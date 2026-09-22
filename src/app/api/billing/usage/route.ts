import { and, desc, eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { aiCreditTransactions, usageEvents } from "@/server/db/schema";
import { withApi } from "@/server/guard";

/**
 * Consumo e extrato de créditos do usuário.
 *
 * Duas leituras que não existiam:
 *
 * - **Quanto ele consumiu** — tokens e custo real, somados dos `usage_events`.
 *   É o número que diz se o preço do crédito fecha a conta.
 * - **Extrato** — cada entrada e saída de crédito, para ele conferir. Cobrar
 *   sem mostrar de onde veio o débito é como mandar fatura sem itens.
 *
 * `costMicroUsd` é interno e NÃO vai para o cliente: o usuário compra
 * créditos, não tokens, e mostrar nosso custo de API na tela dele só
 * confundiria. A soma existe para o painel do fundador.
 */

const DIAS = 30;

export const GET = withApi(null, async ({ ctx }) => {
  const desde = new Date(Date.now() - DIAS * 86400000);

  const [resumo] = await ctx.db
    .select({
      chamadas: sql<number>`count(*)`,
      tokensIn: sql<number>`coalesce(sum(${usageEvents.tokensIn}), 0)`,
      tokensOut: sql<number>`coalesce(sum(${usageEvents.tokensOut}), 0)`,
      creditos: sql<number>`coalesce(sum(${usageEvents.creditsCharged}), 0)`,
      naoMedidas: sql<number>`sum(case when ${usageEvents.tokensIn} is null then 1 else 0 end)`,
    })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, ctx.userId),
        eq(usageEvents.status, "ok"),
        gte(usageEvents.createdAt, desde)
      )
    );

  const extrato = await ctx.db
    .select({
      amount: aiCreditTransactions.amount,
      reason: aiCreditTransactions.reason,
      createdAt: aiCreditTransactions.createdAt,
    })
    .from(aiCreditTransactions)
    .where(eq(aiCreditTransactions.userId, ctx.userId))
    .orderBy(desc(aiCreditTransactions.createdAt))
    .limit(50);

  return NextResponse.json({
    periodoDias: DIAS,
    consumo: {
      chamadas: resumo?.chamadas ?? 0,
      tokensEntrada: resumo?.tokensIn ?? 0,
      tokensSaida: resumo?.tokensOut ?? 0,
      creditosGastos: resumo?.creditos ?? 0,
      // Chamadas antigas, de antes de a medição existir. Aparecem para o
      // total não parecer menor do que foi.
      chamadasSemMedicao: resumo?.naoMedidas ?? 0,
    },
    extrato: extrato.map((t) => ({
      quantidade: t.amount,
      motivo: t.reason,
      em: t.createdAt.toISOString(),
    })),
  });
});
