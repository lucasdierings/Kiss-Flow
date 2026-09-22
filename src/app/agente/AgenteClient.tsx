"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import Carteira from "@/components/Carteira";
import { PIPELINE_STAGES, type Contact } from "@/lib/types";

/**
 * O agente.
 *
 * DUAS VERSÕES ANTIGAS FORAM CONSULTADAS
 *
 * A web tinha `/chat` (547 linhas, apagada no pivô) com três modos — conversa,
 * sugerir e validar. Ela dependia de `/api/ai/chat`, do Supabase e do
 * `context-engine`, e os três foram removidos. Ressuscitar exigiria uma rota
 * nova e uma tabela de mensagens que o D1 não tem.
 *
 * O mobile tem `mentor.tsx`, que já conversa com `/api/ai/advise` — a rota que
 * existe e funciona.
 *
 * ESTA TELA fica sobre o que funciona hoje, com o que valia a pena das duas:
 * seleção de pessoa (a análise exige contexto de alguém), diagnóstico, e as
 * sugestões com copiar e abrir no WhatsApp.
 *
 * O QUE NÃO TEM, E POR QUÊ
 *
 * A conversa **não é salva**. Não existe tabela de mensagens no D1, e a tela
 * avisa isso em vez de deixar o usuário descobrir ao recarregar. Persistir
 * exige migração — decisão de produto, não detalhe de tela.
 */

interface Sugestao {
  title: string;
  text: string;
}

interface Resposta {
  id: string;
  pergunta: string;
  mentor: string;
  diagnosis: string;
  options: Sugestao[];
  principleApplied?: string;
  creditosCobrados?: number;
}

export default function AgenteClient() {
  const [contatos, setContatos] = useState<Contact[] | null>(null);
  const [selecionado, setSelecionado] = useState<string>("");
  const [mensagem, setMensagem] = useState("");
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [pensando, setPensando] = useState(false);
  const [erro, setErro] = useState<{ texto: string; semCredito?: boolean } | null>(null);
  const [copiada, setCopiada] = useState<string | null>(null);

  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const r = await fetch("/api/crm/contacts");
      if (!r.ok || cancelado) return;
      const { contacts } = (await r.json()) as { contacts: Contact[] };
      if (cancelado) return;
      const ativos = contacts.filter((c) => c.status === "active");
      setContatos(ativos);
      if (ativos.length > 0) setSelecionado(ativos[0].id);
    })();
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [respostas, pensando]);

  const pessoa = contatos?.find((c) => c.id === selecionado);

  const perguntar = useCallback(async () => {
    const texto = mensagem.trim();
    if (!texto || !selecionado) return;

    setPensando(true);
    setErro(null);

    const r = await fetch("/api/ai/advise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: selecionado, userMessage: texto }),
    });

    const corpo = (await r.json().catch(() => null)) as
      | (Partial<Resposta> & { error?: string; detail?: string })
      | null;

    if (!r.ok) {
      setErro({
        texto: corpo?.detail ?? corpo?.error ?? "Não foi possível responder agora.",
        semCredito: r.status === 402,
      });
      setPensando(false);
      return;
    }

    setRespostas((atual) => [
      ...atual,
      {
        id: crypto.randomUUID(),
        pergunta: texto,
        mentor: corpo?.mentor ?? "",
        diagnosis: corpo?.diagnosis ?? "",
        options: corpo?.options ?? [],
        principleApplied: corpo?.principleApplied,
        creditosCobrados: (corpo as { quota?: { creditosCobrados?: number } })?.quota
          ?.creditosCobrados,
      },
    ]);
    setMensagem("");
    setPensando(false);
  }, [mensagem, selecionado]);

  async function copiar(id: string, texto: string) {
    await navigator.clipboard.writeText(texto);
    setCopiada(id);
    setTimeout(() => setCopiada(null), 2000);
  }

  function abrirWhatsApp(texto: string) {
    const numero = (pessoa?.phone ?? "").replace(/\D/g, "");
    if (!numero) return;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, "_blank");
  }

  if (contatos === null) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-[var(--muted)]">Carregando…</main>;
  }

  if (contatos.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Cabecalho />
        <div className="bento-card mt-6 text-center">
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            O agente lê a situação de uma pessoa específica — as métricas dela, o
            histórico e o que você anotou. Cadastre alguém primeiro.
          </p>
          <Link
            href="/alvos/novo"
            className="mt-4 inline-block rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Cadastrar a primeira pessoa
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10">
      <Cabecalho />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted)]">Sobre</span>
          <select
            value={selecionado}
            onChange={(e) => { setSelecionado(e.target.value); setRespostas([]); }}
            className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2 text-sm outline-none focus:border-[var(--accent-violet)]"
          >
            {contatos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </label>
        <Carteira compacto />
      </div>

      {pessoa && (
        <p className="mt-2 text-[11px] text-[var(--muted)]">
          {PIPELINE_STAGES.find((f) => f.id === pessoa.pipelineStage)?.name} ·
          receptividade {Math.round(pessoa.victimScore)} · mistério{" "}
          {Math.round(pessoa.mysteryCoefficient)} · tensão {Math.round(pessoa.tensionLevel)}
        </p>
      )}

      <div className="mt-6 flex-1">
        {respostas.length === 0 && !pensando && (
          <div className="bento-card">
            <p className="text-sm leading-relaxed">
              Conte o que está acontecendo com{" "}
              <strong>{pessoa?.firstName}</strong>. Quanto mais concreto, melhor a
              leitura — o que ela disse, quanto tempo levou para responder, o que
              você sentiu.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Ela demorou dois dias para responder e foi curta. O que faço?",
                "Conversamos por horas ontem. Chamo para sair agora ou espero?",
                "Ela parou de responder do nada.",
              ].map((exemplo) => (
                <button
                  key={exemplo}
                  onClick={() => setMensagem(exemplo)}
                  className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-left text-xs text-[var(--muted)] transition-colors hover:border-[#3a3a3a] hover:text-[var(--foreground)]"
                >
                  {exemplo}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {respostas.map((r) => (
            <article key={r.id}>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--accent-purple)]/15 px-4 py-2.5">
                <p className="text-sm">{r.pergunta}</p>
              </div>

              <div className="mt-4 bento-card">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-widest text-[var(--accent-violet)]">
                    {r.mentor}
                  </span>
                  {r.creditosCobrados != null && (
                    <span className="text-[10px] text-[var(--muted)]">
                      {r.creditosCobrados} crédito{r.creditosCobrados === 1 ? "" : "s"}
                    </span>
                  )}
                </div>

                <p className="mt-2.5 text-sm leading-relaxed">{r.diagnosis}</p>

                {r.options.length > 0 && (
                  <div className="mt-5 flex flex-col gap-2.5">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                      O que você pode mandar
                    </p>
                    {r.options.map((o, i) => {
                      const chave = `${r.id}-${i}`;
                      return (
                        <div key={i} className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] p-3">
                          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                            {o.title}
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed">{o.text}</p>
                          <div className="mt-2.5 flex gap-3">
                            <button
                              onClick={() => copiar(chave, o.text)}
                              className="text-xs text-[var(--accent-violet)] hover:underline"
                            >
                              {copiada === chave ? "Copiado" : "Copiar"}
                            </button>
                            {pessoa?.phone && (
                              <button
                                onClick={() => abrirWhatsApp(o.text)}
                                className="text-xs text-[#059669] hover:underline"
                              >
                                Abrir no WhatsApp
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {r.principleApplied && (
                  <p className="mt-4 border-t border-[var(--card-border)] pt-3 text-[11px] leading-relaxed text-[var(--muted)]">
                    <span className="uppercase tracking-wider">Por quê: </span>
                    {r.principleApplied}
                  </p>
                )}

                <p className="mt-3 text-[11px] text-[var(--muted)]">
                  Usou uma delas?{" "}
                  <Link href={`/alvos/${selecionado}`} className="text-[var(--accent-violet)] hover:underline">
                    Registre a interação
                  </Link>{" "}
                  — é o que faz a próxima leitura ser melhor.
                </p>
              </div>
            </article>
          ))}

          {pensando && (
            <div className="bento-card">
              <p className="text-sm text-[var(--muted)]">
                Lendo a situação… costuma levar alguns segundos.
              </p>
            </div>
          )}
        </div>

        <div ref={fim} />
      </div>

      {erro && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[#e11d48]/30 bg-[#e11d48]/10 px-3 py-2.5 text-xs text-[#fda4af]"
        >
          {erro.texto}
          {erro.semCredito && (
            <Link href="/perfil" className="ml-2 underline">
              Ver carteira
            </Link>
          )}
        </div>
      )}

      <div className="sticky bottom-0 mt-6 bg-[var(--background)] pb-2 pt-3">
        <div className="flex gap-2">
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void perguntar();
              }
            }}
            rows={2}
            placeholder={`O que está acontecendo com ${pessoa?.firstName ?? ""}?`}
            className="flex-1 resize-none rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
          />
          <button
            onClick={perguntar}
            disabled={pensando || mensagem.trim().length < 3}
            className="shrink-0 self-end rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {pensando ? "…" : "Perguntar"}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-[var(--muted)]">
          Cada pergunta consome 1 crédito. A conversa não fica salva — ao sair da
          página, ela se perde.
        </p>
      </div>
    </main>
  );
}

function Cabecalho() {
  return (
    <div>
      <Link href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tighter">Agente</h1>
      <p className="mt-1.5 text-sm text-[var(--muted)]">
        Descreva a situação e receba a leitura do que está acontecendo, com
        sugestões prontas para enviar.
      </p>
    </div>
  );
}
