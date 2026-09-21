import { NextResponse } from "next/server";

import { notFound, withApi } from "@/server/guard";
import { changeStage } from "@/server/repo/crm";
import { transitionSchema } from "@/server/schemas";

/**
 * Mudança de fase, perda, congelamento, conquista e reativação — todas pela
 * mesma rota, porque todas fazem o mesmo par de escritas (registrar em
 * phase_transitions e atualizar o contato) e compartilham a regra da
 * evidência obrigatória.
 */
export const POST = withApi(transitionSchema, async ({ body, ctx, params }) => {
  const contato = await changeStage(ctx, params.id, body);
  return contato ? NextResponse.json({ contact: contato }) : notFound("Pessoa");
});
