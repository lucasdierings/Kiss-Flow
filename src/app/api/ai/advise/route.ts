import { NextResponse } from "next/server";
import { z } from "zod";

import { FLASH_MODEL, getFlashModel, isAiConfigured } from "@/lib/gemini";
import { buildMentorSystemPrompt, retrieveKnowledgeChunks } from "@/lib/rag-engine";
import { withApi } from "@/server/guard";
import { getContact } from "@/server/repo/crm";
import { logUsage, refundReservation, reserveAnalysis } from "@/server/usage";

/**
 * Conselho do mentor.
 *
 * Esta era a única rota que chamava o Gemini de verdade — e a chamava sem
 * sessão, sem cota e sem registro: qualquer requisição anônima gastava a
 * cota de API do projeto. Agora passa por `withApi` (sessão + validação),
 * reserva uma unidade antes de chamar o modelo e registra o uso depois.
 *
 * O contato vem por id e é lido do banco. Antes vinha inteiro no corpo da
 * requisição, com métricas e tudo — o cliente descrevia a própria situação
 * para a IA, o que torna qualquer diagnóstico decorativo.
 */

const adviseSchema = z.object({
  contactId: z.string().min(1),
  userMessage: z.string().min(1).max(4000),
  category: z.string().optional(),
});

/** Tudo que o modelo devolve é texto não confiável: validar antes de servir. */
const adviceShape = z.object({
  diagnosis: z.string(),
  options: z
    .array(z.object({ title: z.string(), text: z.string() }))
    .min(1)
    .max(3),
  principleApplied: z.string().optional(),
});

export const POST = withApi(adviseSchema, async ({ body, ctx }) => {
  const contact = await getContact(ctx, body.contactId);
  if (!contact) {
    return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 });
  }

  // Antes de cobrar: motor indisponível é problema nosso, e o usuário não
  // pode perder uma análise por causa disso. Esta checagem estava DEPOIS da
  // reserva e consumia a cota para depois responder 503.
  if (!(await isAiConfigured())) {
    await logUsage(ctx, {
      feature: "ai_analysis",
      featureDetail: "ai/advise",
      contactId: body.contactId,
      status: "error",
    });
    return NextResponse.json(
      { error: "Motor de IA indisponível no momento." },
      { status: 503 }
    );
  }

  // Reserva ANTES da chamada ao modelo. Reservar depois deixaria o custo
  // acontecer mesmo quando o usuário não tem saldo.
  const reservation = await reserveAnalysis(ctx, body.contactId);
  if (!reservation.allowed) {
    await logUsage(ctx, {
      feature: "ai_analysis",
      featureDetail: "ai/advise",
      contactId: body.contactId,
      status: "blocked",
    });
    return NextResponse.json(
      {
        error: "Sem análises disponíveis",
        detail:
          "A franquia do mês acabou e não há créditos na carteira. Recarregue para continuar.",
        plan: reservation.plan,
        limit: Number.isFinite(reservation.limit) ? reservation.limit : null,
      },
      { status: 402 }
    );
  }

  // Persona pelo gênero de quem usa; o alvo NÃO define o mentor.
  const [profile] = await ctx.db.query.userProfile.findMany({
    where: (p, { eq }) => eq(p.userId, ctx.userId),
    limit: 1,
  });
  const mentor = profile?.gender === "feminino" ? "cleopatra" : "donjuan";

  const chunks = retrieveKnowledgeChunks(body.category, body.userMessage);
  const systemPrompt = buildMentorSystemPrompt(
    mentor,
    { name: profile?.displayName ?? "", gender: profile?.gender ?? "" },
    {
      name: contact.firstName,
      archetype: contact.primaryArchetype,
      stage: contact.pipelineStage,
      mysteryScore: contact.mysteryCoefficient,
      tensionScore: contact.tensionLevel,
      interestScore: contact.victimScore,
    },
    chunks
  );

  const startedAt = Date.now();
  let raw: string;
  try {
    const model = await getFlashModel();
    const result = await model.generateContent([
      { text: systemPrompt },
      {
        text: `Mensagem do usuário sobre ${contact.firstName}:\n"${body.userMessage}"\n\nResponda no formato JSON solicitado.`,
      },
    ]);
    raw = result.response.text();
  } catch (error) {
    console.error("Gemini falhou:", error);
    // A análise não foi entregue: devolve a unidade cobrada. Sem isto, uma
    // sequência de 503 do provedor zera a franquia do mês do usuário.
    await refundReservation(ctx, reservation);
    await logUsage(ctx, {
      feature: "ai_analysis",
      featureDetail: "ai/advise",
      contactId: body.contactId,
      latencyMs: Date.now() - startedAt,
      status: "error",
    });
    return NextResponse.json(
      { error: "Não foi possível gerar o conselho agora. Tente de novo." },
      { status: 502 }
    );
  }

  const latencyMs = Date.now() - startedAt;

  let advice: z.infer<typeof adviceShape>;
  try {
    advice = adviceShape.parse(
      JSON.parse(raw.replace(/```json/gi, "").replace(/```/g, "").trim())
    );
  } catch {
    // Sem inventar opções: um texto solto é diagnóstico, não sugestão pronta.
    advice = { diagnosis: raw.trim(), options: [{ title: "Leitura da situação", text: raw.trim() }] };
  }

  await logUsage(ctx, {
    feature: "ai_analysis",
    featureDetail: "ai/advise",
    contactId: body.contactId,
    model: FLASH_MODEL,
    latencyMs,
    status: "ok",
  });

  return NextResponse.json({
    mentor: mentor === "donjuan" ? "Don Juan" : "Cleópatra",
    ...advice,
    quota: {
      source: reservation.source,
      used: reservation.used ?? null,
      limit: Number.isFinite(reservation.limit) ? reservation.limit : null,
      creditsLeft: reservation.creditsLeft ?? null,
    },
  });
});
