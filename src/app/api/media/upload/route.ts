import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { mediaUploads, userProfile } from "@/server/db/schema";
import { newId, requireUser, unauthorized } from "@/server/guard";

/**
 * Upload de imagem para o R2.
 *
 * O bucket `MEDIA` estava ligado no wrangler.jsonc desde a migração e nunca
 * tinha sido usado — não havia como colocar foto em nada.
 *
 * Não usa `withApi` porque o corpo é multipart, e o guard valida JSON.
 * A sessão é checada do mesmo jeito, via requireUser.
 *
 * A chave começa pelo id do usuário. Isso não é enfeite: é o que permite
 * servir o arquivo conferindo o dono sem consultar o banco.
 */

const TIPOS_ACEITOS = new Set(["image/jpeg", "image/png", "image/webp"]);
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

export async function POST(request: Request): Promise<Response> {
  const ctx = await requireUser(request);
  if (!ctx) return unauthorized();

  const form = await request.formData().catch(() => null);
  const arquivo = form?.get("file");

  if (!(arquivo instanceof File)) {
    return NextResponse.json({ error: "Envie um arquivo em `file`" }, { status: 400 });
  }
  if (!TIPOS_ACEITOS.has(arquivo.type)) {
    return NextResponse.json(
      { error: "Formato não aceito", detail: "Use JPG, PNG ou WebP." },
      { status: 415 }
    );
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json(
      { error: "Arquivo grande demais", detail: "O limite é 5 MB." },
      { status: 413 }
    );
  }

  const kind = form?.get("kind") === "avatar_contact" ? "avatar_contact" : "avatar_user";
  const contactId = typeof form?.get("contactId") === "string" ? String(form.get("contactId")) : null;

  const extensao = arquivo.type.split("/")[1].replace("jpeg", "jpg");
  const chave = `${ctx.userId}/${kind}/${newId()}.${extensao}`;

  const { env } = await getCloudflareContext({ async: true });
  await env.MEDIA.put(chave, await arquivo.arrayBuffer(), {
    httpMetadata: { contentType: arquivo.type },
  });

  const url = `/api/media/${chave}`;

  await ctx.db.batch([
    ctx.db.insert(mediaUploads).values({
      id: newId(),
      userId: ctx.userId,
      contactId: kind === "avatar_contact" ? contactId : null,
      r2Key: chave,
      kind,
      contentType: arquivo.type,
      sizeBytes: arquivo.size,
    }),
    ...(kind === "avatar_user"
      ? [
          ctx.db
            .update(userProfile)
            .set({ avatarUrl: url, updatedAt: new Date() })
            .where(eq(userProfile.userId, ctx.userId)),
        ]
      : []),
  ] as never);

  return NextResponse.json({ url }, { status: 201 });
}
