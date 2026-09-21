import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateArchetype, QUIZ_QUESTIONS } from "@/lib/archetype-quiz";
import { onboardingAnswer, userProfile } from "@/server/db/schema";
import { newId, withApi } from "@/server/guard";

/**
 * Conclusão do onboarding.
 *
 * A regra nº 1 do produto é que o quiz de arquétipo vem antes do uso, mas
 * `onboarding_completed` existia no banco sem que nada jamais o escrevesse:
 * o usuário entrava e via um perfil inventado. Esta rota é o que faltava.
 *
 * O arquétipo é calculado **no servidor**. Aceitar o resultado pronto do
 * cliente deixaria qualquer um escolher o próprio, e o arquétipo alimenta a
 * persona da IA e o scoring — é dado de domínio, não preferência de tela.
 */

const bodySchema = z.object({
  displayName: z.string().min(1).max(80),
  gender: z.string().min(1),
  orientation: z.string().min(1),
  ageRange: z.string().optional(),
  /** { [questionId]: índice da opção escolhida } */
  answers: z.record(z.string(), z.number().int().min(0)),
});

export const POST = withApi(bodySchema, async ({ body, ctx }) => {
  const respondidas = Object.keys(body.answers).filter((id) =>
    QUIZ_QUESTIONS.some((q) => q.id === id)
  );

  if (respondidas.length < QUIZ_QUESTIONS.length) {
    return NextResponse.json(
      {
        error: "Quiz incompleto",
        detail: `Respondidas ${respondidas.length} de ${QUIZ_QUESTIONS.length} perguntas.`,
      },
      { status: 400 }
    );
  }

  const { primary, secondary, scores } = calculateArchetype(body.answers);

  // Respostas cruas guardadas para refazer o cálculo se a régua mudar —
  // sem elas, mexer no scoring obrigaria todo mundo a refazer o quiz.
  const registros = Object.entries(body.answers).map(([questionKey, value]) =>
    ctx.db.insert(onboardingAnswer).values({
      id: newId(),
      userId: ctx.userId,
      questionKey,
      answerValue: String(value),
    })
  );

  await ctx.db.batch([
    ctx.db.delete(onboardingAnswer).where(eq(onboardingAnswer.userId, ctx.userId)),
    ...registros,
    ctx.db
      .update(userProfile)
      .set({
        displayName: body.displayName.trim(),
        gender: body.gender,
        orientation: body.orientation,
        ageRange: body.ageRange ?? null,
        seducerArchetype: primary,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, ctx.userId)),
  ] as never);

  return NextResponse.json({ primary, secondary, scores });
});
