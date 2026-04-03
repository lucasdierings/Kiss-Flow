"use client";

import { useEffect, useState } from "react";
import { loadState } from "@/lib/store";
import {
  calculateAnalytics,
  generateBottleneckInsight,
  type AnalyticsSummary,
} from "@/lib/analytics";
import { LOST_REASON_LABELS, type LostReason } from "@/lib/types";

export default function ConversionAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    const state = loadState();
    if (!state || state.phaseHistory.length < 1) return;
    setAnalytics(calculateAnalytics(state));
  }, []);

  if (!analytics) return null;

  const hasData = analytics.conversionRates.some((r) => r.total > 0);
  if (!hasData && analytics.lossAnalysis.total === 0) return null;

  const bottleneckInsight = generateBottleneckInsight(analytics);

  return (
    <div className="bento-card col-span-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[#06b6d4]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Analytics de Conversão
          </span>
        </div>
        <div className="flex items-center gap-3">
          {analytics.avgTimeToClose !== null && (
            <span className="text-[10px] text-[#737373]">
              Tempo médio até fechamento:{" "}
              <span className="text-[#06b6d4] font-mono">
                {analytics.avgTimeToClose}d
              </span>
            </span>
          )}
          <span className="text-[10px] text-[#737373]">
            Conversão geral:{" "}
            <span className="text-[#059669] font-mono font-semibold">
              {analytics.overallConversionRate}%
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Column 1: Conversion Rates */}
        <div>
          <h4 className="text-[10px] font-medium tracking-widest uppercase text-[#737373] mb-3">
            Taxa de Conversão
          </h4>
          <div className="space-y-2">
            {analytics.conversionRates.map((rate) => (
              <div key={`${rate.fromPhase}-${rate.toPhase}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-[#a3a3a3]">
                    {rate.fromLabel} → {rate.toLabel}
                  </span>
                  <span
                    className="text-[10px] font-mono font-semibold"
                    style={{
                      color:
                        rate.rate > 60
                          ? "#059669"
                          : rate.rate > 30
                          ? "#d97706"
                          : "#e11d48",
                    }}
                  >
                    {rate.rate}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#262626]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${rate.rate}%`,
                      background:
                        rate.rate > 60
                          ? "#059669"
                          : rate.rate > 30
                          ? "#d97706"
                          : "#e11d48",
                    }}
                  />
                </div>
                <span className="text-[8px] text-[#737373]">
                  {rate.converted}/{rate.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Conversion Speed */}
        <div>
          <h4 className="text-[10px] font-medium tracking-widest uppercase text-[#737373] mb-3">
            Velocidade por Fase
          </h4>
          <div className="space-y-2">
            {analytics.conversionSpeeds.map((speed) => (
              <div
                key={speed.phase}
                className="flex items-center justify-between p-2 rounded-lg bg-[#0D0D0D]/50 border border-[#262626]/50"
              >
                <span className="text-[10px] text-[#a3a3a3]">
                  {speed.label}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-semibold"
                    style={{
                      color:
                        speed.avgDays === 0
                          ? "#737373"
                          : speed.avgDays < 5
                          ? "#059669"
                          : speed.avgDays < 10
                          ? "#d97706"
                          : "#e11d48",
                    }}
                  >
                    {speed.avgDays > 0 ? `${speed.avgDays}d` : "—"}
                  </span>
                  {speed.count > 0 && (
                    <span className="text-[8px] text-[#737373]">
                      ({speed.count})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Loss Analysis + Bottleneck */}
        <div>
          <h4 className="text-[10px] font-medium tracking-widest uppercase text-[#737373] mb-3">
            Análise de Perdas
          </h4>

          {analytics.lossAnalysis.total > 0 ? (
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-[#ef4444]/5 border border-[#ef4444]/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#ef4444]">
                    Total perdidos
                  </span>
                  <span className="text-sm font-bold text-[#ef4444]">
                    {analytics.lossAnalysis.total}
                  </span>
                </div>
                <div className="space-y-1">
                  {(
                    Object.entries(analytics.lossAnalysis.byReason) as [
                      LostReason,
                      number
                    ][]
                  )
                    .filter(([, count]) => count > 0)
                    .map(([reason, count]) => (
                      <div
                        key={reason}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[9px] text-[#a3a3a3]">
                          {LOST_REASON_LABELS[reason]}
                        </span>
                        <span className="text-[10px] font-mono text-[#ef4444]/70">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Bottleneck insight */}
              <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#d97706]/5 to-[#e11d48]/5 border border-[#d97706]/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg
                    className="w-3 h-3 text-[#d97706]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <span className="text-[9px] font-medium tracking-widest uppercase text-[#d97706]">
                    Gargalo
                  </span>
                </div>
                <p className="text-[10px] text-[#a3a3a3] leading-relaxed">
                  {bottleneckInsight}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#059669]/5 border border-[#059669]/10 text-center">
              <span className="text-[10px] text-[#059669]">
                Nenhuma perda registrada
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
