"use client";

import { useState } from "react";

const archetypes = [
  { id: 1, name: "O Reformador", desc: "Busca perfeicao, critico, idealista", color: "#7c3aed" },
  { id: 2, name: "A Realeza Mimada", desc: "Snob que busca adoracao", color: "#e11d48" },
  { id: 3, name: "O Sonhador Decepcionado", desc: "Vive em mundos de fantasia", color: "#06b6d4" },
  { id: 4, name: "A Estrela Ofuscada", desc: "Ex-centro das atencoes", color: "#d97706" },
  { id: 5, name: "O Noviço", desc: "Jovem e curioso, busca experiencia", color: "#059669" },
];

export default function CurrentVictim() {
  const [currentArchetype] = useState(archetypes[0]);

  return (
    <div className="bento-card col-span-2 row-span-2 flex flex-col">
      {/* Header badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse-glow" />
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Alvo Atual
          </span>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-[#7c3aed]/10 text-[#8b5cf6] border border-[#7c3aed]/20">
          Fase: Engajamento
        </span>
      </div>

      {/* Portrait area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Avatar with glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#7c3aed]/20 blur-2xl scale-150" />
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#262626] ring-2 ring-[#7c3aed]/30 ring-offset-2 ring-offset-[#161616]">
            {/* Placeholder portrait - cinematic noir style */}
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
              <svg className="w-16 h-16 text-[#737373]/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
          {/* Online status */}
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#059669] border-2 border-[#161616]" />
        </div>

        {/* Name */}
        <h2 className="text-2xl font-semibold tracking-tighter mb-1">
          Isabella M.
        </h2>

        {/* Archetype badge */}
        <div
          className="px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{
            background: `${currentArchetype.color}15`,
            color: currentArchetype.color,
            border: `1px solid ${currentArchetype.color}30`,
          }}
        >
          {currentArchetype.name}
        </div>

        {/* Archetype description */}
        <p className="text-xs text-[#737373] text-center max-w-[200px] mb-6">
          {currentArchetype.desc}
        </p>

        {/* Stats row */}
        <div className="w-full grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-[#0D0D0D] border border-[#262626]">
            <div className="text-lg font-semibold tracking-tighter text-[#8b5cf6]">87%</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider">Receptividade</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[#0D0D0D] border border-[#262626]">
            <div className="text-lg font-semibold tracking-tighter text-[#e11d48]">72%</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider">Investimento</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[#0D0D0D] border border-[#262626]">
            <div className="text-lg font-semibold tracking-tighter text-[#059669]">14d</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider">Pipeline</div>
          </div>
        </div>
      </div>

      {/* Pipeline stage indicator */}
      <div className="mt-6 flex gap-1">
        {[
          { name: "Prospecção", tooltip: "Conhecendo e despertando interesse" },
          { name: "Qualificado(a)", tooltip: "Já demonstrou interesse" },
          { name: "Engajamento", tooltip: "Conversas fluindo" },
          { name: "Agendamento", tooltip: "Marcando um encontro" },
          { name: "Fechamento", tooltip: "Momento decisivo" },
        ].map((stage, i) => (
          <div key={stage.name} className="flex-1 flex flex-col items-center gap-1.5" title={stage.tooltip}>
            <div
              className={`w-full h-1 rounded-full transition-all ${
                i <= 2 ? "bg-[#7c3aed]" : "bg-[#262626]"
              }`}
            />
            <span className={`text-[9px] ${i <= 2 ? "text-[#8b5cf6]" : "text-[#737373]/50"}`}>
              {stage.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
