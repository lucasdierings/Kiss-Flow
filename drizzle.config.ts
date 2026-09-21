import type { Config } from "drizzle-kit";

/**
 * Config do Drizzle Kit para o D1.
 *
 * Só gera SQL — quem aplica é o wrangler (`wrangler d1 migrations apply`),
 * que lê `migrations_dir` do wrangler.jsonc. Por isso `out` precisa continuar
 * apontando para a MESMA pasta declarada lá ("drizzle"); mudar um sem o outro
 * faz o wrangler aplicar um conjunto vazio de migrations sem reclamar.
 *
 * Sem `driver: "d1-http"` de propósito: push/studio direto contra o banco
 * remoto contornaria o histórico de migrations, que é justamente o que este
 * arquivo existe para proteger.
 */
export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
} satisfies Config;
