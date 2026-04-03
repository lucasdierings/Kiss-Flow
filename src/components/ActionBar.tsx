"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ActionModal from "./ActionModal";
import type { Contact } from "@/lib/types";

const tactics = [
  {
    id: "insinuation",
    label: "Enviar Insinuacao",
    sublabel: "Tatica 6",
    tacticNumber: 6,
    description: "Plantar uma ideia sutil no inconsciente do alvo. A insinuacao penetra por tras das defesas racionais, criando pensamentos que parecem surgir naturalmente na mente do outro.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    color: "#8b5cf6",
  },
  {
    id: "retreat",
    label: "Recuo Estrategico",
    sublabel: "Tatica 21",
    tacticNumber: 21,
    description: "Silencio calculado de 48h para elevar o desejo. A ausencia cria um vacuo emocional que o alvo sente necessidade de preencher, intensificando a fantasia.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
    color: "#e11d48",
  },
  {
    id: "poetize",
    label: "Poetizar Presenca",
    sublabel: "Tatica 10",
    tacticNumber: 10,
    description: "Usar linguagem poetica e imagens vividas para estimular a imaginacao do alvo. As palavras certas criam uma atmosfera de encantamento e elevam a percepcao de voce.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    color: "#d97706",
  },
  {
    id: "triangle",
    label: "Criar Triangulo",
    sublabel: "Tatica 4",
    tacticNumber: 4,
    description: "Introduzir uma terceira parte para despertar ciume e competicao. A prova social e a sensacao de que outros disputam sua atencao ativa o instinto de competicao no alvo.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    color: "#06b6d4",
  },
  {
    id: "bold",
    label: "Movimento Ousado",
    sublabel: "Tatica 23",
    tacticNumber: 23,
    description: "Acao direta e decisiva no momento de climax emocional. Quando as metricas indicam que o alvo esta no auge do encantamento, hesitar e perder a janela — agir com ousadia elimina o espaco entre desejo e acao.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    color: "#059669",
  },
];

interface ActionBarProps {
  contact?: Contact | null;
}

export default function ActionBar({ contact }: ActionBarProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalTactic, setModalTactic] = useState<(typeof tactics)[number] | null>(null);

  const handleTacticClick = (tactic: (typeof tactics)[number]) => {
    if (!contact) {
      // No contact selected — just show tooltip
      return;
    }
    setModalTactic(tactic);
  };

  const handleConfirm = (tacticId: string) => {
    // TODO: Record as interaction in Supabase
    setModalTactic(null);
  };

  const handleAskAI = (tacticId: string) => {
    setModalTactic(null);
    // Navigate to chat with tactic context
    const params = new URLSearchParams();
    if (contact) params.set("contactId", contact.id);
    params.set("tactic", tacticId);
    router.push(`/chat?${params.toString()}`);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Tooltip */}
          {hoveredId && !modalTactic && (
            <div className="glass-strong rounded-xl px-4 py-3 mb-3 animate-float-up max-w-sm mx-auto text-center">
              <p className="text-sm font-medium text-[#e5e5e5]">
                {tactics.find((t) => t.id === hoveredId)?.label}
              </p>
              <p className="text-[11px] text-[#737373] mt-0.5">
                {tactics.find((t) => t.id === hoveredId)?.description.slice(0, 80)}...
              </p>
            </div>
          )}

          {/* Buttons bar */}
          <div className="glass-strong rounded-2xl px-3 py-3 flex items-center justify-center gap-2">
            {tactics.map((tactic) => (
              <button
                key={tactic.id}
                onMouseEnter={() => setHoveredId(tactic.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleTacticClick(tactic)}
                className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: hoveredId === tactic.id
                    ? `${tactic.color}15`
                    : "transparent",
                  border: `1px solid ${
                    hoveredId === tactic.id
                      ? `${tactic.color}40`
                      : "transparent"
                  }`,
                  color: hoveredId === tactic.id
                    ? tactic.color
                    : "#737373",
                  opacity: !contact ? 0.5 : 1,
                  cursor: !contact ? "not-allowed" : "pointer",
                }}
              >
                {tactic.icon}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-xs font-medium leading-tight">{tactic.label}</span>
                  <span className="text-[9px] opacity-60">{tactic.sublabel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={!!modalTactic}
        onClose={() => setModalTactic(null)}
        tactic={
          modalTactic
            ? {
                id: modalTactic.id,
                name: modalTactic.label,
                tacticNumber: modalTactic.tacticNumber,
                description: modalTactic.description,
                color: modalTactic.color,
              }
            : null
        }
        contact={contact ?? null}
        onConfirm={handleConfirm}
        onAskAI={handleAskAI}
      />
    </>
  );
}
