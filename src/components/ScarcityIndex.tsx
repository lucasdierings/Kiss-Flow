"use client";

import { useEffect, useState } from "react";

interface ScarcityIndexProps {
  value?: number; // 0-100
}

export default function ScarcityIndex({ value: propValue }: ScarcityIndexProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 500);
  }, []);

  const scarcityScore = propValue ?? 0;
  // Derive display metrics from score
  const inactivityHours = Math.round((scarcityScore / 100) * 48);
  const messagesReceived = Math.round((scarcityScore / 100) * 15);

  const getStatus = (score: number) => {
    if (score >= 80) return { label: "Objeto de Desejo", color: "#7c3aed", bg: "#7c3aed" };
    if (score >= 60) return { label: "Alta Demanda", color: "#059669", bg: "#059669" };
    if (score >= 40) return { label: "Equilibrado", color: "#d97706", bg: "#d97706" };
    return { label: "Disponivel Demais", color: "#e11d48", bg: "#e11d48" };
  };

  const status = getStatus(scarcityScore);

  return (
    <div className="bento-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Escassez
          </span>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: `${status.bg}15`,
            color: status.color,
            border: `1px solid ${status.color}30`,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Score display */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold tracking-tighter" style={{ color: status.color }}>
          {animate ? scarcityScore : 0}
        </div>
        <div className="text-[10px] text-[#737373] uppercase tracking-wider mt-1">Scarcity Score</div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-[#0D0D0D] overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animate ? `${scarcityScore}%` : "0%",
            background: `linear-gradient(90deg, ${status.color}80, ${status.color})`,
            boxShadow: `0 0 8px ${status.color}40`,
          }}
        />
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#737373]">Inatividade</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 rounded-full bg-[#0D0D0D] overflow-hidden">
              <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${(inactivityHours / 48) * 100}%` }} />
            </div>
            <span className="text-[11px] font-mono text-[#a3a3a3]">{inactivityHours}h</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#737373]">Msgs recebidas</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 rounded-full bg-[#0D0D0D] overflow-hidden">
              <div className="h-full rounded-full bg-[#059669]" style={{ width: `${(messagesReceived / 15) * 100}%` }} />
            </div>
            <span className="text-[11px] font-mono text-[#a3a3a3]">{messagesReceived}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#737373]">Ratio iniciativa</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 rounded-full bg-[#0D0D0D] overflow-hidden">
              <div className="h-full rounded-full bg-[#d97706]" style={{ width: `${scarcityScore}%` }} />
            </div>
            <span className="text-[11px] font-mono text-[#a3a3a3]">{scarcityScore}%</span>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-4 p-2.5 rounded-lg bg-[#7c3aed]/5 border border-[#7c3aed]/10">
        <p className="text-[10px] text-[#8b5cf6]">
          {scarcityScore >= 80
            ? "Nível de escassez excelente. Você é objeto de desejo."
            : scarcityScore >= 60
            ? "Boa escassez. Manter o ritmo atual para maximizar o efeito."
            : scarcityScore >= 40
            ? "Escassez moderada. Considere reduzir a frequência de contato."
            : scarcityScore > 0
            ? "Disponível demais. Aumente o tempo entre as respostas."
            : "Sem dados de escassez."}
        </p>
      </div>
    </div>
  );
}
