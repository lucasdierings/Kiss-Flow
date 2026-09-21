import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import { requireUser, unauthorized } from "@/server/guard";

/**
 * Serve um arquivo do R2.
 *
 * A checagem de dono é o prefixo da chave: todo upload é gravado em
 * `<userId>/...`, então conferir o primeiro segmento contra a sessão basta —
 * sem consulta ao banco no caminho de leitura, que é o mais chamado.
 *
 * O bucket é privado. Sem esta rota não há como exibir imagem nenhuma.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ key: string[] }> }
): Promise<Response> {
  const ctx = await requireUser(request);
  if (!ctx) return unauthorized();

  const { key } = await context.params;
  const chave = key.join("/");

  if (key[0] !== ctx.userId) {
    // 404 e não 403: responder "existe, mas não é seu" entrega informação.
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const objeto = await env.MEDIA.get(chave);
  if (!objeto) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return new Response(objeto.body, {
    headers: {
      "Content-Type": objeto.httpMetadata?.contentType ?? "application/octet-stream",
      // Imutável: a chave tem um uuid, então trocar a foto gera outra URL.
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
