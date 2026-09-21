"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  PIPELINE_STAGES,
  STATUS_LABELS,
  type Contact,
  type ContactStatus,
} from "@/lib/types";

const FILTROS: Array<{ id: ContactStatus | "todos"; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "active", label: "Ativos" },
  { id: "won", label: "Ganhamos" },
  { id: "frozen", label: "Geladeira" },
  { id: "lost", label: "Perdidos" },
];

const nomeDaFase = (id: string) =>
  PIPELINE_STAGES.find((f) => f.id === id)?.name ?? id;

export default function AlvosClient() {
  const [contatos, setContatos] = useState<Contact[] | null>(null);
  const [filtro, setFiltro] = useState<ContactStatus | "todos">("todos");

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const r = await fetch("/api/crm/contacts");
      if (!r.ok || cancelado) return;
      const { contacts } = (await r.json()) as { contacts: Contact[] };
      if (!cancelado) setContatos(contacts);
    })();
    return () => { cancelado = true; };
  }, []);

  const visiveis =
    contatos?.filter((c) => filtro === "todos" || c.status === filtro) ?? [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tighter">Meus alvos</h1>
        </div>
        <Link
          href="/alvos/novo"
          className="shrink-0 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Novo alvo
        </Link>
      </div>

      {contatos === null ? (
        <p className="mt-8 text-sm text-[var(--muted)]">Carregando…</p>
      ) : contatos.length === 0 ? (
        <div className="bento-card mt-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            Você ainda não cadastrou ninguém. Comece pela pessoa com quem já existe
            alguma conversa — o sistema precisa de histórico para analisar.
          </p>
          <Link
            href="/alvos/novo"
            className="mt-4 inline-block rounded-lg border border-[var(--accent-violet)] px-4 py-2 text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--accent-purple)]/15"
          >
            Cadastrar o primeiro
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {FILTROS.map((f) => {
              const quantos =
                f.id === "todos"
                  ? contatos.length
                  : contatos.filter((c) => c.status === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    filtro === f.id
                      ? "border-[var(--accent-violet)] bg-[var(--accent-purple)]/15 text-[var(--foreground)]"
                      : "border-[var(--card-border)] text-[var(--muted)] hover:border-[#3a3a3a]"
                  }`}
                >
                  {f.label} ({quantos})
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {visiveis.map((c) => (
              <Link key={c.id} href={`/alvos/${c.id}`} className="bento-card block !py-4 hover:border-[#3a3a3a]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {nomeDaFase(c.pipelineStage)}
                      {c.status !== "active" && ` · ${STATUS_LABELS[c.status]}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-4 text-right">
                    <Metrica rotulo="Recep." valor={c.victimScore} />
                    <Metrica rotulo="Mistério" valor={c.mysteryCoefficient} />
                    <Metrica rotulo="Tensão" valor={c.tensionLevel} />
                  </div>
                </div>
              </Link>
            ))}
            {visiveis.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--muted)]">
                Nenhum alvo nesse filtro.
              </p>
            )}
          </div>
        </>
      )}
    </main>
  );
}

function Metrica({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div>
      <p className="text-sm font-semibold tabular-nums">{Math.round(valor)}</p>
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{rotulo}</p>
    </div>
  );
}
