"use client";

import { useState } from "react";
import { LostReason, LOST_REASON_LABELS } from "@/lib/types";

const STAGE_COLORS: Record<string, string> = {
  prospeccao: "#06b6d4",
  qualificado: "#8b5cf6",
  engajamento: "#d97706",
  agendamento: "#e11d48",
  fechamento: "#059669",
  lost: "#ef4444",
  frozen: "#3b82f6",
  won: "#059669",
  none: "#737373",
};

const STAGE_LABELS: Record<string, string> = {
  prospeccao: "Prospecção",
  qualificado: "Qualificado(a)",
  engajamento: "Engajamento",
  agendamento: "Agendamento",
  fechamento: "Fechamento",
  lost: "Perdido",
  frozen: "Geladeira",
  won: "Ganhamos!",
  none: "Novo",
};

interface PhaseTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (evidence: string, lostReason?: LostReason) => void;
  contactName: string;
  oldPhase: string;
  newPhase: string;
  isLost: boolean;
}

export default function PhaseTransitionModal({
  isOpen,
  onClose,
  onConfirm,
  contactName,
  oldPhase,
  newPhase,
  isLost,
}: PhaseTransitionModalProps) {
  const [evidence, setEvidence] = useState("");
  const [lostReason, setLostReason] = useState<LostReason | null>(null);

  if (!isOpen) return null;

  const oldColor = STAGE_COLORS[oldPhase] || STAGE_COLORS.none;
  const newColor = isLost ? STAGE_COLORS.lost : (STAGE_COLORS[newPhase] || STAGE_COLORS.none);
  const oldLabel = STAGE_LABELS[oldPhase] || oldPhase;
  const newLabel = isLost ? "Perdido" : (STAGE_LABELS[newPhase] || newPhase);

  const canConfirm = evidence.trim().length >= 10 && (!isLost || lostReason !== null);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(evidence.trim(), lostReason || undefined);
    setEvidence("");
    setLostReason(null);
  };

  const handleClose = () => {
    setEvidence("");
    setLostReason(null);
    onClose();
  };

  const lostReasonDescriptions: Record<LostReason, string> = {
    desistencia: "Perda de interesse do operador",
    rejeicao: "Encerramento por parte do alvo",
    sucesso_efemero: "Conversão atingida, mas sem retenção",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#161616] border border-[#262626] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          {isLost ? (
            <h2 className="text-lg font-bold tracking-tight text-[#ef4444]">
              Mover para Perdidos
            </h2>
          ) : (
            <h2 className="text-lg font-bold tracking-tight text-[#e5e5e5]">
              Transição de Fase
            </h2>
          )}
          <p className="text-xs text-[#737373] mt-1">
            {contactName}
          </p>
        </div>

        {/* Phase badges */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-3">
            {/* Old phase */}
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{
                background: `${oldColor}15`,
                color: oldColor,
                border: `1px solid ${oldColor}30`,
              }}
            >
              {oldLabel}
            </span>

            {/* Arrow */}
            <svg
              className="w-5 h-5 text-[#737373] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>

            {/* New phase */}
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{
                background: `${newColor}15`,
                color: newColor,
                border: `1px solid ${newColor}30`,
              }}
            >
              {newLabel}
            </span>
          </div>
        </div>

        {/* Lost reason radio group */}
        {isLost && (
          <div className="px-6 pb-4">
            <label className="text-xs text-[#a3a3a3] font-medium block mb-2">
              Motivo da perda
            </label>
            <div className="space-y-2">
              {(Object.keys(LOST_REASON_LABELS) as LostReason[]).map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    lostReason === reason
                      ? "bg-[#ef4444]/10 border border-[#ef4444]/30"
                      : "bg-[#0D0D0D] border border-[#262626] hover:border-[#333]"
                  }`}
                >
                  <input
                    type="radio"
                    name="lostReason"
                    checked={lostReason === reason}
                    onChange={() => setLostReason(reason)}
                    className="mt-0.5 accent-[#ef4444]"
                  />
                  <div>
                    <span
                      className={`text-xs font-medium ${
                        lostReason === reason ? "text-[#ef4444]" : "text-[#e5e5e5]"
                      }`}
                    >
                      {LOST_REASON_LABELS[reason]}
                    </span>
                    <p className="text-[10px] text-[#737373] mt-0.5">
                      {lostReasonDescriptions[reason]}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Evidence textarea */}
        <div className="px-6 pb-4">
          <label className="text-xs text-[#a3a3a3] font-medium block mb-2">
            O que aconteceu? (evidência concreta)
          </label>
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Ex: Primeiro beijo, convite aceito, bloqueio, sinal de interesse..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 resize-none"
          />
          {evidence.length > 0 && evidence.trim().length < 10 && (
            <p className="text-[10px] text-[#d97706] mt-1">
              Mínimo 10 caracteres ({evidence.trim().length}/10)
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs text-[#737373] hover:text-[#a3a3a3] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-medium transition-colors ${
              canConfirm
                ? isLost
                  ? "bg-[#ef4444] text-white hover:bg-[#dc2626]"
                  : "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                : "bg-[#262626] text-[#737373] cursor-not-allowed"
            }`}
          >
            {isLost ? "Confirmar Perda" : "Confirmar Transição"}
          </button>
        </div>
      </div>
    </div>
  );
}
