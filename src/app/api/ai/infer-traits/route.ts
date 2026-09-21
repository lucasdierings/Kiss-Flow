import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { extrairJson, generateWithRetry, isAiConfigured } from "@/lib/gemini";
import { EIXOS, MINIMO_PARA_INFERIR } from "@/lib/traits";
import { contactTraits, interactions } from "@/server/db/schema";
import { notFound, withApi } from "@/server/guard";
import { getContact } from "@/server/repo/crm";
import { logUsage, refundReservation, reserveAnalysis } from "@/server/usage";

/**
 * Leitura dos traços a partir do que foi registrado.
 *
 * Esta é a resposta para "os números do radar vêm de onde?". Antes não vinham
 * de lugar nenhum: eram 50 por padrão.
 *
 * Três decisões que definem o comportamento:
 *
 * 1. **Só lê nota escrita pelo usuário.** Não inventa a partir de métricas,
 *    porque métrica é consequência do que ele registrou, não observação nova
 *    sobre a pessoa. Sem notas, não roda.
 * 2. **Nunca sobrescreve o declarado.** Quem convive sabe mais que a leitura
 *    automática. Eixo declarado é devolvido como proposta, e o usuário decide.
 * 3. **Sempre com evidência e confiança.** É exigência do contrato de dados
 *    do Gate 0 para atributo derivado, e é o que permite discordar.
 *
 * Custa uma análise da cota, igual a /api/ai/advise — é a mesma chamada de
 * modelo — e devolve a cota se o provedor falhar.
 */

const bodySchema = z.object({ contactId: z.string().min(1) });

const propostaSchema = z.object({
  traits: z
    .array(
      z.object({
        axis: z.enum(EIXOS.map((e) => e.id) as [string, ...string[]]),
        value: z.number().min(0).max(100),
        confidence: z.number().min(0).max(1),
        evidence: z.string().min(1).max(400),
      })
    )
    .max(6),
});

export const POST = withApi(bodySchema, async ({ body, ctx }) => {
  const contato = await getContact(ctx, body.contactId);
  if (!contato) return notFound("Pessoa");

  const registros = await ctx.db
    .select({ notes: interactions.notes, typeId: interactions.typeId, sentiment: interactions.sentiment })
    .from(interactions)
    .where(
      and(eq(interactions.userId, ctx.userId), eq(interactions.contactId, body.contactId))
    )
    .orderBy(desc(interactions.occurredAt))
    .limit(40);

  const comNota = registros.filter((r) => r.notes.trim().length > 0);

  if (comNota.length < MINIMO_PARA_INFERIR) {
    return NextResponse.json(
      {
        error: "Material insuficiente",
        detail: `A leitura sai das suas anotações. São necessárias ${MINIMO_PARA_INFERIR} interações com nota escrita; você tem ${comNota.length}.`,
        faltam: MINIMO_PARA_INFERIR - comNota.length,
      },
      { status: 422 }
    );
  }

  if (!(await isAiConfigured())) {
    return NextResponse.json({ error: "Motor de IA indisponível no momento." }, { status: 503 });
  }

  const reserva = await reserveAnalysis(ctx, body.contactId);
  if (!reserva.allowed) {
    return NextResponse.json(
      { error: "Sem análises disponíveis", plan: reserva.plan },
      { status: 402 }
    );
  }

  const existentes = await ctx.db
    .select()
    .from(contactTraits)
    .where(
      and(eq(contactTraits.userId, ctx.userId), eq(contactTraits.contactId, body.contactId))
    );
  const declarados = new Set(
    existentes.filter((t) => t.source === "declarado").map((t) => t.axis)
  );

  const prompt = `Você analisa anotações de relacionamento e estima seis traços de personalidade da pessoa observada.

EIXOS (0 a 100):
${EIXOS.map((e) => `- ${e.id} (${e.nome}): ${e.desc}`).join("\n")}

REGRAS ABSOLUTAS:
- Estime SOMENTE eixos com evidência real nas anotações. Omita os demais.
- Nunca complete com 50 nem com "média". Eixo sem sinal fica de fora.
- "evidence" deve citar o comportamento observado nas anotações, em no máximo
  200 caracteres, sem copiar conversa inteira.
- "confidence" reflete quão forte é o sinal: 0.3 para indício isolado, 0.9
  para padrão repetido em várias anotações.
- Responda APENAS com JSON: {"traits":[{"axis","value","confidence","evidence"}]}

ANOTAÇÕES (mais recentes primeiro):
${comNota.map((r, i) => `${i + 1}. [${r.typeId}, sentimento ${r.sentiment.toFixed(1)}] ${r.notes.trim().slice(0, 300)}`).join("\n")}`;

  let bruto: string;
  try {
    bruto = (await generateWithRetry([{ text: prompt }])).text;
  } catch (erro) {
    console.error("Inferência de traços falhou:", erro);
    await refundReservation(ctx, reserva);
    await logUsage(ctx, {
      feature: "ai_analysis",
      featureDetail: "ai/infer-traits",
      contactId: body.contactId,
      status: "error",
    });
    return NextResponse.json({ error: "Não foi possível ler agora. Tente de novo." }, { status: 502 });
  }

  let proposta: z.infer<typeof propostaSchema>;
  try {
    proposta = propostaSchema.parse(extrairJson(bruto));
  } catch {
    await refundReservation(ctx, reserva);
    return NextResponse.json(
      { error: "A leitura veio num formato que não consegui aproveitar." },
      { status: 502 }
    );
  }

  const agora = new Date();
  const aplicar = proposta.traits.filter((t) => !declarados.has(t.axis));

  if (aplicar.length > 0) {
    await ctx.db.batch(
      aplicar.map((t) =>
        ctx.db
          .insert(contactTraits)
          .values({
            userId: ctx.userId,
            contactId: body.contactId,
            axis: t.axis,
            value: Math.round(t.value),
            source: "inferido",
            confidence: t.confidence,
            evidence: t.evidence,
            observedAt: agora,
            updatedAt: agora,
          })
          .onConflictDoUpdate({
            target: [contactTraits.userId, contactTraits.contactId, contactTraits.axis],
            set: {
              value: Math.round(t.value),
              source: "inferido",
              confidence: t.confidence,
              evidence: t.evidence,
              observedAt: agora,
              updatedAt: agora,
            },
          })
      ) as never
    );
  }

  await logUsage(ctx, {
    feature: "ai_analysis",
    featureDetail: "ai/infer-traits",
    contactId: body.contactId,
    status: "ok",
  });

  return NextResponse.json({
    aplicados: aplicar.length,
    // Eixos que a IA propôs mas o usuário já tinha declarado: mostrados como
    // divergência, não aplicados.
    divergencias: proposta.traits
      .filter((t) => declarados.has(t.axis))
      .map((t) => ({ axis: t.axis, sugerido: Math.round(t.value), evidence: t.evidence })),
    baseadoEm: comNota.length,
  });
});
