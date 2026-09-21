"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

/**
 * Cadastro.
 *
 * O acesso é fechado por ALLOWED_EMAILS enquanto durar o beta: o servidor
 * responde 403 para quem não está na lista, e a mensagem aqui explica isso em
 * vez de mostrar um erro genérico — durante o recrutamento do Gate 0 essa
 * recusa vai ser comum e precisa ser compreensível.
 */
export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa de ao menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error: authError } = await authClient.signUp.email({
      email: email.trim(),
      password,
      name: name.trim() || email.split("@")[0],
    });

    if (authError) {
      if (authError.status === 403) {
        setError("Este e-mail ainda não está liberado. O acesso está limitado ao grupo de testes.");
      } else if (authError.status === 422) {
        setError("Já existe uma conta com este e-mail. Tente entrar.");
      } else {
        setError("Não foi possível criar a conta agora. Tente de novo.");
      }
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tighter text-[var(--foreground)]">
            Criar conta
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Acesso limitado ao grupo de testes
          </p>
        </div>

        <div className="bento-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--muted)]">Nome</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
                placeholder="Como quer ser chamado"
              />
            </label>

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
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
                placeholder="mínimo 6 caracteres"
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
              {loading ? "Criando…" : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Já tem conta?{" "}
          <Link href="/login" className="text-[var(--accent-violet)] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
