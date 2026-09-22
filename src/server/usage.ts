/**
 * Cotas, créditos e telemetria de uso.
 *
 * O portão que faltava: `plans.ts` definia os limites e `usage_counters`
 * existia no schema, mas nada no caminho da requisição consultava nenhum dos
 * dois — qualquer usuário podia chamar a IA à vontade.
 *
 * Ordem de cobrança de uma análise: primeiro a franquia mensal do plano,
 * depois a carteira de créditos avulsos. É o que a oferta promete ("30
 * análises/mês inclusas" + pacotes de recarga); se mudar a oferta, muda aqui.
 */

import { and, eq, inArray, sql } from "drizzle-orm";

import {
  CREDITO_MINIMO,
  creditosDaChamada,
  custoEmDolar,
  emMicroDolares,
} from "@/lib/pricing";
import {
  currentPeriod,
  limitFor,
  type MonthlyFeature,
  type Plan,
} from "@/lib/plans";

import {
  aiCreditTransactions,
  aiCreditWallets,
  usageCounters,
  usageEvents,
  userProfile,
} from "./db/schema";
import { newId, type Ctx } from "./guard";
import type { Db } from "./db/client";

export async function getPlan(ctx: Ctx): Promise<Plan> {
  const [row] = await ctx.db
    .select({ plan: userProfile.plan })
    .from(userProfile)
    .where(eq(userProfile.userId, ctx.userId));
  return row?.plan ?? "free";
}

export interface Reservation {
  allowed: boolean;
  /** De onde saiu a unidade cobrada. Ausente quando `allowed` é falso. */
  source?: "plan" | "credit";
  plan: Plan;
  limit: number;
  /** Consumo do período após a reserva, quando veio da franquia. */
  used?: number;
  /** Saldo restante, quando veio da carteira. */
  creditsLeft?: number;
}

/**
 * Reserva uma unidade da franquia mensal.
 *
 * Uma escrita só: `INSERT ... ON CONFLICT DO UPDATE ... WHERE count < limite`.
 * D1 não tem transação interativa, então um SELECT seguido de UPDATE abriria
 * janela de corrida — duas requisições simultâneas passariam pelo mesmo
 * "ainda tem saldo". Com o `setWhere`, o UPDATE simplesmente não acontece
 * quando o limite foi atingido, e o RETURNING vem vazio.
 *
 * Não há reset nem cron: mês novo é chave nova, criada preguiçosamente.
 */
export async function reserveMonthly(
  ctx: Ctx,
  feature: MonthlyFeature,
  plan: Plan
): Promise<{ ok: boolean; used?: number; limit: number }> {
  const limit = limitFor(plan, feature);
  if (limit <= 0) return { ok: false, limit };

  const period = currentPeriod();
  const now = new Date();

  // Infinity não sobrevive à serialização para SQL. Sem teto, o upsert é
  // incondicional e só serve para contabilizar.
  const unlimited = !Number.isFinite(limit);

  const rows = await ctx.db
    .insert(usageCounters)
    .values({ userId: ctx.userId, period, feature, count: 1, updatedAt: now })
    .onConflictDoUpdate({
      target: [usageCounters.userId, usageCounters.period, usageCounters.feature],
      set: { count: sql`${usageCounters.count} + 1`, updatedAt: now },
      ...(unlimited
        ? {}
        : { setWhere: sql`${usageCounters.count} < ${limit}` }),
    })
    .returning({ count: usageCounters.count });

  const row = rows[0];
  return row ? { ok: true, used: row.count, limit } : { ok: false, limit };
}

/**
 * Debita um crédito avulso. Mesmo raciocínio da reserva mensal: o `WHERE
 * balance > 0` faz do UPDATE a própria verificação de saldo.
 */
export async function consumeCredit(
  ctx: Ctx,
  referenceId?: string
): Promise<{ ok: boolean; creditsLeft?: number }> {
  const rows = await ctx.db
    .update(aiCreditWallets)
    .set({
      balance: sql`${aiCreditWallets.balance} - 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(aiCreditWallets.userId, ctx.userId),
        sql`${aiCreditWallets.balance} > 0`
      )
    )
    .returning({ balance: aiCreditWallets.balance });

  const row = rows[0];
  if (!row) return { ok: false };

  await ctx.db.insert(aiCreditTransactions).values({
    id: newId(),
    userId: ctx.userId,
    amount: -1,
    reason: "consumption",
    referenceId: referenceId ?? null,
  });

  return { ok: true, creditsLeft: row.balance };
}

/** Franquia do plano primeiro; carteira como reserva. */
export async function reserveAnalysis(
  ctx: Ctx,
  referenceId?: string
): Promise<Reservation> {
  const plan = await getPlan(ctx);

  const monthly = await reserveMonthly(ctx, "ai_analysis", plan);
  if (monthly.ok) {
    return { allowed: true, source: "plan", plan, limit: monthly.limit, used: monthly.used };
  }

  const credit = await consumeCredit(ctx, referenceId);
  if (credit.ok) {
    return {
      allowed: true,
      source: "credit",
      plan,
      limit: monthly.limit,
      creditsLeft: credit.creditsLeft,
    };
  }

  return { allowed: false, plan, limit: monthly.limit };
}

/**
 * Devolve a unidade reservada.
 *
 * A reserva acontece ANTES da chamada ao modelo, senão o custo ocorreria sem
 * saldo. Mas quando o modelo falha por motivo nosso ou do provedor — 502, 503
 * de capacidade, chave inválida — a análise não foi entregue, e cobrar por ela
 * é errado. Sem isto, cinco 503 seguidos do Gemini zeravam a franquia mensal
 * de um usuário do plano free (aconteceu em teste).
 *
 * Só estorna falha de infraestrutura. Resposta ruim do modelo é entrega.
 */
export async function refundReservation(
  ctx: Ctx,
  reservation: Reservation,
  feature: MonthlyFeature = "ai_analysis"
): Promise<void> {
  try {
    if (reservation.source === "plan") {
      // O guarda `count > 0` evita contador negativo se algo já tiver zerado.
      await ctx.db
        .update(usageCounters)
        .set({ count: sql`${usageCounters.count} - 1`, updatedAt: new Date() })
        .where(
          and(
            eq(usageCounters.userId, ctx.userId),
            eq(usageCounters.period, currentPeriod()),
            eq(usageCounters.feature, feature),
            sql`${usageCounters.count} > 0`
          )
        );
      return;
    }

    if (reservation.source === "credit") {
      await ctx.db.batch([
        ctx.db.insert(aiCreditTransactions).values({
          id: newId(),
          userId: ctx.userId,
          amount: 1,
          reason: "refund",
          // Sem referenceId: o índice único de concessão é por evento de
          // compra, e um estorno não é uma compra.
          referenceId: null,
        }),
        ctx.db
          .update(aiCreditWallets)
          .set({
            balance: sql`${aiCreditWallets.balance} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(aiCreditWallets.userId, ctx.userId)),
      ]);
    }
  } catch (error) {
    // Um estorno perdido é melhor que uma requisição derrubada; fica no log.
    console.error("refundReservation falhou:", error);
  }
}

/**
 * Telemetria. Append-only e analítica — não é trilha de auditoria.
 *
 * Nunca receba conteúdo bruto de conversa, print ou áudio: o contrato de
 * dados do Gate 0 proíbe, e esta tabela não tem janela de expurgo.
 */
export async function logUsage(
  ctx: Ctx,
  entry: {
    feature: string;
    featureDetail: string;
    contactId?: string;
    model?: string;
    tokensIn?: number;
    tokensOut?: number;
    costMicroUsd?: number;
    creditsCharged?: number;
    latencyMs?: number;
    status?: "ok" | "error" | "blocked";
  }
): Promise<void> {
  try {
    await ctx.db.insert(usageEvents).values({
      id: newId(),
      userId: ctx.userId,
      contactId: entry.contactId ?? null,
      feature: entry.feature,
      featureDetail: entry.featureDetail,
      model: entry.model ?? null,
      tokensIn: entry.tokensIn ?? null,
      tokensOut: entry.tokensOut ?? null,
      costMicroUsd: entry.costMicroUsd ?? null,
      creditsCharged: entry.creditsCharged ?? null,
      latencyMs: entry.latencyMs ?? null,
      status: entry.status ?? "ok",
    });
  } catch (error) {
    // Telemetria não derruba a requisição que ela observa.
    console.error("logUsage falhou:", error);
  }
}

/**
 * Fecha a conta de uma chamada de IA depois que o custo real é conhecido.
 *
 * A reserva acontece ANTES da chamada porque não há como saber o consumo de
 * antemão — é o mesmo princípio de uma pré-autorização de cartão. Só que a
 * reserva cobra 1 crédito, e uma análise com um histórico enorme pode ter
 * custado mais. Esta função acerta a diferença.
 *
 * Três decisões:
 *
 * 1. **Nunca devolve créditos por consumo baixo.** A reserva de 1 crédito é o
 *    piso: uma análise barata não vira meio crédito. Quem devolve é o
 *    `refundReservation`, e só quando a análise NÃO foi entregue.
 * 2. **A cobrança extra não pode ser bloqueada por saldo.** O trabalho já foi
 *    feito e já custou dinheiro; recusar o débito aqui só faria o prejuízo
 *    virar nosso. O saldo pode ficar negativo, e a próxima reserva vai barrar.
 * 3. **O custo em dólar é registrado sempre**, independente dos créditos. É
 *    com ele que se descobre se o preço do crédito está certo — créditos são
 *    a unidade de venda, dólar é a unidade de verdade.
 */
export async function settleAnalysis(
  ctx: Ctx,
  reserva: Reservation,
  medicao: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    feature: string;
    featureDetail: string;
    contactId?: string;
    latencyMs?: number;
  }
): Promise<{ creditosCobrados: number; custoMicroUsd: number }> {
  const { model, tokensIn, tokensOut } = medicao;

  const custoMicroUsd = emMicroDolares(custoEmDolar(model, tokensIn, tokensOut));

  // Sem metadados de token, não dá para cobrar extra com honestidade: fica no
  // mínimo já reservado e o custo vai zerado, sinalizando "não medido".
  const medido = tokensIn > 0 || tokensOut > 0;
  const creditosDevidos = medido ? creditosDaChamada(tokensIn, tokensOut) : CREDITO_MINIMO;
  const extra = Math.max(0, creditosDevidos - CREDITO_MINIMO);

  if (extra > 0) {
    const agora = new Date();
    try {
      await ctx.db.batch([
        ctx.db.insert(aiCreditTransactions).values({
          id: newId(),
          userId: ctx.userId,
          amount: -extra,
          reason: "consumption",
          referenceId: medicao.contactId ?? null,
          createdAt: agora,
        }),
        ctx.db
          .update(aiCreditWallets)
          .set({
            balance: sql`${aiCreditWallets.balance} - ${extra}`,
            updatedAt: agora,
          })
          .where(eq(aiCreditWallets.userId, ctx.userId)),
      ]);
    } catch (erro) {
      // Perder a cobrança extra é melhor que derrubar a resposta que o
      // usuário já esperou. Fica no log e no evento de uso.
      console.error("settleAnalysis: cobrança extra falhou:", erro);
    }
  }

  await logUsage(ctx, {
    feature: medicao.feature,
    featureDetail: medicao.featureDetail,
    contactId: medicao.contactId,
    model,
    tokensIn: medido ? tokensIn : undefined,
    tokensOut: medido ? tokensOut : undefined,
    costMicroUsd: medido ? custoMicroUsd : undefined,
    creditsCharged: creditosDevidos,
    latencyMs: medicao.latencyMs,
    status: "ok",
  });

  return { creditosCobrados: creditosDevidos, custoMicroUsd };
}

export async function getWalletBalance(ctx: Ctx): Promise<number> {
  const [row] = await ctx.db
    .select({ balance: aiCreditWallets.balance })
    .from(aiCreditWallets)
    .where(eq(aiCreditWallets.userId, ctx.userId));
  return row?.balance ?? 0;
}

export async function getMonthlyUsage(
  ctx: Ctx,
  feature: MonthlyFeature
): Promise<number> {
  const [row] = await ctx.db
    .select({ count: usageCounters.count })
    .from(usageCounters)
    .where(
      and(
        eq(usageCounters.userId, ctx.userId),
        eq(usageCounters.period, currentPeriod()),
        eq(usageCounters.feature, feature)
      )
    );
  return row?.count ?? 0;
}

/**
 * Credita a carteira. Recebe `Db` em vez de `Ctx` porque quem chama é o
 * webhook da loja, que se autentica por segredo compartilhado e identifica o
 * usuário pelo payload — não há sessão.
 */
export async function addCredits(
  db: Db,
  userId: string,
  amount: number,
  reason: "purchase" | "bonus" | "refund",
  referenceId?: string
): Promise<number> {
  const now = new Date();

  /**
   * Ordem e atomicidade importam, e custaram um bug de dinheiro.
   *
   * A primeira versão creditava a carteira e SÓ DEPOIS lançava a transação.
   * Numa reentrega do webhook, a carteira já tinha sido somada quando o
   * índice único barrava a transação: saldo dobrado, uma transação só, e um
   * 500 que fazia a loja tentar de novo. Verificado: 60 créditos viraram 120.
   *
   * Agora a transação — a escrita protegida pelo índice — vai PRIMEIRO, e as
   * duas seguem no mesmo `db.batch()`, que no D1 roda em transação única.
   * A colisão aborta o lote inteiro e a carteira não é tocada.
   */
  const [, walletRows] = await db.batch([
    db.insert(aiCreditTransactions).values({
      id: newId(),
      userId,
      amount,
      reason,
      referenceId: referenceId ?? null,
      createdAt: now,
    }),
    db
      .insert(aiCreditWallets)
      .values({ userId, balance: amount, updatedAt: now })
      .onConflictDoUpdate({
        target: aiCreditWallets.userId,
        set: {
          balance: sql`${aiCreditWallets.balance} + ${amount}`,
          updatedAt: now,
        },
      })
      .returning({ balance: aiCreditWallets.balance }),
  ]);

  return walletRows[0]?.balance ?? amount;
}

/** Este crédito já foi lançado? Usado para reconhecer reentrega do webhook. */
export async function grantExists(
  db: Db,
  referenceId: string
): Promise<boolean> {
  const [row] = await db
    .select({ id: aiCreditTransactions.id })
    .from(aiCreditTransactions)
    .where(
      and(
        eq(aiCreditTransactions.referenceId, referenceId),
        inArray(aiCreditTransactions.reason, ["purchase", "bonus", "refund"])
      )
    );
  return Boolean(row);
}

/**
 * O drizzle embrulha o erro do D1 numa mensagem "Failed query: ..." que não
 * cita a restrição violada — o texto original fica na cadeia de `cause`.
 * Procurar só na mensagem de topo deixava a colisão passar por erro genérico.
 */
export function isUniqueViolation(error: unknown): boolean {
  const pattern = /UNIQUE constraint failed|SQLITE_CONSTRAINT/i;
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    const e = current as { message?: string; cause?: unknown };
    if (typeof e.message === "string" && pattern.test(e.message)) return true;
    current = e.cause;
  }
  return false;
}
