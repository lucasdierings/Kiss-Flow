import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";


import { getDb } from "./db/client";
import { account, session, user, userProfile, verification } from "./db/schema";

/**
 * Instância do Better Auth.
 *
 * Construída POR REQUISIÇÃO, de propósito. Um singleton de módulo guardaria
 * a referência ao binding D1 da primeira requisição — funciona no `next dev`
 * e falha no Worker publicado.
 *
 * Acesso fechado: `disableSignUp` bloqueia cadastro pela API e ALLOWED_EMAILS
 * é a segunda trava. Magic link e Google entram depois sem mexer no schema —
 * a tabela `account` já comporta ambos.
 */
export async function getAuth() {
  const db = await getDb();
  const { env } = await getCloudflareContext({ async: true });

  const secret = env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET ausente. Defina em .dev.vars (local) ou via `wrangler secret put` (produção)."
    );
  }

  return betterAuth({
    secret,
    baseURL: env.BETTER_AUTH_URL || undefined,

    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: { user, session, account, verification },
    }),

    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      minPasswordLength: 6,
    },
    
    emailVerification: {
      enabled: true,
      autoSignInAfterVerification: true,
    },

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || "",
        clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      },
      apple: {
        clientId: env.APPLE_CLIENT_ID || "",
        clientSecret: env.APPLE_CLIENT_SECRET || "",
        privateKey: env.APPLE_PRIVATE_KEY || "",
        teamId: env.APPLE_TEAM_ID || "",
        keyId: env.APPLE_KEY_ID || "",
      },
    },

    session: {
      // Deixa o proxy validar a sessão pela assinatura do cookie, sem I/O.
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },

    databaseHooks: {
      user: {
        create: {
          before: async (newUser) => {
            const allowed = (env.ALLOWED_EMAILS || "")
              .split(",")
              .map((e) => e.trim().toLowerCase())
              .filter(Boolean);

            // Restrição global de e-mails, se configurada no .dev.vars
            if (
              allowed.length > 0 &&
              !allowed.includes(newUser.email.toLowerCase())
            ) {
              throw new APIError("FORBIDDEN", {
                message: "Este e-mail não está autorizado.",
              });
            }

            return { data: newUser };
          },
          // Substitui o trigger do Supabase que criava user_profiles.
          after: async (createdUser) => {
            await db
              .insert(userProfile)
              .values({ userId: createdUser.id, displayName: createdUser.name })
              .onConflictDoNothing();
          },
        },
      },
    },
  });
}

export type Auth = Awaited<ReturnType<typeof getAuth>>;

/** Lista de e-mails autorizados. Vazia = sem restrição extra. */
export async function allowedEmails(): Promise<string[]> {
  const { env } = await getCloudflareContext({ async: true });
  return (env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
