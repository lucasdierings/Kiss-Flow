"use client";

import { useState } from "react";

const tactics = [
  {
    id: "insinuation",
    label: "Enviar Insinuacao",
    sublabel: "Tatica 6",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    color: "#8b5cf6",
    desc: "Plantar uma ideia sutil no inconsciente",
  },
  {
    id: "retreat",
    label: "Recuo Estrategico",
    sublabel: "Tatica 21",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
    color: "#e11d48",
    desc: "Silencio de 48h para elevar o desejo",
  },
  {
    id: "poetize",
    label: "Poetizar Presenca",
    sublabel: "Tatica 10",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    color: "#d97706",
    desc: "Usar linguagem poetica e imagens vividas",
  },
  {
    id: "triangle",
    label: "Criar Triangulo",
    sublabel: "Tatica 4",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    color: "#06b6d4",
    desc: "Ativar competicao com prova social",
  },
  {
    id: "bold",
    label: "Movimento Ousado",
    sublabel: "Tatica 23",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    color: "#059669",
    desc: "Acao direta no momento de climax emocional",
  },
];

export default function ActionBar() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeTactic, setActiveTactic] = useState<string | null>(null);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Tooltip */}
        {hoveredId && !activeTactic && (
          <div className="glass-strong rounded-xl px-4 py-3 mb-3 animate-float-up max-w-sm mx-auto text-center">
            <p className="text-sm font-medium text-[#e5e5e5]">
              {tactics.find((t) => t.id === hoveredId)?.label}
            </p>
            <p className="text-[11px] text-[#737373] mt-0.5">
              {tactics.find((t) => t.id === hoveredId)?.desc}
            </p>
          </div>
        )}

        {/* Active tactic confirmation */}
        {activeTactic && (
          <div className="glass-strong rounded-xl px-4 py-3 mb-3 max-w-sm mx-auto text-center border border-[#8b5cf6]/20">
            <p className="text-sm font-medium text-[#8b5cf6]">
              {tactics.find((t) => t.id === activeTactic)?.label} ativado
            </p>
            <div className="flex gap-2 mt-2 justify-center">
              <button
                onClick={() => setActiveTactic(null)}
                className="px-3 py-1 text-[11px] rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setActiveTactic(null)}
                className="px-3 py-1 text-[11px] rounded-lg bg-[#262626] text-[#737373] hover:bg-[#333] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Buttons bar */}
        <div className="glass-strong rounded-2xl px-3 py-3 flex items-center justify-center gap-2">
          {tactics.map((tactic) => (
            <button
              key={tactic.id}
              onMouseEnter={() => setHoveredId(tactic.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setActiveTactic(tactic.id)}
              className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: hoveredId === tactic.id || activeTactic === tactic.id
                  ? `${tactic.color}15`
                  : "transparent",
                border: `1px solid ${
                  hoveredId === tactic.id || activeTactic === tactic.id
                    ? `${tactic.color}40`
                    : "transparent"
                }`,
                color: hoveredId === tactic.id || activeTactic === tactic.id
                  ? tactic.color
                  : "#737373",
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
  );
}
