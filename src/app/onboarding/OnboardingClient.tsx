"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ARCHETYPE_RESULTS, QUIZ_QUESTIONS } from "@/lib/archetype-quiz";

/**
 * Onboarding: identidade + quiz de arquétipo.
 *
 * Existe porque a regra nº 1 do produto exige o quiz antes do uso, e porque
 * sem ele o dashboard mostrava números inventados como se fossem do usuário.
 * O arquétipo é calculado no servidor; aqui só coletamos.
 */

const GENEROS = [
  { id: "masculino", label: "Masculino" },
  { id: "feminino", label: "Feminino" },
  { id: "nao_binario", label: "Não-binário" },
  { id: "outro", label: "Prefiro não dizer" },
];

const ORIENTACOES = [
  { id: "mulheres", label: "Mulheres" },
  { id: "homens", label: "Homens" },
  { id: "ambos", label: "Ambos" },
];

const FAIXAS = ["18-24", "25-34", "35-44", "45+"];

export default function OnboardingClient({ nomeInicial }: { nomeInicial: string }) {
  const router = useRouter();

  const [etapa, setEtapa] = useState<"identidade" | "quiz" | "resultado">("identidade");
  const [displayName, setDisplayName] = useState(nomeInicial);
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [ageRange, setAgeRange] = useState("");

  const [indice, setIndice] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [resultado, setResultado] = useState<{ primary: string; secondary: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const pergunta = QUIZ_QUESTIONS[indice];
  const progresso = Math.round((Object.keys(answers).length / QUIZ_QUESTIONS.length) * 100);

  const identidadeOk = displayName.trim() && gender && orientation;

  async function escolher(opcaoIndex: number) {
    const atualizadas = { ...answers, [pergunta.id]: opcaoIndex };
    setAnswers(atualizadas);

    if (indice < QUIZ_QUESTIONS.length - 1) {
      setIndice(indice + 1);
      return;
    }

    setEnviando(true);
    setErro(null);

    const resposta = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayName.trim(),
        gender,
        orientation,
        ageRange: ageRange || undefined,
        answers: atualizadas,
      }),
    });

    if (!resposta.ok) {
      setErro("Não foi possível salvar suas respostas. Tente de novo.");
      setEnviando(false);
      return;
    }

    setResultado(await resposta.json());
    setEtapa("resultado");
    setEnviando(false);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      {etapa === "identidade" && (
        <div>
          <h1 className="text-3xl font-semibold tracking-tighter">Antes de começar</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Três respostas rápidas para o sistema falar com você do jeito certo.
          </p>

          <div className="bento-card mt-6 flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--muted)]">Como quer ser chamado</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-violet)]"
                placeholder="Seu nome"
              />
            </label>

            <Grupo titulo="Seu gênero" opcoes={GENEROS} valor={gender} aoEscolher={setGender} />
            <Grupo titulo="Você se interessa por" opcoes={ORIENTACOES} valor={orientation} aoEscolher={setOrientation} />
            <Grupo
              titulo="Faixa etária (opcional)"
              opcoes={FAIXAS.map((f) => ({ id: f, label: f }))}
              valor={ageRange}
              aoEscolher={setAgeRange}
            />

            <button
              disabled={!identidadeOk}
              onClick={() => setEtapa("quiz")}
              className="mt-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {etapa === "quiz" && (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Pergunta {indice + 1} de {QUIZ_QUESTIONS.length}</span>
              <span>{progresso}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--card-border)]">
              <div
                className="h-full bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          <div className="bento-card">
            <h2 className="text-lg font-medium leading-snug">{pergunta.question}</h2>

            <div className="mt-5 flex flex-col gap-2.5">
              {pergunta.options.map((opcao, i) => (
                <button
                  key={i}
                  disabled={enviando}
                  onClick={() => escolher(i)}
                  className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-4 py-3 text-left text-sm transition-colors hover:border-[var(--accent-violet)] hover:bg-[var(--card-hover)] disabled:opacity-50"
                >
                  {opcao.text}
                </button>
              ))}
            </div>

            {erro && (
              <p role="alert" className="mt-4 rounded-lg border border-[#e11d48]/30 bg-[#e11d48]/10 px-3 py-2 text-xs text-[#fda4af]">
                {erro}
              </p>
            )}

            {indice > 0 && !enviando && (
              <button
                onClick={() => setIndice(indice - 1)}
                className="mt-4 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                ← Voltar
              </button>
            )}
          </div>
        </div>
      )}

      {etapa === "resultado" && resultado && (
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Seu arquétipo</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tighter">
            {ARCHETYPE_RESULTS[resultado.primary]?.name ?? resultado.primary}
          </h1>

          <div className="bento-card mt-6 text-left">
            <p className="text-sm leading-relaxed text-[var(--foreground)]">
              {ARCHETYPE_RESULTS[resultado.primary]?.description ?? ""}
            </p>
            {ARCHETYPE_RESULTS[resultado.secondary] && (
              <p className="mt-4 text-xs text-[var(--muted)]">
                Traço secundário: {ARCHETYPE_RESULTS[resultado.secondary].name}
              </p>
            )}
          </div>

          <button
            onClick={() => { router.push("/"); router.refresh(); }}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Entrar no app
          </button>
        </div>
      )}
    </main>
  );
}

function Grupo({
  titulo,
  opcoes,
  valor,
  aoEscolher,
}: {
  titulo: string;
  opcoes: { id: string; label: string }[];
  valor: string;
  aoEscolher: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--muted)]">{titulo}</span>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => aoEscolher(o.id)}
            className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
              valor === o.id
                ? "border-[var(--accent-violet)] bg-[var(--accent-purple)]/15 text-[var(--foreground)]"
                : "border-[var(--card-border)] bg-[#0D0D0D] text-[var(--muted)] hover:border-[#3a3a3a]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
