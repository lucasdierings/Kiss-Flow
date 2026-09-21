"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  INTERACTION_CATEGORIES,
  PIPELINE_STAGES,
  STATUS_LABELS,
  type Contact,
  type Interaction,
  type InteractionCategory,
} from "@/lib/types";

/**
 * Detalhe do alvo: onde o loop do Gate 0 fecha.
 *
 * Capturar (registrar interação) → receber (pedir leitura à IA) → agir
 * (copiar uma sugestão) → aprender (o sentimento da próxima interação).
 *
 * As métricas exibidas vêm do servidor. O cliente não as calcula nem as
 * envia: manda o fato ocorrido, e o engine decide o efeito.
 */

interface Sugestao {
  title: string;
  text: string;
}

export default function AlvoDetalheClient({ id }: { id: string }) {
  const router = useRouter();

  const [contato, setContato] = useState<Contact | null>(null);
  const [interacoes, setInteracoes] = useState<Interaction[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  const recarregar = useCallback(async () => {
    const [rc, rs] = await Promise.all([
      fetch(`/api/crm/contacts/${id}`),
      fetch("/api/crm/state"),
    ]);

    if (rc.status === 404) {
      setNaoEncontrado(true);
      setCarregando(false);
      return;
    }

    if (rc.ok) setContato(((await rc.json()) as { contact: Contact }).contact);
    if (rs.ok) {
      const estado = (await rs.json()) as { interactions: Interaction[] };
      setInteracoes(
        estado.interactions
          .filter((i) => i.contactId === id)
          .sort((a, b) => b.date.localeCompare(a.date))
      );
    }
    setCarregando(false);
  }, [id]);

  useEffect(() => { void recarregar(); }, [recarregar]);

  if (carregando) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-[var(--muted)]">Carregando…</main>;
  }

  if (naoEncontrado || !contato) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-[var(--muted)]">Esta pessoa não existe ou foi removida.</p>
        <Link href="/alvos" className="mt-4 inline-block text-sm text-[var(--accent-violet)] hover:underline">
          ← Meus alvos
        </Link>
      </main>
    );
  }

  const fase = PIPELINE_STAGES.find((f) => f.id === contato.pipelineStage);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/alvos" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Meus alvos
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tighter">
            {contato.firstName} {contato.lastName}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {fase?.name}
            {contato.status !== "active" && ` · ${STATUS_LABELS[contato.status]}`}
          </p>
        </div>
        {contato.phone && (
          <a
            href={`https://wa.me/${contato.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:border-[#3a3a3a] hover:text-[var(--foreground)]"
          >
            Abrir WhatsApp
          </a>
        )}
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metrica rotulo="Receptividade" valor={contato.victimScore} cor="#8b5cf6" />
        <Metrica rotulo="Mistério" valor={contato.mysteryCoefficient} cor="#06b6d4" />
        <Metrica rotulo="Tensão" valor={contato.tensionLevel} cor="#d97706" />
        <Metrica rotulo="Escassez" valor={contato.scarcityScore} cor="#059669" />
      </section>

      <RegistrarInteracao contatoId={id} aoRegistrar={recarregar} />

      <PedirLeitura contatoId={id} nome={contato.firstName} />

      <section className="mt-8">
        <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">
          Histórico ({interacoes.length})
        </h2>
        {interacoes.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Nada registrado ainda. As métricas acima começam nos valores iniciais e
            só passam a significar algo depois das primeiras interações.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {interacoes.map((i) => (
              <li key={i.id} className="bento-card !py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">{nomeDoTipo(i.typeId)}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(i.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {i.notes && <p className="mt-1.5 text-xs text-[var(--muted)]">{i.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function nomeDoTipo(typeId: string): string {
  for (const cat of Object.values(INTERACTION_CATEGORIES)) {
    const achado = cat.types.find((t) => t.id === typeId);
    if (achado) return achado.name;
  }
  return typeId;
}

function Metrica({ rotulo, valor, cor }: { rotulo: string; valor: number; cor: string }) {
  return (
    <div className="bento-card !p-3">
      <p className="text-xl font-semibold tabular-nums" style={{ color: cor }}>
        {Math.round(valor)}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">{rotulo}</p>
    </div>
  );
}

function RegistrarInteracao({
  contatoId,
  aoRegistrar,
}: {
  contatoId: string;
  aoRegistrar: () => Promise<void>;
}) {
  const [categoria, setCategoria] = useState<InteractionCategory>("digital_active");
  const [typeId, setTypeId] = useState("dm_casual");
  const [sentiment, setSentiment] = useState(0);
  const [initiatedByTarget, setInitiatedByTarget] = useState(false);
  const [notes, setNotes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sugestaoFase, setSugestaoFase] = useState<string | null>(null);

  const tipos = INTERACTION_CATEGORIES[categoria].types;

  async function registrar() {
    setSalvando(true);
    setErro(null);

    const r = await fetch(`/api/crm/contacts/${contatoId}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        typeId,
        category: categoria,
        sentiment,
        date: new Date().toISOString(),
        notes: notes.trim(),
        initiatedByTarget,
      }),
    });

    if (!r.ok) {
      setErro("Não foi possível registrar. Tente de novo.");
      setSalvando(false);
      return;
    }

    const { suggestedProgression } = (await r.json()) as { suggestedProgression?: string };
    // O servidor apenas SUGERE avanço de fase; comitar exige evidência
    // escrita, o que é feito em tela própria. Aqui só avisamos.
    setSugestaoFase(
      suggestedProgression
        ? PIPELINE_STAGES.find((f) => f.id === suggestedProgression)?.name ?? null
        : null
    );

    setNotes("");
    setSentiment(0);
    setInitiatedByTarget(false);
    await aoRegistrar();
    setSalvando(false);
  }

  return (
    <section className="bento-card mt-6">
      <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">
        Registrar interação
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(INTERACTION_CATEGORIES) as InteractionCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategoria(c);
              setTypeId(INTERACTION_CATEGORIES[c].types[0].id);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              categoria === c
                ? "border-[var(--accent-violet)] bg-[var(--accent-purple)]/15"
                : "border-[var(--card-border)] text-[var(--muted)] hover:border-[#3a3a3a]"
            }`}
          >
            {INTERACTION_CATEGORIES[c].name}
          </button>
        ))}
      </div>

      <select
        value={typeId}
        onChange={(e) => setTypeId(e.target.value)}
        className="mt-3 w-full rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-violet)]"
      >
        {tipos.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <label className="mt-4 block">
        <span className="text-xs text-[var(--muted)]">
          Como foi: <strong className="text-[var(--foreground)]">{rotuloSentimento(sentiment)}</strong>
        </span>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.25}
          value={sentiment}
          onChange={(e) => setSentiment(Number(e.target.value))}
          className="mt-2 w-full accent-[#8b5cf6]"
        />
      </label>

      <label className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
        <input
          type="checkbox"
          checked={initiatedByTarget}
          onChange={(e) => setInitiatedByTarget(e.target.checked)}
          className="accent-[#8b5cf6]"
        />
        Foi ela quem procurou
      </label>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="O que aconteceu (opcional)"
        className="mt-3 w-full resize-y rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
      />

      {erro && <p role="alert" className="mt-3 text-xs text-[#fda4af]">{erro}</p>}

      {sugestaoFase && (
        <p className="mt-3 rounded-lg border border-[var(--accent-violet)]/40 bg-[var(--accent-purple)]/10 px-3 py-2 text-xs">
          O sistema sugere avançar para <strong>{sugestaoFase}</strong>. A mudança de
          fase exige evidência escrita e ainda não foi aplicada.
        </p>
      )}

      <button
        onClick={registrar}
        disabled={salvando}
        className="mt-4 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {salvando ? "Registrando…" : "Registrar"}
      </button>
    </section>
  );
}

function rotuloSentimento(v: number) {
  if (v <= -0.75) return "Muito ruim";
  if (v <= -0.25) return "Ruim";
  if (v < 0.25) return "Neutro";
  if (v < 0.75) return "Bom";
  return "Muito bom";
}

function PedirLeitura({ contatoId, nome }: { contatoId: string; nome: string }) {
  const [mensagem, setMensagem] = useState("");
  const [pensando, setPensando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [diagnostico, setDiagnostico] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [copiada, setCopiada] = useState<number | null>(null);

  async function pedir() {
    setPensando(true);
    setErro(null);
    setDiagnostico(null);
    setSugestoes([]);

    const r = await fetch("/api/ai/advise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contatoId, userMessage: mensagem.trim() }),
    });

    const corpo = (await r.json().catch(() => null)) as
      | { diagnosis?: string; options?: Sugestao[]; error?: string; detail?: string }
      | null;

    if (!r.ok) {
      setErro(corpo?.detail ?? corpo?.error ?? "Não foi possível gerar a leitura agora.");
      setPensando(false);
      return;
    }

    setDiagnostico(corpo?.diagnosis ?? null);
    setSugestoes(corpo?.options ?? []);
    setPensando(false);
  }

  return (
    <section className="bento-card mt-6">
      <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">
        Pedir leitura da situação
      </h2>
      <p className="mt-1.5 text-xs text-[var(--muted)]">
        Descreva o que está acontecendo com {nome}. A resposta pode levar alguns
        segundos.
      </p>

      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        rows={3}
        placeholder="Ela respondeu rápido e mandou um áudio rindo. O que faço agora?"
        className="mt-3 w-full resize-y rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
      />

      <button
        onClick={pedir}
        disabled={pensando || mensagem.trim().length < 3}
        className="mt-3 rounded-lg border border-[var(--accent-violet)] px-4 py-2.5 text-sm transition-colors hover:bg-[var(--accent-purple)]/15 disabled:opacity-40"
      >
        {pensando ? "Analisando…" : "Analisar"}
      </button>

      {erro && (
        <p role="alert" className="mt-3 rounded-lg border border-[#e11d48]/30 bg-[#e11d48]/10 px-3 py-2 text-xs text-[#fda4af]">
          {erro}
        </p>
      )}

      {diagnostico && (
        <div className="mt-5">
          <p className="text-sm leading-relaxed">{diagnostico}</p>

          {sugestoes.length > 0 && (
            <div className="mt-4 flex flex-col gap-2.5">
              {sugestoes.map((s, i) => (
                <div key={i} className="rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{s.title}</p>
                  <p className="mt-1.5 text-sm">{s.text}</p>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(s.text);
                      setCopiada(i);
                      setTimeout(() => setCopiada(null), 2000);
                    }}
                    className="mt-2 text-xs text-[var(--accent-violet)] hover:underline"
                  >
                    {copiada === i ? "Copiado" : "Copiar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
