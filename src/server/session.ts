import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "./auth";

/**
 * Sessão em Server Components.
 *
 * Substitui o `src/proxy.ts`, removido por duas razões:
 *
 * 1. Incompatibilidade real. No Next 16 o Proxy roda **só** no runtime Node
 *    ("o `runtime` não está disponível em arquivos Proxy e define-lo lança
 *    erro", diz a doc da versão instalada), e o @opennextjs/cloudflare aborta
 *    o build ao encontrar middleware Node. Com o proxy no lugar, não havia
 *    deploy possível.
 * 2. Ele nunca funcionou. A lista de rotas públicas começava com "/" e era
 *    conferida com `startsWith` — todo caminho começa com "/", então o proxy
 *    liberava o site inteiro.
 *
 * A troca é para melhor: o proxy só olhava a assinatura do cookie, sem tocar
 * o banco, e por isso o próprio arquivo avisava que não era fronteira de
 * segurança. Isto aqui consulta a sessão de verdade.
 *
 * Não substitui o `requireUser()` das rotas de API — cada uma continua
 * autorizando por conta própria.
 */
export async function getSession() {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
}

/** Exige sessão; sem ela, manda para o login preservando o destino. */
export async function requireSession(redirectTo = "/") {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return session;
}
