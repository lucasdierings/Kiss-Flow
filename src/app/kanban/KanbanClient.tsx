"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  PIPELINE_STAGES,
  STATUS_LABELS,
  type Contact,
  type PipelineStage,
} from "@/lib/types";

/**
 * Quadro de gestão.
 *
 * Existia antes do pivô, lia localStorage e foi apagado. Volta consumindo a
 * API, e com a peça que faltava: a transição de fase agora é **aplicada**,
 * não só sugerida.
 *
 * A evidência é obrigatória de propósito — é a regra do domínio, validada
 * também no servidor (`transitionSchema`, mínimo de 10 caracteres). Arrastar
 * um cartão sem dizer o que aconteceu produziria um histórico sem valor
 * analítico, que é justamente do que a análise de conversão depende.
 */

type ColunaId = PipelineStage | "won" | "frozen" | "lost";

const COLUNAS: Array<{ id: ColunaId; nome: string; cor: string }> = [
  ...PIPELINE_STAGES.map((f) => ({ id: f.id as ColunaId, nome: f.name, cor: "#8b5cf6" })),
  { id: "won", nome: STATUS_LABELS.won, cor: "#059669" },
  { id: "frozen", nome: STATUS_LABELS.frozen, cor: "#06b6d4" },
  { id: "lost", nome: STATUS_LABELS.lost, cor: "#e11d48" },
];

const MOTIVOS = [
  { id: "desistencia", label: "Desisti" },
  { id: "rejeicao", label: "Fui rejeitado" },
  { id: "sucesso_efemero", label: "Aconteceu, mas não seguiu" },
];

function colunaDe(c: Contact): ColunaId {
  return c.status === "active" ? c.pipelineStage : (c.status as ColunaId);
}

export default function KanbanClient() {
  const [contatos, setContatos] = useState<Contact[] | null>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [pendente, setPendente] = useState<{ contato: Contact; destino: ColunaId } | null>(null);

  const carregar = useCallback(async () => {
    const r = await fetch("/api/crm/contacts");
    if (!r.ok) return;
    const { contacts } = (await r.json()) as { contacts: Contact[] };
    setContatos(contacts);
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  function soltar(destino: ColunaId) {
    const contato = contatos?.find((c) => c.id === arrastando);
    setArrastando(null);
    if (!contato || colunaDe(contato) === destino) return;
    setPendente({ contato, destino });
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10">
      <Link href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Dashboard
      </Link>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tighter">Quadro</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Arraste para mudar de fase. Toda mudança pede uma evidência.
          </p>
        </div>
        <Link
          href="/alvos/novo"
          className="shrink-0 rounded-lg border border-[var(--card-border)] px-4 py-2 text-xs transition-colors hover:border-[#3a3a3a]"
        >
          + Novo alvo
        </Link>
      </div>

      {contatos === null ? (
        <p className="mt-8 text-sm text-[var(--muted)]">Carregando…</p>
      ) : (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
          {COLUNAS.map((coluna) => {
            const daColuna = contatos.filter((c) => colunaDe(c) === coluna.id);
            return (
              <div
                key={coluna.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => soltar(coluna.id)}
                className="flex w-56 shrink-0 flex-col rounded-xl border border-[var(--card-border)] bg-[#121212] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: coluna.cor }}>
                    {coluna.nome}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">{daColuna.length}</span>
                </div>

                <div className="mt-3 flex min-h-[80px] flex-col gap-2">
                  {daColuna.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => setArrastando(c.id)}
                      onDragEnd={() => setArrastando(null)}
                      className={`cursor-grab rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] p-2.5 transition-opacity active:cursor-grabbing ${
                        arrastando === c.id ? "opacity-40" : ""
                      }`}
                    >
                      <Link href={`/alvos/${c.id}`} className="text-sm hover:underline">
                        {c.firstName} {c.lastName}
                      </Link>
                      <div className="mt-2 flex gap-2 text-[10px] text-[var(--muted)]">
                        <span>R {Math.round(c.victimScore)}</span>
                        <span>M {Math.round(c.mysteryCoefficient)}</span>
                        <span>T {Math.round(c.tensionLevel)}</span>
                      </div>
                    </div>
                  ))}
                  {daColuna.length === 0 && (
                    <p className="py-4 text-center text-[11px] text-[#3a3a3a]">vazio</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pendente && (
        <ModalTransicao
          contato={pendente.contato}
          destino={pendente.destino}
          aoFechar={() => setPendente(null)}
          aoConfirmar={async () => {
            setPendente(null);
            await carregar();
          }}
        />
      )}
    </main>
  );
}

function ModalTransicao({
  contato,
  destino,
  aoFechar,
  aoConfirmar,
}: {
  contato: Contact;
  destino: ColunaId;
  aoFechar: () => void;
  aoConfirmar: () => Promise<void>;
}) {
  const [evidencia, setEvidencia] = useState("");
  const [motivo, setMotivo] = useState("desistencia");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const ehPerda = destino === "lost";
  const nomeDestino = COLUNAS.find((c) => c.id === destino)?.nome ?? destino;
  const valido = evidencia.trim().length >= 10;

  async function confirmar() {
    setSalvando(true);
    setErro(null);

    const corpo =
      destino === "lost"
        ? { action: "lost", lostReason: motivo, evidence: evidencia.trim() }
        : destino === "won"
        ? { action: "won", evidence: evidencia.trim() }
        : destino === "frozen"
        ? { action: "freeze", evidence: evidencia.trim() }
        : { action: "stage", newStage: destino, evidence: evidencia.trim() };

    const r = await fetch(`/api/crm/contacts/${contato.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });

    if (!r.ok) {
      setErro("Não foi possível registrar a mudança. Tente de novo.");
      setSalvando(false);
      return;
    }

    await aoConfirmar();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={aoFechar}
    >
      <div className="w-full max-w-md bento-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-medium">
          {contato.firstName} → {nomeDestino}
        </h2>
        <p className="mt-1.5 text-xs text-[var(--muted)]">
          O que aconteceu para justificar essa mudança? Isso alimenta a análise de
          conversão depois.
        </p>

        {ehPerda && (
          <div className="mt-4 flex flex-wrap gap-2">
            {MOTIVOS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMotivo(m.id)}
                className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                  motivo === m.id
                    ? "border-[var(--accent-violet)] bg-[var(--accent-purple)]/15"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:border-[#3a3a3a]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={evidencia}
          onChange={(e) => setEvidencia(e.target.value)}
          rows={3}
          autoFocus
          placeholder="Ex.: marcamos de sair sexta, ela sugeriu o lugar"
          className="mt-4 w-full resize-y rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]"
        />
        <p className="mt-1 text-[11px] text-[var(--muted)]">
          {evidencia.trim().length < 10
            ? `Faltam ${10 - evidencia.trim().length} caracteres`
            : "Pronto"}
        </p>

        {erro && <p role="alert" className="mt-3 text-xs text-[#fda4af]">{erro}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={aoFechar}
            className="rounded-lg border border-[var(--card-border)] px-4 py-2.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={!valido || salvando}
            className="flex-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {salvando ? "Registrando…" : "Confirmar mudança"}
          </button>
        </div>
      </div>
    </div>
  );
}
