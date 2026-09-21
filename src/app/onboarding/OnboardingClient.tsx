"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ARCHETYPE_RESULTS, QUIZ_QUESTIONS } from "@/lib/archetype-quiz";

/**
 * Onboarding guiado.
 *
 * Não é só um formulário: cada etapa explica por que está pedindo aquilo, e
 * o fim aponta a próxima ação concreta em vez de despejar o usuário num
 * painel vazio. O critério do Gate 0 é que 8 em 10 concluam sem ajuda — o
 * que exige que a pessoa entenda o que está fazendo enquanto faz.
 *
 * Serve também para refazer o quiz (`refazendo`), porque comportamento muda
 * e um arquétipo travado para sempre viraria rótulo, não retrato.
 */

type Etapa = "abertura" | "identidade" | "quiz" | "resultado";

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

interface Props {
  refazendo: boolean;
  arquetipoAtual: string | null;
  inicial: {
    displayName: string;
    gender: string;
    orientation: string;
    ageRange: string;
  };
}

export default function OnboardingClient({ refazendo, arquetipoAtual, inicial }: Props) {
  const router = useRouter();

  const [etapa, setEtapa] = useState<Etapa>("abertura");
  const [displayName, setDisplayName] = useState(inicial.displayName);
  const [gender, setGender] = useState(inicial.gender);
  const [orientation, setOrientation] = useState(inicial.orientation);
  const [ageRange, setAgeRange] = useState(inicial.ageRange);

  const [indice, setIndice] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [resultado, setResultado] = useState<{ primary: string; secondary: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const pergunta = QUIZ_QUESTIONS[indice];
  const respondidas = Object.keys(answers).length;
  const progresso = Math.round((respondidas / QUIZ_QUESTIONS.length) * 100);
  const identidadeOk = Boolean(displayName.trim() && gender && orientation);

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

    setResultado((await resposta.json()) as { primary: string; secondary: string });
    setEtapa("resultado");
    setEnviando(false);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      {etapa === "abertura" && (
        <div>
          <h1 className="text-3xl font-semibold tracking-tighter">
            {refazendo ? "Refazer o diagnóstico" : "Bem-vindo"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {refazendo
              ? "Seu jeito de se relacionar muda com o tempo. Responder de novo atualiza o diagnóstico e, com ele, o tipo de sugestão que você recebe."
              : "Antes de começar, o sistema precisa entender como você se relaciona. São 18 perguntas rápidas, sem resposta certa ou errada."}
          </p>

          <div className="bento-card mt-6">
            <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">
              Como isto funciona
            </h2>
            <ol className="mt-4 flex flex-col gap-4">
              <Passo n={1} titulo="Você responde o diagnóstico">
                As perguntas mapeiam seu estilo. O resultado define o tom das
                sugestões que a IA vai te dar.
              </Passo>
              <Passo n={2} titulo="Cadastra alguém com quem já conversa">
                Comece por uma pessoa real, com quem já existe algum histórico —
                sem histórico não há o que analisar.
              </Passo>
              <Passo n={3} titulo="Registra o que acontece">
                Cada conversa, encontro ou silêncio vira dado. As métricas só
                significam algo depois disso.
              </Passo>
              <Passo n={4} titulo="Pede a leitura da situação">
                O sistema devolve o que está acontecendo e sugere o próximo
                passo, sempre explicando o porquê.
              </Passo>
            </ol>
          </div>

          {refazendo && arquetipoAtual && (
            <p className="mt-4 text-xs text-[var(--muted)]">
              Diagnóstico atual:{" "}
              <strong className="text-[var(--foreground)]">
                {ARCHETYPE_RESULTS[arquetipoAtual]?.name ?? arquetipoAtual}
              </strong>
              . Ele só muda quando você concluir as 18 perguntas.
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setEtapa("identidade")}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Começar
            </button>
            {refazendo && (
              <Link
                href="/perfil"
                className="rounded-lg border border-[var(--card-border)] px-4 py-2.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                Cancelar
              </Link>
            )}
          </div>
        </div>
      )}

      {etapa === "identidade" && (
        <div>
          <h1 className="text-3xl font-semibold tracking-tighter">Sobre você</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Isto define como o sistema fala com você e adapta a linguagem. Nada
            disso aparece para ninguém além de você.
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

            <div className="flex gap-3">
              <button
                onClick={() => setEtapa("abertura")}
                className="rounded-lg border border-[var(--card-border)] px-4 py-2.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                Voltar
              </button>
              <button
                disabled={!identidadeOk}
                onClick={() => setEtapa("quiz")}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Ir para o diagnóstico
              </button>
            </div>
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
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Escolha o que mais parece com você, não o que soa melhor.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              {pergunta.options.map((opcao, i) => (
                <button
                  key={i}
                  disabled={enviando}
                  onClick={() => escolher(i)}
                  className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-4 py-3 text-left text-sm leading-snug transition-colors hover:border-[var(--accent-violet)] hover:bg-[var(--card-hover)] disabled:opacity-50"
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

            {enviando && (
              <p className="mt-4 text-xs text-[var(--muted)]">Apurando seu resultado…</p>
            )}
          </div>
        </div>
      )}

      {etapa === "resultado" && resultado && (
        <div>
          <p className="text-center text-xs uppercase tracking-widest text-[var(--muted)]">
            {refazendo && arquetipoAtual && arquetipoAtual !== resultado.primary
              ? "Seu diagnóstico mudou"
              : "Seu diagnóstico"}
          </p>
          <h1 className="mt-2 text-center text-4xl font-semibold tracking-tighter">
            {ARCHETYPE_RESULTS[resultado.primary]?.name ?? resultado.primary}
          </h1>

          {refazendo && arquetipoAtual && arquetipoAtual !== resultado.primary && (
            <p className="mt-2 text-center text-xs text-[var(--muted)]">
              antes: {ARCHETYPE_RESULTS[arquetipoAtual]?.name ?? arquetipoAtual}
            </p>
          )}

          <div className="bento-card mt-6">
            <p className="text-sm leading-relaxed">
              {ARCHETYPE_RESULTS[resultado.primary]?.description ?? ""}
            </p>

            {ARCHETYPE_RESULTS[resultado.primary]?.strengths?.length ? (
              <div className="mt-5 grid grid-cols-2 gap-4">
                <Lista titulo="Pontos fortes" itens={ARCHETYPE_RESULTS[resultado.primary].strengths} cor="#059669" />
                <Lista titulo="Pontos de atenção" itens={ARCHETYPE_RESULTS[resultado.primary].weaknesses} cor="#d97706" />
              </div>
            ) : null}

            {ARCHETYPE_RESULTS[resultado.secondary] && (
              <p className="mt-5 text-xs text-[var(--muted)]">
                Traço secundário:{" "}
                <strong className="text-[var(--foreground)]">
                  {ARCHETYPE_RESULTS[resultado.secondary].name}
                </strong>
              </p>
            )}
          </div>

          <div className="bento-card mt-4">
            <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">
              Próximo passo
            </h2>
            <p className="mt-3 text-sm leading-relaxed">
              Cadastre alguém com quem você já conversa. O sistema precisa de
              histórico real para analisar — com uma pessoa só já dá para começar.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/alvos/novo"
                className="flex-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Cadastrar a primeira pessoa
              </Link>
              <button
                onClick={() => { router.push("/"); router.refresh(); }}
                className="rounded-lg border border-[var(--card-border)] px-4 py-2.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                Ir para o painel
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            Você pode refazer este diagnóstico quando quiser, pelo seu perfil.
          </p>
        </div>
      )}
    </main>
  );
}

function Passo({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--accent-violet)] text-[11px] text-[var(--accent-violet)]">
        {n}
      </span>
      <div>
        <p className="text-sm font-medium">{titulo}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{children}</p>
      </div>
    </li>
  );
}

function Lista({ titulo, itens, cor }: { titulo: string; itens: string[]; cor: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: cor }}>{titulo}</p>
      <ul className="mt-2 flex flex-col gap-1">
        {itens.map((i) => (
          <li key={i} className="text-xs leading-snug text-[var(--muted)]">{i}</li>
        ))}
      </ul>
    </div>
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
