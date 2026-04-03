"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { AppState, Contact, VICTIM_TYPES, PIPELINE_STAGES } from "@/lib/types";
import { loadState } from "@/lib/store";

export default function AlvosPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) return null;

  const filtered = filter === "all"
    ? state.contacts
    : state.contacts.filter((c) => c.pipelineStage === filter);

  const getArchetypeName = (id: string) =>
    VICTIM_TYPES.find((v) => v.id === id)?.name || id;

  const getStageName = (id: string) =>
    PIPELINE_STAGES.find((s) => s.id === id)?.name || id;

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "lead_generation": return "#06b6d4";
      case "qualification": return "#d97706";
      case "nurturing": return "#8b5cf6";
      case "closing": return "#e11d48";
      case "retention": return "#059669";
      default: return "#737373";
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-16 p-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">
              <span className="bg-gradient-to-r from-[#8b5cf6] to-[#e11d48] bg-clip-text text-transparent">
                Alvos
              </span>
            </h1>
            <p className="text-sm text-[#737373] mt-1">
              {state.contacts.length} contatos no pipeline
            </p>
          </div>
          <Link
            href="/alvos/novo"
            className="px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Alvo
          </Link>
        </header>

        {/* Pipeline filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/30"
                : "bg-[#161616] text-[#737373] border border-[#262626] hover:border-[#333]"
            }`}
          >
            Todos ({state.contacts.length})
          </button>
          {PIPELINE_STAGES.map((stage) => {
            const count = state.contacts.filter((c) => c.pipelineStage === stage.id).length;
            return (
              <button
                key={stage.id}
                onClick={() => setFilter(stage.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === stage.id
                    ? "border"
                    : "bg-[#161616] text-[#737373] border border-[#262626] hover:border-[#333]"
                }`}
                style={
                  filter === stage.id
                    ? {
                        background: `${getStageColor(stage.id)}15`,
                        color: getStageColor(stage.id),
                        borderColor: `${getStageColor(stage.id)}40`,
                      }
                    : undefined
                }
              >
                {stage.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Contact list */}
        {filtered.length === 0 ? (
          <div className="bento-card text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-4.5 0 2.625 2.625 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#e5e5e5] mb-2">Nenhum alvo cadastrado</h3>
            <p className="text-sm text-[#737373] mb-6">Comece adicionando seu primeiro alvo ao pipeline</p>
            <Link
              href="/alvos/novo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adicionar Alvo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                interactionCount={state.interactions.filter((i) => i.contactId === contact.id).length}
                getArchetypeName={getArchetypeName}
                getStageName={getStageName}
                getStageColor={getStageColor}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ContactCard({
  contact,
  interactionCount,
  getArchetypeName,
  getStageName,
  getStageColor,
}: {
  contact: Contact;
  interactionCount: number;
  getArchetypeName: (id: string) => string;
  getStageName: (id: string) => string;
  getStageColor: (id: string) => string;
}) {
  const stageColor = getStageColor(contact.pipelineStage);

  return (
    <Link href={`/alvos/${contact.id}`}>
      <div className="bento-card cursor-pointer group">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center border border-[#262626]">
              <span className="text-lg font-semibold text-[#8b5cf6]">
                {contact.firstName[0]}{contact.lastName?.[0] || ""}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-[#e5e5e5] truncate group-hover:text-[#8b5cf6] transition-colors">
                {contact.firstName} {contact.lastName}
              </h3>
              <span
                className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2"
                style={{
                  background: `${stageColor}15`,
                  color: stageColor,
                  border: `1px solid ${stageColor}30`,
                }}
              >
                {getStageName(contact.pipelineStage)}
              </span>
            </div>

            <p className="text-xs text-[#8b5cf6] mb-2">
              {getArchetypeName(contact.primaryArchetype)}
            </p>

            {/* Mini metrics */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-xs font-semibold text-[#8b5cf6]">{Math.round(contact.mysteryCoefficient)}%</div>
                <div className="text-[8px] text-[#737373]">Misterio</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-[#e11d48]">{Math.round(contact.tensionLevel)}%</div>
                <div className="text-[8px] text-[#737373]">Tensao</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-[#059669]">{Math.round(contact.victimScore)}%</div>
                <div className="text-[8px] text-[#737373]">Score</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-[#d97706]">{interactionCount}</div>
                <div className="text-[8px] text-[#737373]">Interacoes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline bar */}
        <div className="mt-4 flex gap-0.5">
          {["lead_generation", "qualification", "nurturing", "closing", "retention"].map((stage, i) => {
            const stageIdx = ["lead_generation", "qualification", "nurturing", "closing", "retention"].indexOf(contact.pipelineStage);
            return (
              <div
                key={stage}
                className="flex-1 h-1 rounded-full"
                style={{
                  background: i <= stageIdx ? stageColor : "#262626",
                }}
              />
            );
          })}
        </div>
      </div>
    </Link>
  );
}
