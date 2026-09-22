"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CLOSING_GOALS, PIPELINE_STAGES, VICTIM_TYPES } from "@/lib/types";

/**
 * Cadastro de alvo.
 *
 * Primeiro passo do loop do Gate 0 (capturar). O botão "Adicionar primeiro
 * alvo" do dashboard apontava para cá desde o pivô, mas a página tinha sido
 * apagada — dava 404.
 *
 * Só o nome é obrigatório. O critério do Gate 0 é que 8 em 10 pessoas
 * concluam sem ajuda em até 2 minutos; formulário longo derruba isso, e o
 * resto pode ser completado depois ou inferido pela IA.
 */
export default function NovoAlvoClient() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryArchetype, setPrimaryArchetype] = useState<string>("");
  // Radar é o padrão: alvo recém-cadastrado, por definição, ainda não teve
  // interação nenhuma. A primeira interação registrada tira ele de lá.
  const [pipelineStage, setPipelineStage] = useState<string>("radar");
  const [closingGoal, setClosingGoal] = useState("");
  const [notes, setNotes] = useState("");

  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);

    const resposta = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          // O arquétipo pode ser descoberto depois; o padrão é o tipo mais
          // genérico da lista, não uma adivinhação disfarçada de dado.
          primaryArchetype: primaryArchetype || VICTIM_TYPES[0].id,
          pipelineStage,
          closingGoal: closingGoal || undefined,
          notes: notes.trim(),
        },
      }),
    });

    if (!resposta.ok) {
      const corpo = (await resposta.json().catch(() => null)) as
        | { error?: string; detail?: string }
        | null;
      if (resposta.status === 402) {
        setErro(corpo?.detail ?? "Limite de pessoas ativas do seu plano atingido.");
      } else {
        setErro(corpo?.error ?? "Não foi possível salvar. Tente de novo.");
      }
      setSalvando(false);
      return;
    }

    const { contact } = (await resposta.json()) as { contact: { id: string } };
    router.push(`/alvos/${contact.id}`);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/alvos" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Meus alvos
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tighter">Novo alvo</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Só o nome é obrigatório. O resto você completa conforme for conhecendo.
      </p>

      <form onSubmit={salvar} className="bento-card mt-6 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Nome *">
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={entrada}
              placeholder="Ana"
            />
          </Campo>
          <Campo label="Sobrenome">
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={entrada}
              placeholder="Souza"
            />
          </Campo>
        </div>

        <Campo label="Telefone (para abrir o WhatsApp direto)">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={entrada}
            placeholder="5544999999999"
            inputMode="tel"
          />
        </Campo>

        <Campo label="Em que ponto vocês estão">
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STAGES.map((f) => (
              <Opcao
                key={f.id}
                ativo={pipelineStage === f.id}
                onClick={() => setPipelineStage(f.id)}
                titulo={f.tooltip}
              >
                {f.name}
              </Opcao>
            ))}
          </div>
        </Campo>

        <Campo label="Onde você quer chegar (opcional)">
          <div className="flex flex-wrap gap-2">
            {CLOSING_GOALS.map((m) => (
              <Opcao
                key={m.id}
                ativo={closingGoal === m.id}
                onClick={() => setClosingGoal(closingGoal === m.id ? "" : m.id)}
              >
                {m.name}
              </Opcao>
            ))}
          </div>
        </Campo>

        <Campo label="Perfil da pessoa (opcional — dá para descobrir depois)">
          <select
            value={primaryArchetype}
            onChange={(e) => setPrimaryArchetype(e.target.value)}
            className={entrada}
          >
            <option value="">Ainda não sei</option>
            {VICTIM_TYPES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.desc}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Notas">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${entrada} resize-y`}
            placeholder="Como se conheceram, o que ela gosta, o que já rolou…"
          />
        </Campo>

        {erro && (
          <p role="alert" className="rounded-lg border border-[#e11d48]/30 bg-[#e11d48]/10 px-3 py-2 text-xs text-[#fda4af]">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={salvando || !firstName.trim()}
          className="rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {salvando ? "Salvando…" : "Salvar alvo"}
        </button>
      </form>
    </main>
  );
}

const entrada =
  "w-full rounded-lg border border-[var(--card-border)] bg-[#0D0D0D] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[#4a4a4a] focus:border-[var(--accent-violet)]";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function Opcao({
  ativo,
  onClick,
  children,
  titulo,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
  titulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
        ativo
          ? "border-[var(--accent-violet)] bg-[var(--accent-purple)]/15 text-[var(--foreground)]"
          : "border-[var(--card-border)] bg-[#0D0D0D] text-[var(--muted)] hover:border-[#3a3a3a]"
      }`}
    >
      {children}
    </button>
  );
}
