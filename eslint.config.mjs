import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Saída de build do OpenNext e estado local do wrangler. Sem estas duas
    // linhas o lint analisa os bundles gerados: eram 12.223 problemas, dos
    // quais quase nada vinha de código escrito por gente.
    ".open-next/**",
    ".wrangler/**",

    // Tipos gerados por `wrangler types`.
    "cloudflare-env.d.ts",

    // O app mobile tem tooling próprio (Expo) e é lintado de dentro dele.
    "apps/**",

    // Migrations e snapshots gerados pelo drizzle-kit.
    "drizzle/**",
  ]),
]);

export default eslintConfig;
