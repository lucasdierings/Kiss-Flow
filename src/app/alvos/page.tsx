"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { AppState, Contact, VICTIM_TYPES, PIPELINE_STAGES, LOST_REASON_LABELS, type LostReason } from "@/lib/types";
import { loadState, reactivateContact } from "@/lib/store";

export default function AlvosPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) return null;

  const activeContacts = state.contacts.filter((c) => c.status === "active");
  const lostContacts = state.contacts.filter((c) => c.status === "lost");
  const wonContacts = state.contacts.filter((c) => c.status === "won");
  const frozenContacts = state.contacts.filter((c) => c.status === "frozen");

  const filtered = filter === "lost"
    ? lostContacts
    : filter === "won"
    ? wonContacts
    : filter === "frozen"
    ? frozenContacts
    : filter === "all"
    ? activeContacts
    : activeContacts.filter((c) => c.pipelineStage === filter);

  const getArchetypeName = (id: string) =>
    VICTIM_TYPES.find((v) => v.id === id)?.name || id;

  const getStageName = (id: string) =>
    PIPELINE_STAGES.find((s) => s.id === id)?.name || id;

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "prospeccao": return "#06b6d4";
      case "qualificado": return "#8b5cf6";
      case "engajamento": return "#d97706";
      case "agendamento": return "#e11d48";
      case "fechamento": return "#059669";
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
              {activeContacts.length} contato{activeContacts.length !== 1 ? "s" : ""} no pipeline
              {wonContacts.length > 0 && (
                <span className="text-[#059669]/60"> · {wonContacts.length} ganho{wonContacts.length !== 1 ? "s" : ""}</span>
              )}
              {frozenContacts.length > 0 && (
                <span className="text-[#3b82f6]/60"> · {frozenContacts.length} na geladeira</span>
              )}
              {lostContacts.length > 0 && (
                <span className="text-[#ef4444]/60"> · {lostContacts.length} perdido{lostContacts.length !== 1 ? "s" : ""}</span>
              )}
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
            Todos ({activeContacts.length})
          </button>
          {PIPELINE_STAGES.map((stage) => {
            const count = activeContacts.filter((c) => c.pipelineStage === stage.id).length;
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
          {wonContacts.length > 0 && (
            <button
              onClick={() => setFilter("won")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === "won"
                  ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                  : "bg-[#161616] text-[#737373] border border-[#262626] hover:border-[#333]"
              }`}
            >
              Ganhamos ({wonContacts.length})
            </button>
          )}
          {frozenContacts.length > 0 && (
            <button
              onClick={() => setFilter("frozen")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === "frozen"
                  ? "bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30"
                  : "bg-[#161616] text-[#737373] border border-[#262626] hover:border-[#333]"
              }`}
            >
              Geladeira ({frozenContacts.length})
            </button>
          )}
          {lostContacts.length > 0 && (
            <button
              onClick={() => setFilter("lost")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === "lost"
                  ? "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30"
                  : "bg-[#161616] text-[#737373] border border-[#262626] hover:border-[#333]"
              }`}
            >
              Perdidos ({lostContacts.length})
            </button>
          )}
        </div>

        {/* Contact list */}
        {filtered.length === 0 ? (
          <div className="bento-card text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-4.5 0 2.625 2.625 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#e5e5e5] mb-2">
              {filter === "lost" ? "Nenhum alvo perdido" : "Nenhum alvo cadastrado"}
            </h3>
            <p className="text-sm text-[#737373] mb-6">
              {filter === "lost"
                ? "Nenhum alvo foi marcado como perdido"
                : "Comece adicionando seu primeiro alvo ao pipeline"}
            </p>
            {filter !== "lost" && (
              <Link
                href="/alvos/novo"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Adicionar Alvo
              </Link>
            )}
          </div>
        ) : (filter === "won" || filter === "frozen") ? (
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
        ) : filter === "lost" ? (
          /* Lost contacts grouped by reason */
          <div className="space-y-6">
            {(Object.keys(LOST_REASON_LABELS) as LostReason[]).map((reason) => {
              const group = filtered.filter((c) => c.lostReason === reason);
              if (group.length === 0) return null;
              return (
                <div key={reason}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    <h3 className="text-sm font-semibold text-[#ef4444]">
                      {LOST_REASON_LABELS[reason]}
                    </h3>
                    <span className="text-[10px] text-[#ef4444]/50">({group.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.map((contact) => (
                      <LostContactCard
                        key={contact.id}
                        contact={contact}
                        getArchetypeName={getArchetypeName}
                        getStageName={getStageName}
                        getStageColor={getStageColor}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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
                <div className="text-[8px] text-[#737373]">Receptividade</div>
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
          {PIPELINE_STAGES.map((stage, i) => {
            const stageIdx = PIPELINE_STAGES.findIndex((s) => s.id === contact.pipelineStage);
            return (
              <div
                key={stage.id}
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

function LostContactCard({
  contact,
  getArchetypeName,
  getStageName,
  getStageColor,
}: {
  contact: Contact;
  getArchetypeName: (id: string) => string;
  getStageName: (id: string) => string;
  getStageColor: (id: string) => string;
}) {
  const stageColor = getStageColor(contact.pipelineStage);

  return (
    <div className="bento-card opacity-75 relative overflow-hidden">
      {/* Red accent top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ef4444]/40" />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a1a1a] via-[#1a1010] to-[#2a1010] flex items-center justify-center border border-[#ef4444]/20">
            <span className="text-lg font-semibold text-[#ef4444]/60">
              {contact.firstName[0]}{contact.lastName?.[0] || ""}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-[#e5e5e5]/60 truncate">
              {contact.firstName} {contact.lastName}
            </h3>
            {contact.lostReason && (
              <span
                className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20"
              >
                {LOST_REASON_LABELS[contact.lostReason]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[#8b5cf6]/50">
              {getArchetypeName(contact.primaryArchetype)}
            </span>
            <span className="text-[8px] text-[#737373]">·</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: `${stageColor}10`,
                color: `${stageColor}80`,
                border: `1px solid ${stageColor}20`,
              }}
            >
              {getStageName(contact.pipelineStage)}
            </span>
          </div>

          {/* Reativar button */}
          <Link
            href={`/alvos/${contact.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-medium bg-[#059669]/10 text-[#059669] border border-[#059669]/20 hover:bg-[#059669]/20 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Reativar
          </Link>
        </div>
      </div>

      {/* Pipeline bar (dimmed) */}
      <div className="mt-4 flex gap-0.5 opacity-40">
        {PIPELINE_STAGES.map((stage, i) => {
          const stageIdx = PIPELINE_STAGES.findIndex((s) => s.id === contact.pipelineStage);
          return (
            <div
              key={stage.id}
              className="flex-1 h-1 rounded-full"
              style={{
                background: i <= stageIdx ? stageColor : "#262626",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
