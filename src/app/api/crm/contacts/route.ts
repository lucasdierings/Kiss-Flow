import { NextResponse } from "next/server";

import { PLAN_LIMITS } from "@/lib/plans";
import { withApi } from "@/server/guard";
import { countActiveContacts, createContact, listContacts } from "@/server/repo/crm";
import { createContactSchema } from "@/server/schemas";
import { getPlan } from "@/server/usage";

/**
 * Antes esta rota devolvia três contatos de demonstração fixos no código e o
 * POST não gravava nada. Agora lê e escreve no D1, com o dono vindo da sessão.
 *
 * O formato de saída é o do domínio (`Contact`, de src/lib/types.ts). Rótulos
 * de fase e temperatura são apresentação e ficam no cliente — o servidor não
 * tem por que conhecer o vocabulário de tela.
 */

export const GET = withApi(null, async ({ ctx }) => {
  return NextResponse.json({ contacts: await listContacts(ctx) });
});

export const POST = withApi(createContactSchema, async ({ body, ctx }) => {
  // Cardinalidade é do plano, não do corpo da requisição: apagar um contato
  // libera a vaga, e por isso a contagem é feita na hora em vez de guardada.
  const plan = await getPlan(ctx);
  const limit = PLAN_LIMITS[plan].activeContacts;

  if (Number.isFinite(limit) && (await countActiveContacts(ctx)) >= limit) {
    return NextResponse.json(
      {
        error: "Limite de pessoas ativas atingido",
        detail: `O plano ${plan} permite ${limit} pessoa(s) ativa(s) ao mesmo tempo.`,
        limit,
        plan,
      },
      { status: 402 }
    );
  }

  const result = await createContact(ctx, {
    contact: body.contact as Parameters<typeof createContact>[1]["contact"],
    pastInteractions: body.pastInteractions?.map((i) => ({
      ...i,
      date: i.date,
    })) as Parameters<typeof createContact>[1]["pastInteractions"],
  });

  return NextResponse.json(result, { status: 201 });
});
