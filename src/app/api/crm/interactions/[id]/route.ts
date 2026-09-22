import { NextResponse } from "next/server";

import type { Interaction } from "@/lib/types";
import { notFound, withApi } from "@/server/guard";
import { deleteInteraction, updateInteraction } from "@/server/repo/crm";
import { updateInteractionSchema } from "@/server/schemas";

/**
 * Editar e apagar uma interação.
 *
 * `updateInteraction` e `deleteInteraction` existiam em repo/crm.ts desde a
 * migração e **nunca tinham rota** — não havia como corrigir um registro.
 * Isso importa mais do que parece: o formulário gravava a data como "agora",
 * então quem registrasse um encontro de duas semanas atrás ficava com a data
 * errada e sem saída. E data errada contamina tudo o que é calculado por
 * tempo: dias desde o último contato, ritmo, escassez, estagnação.
 *
 * Rota por id da interação, e não aninhada no contato, porque a interação já
 * carrega o dono e o contato — aninhar só duplicaria a chance de divergirem.
 * O `userId` continua vindo da sessão.
 *
 * As métricas NÃO são recalculadas ao editar. Os instantâneos
 * (`mystery_after` e companhia) ficam como estavam: eles registram o que o
 * motor decidiu naquele momento, com a informação daquele momento. Reescrever
 * a história exigiria reprocessar a cadeia inteira de interações do contato —
 * decisão de produto, não detalhe de rota.
 */

export const PATCH = withApi(updateInteractionSchema, async ({ body, ctx, params }) => {
  const atualizada = await updateInteraction(
    ctx,
    params.id,
    body as unknown as Partial<Interaction>
  );
  return atualizada
    ? NextResponse.json({ interaction: atualizada })
    : notFound("Interação");
});

export const DELETE = withApi(null, async ({ ctx, params }) => {
  const removida = await deleteInteraction(ctx, params.id);
  return removida ? NextResponse.json({ ok: true }) : notFound("Interação");
});
