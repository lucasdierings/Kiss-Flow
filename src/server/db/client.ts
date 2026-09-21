import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";

import { schema } from "./schema";

/**
 * Cliente Drizzle sobre o D1.
 *
 * IMPORTANTE: construir por requisição, NUNCA no escopo do módulo. Workers
 * não permitem objetos com I/O capturados no escopo global entre requisições,
 * e `getCloudflareContext()` não é confiável em tempo de avaliação do módulo.
 * Fazer isso no topo do arquivo funciona no `next dev` e falha no Worker
 * publicado — é o erro que custa um dia de debug.
 */
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
}

export type Db = Awaited<ReturnType<typeof getDb>>;
