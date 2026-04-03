"use client";

import { useState, useEffect } from "react";
import {
  AppState,
  Contact,
  INTERACTION_CATEGORIES,
  type InteractionCategory,
  type PipelineStage,
} from "@/lib/types";
import { loadState, addInteraction, manualStageChange } from "@/lib/store";
import PhaseTransitionModal from "@/components/PhaseTransitionModal";

export default function QuickLogFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<AppState | null>(null);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [category, setCategory] = useState<InteractionCategory>("digital_active");
  const [typeId, setTypeId] = useState("");
  const [sentiment, setSentiment] = useState(0.5);
  const [initiatedByTarget, setInitiatedByTarget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<{
    contactId: string;
    contactName: string;
    oldPhase: string;
    newPhase: string;
  } | null>(null);

  useEffect(() => {
    const s = loadState();
    setState(s);
    if (s.contacts.length > 0) {
      setSelectedContactId(s.activeContactId || s.contacts[0].id);
    }
    const types = INTERACTION_CATEGORIES[category].types;
    if (types.length > 0) setTypeId(types[0].id);
  }, []);

  useEffect(() => {
    const types = INTERACTION_CATEGORIES[category].types;
    if (types.length > 0) setTypeId(types[0].id);
  }, [category]);

  if (!state) return null;

  const activeContacts = state.contacts.filter((c) => c.status === "active");

  const handleSave = () => {
    if (!selectedContactId || !typeId) return;
    setSaving(true);
    const contact = state.contacts.find((c) => c.id === selectedContactId);
    const result = addInteraction(state, {
      contactId: selectedContactId,
      typeId: typeId as any,
      category,
      sentiment,
      date: new Date().toISOString(),
      notes: "",
      initiatedByTarget,
    });
    setState(result.state);
    setSaving(false);
    setIsOpen(false);
    setSentiment(0.5);
    setInitiatedByTarget(false);

    if (result.suggestedProgression && contact) {
      setPendingTransition({
        contactId: selectedContactId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        oldPhase: contact.pipelineStage,
        newPhase: result.suggestedProgression,
      });
    }
  };

  const handleConfirmTransition = (evidence: string) => {
    if (!pendingTransition || !state) return;
    const newState = manualStageChange(
      state,
      pendingTransition.contactId,
      pendingTransition.newPhase as PipelineStage,
      evidence
    );
    setState(newState);
    setPendingTransition(null);
  };

  const sentimentColor = (v: number) => {
    if (v <= -0.5) return "#e11d48";
    if (v < 0) return "#d97706";
    if (v === 0) return "#737373";
    if (v <= 0.5) return "#059669";
    return "#7c3aed";
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9] transition-all hover:scale-105 flex items-center justify-center"
        title="Registro rápido de interação"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      </button>

      {/* Phase Transition Modal */}
      <PhaseTransitionModal
        isOpen={pendingTransition !== null}
        onClose={() => setPendingTransition(null)}
        onConfirm={handleConfirmTransition}
        contactName={pendingTransition?.contactName || ""}
        oldPhase={pendingTransition?.oldPhase || ""}
        newPhase={pendingTransition?.newPhase || ""}
        isLost={false}
      />

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-[#161616] border border-[#262626] shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-tighter text-[#e5e5e5]">Registro Rápido</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#737373] hover:text-[#a3a3a3]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Contact */}
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
              >
                {activeContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>

              {/* Quick category */}
              <div className="flex gap-1 flex-wrap">
                {(Object.entries(INTERACTION_CATEGORIES) as [InteractionCategory, typeof INTERACTION_CATEGORIES[InteractionCategory]][]).map(
                  ([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-colors ${
                        category === key
                          ? "bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/30"
                          : "bg-[#0D0D0D] text-[#737373] border border-[#262626]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  )
                )}
              </div>

              {/* Type */}
              <div className="flex gap-1 flex-wrap">
                {INTERACTION_CATEGORIES[category].types.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeId(t.id)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-colors ${
                      typeId === t.id
                        ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                        : "bg-[#0D0D0D] text-[#737373] border border-[#262626]"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {/* Quem iniciou */}
              <div className="flex gap-2">
                <button
                  onClick={() => setInitiatedByTarget(false)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    !initiatedByTarget
                      ? "bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/30"
                      : "bg-[#0D0D0D] text-[#737373] border border-[#262626]"
                  }`}
                >
                  Eu iniciei
                </button>
                <button
                  onClick={() => setInitiatedByTarget(true)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    initiatedByTarget
                      ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                      : "bg-[#0D0D0D] text-[#737373] border border-[#262626]"
                  }`}
                >
                  O alvo iniciou
                </button>
              </div>

              {/* Sentiment */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#737373]">Sentimento</span>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.1}
                  value={sentiment}
                  onChange={(e) => setSentiment(parseFloat(e.target.value))}
                  className="flex-1 accent-[#8b5cf6]"
                />
                <span className="text-xs font-medium w-8 text-right" style={{ color: sentimentColor(sentiment) }}>
                  {sentiment > 0 ? "+" : ""}{sentiment.toFixed(1)}
                </span>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!selectedContactId || !typeId || saving}
                className="w-full py-2.5 rounded-xl bg-[#059669] text-white text-sm font-medium hover:bg-[#047857] transition-colors disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
