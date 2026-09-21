import { NextResponse } from "next/server";
import type { z } from "zod";

import { getAuth } from "./auth";
import { getDb, type Db } from "./db/client";

export interface Ctx {
  db: Db;
  userId: string;
  email: string;
}

/**
 * A autorização de verdade. O proxy só faz redirecionamento otimista pela
 * assinatura do cookie — toda rota que toca dado passa por aqui.
 */
export async function requireUser(request: Request): Promise<Ctx | null> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;

  return {
    db: await getDb(),
    userId: session.user.id,
    email: session.user.email,
  };
}

export const unauthorized = () =>
  NextResponse.json({ error: "Não autenticado" }, { status: 401 });

export const notFound = (what = "Recurso") =>
  NextResponse.json({ error: `${what} não encontrado` }, { status: 404 });

/**
 * Envolve um handler com checagem de sessão e validação de corpo.
 * Handlers de leitura passam `schema: null`.
 */
export function withApi<S extends z.ZodTypeAny | null>(
  schema: S,
  handler: (
    args: {
      body: S extends z.ZodTypeAny ? z.infer<S> : undefined;
      ctx: Ctx;
      request: Request;
      params: Record<string, string>;
    }
  ) => Promise<Response>
) {
  return async (
    request: Request,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<Response> => {
    const ctx = await requireUser(request);
    if (!ctx) return unauthorized();

    let body: unknown = undefined;
    if (schema) {
      let raw: unknown;
      try {
        raw = await request.json();
      } catch {
        return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
      }
      const parsed = (schema as z.ZodTypeAny).safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Corpo inválido", details: parsed.error.issues },
          { status: 400 }
        );
      }
      body = parsed.data;
    }

    const params = context?.params ? await context.params : {};

    try {
      return await handler({
        body: body as never,
        ctx,
        request,
        params,
      });
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  };
}

export const newId = () => crypto.randomUUID();
