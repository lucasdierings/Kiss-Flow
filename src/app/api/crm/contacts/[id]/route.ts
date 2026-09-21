import { NextResponse } from "next/server";

import { notFound, withApi } from "@/server/guard";
import { deleteContact, getContact, updateContact } from "@/server/repo/crm";
import { updateContactSchema } from "@/server/schemas";
import type { Contact } from "@/lib/types";

export const GET = withApi(null, async ({ ctx, params }) => {
  const contato = await getContact(ctx, params.id);
  return contato ? NextResponse.json({ contact: contato }) : notFound("Pessoa");
});

export const PATCH = withApi(updateContactSchema, async ({ body, ctx, params }) => {
  // O schema exclui as métricas de propósito: quem as calcula é o engine no
  // servidor. Aceitá-las aqui deixaria o cliente gravar receptividade 100.
  const contato = await updateContact(ctx, params.id, body as Partial<Contact>);
  return contato ? NextResponse.json({ contact: contato }) : notFound("Pessoa");
});

export const DELETE = withApi(null, async ({ ctx, params }) => {
  const removido = await deleteContact(ctx, params.id);
  return removido ? NextResponse.json({ ok: true }) : notFound("Pessoa");
});
