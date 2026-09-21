import { NextResponse } from "next/server";

import { withApi } from "@/server/guard";
import { loadState } from "@/server/repo/crm";

/**
 * Carga inicial do cliente: contatos, interações, histórico de fases e perfil,
 * numa requisição só.
 *
 * Substitui o `loadState()` do localStorage em `src/lib/store.ts`, que era
 * por dispositivo e sem dono. Um endpoint só porque os motores de análise
 * (engine, analytics, user-scoring) precisam do conjunto inteiro para
 * calcular — buscar em pedaços renderizaria números errados no meio do
 * caminho.
 */
export const GET = withApi(null, async ({ ctx }) => {
  return NextResponse.json(await loadState(ctx));
});
