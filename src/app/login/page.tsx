"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { authClient } from "@/lib/auth-client";

/**
 * Entrada da versão web.
 *
 * A tela anterior usava Magic Link do Supabase e foi apagada no pivô; esta
 * fala com o Better Auth pelas rotas em /api/auth. O provedor Apple não
 * aparece: as credenciais APPLE_* estão vazias, e um botão que só falha é
 * pior que botão nenhum.
 */
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (authError) {
      // A mensagem do Better Auth vem em inglês e é genérica de propósito
      // (não revela se o e-mail existe). Mantemos a discrição, em português.
      setError(
        authError.status === 401 || authError.status === 403
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar agora. Tente de novo."
      );
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    await authClient.signIn.social({ provider: "google", callbackURL: redirectTo });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tighter text-[var(--foreground)]">
            Kiss Flow
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Entre para continuar
          </p>
        </div>

        <div className="bento-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--muted)]">E-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
                placeholder="voce@exemplo.com"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--muted)]">Senha</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-[#e11d48]/30 bg-[#e11d48]/10 px-3 py-2 text-xs text-[#fda4af]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--card-border)]" />
            <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">ou</span>
            <span className="h-px flex-1 bg-[var(--card-border)]" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--card-hover)]"
          >
            Continuar com Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Não tem conta?{" "}
          <Link href="/signup" className="text-[var(--accent-violet)] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  // useSearchParams exige Suspense numa rota que pode ser pré-renderizada.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
