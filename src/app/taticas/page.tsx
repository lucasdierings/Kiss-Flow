"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { TACTICS, RISK_COLORS, type Tactic } from "@/lib/tactics-data";
import { PIPELINE_STAGES } from "@/lib/types";

const PHASE_COLORS: Record<string, string> = {
  lead_generation: "#06b6d4",
  qualification: "#d97706",
  nurturing: "#8b5cf6",
  closing: "#e11d48",
  retention: "#059669",
};

export default function TaticasPage() {
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedTactic, setExpandedTactic] = useState<number | null>(null);

  const filtered = TACTICS.filter((t) => {
    if (filterPhase !== "all" && !t.phase.includes(filterPhase)) return false;
    if (filterRisk !== "all" && t.risk !== filterRisk) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-16 p-6">
        <header className="mb-6">
          <h1 className="text-xl font-bold tracking-tighter text-[#e5e5e5]">Biblioteca de Táticas</h1>
          <p className="text-xs text-[#737373] mt-1">
            24 estratégias de sedução organizadas por fase e nível de risco
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tática..."
            className="px-4 py-2 rounded-xl bg-[#161616] border border-[#262626] text-sm text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 transition-colors w-64"
          />

          {/* Phase filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterPhase("all")}
              className={`px-3 py-2 rounded-xl text-[10px] font-medium transition-colors ${
                filterPhase === "all"
                  ? "bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/30"
                  : "bg-[#161616] text-[#737373] border border-[#262626] hover:border-[#333]"
              }`}
            >
              Todas
            </button>
            {PIPELINE_STAGES.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setFilterPhase(stage.id)}
                className={`px-3 py-2 rounded-xl text-[10px] font-medium transition-colors ${
                  filterPhase === stage.id
                    ? `border`
                    : "bg-[#161616] text-[#737373] border border-[#262626] hover:border-[#333]"
                }`}
                style={
                  filterPhase === stage.id
                    ? {
                        background: `${PHASE_COLORS[stage.id]}15`,
                        color: PHASE_COLORS[stage.id],
                        borderColor: `${PHASE_COLORS[stage.id]}30`,
                      }
                    : undefined
                }
              >
                {stage.name}
              </button>
            ))}
          </div>

          {/* Risk filter */}
          <div className="flex gap-1">
            {(["all", "baixo", "medio", "alto"] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`px-3 py-2 rounded-xl text-[10px] font-medium transition-colors ${
                  filterRisk === risk
                    ? risk === "all"
                      ? "bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/30"
                      : "border"
                    : "bg-[#161616] text-[#737373] border border-[#262626] hover:border-[#333]"
                }`}
                style={
                  filterRisk === risk && risk !== "all"
                    ? {
                        background: `${RISK_COLORS[risk]}15`,
                        color: RISK_COLORS[risk],
                        borderColor: `${RISK_COLORS[risk]}30`,
                      }
                    : undefined
                }
              >
                {risk === "all" ? "Qualquer risco" : risk === "baixo" ? "Baixo" : risk === "medio" ? "Médio" : "Alto"}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-[10px] text-[#737373] mb-4">
          {filtered.length} de 24 táticas
        </p>

        {/* Tactics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tactic) => (
            <TacticCard
              key={tactic.number}
              tactic={tactic}
              isExpanded={expandedTactic === tactic.number}
              onToggle={() =>
                setExpandedTactic(expandedTactic === tactic.number ? null : tactic.number)
              }
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[#737373]/50">
            Nenhuma tática encontrada com esses filtros.
          </div>
        )}
      </main>
    </div>
  );
}

function TacticCard({
  tactic,
  isExpanded,
  onToggle,
}: {
  tactic: Tactic;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const riskColor = RISK_COLORS[tactic.risk];

  return (
    <div
      className="bento-card cursor-pointer hover:border-[#333] transition-all"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#737373] bg-[#0D0D0D] px-1.5 py-0.5 rounded">
            #{tactic.number}
          </span>
          <h3 className="text-sm font-medium text-[#e5e5e5]">{tactic.name}</h3>
        </div>
        <span
          className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{
            background: `${riskColor}15`,
            color: riskColor,
            border: `1px solid ${riskColor}30`,
          }}
        >
          {tactic.risk}
        </span>
      </div>

      <p className="text-xs text-[#737373] leading-relaxed mb-3">{tactic.description}</p>

      {/* Phase badges */}
      <div className="flex gap-1 flex-wrap">
        {tactic.phase.map((p) => {
          const stage = PIPELINE_STAGES.find((s) => s.id === p);
          const color = PHASE_COLORS[p] || "#737373";
          return (
            <span
              key={p}
              className="text-[8px] px-1.5 py-0.5 rounded-full"
              style={{
                background: `${color}10`,
                color,
                border: `1px solid ${color}20`,
              }}
            >
              {stage?.name || p}
            </span>
          );
        })}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-[#262626] space-y-3">
          <div>
            <div className="text-[10px] text-[#8b5cf6] uppercase tracking-wider font-medium mb-1">Quando usar</div>
            <p className="text-xs text-[#a3a3a3]">{tactic.whenToUse}</p>
          </div>
          <div>
            <div className="text-[10px] text-[#059669] uppercase tracking-wider font-medium mb-1">Exemplo prático</div>
            <p className="text-xs text-[#a3a3a3] italic">{tactic.example}</p>
          </div>
        </div>
      )}
    </div>
  );
}
