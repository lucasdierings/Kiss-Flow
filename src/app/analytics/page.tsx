"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { AppState, VICTIM_TYPES, PIPELINE_STAGES, LOST_REASON_LABELS, type LostReason } from "@/lib/types";
import { loadState } from "@/lib/store";
import { calculateAnalytics, generateBottleneckInsight, type AnalyticsSummary } from "@/lib/analytics";
import { calculateUserScore, type UserScore } from "@/lib/user-scoring";

const PHASE_COLORS: Record<string, string> = {
  lead_generation: "#06b6d4",
  qualification: "#d97706",
  nurturing: "#8b5cf6",
  closing: "#e11d48",
  retention: "#059669",
};

export default function AnalyticsPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [userScores, setUserScores] = useState<UserScore | null>(null);

  useEffect(() => {
    const s = loadState();
    setState(s);
    setAnalytics(calculateAnalytics(s));
    if (s.contacts.length > 0) {
      setUserScores(calculateUserScore(s.contacts, s.interactions, s.seducerArchetype));
    }
  }, []);

  if (!state || !analytics) return null;

  const activeContacts = state.contacts.filter((c) => c.status === "active");
  const lostContacts = state.contacts.filter((c) => c.status === "lost");

  // Conversion by archetype
  const archetypeStats = getArchetypeConversion(state);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-16 p-6">
        <header className="mb-6">
          <h1 className="text-xl font-bold tracking-tighter text-[#e5e5e5]">Analytics</h1>
          <p className="text-xs text-[#737373] mt-1">
            Performance geral como sedutor — {activeContacts.length} alvos ativos, {lostContacts.length} perdidos
          </p>
        </header>

        <div className="grid grid-cols-4 gap-4">
          {/* KPI cards */}
          <div className="bento-card text-center">
            <div className="text-3xl font-bold tracking-tighter text-[#8b5cf6]">{analytics.overallConversionRate}%</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mt-1">Taxa Geral de Conversão</div>
          </div>
          <div className="bento-card text-center">
            <div className="text-3xl font-bold tracking-tighter text-[#059669]">{state.contacts.length}</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mt-1">Total de Alvos</div>
          </div>
          <div className="bento-card text-center">
            <div className="text-3xl font-bold tracking-tighter text-[#e11d48]">{analytics.lossAnalysis.total}</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mt-1">Perdidos</div>
          </div>
          <div className="bento-card text-center">
            <div className="text-3xl font-bold tracking-tighter text-[#d97706]">{state.interactions.length}</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mt-1">Total Interações</div>
          </div>

          {/* Conversion funnel */}
          <div className="col-span-2 bento-card">
            <h3 className="text-xs font-medium tracking-widest uppercase text-[#737373] mb-4">Taxas de Conversão por Fase</h3>
            <div className="space-y-3">
              {analytics.conversionRates.map((cr) => (
                <div key={`${cr.fromPhase}-${cr.toPhase}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#a3a3a3]">
                      {cr.fromLabel} → {cr.toLabel}
                    </span>
                    <span className="text-xs font-bold" style={{ color: cr.rate >= 50 ? "#059669" : cr.rate >= 25 ? "#d97706" : "#e11d48" }}>
                      {cr.rate}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cr.rate}%`,
                        background: cr.rate >= 50 ? "#059669" : cr.rate >= 25 ? "#d97706" : "#e11d48",
                      }}
                    />
                  </div>
                  <div className="text-[8px] text-[#737373] mt-0.5">{cr.converted}/{cr.total} convertidos</div>
                </div>
              ))}
              {analytics.conversionRates.length === 0 && (
                <p className="text-xs text-[#737373]/50 text-center py-4">Dados insuficientes</p>
              )}
            </div>
          </div>

          {/* Conversion speed */}
          <div className="col-span-2 bento-card">
            <h3 className="text-xs font-medium tracking-widest uppercase text-[#737373] mb-4">Velocidade por Fase</h3>
            <div className="space-y-3">
              {analytics.conversionSpeeds.map((cs) => {
                const color = PHASE_COLORS[cs.phase] || "#737373";
                return (
                  <div key={cs.phase} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[10px] text-[#a3a3a3] w-28">{cs.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(cs.avgDays * 3, 100)}%`, background: color }}
                      />
                    </div>
                    <span className="text-xs font-mono w-12 text-right" style={{ color }}>
                      {cs.avgDays}d
                    </span>
                  </div>
                );
              })}
              {analytics.conversionSpeeds.length === 0 && (
                <p className="text-xs text-[#737373]/50 text-center py-4">Dados insuficientes</p>
              )}
            </div>
          </div>

          {/* Bottlenecks */}
          <div className="col-span-2 bento-card">
            <h3 className="text-xs font-medium tracking-widest uppercase text-[#737373] mb-4">Gargalos do Pipeline</h3>
            <div className="space-y-3">
              {analytics.bottlenecks
                .sort((a, b) => b.lossRate - a.lossRate)
                .map((bn) => (
                    <div key={bn.phase} className="p-3 rounded-xl bg-[#0D0D0D] border border-[#262626]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#e5e5e5]">{bn.label}</span>
                        <span className="text-xs font-bold text-[#e11d48]">{bn.lossRate}% perda</span>
                      </div>
                      <p className="text-[10px] text-[#737373]">
                        {bn.lostCount} perdidos de {bn.totalReached} | Tempo médio: {bn.avgDwellDays}d
                      </p>
                    </div>
                  ))
              }
              {analytics.bottlenecks.length > 0 && (
                <p className="text-[10px] text-[#d97706] mt-2">{generateBottleneckInsight(analytics)}</p>
              )}
              {analytics.bottlenecks.length === 0 && (
                <p className="text-xs text-[#737373]/50 text-center py-4">Nenhum gargalo detectado</p>
              )}
            </div>
          </div>

          {/* Loss analysis */}
          <div className="col-span-2 bento-card">
            <h3 className="text-xs font-medium tracking-widest uppercase text-[#737373] mb-4">Análise de Perdas</h3>
            {analytics.lossAnalysis.total > 0 ? (
              <div className="space-y-3">
                {(Object.entries(analytics.lossAnalysis.byReason) as [LostReason, number][]).map(
                  ([reason, count]) => {
                    const pct = Math.round((count / analytics.lossAnalysis.total) * 100);
                    return (
                      <div key={reason}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#a3a3a3]">{LOST_REASON_LABELS[reason]}</span>
                          <span className="text-xs font-bold text-[#ef4444]">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
                          <div className="h-full rounded-full bg-[#ef4444]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="text-xs text-[#737373]/50 text-center py-4">Nenhum alvo perdido ainda</p>
            )}
          </div>

          {/* Conversion by archetype */}
          <div className="col-span-2 bento-card">
            <h3 className="text-xs font-medium tracking-widest uppercase text-[#737373] mb-4">Performance por Arquétipo</h3>
            <div className="space-y-2.5">
              {archetypeStats.map((as) => (
                <div key={as.archetype} className="flex items-center gap-3">
                  <span className="text-[10px] text-[#a3a3a3] w-36 truncate">{as.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#8b5cf6]"
                      style={{ width: `${as.avgReceptivity}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#8b5cf6] w-12 text-right">
                    {as.avgReceptivity}%
                  </span>
                  <span className="text-[9px] text-[#737373] w-6 text-right">{as.count}</span>
                </div>
              ))}
              {archetypeStats.length === 0 && (
                <p className="text-xs text-[#737373]/50 text-center py-4">Dados insuficientes</p>
              )}
            </div>
          </div>

          {/* Phase distribution */}
          <div className="col-span-2 bento-card">
            <h3 className="text-xs font-medium tracking-widest uppercase text-[#737373] mb-4">Distribuição Atual</h3>
            <div className="space-y-2.5">
              {PIPELINE_STAGES.map((stage) => {
                const count = analytics.phaseDistribution[stage.id] || 0;
                const pct = state.contacts.length > 0 ? Math.round((count / activeContacts.length) * 100) : 0;
                const color = PHASE_COLORS[stage.id];
                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[10px] text-[#a3a3a3] w-28">{stage.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-xs font-mono w-8 text-right" style={{ color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Performance */}
          {userScores && (
            <div className="col-span-4 bento-card">
              <h3 className="text-xs font-medium tracking-widest uppercase text-[#737373] mb-4">Sua Performance como Sedutor</h3>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: "Manutenção de Mistério", value: userScores.mysteryMaintenance, color: "#8b5cf6" },
                  { label: "Controle Emocional", value: userScores.emotionalControl, color: "#e11d48" },
                  { label: "Paciência Estratégica", value: userScores.strategicPatience, color: "#06b6d4" },
                  { label: "Prova Social", value: userScores.socialProofAwareness, color: "#d97706" },
                  { label: "Adaptabilidade", value: userScores.adaptability, color: "#059669" },
                ].map((score) => (
                  <div key={score.label} className="text-center">
                    <div className="text-2xl font-bold tracking-tighter" style={{ color: score.color }}>
                      {Math.round(score.value)}%
                    </div>
                    <div className="text-[9px] text-[#737373] mt-1">{score.label}</div>
                    <div className="mt-2 w-full h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${score.value}%`, background: score.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper: aggregate performance by target archetype
function getArchetypeConversion(state: AppState) {
  const byArchetype: Record<string, { total: number; sumReceptivity: number }> = {};

  for (const contact of state.contacts) {
    const arch = contact.primaryArchetype;
    if (!byArchetype[arch]) byArchetype[arch] = { total: 0, sumReceptivity: 0 };
    byArchetype[arch].total++;
    byArchetype[arch].sumReceptivity += contact.victimScore;
  }

  return Object.entries(byArchetype)
    .map(([archetype, data]) => ({
      archetype,
      name: VICTIM_TYPES.find((v) => v.id === archetype)?.name || archetype,
      count: data.total,
      avgReceptivity: Math.round(data.sumReceptivity / data.total),
    }))
    .sort((a, b) => b.avgReceptivity - a.avgReceptivity);
}
