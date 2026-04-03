"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import PhaseTransitionModal from "@/components/PhaseTransitionModal";
import {
  AppState,
  Contact,
  PIPELINE_STAGES,
  VICTIM_TYPES,
  type PipelineStage,
  type LostReason,
} from "@/lib/types";
import { loadState, manualStageChange, moveToLost } from "@/lib/store";

const STAGE_COLORS: Record<string, string> = {
  lead_generation: "#06b6d4",
  qualification: "#d97706",
  nurturing: "#8b5cf6",
  closing: "#e11d48",
  retention: "#059669",
  lost: "#ef4444",
};

export default function KanbanPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [draggedContact, setDraggedContact] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [pendingTransition, setPendingTransition] = useState<{
    contactId: string;
    oldPhase: string;
    newPhase: string;
    isLost: boolean;
  } | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) return null;

  const activeContacts = state.contacts.filter((c) => c.status === "active");
  const lostContacts = state.contacts.filter((c) => c.status === "lost");

  const getContactsByStage = (stageId: string) =>
    activeContacts.filter((c) => c.pipelineStage === stageId);

  const getArchetypeName = (id: string) =>
    VICTIM_TYPES.find((v) => v.id === id)?.name || id;

  const getDaysInStage = (contact: Contact) => {
    const lastTransition = state.phaseHistory
      .filter((p) => p.contactId === contact.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const since = lastTransition ? new Date(lastTransition.timestamp) : new Date(contact.createdAt);
    return Math.floor((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleDragStart = (contactId: string) => {
    setDraggedContact(contactId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (targetStage: string) => {
    if (!draggedContact) return;
    setDragOverStage(null);
    setDraggedContact(null);

    const contact = state.contacts.find((c) => c.id === draggedContact);
    if (!contact) return;
    if (contact.pipelineStage === targetStage) return;

    setPendingTransition({
      contactId: draggedContact,
      oldPhase: contact.pipelineStage,
      newPhase: targetStage,
      isLost: targetStage === "lost",
    });
  };

  const handleConfirmTransition = (evidence: string, lostReason?: LostReason) => {
    if (!pendingTransition || !state) return;
    let newState: AppState;
    if (pendingTransition.isLost) {
      newState = moveToLost(state, pendingTransition.contactId, lostReason!, evidence);
    } else {
      newState = manualStageChange(
        state,
        pendingTransition.contactId,
        pendingTransition.newPhase as PipelineStage,
        evidence
      );
    }
    setState(newState);
    setPendingTransition(null);
  };

  const transitionContact = pendingTransition
    ? state.contacts.find((c) => c.id === pendingTransition.contactId)
    : null;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-16 p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-[#e5e5e5]">Pipeline Kanban</h1>
            <p className="text-xs text-[#737373] mt-1">
              Arraste alvos entre fases para gerenciar o pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/alvos/novo"
              className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-medium hover:bg-[#6d28d9] transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Novo Alvo
            </Link>
            <Link
              href="/alvos"
              className="px-4 py-2 rounded-xl bg-[#161616] border border-[#262626] text-xs text-[#737373] hover:text-[#a3a3a3] hover:border-[#333] transition-colors"
            >
              Ver Lista
            </Link>
          </div>
        </header>

        <div className="flex gap-3 overflow-x-auto pb-4">
          {/* Pipeline stages */}
          {PIPELINE_STAGES.map((stage) => {
            const contacts = getContactsByStage(stage.id);
            const color = STAGE_COLORS[stage.id];
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-64 rounded-2xl border transition-colors ${
                  isOver
                    ? "border-[#7c3aed]/50 bg-[#7c3aed]/5"
                    : "border-[#262626] bg-[#161616]"
                }`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Column header */}
                <div className="p-3 border-b border-[#262626]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-xs font-medium text-[#e5e5e5]">{stage.name}</span>
                    </div>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: `${color}15`, color }}
                    >
                      {contacts.length}
                    </span>
                  </div>
                  <p className="text-[9px] text-[#737373] mt-1">{stage.phase}</p>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[100px]">
                  {contacts.map((contact) => (
                    <Link
                      key={contact.id}
                      href={`/alvos/${contact.id}`}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(contact.id);
                      }}
                      className={`block p-3 rounded-xl bg-[#0D0D0D] border border-[#262626] hover:border-[#333] transition-all cursor-grab active:cursor-grabbing ${
                        draggedContact === contact.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {contact.avatarUrl ? (
                          <img
                            src={contact.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#8b5cf6]">
                              {contact.firstName[0]}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[#e5e5e5] truncate">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-[9px] text-[#737373] truncate">
                            {getArchetypeName(contact.primaryArchetype)}
                          </div>
                        </div>
                      </div>

                      {/* Mini metrics */}
                      <div className="flex items-center gap-2 text-[8px]">
                        <span className="text-[#8b5cf6]">M:{Math.round(contact.mysteryCoefficient)}%</span>
                        <span className="text-[#059669]">R:{Math.round(contact.victimScore)}%</span>
                        <span className="text-[#737373] ml-auto">{getDaysInStage(contact)}d</span>
                      </div>
                    </Link>
                  ))}

                  {contacts.length === 0 && (
                    <div className="text-center py-6 text-[10px] text-[#737373]/50">
                      Arraste alvos aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Lost column */}
          <div
            className={`flex-shrink-0 w-64 rounded-2xl border transition-colors ${
              dragOverStage === "lost"
                ? "border-[#ef4444]/50 bg-[#ef4444]/5"
                : "border-[#262626] bg-[#161616]"
            }`}
            onDragOver={(e) => handleDragOver(e, "lost")}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop("lost")}
          >
            <div className="p-3 border-b border-[#262626]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="text-xs font-medium text-[#ef4444]">Perdidos</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#ef4444]/15 text-[#ef4444]">
                  {lostContacts.length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-2 min-h-[100px]">
              {lostContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/alvos/${contact.id}`}
                  className="block p-3 rounded-xl bg-[#0D0D0D] border border-[#ef4444]/10 hover:border-[#ef4444]/30 transition-colors opacity-60"
                >
                  <div className="text-xs font-medium text-[#e5e5e5]">
                    {contact.firstName} {contact.lastName}
                  </div>
                  <div className="text-[9px] text-[#ef4444] mt-1">
                    {contact.lostReason === "desistencia"
                      ? "Desistência"
                      : contact.lostReason === "rejeicao"
                      ? "Rejeição"
                      : "Sucesso Efêmero"}
                  </div>
                </Link>
              ))}
              {lostContacts.length === 0 && (
                <div className="text-center py-6 text-[10px] text-[#737373]/50">
                  Nenhum alvo perdido
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Phase Transition Modal */}
      <PhaseTransitionModal
        isOpen={pendingTransition !== null}
        onClose={() => setPendingTransition(null)}
        onConfirm={handleConfirmTransition}
        contactName={transitionContact ? `${transitionContact.firstName} ${transitionContact.lastName}` : ""}
        oldPhase={pendingTransition?.oldPhase || ""}
        newPhase={pendingTransition?.newPhase || ""}
        isLost={pendingTransition?.isLost || false}
      />
    </div>
  );
}
