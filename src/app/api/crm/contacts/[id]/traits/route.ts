import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { EIXOS } from "@/lib/traits";
import { contactTraits } from "@/server/db/schema";
import { notFound, withApi } from "@/server/guard";
import { getContact } from "@/server/repo/crm";

const IDS = EIXOS.map((e) => e.id) as [string, ...string[]];

export const GET = withApi(null, async ({ ctx, params }) => {
  const rows = await ctx.db
    .select()
    .from(contactTraits)
    .where(
      and(eq(contactTraits.userId, ctx.userId), eq(contactTraits.contactId, params.id))
    );

  return NextResponse.json({
    traits: rows.map((r) => ({
      axis: r.axis,
      value: r.value,
      source: r.source,
      confidence: r.confidence,
      evidence: r.evidence,
      observedAt: r.observedAt.toISOString(),
    })),
  });
});

const declararSchema = z.object({
  axis: z.enum(IDS),
  /** null apaga a medição daquele eixo — "exclusão individual" do contrato. */
  value: z.number().int().min(0).max(100).nullable(),
});

/**
 * Declaração do usuário sobre um eixo.
 *
 * Entra com confiança 1 e sobrescreve qualquer inferência: quem convive com a
 * pessoa sabe mais que a leitura automática de notas.
 */
export const PUT = withApi(declararSchema, async ({ body, ctx, params }) => {
  if (!(await getContact(ctx, params.id))) return notFound("Pessoa");

  if (body.value === null) {
    await ctx.db
      .delete(contactTraits)
      .where(
        and(
          eq(contactTraits.userId, ctx.userId),
          eq(contactTraits.contactId, params.id),
          eq(contactTraits.axis, body.axis)
        )
      );
    return NextResponse.json({ ok: true, removido: true });
  }

  const agora = new Date();
  await ctx.db
    .insert(contactTraits)
    .values({
      userId: ctx.userId,
      contactId: params.id,
      axis: body.axis,
      value: body.value,
      source: "declarado",
      confidence: 1,
      evidence: null,
      observedAt: agora,
      updatedAt: agora,
    })
    .onConflictDoUpdate({
      target: [contactTraits.userId, contactTraits.contactId, contactTraits.axis],
      set: {
        value: body.value,
        source: "declarado",
        confidence: 1,
        evidence: null,
        observedAt: agora,
        updatedAt: agora,
      },
    });

  return NextResponse.json({ ok: true });
});
