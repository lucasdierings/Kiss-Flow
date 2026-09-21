import { getAuth } from "@/server/auth";

/**
 * Handler HTTP do Better Auth.
 *
 * Sem este arquivo não existe login: a instância em src/server/auth.ts estava
 * configurada, completa e inalcançável — nenhuma URL chegava até ela.
 *
 * O atalho usual (`export const { GET, POST } = toNextJsHandler(auth)`) espera
 * uma instância pronta no escopo do módulo. Aqui não serve: `getAuth()` é
 * assíncrona e construída por requisição, de propósito. Ver a nota em
 * src/server/db/client.ts sobre bindings capturados no escopo global.
 */
async function handler(request: Request): Promise<Response> {
  const auth = await getAuth();
  return auth.handler(request);
}

export { handler as GET, handler as POST };
