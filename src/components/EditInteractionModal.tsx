"use client";

import { useState } from "react";
import {
  Interaction,
  INTERACTION_CATEGORIES,
  type InteractionCategory,
} from "@/lib/types";

interface EditInteractionModalProps {
  interaction: Interaction;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Omit<Interaction, "id" | "contactId">>) => void;
}

export default function EditInteractionModal({
  interaction,
  isOpen,
  onClose,
  onSave,
}: EditInteractionModalProps) {
  const [category, setCategory] = useState<InteractionCategory>(interaction.category);
  const [typeId, setTypeId] = useState(interaction.typeId);
  const [sentiment, setSentiment] = useState(interaction.sentiment);
  const [date, setDate] = useState(interaction.date.split("T")[0]);
  const [notes, setNotes] = useState(interaction.notes);
  const [initiatedByTarget, setInitiatedByTarget] = useState(interaction.initiatedByTarget);
  const [duration, setDuration] = useState(interaction.duration?.toString() || "");
  const [location, setLocation] = useState(interaction.location || "");

  if (!isOpen) return null;

  const sentimentColor = (v: number) => {
    if (v <= -0.5) return "#e11d48";
    if (v < 0) return "#d97706";
    if (v === 0) return "#737373";
    if (v <= 0.5) return "#059669";
    return "#7c3aed";
  };

  const handleSave = () => {
    onSave({
      category,
      typeId: typeId as Interaction["typeId"],
      sentiment,
      date: new Date(date).toISOString(),
      notes,
      initiatedByTarget,
      duration: duration ? parseInt(duration) : undefined,
      location: location || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#161616] border border-[#262626] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold tracking-tighter text-[#e5e5e5]">Editar Interação</h2>
          <button onClick={onClose} className="text-[#737373] hover:text-[#a3a3a3] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Categoria */}
          <div>
            <label className="text-xs text-[#737373] mb-1.5 block">Categoria</label>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.entries(INTERACTION_CATEGORIES) as [InteractionCategory, typeof INTERACTION_CATEGORIES[InteractionCategory]][]).map(
                ([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCategory(key);
                      const types = INTERACTION_CATEGORIES[key].types;
                      if (types.length > 0) setTypeId(types[0].id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                      category === key
                        ? "bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/30"
                        : "bg-[#0D0D0D] text-[#737373] border border-[#262626] hover:border-[#333]"
                    }`}
                  >
                    {cat.name}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-xs text-[#737373] mb-1.5 block">Tipo</label>
            <div className="flex gap-1.5 flex-wrap">
              {INTERACTION_CATEGORIES[category].types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeId(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                    typeId === t.id
                      ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                      : "bg-[#0D0D0D] text-[#737373] border border-[#262626] hover:border-[#333]"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Data + Quem iniciou */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#737373] mb-1 block">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
              />
            </div>
            <div>
              <label className="text-xs text-[#737373] mb-1 block">Quem iniciou?</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInitiatedByTarget(false)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    !initiatedByTarget
                      ? "bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/30"
                      : "bg-[#0D0D0D] text-[#737373] border border-[#262626]"
                  }`}
                >
                  Eu
                </button>
                <button
                  onClick={() => setInitiatedByTarget(true)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    initiatedByTarget
                      ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                      : "bg-[#0D0D0D] text-[#737373] border border-[#262626]"
                  }`}
                >
                  O Alvo
                </button>
              </div>
            </div>
          </div>

          {/* Duração + Local (para presenciais) */}
          {(category === "presencial_casual" || category === "presencial_intimate") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#737373] mb-1 block">Duração (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="90"
                  className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] mb-1 block">Local</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Starbucks"
                  className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
                />
              </div>
            </div>
          )}

          {/* Sentimento */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-[#737373]">Como foi?</label>
              <span className="text-xs font-medium" style={{ color: sentimentColor(sentiment) }}>
                {sentiment > 0 ? "+" : ""}{sentiment.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.1}
              value={sentiment}
              onChange={(e) => setSentiment(parseFloat(e.target.value))}
              className="w-full accent-[#8b5cf6]"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs text-[#737373] mb-1 block">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Detalhes da interação..."
              className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-[#262626]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[#737373] hover:text-[#a3a3a3]">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#059669] text-white text-sm font-medium hover:bg-[#047857] transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
