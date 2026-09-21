import { NextResponse } from "next/server";

import { notFound, withApi } from "@/server/guard";
import { addInteraction } from "@/server/repo/crm";
import { interactionInputSchema } from "@/server/schemas";
import type { Interaction } from "@/lib/types";

/**
 * Registro de interação — o coração do loop do Gate 0.
 *
 * O impacto nas métricas é calculado aqui pelo `engine`, não no cliente, e a
 * resposta pode trazer `suggestedProgression`: a interação sugere avanço de
 * fase, mas **não comete** a mudança. Toda transição exige evidência escrita,
 * pela rota /transition.
 */
export const POST = withApi(interactionInputSchema, async ({ body, ctx, params }) => {
  const resultado = await addInteraction(
    ctx,
    params.id,
    body as unknown as Omit<
      Interaction,
      "id" | "contactId" | "mysteryAfter" | "tensionAfter" | "enchantmentAfter"
    >
  );

  return resultado ? NextResponse.json(resultado, { status: 201 }) : notFound("Pessoa");
});
