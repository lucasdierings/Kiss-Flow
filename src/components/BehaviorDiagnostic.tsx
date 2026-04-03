"use client";

import { type UserScore } from "@/lib/user-scoring";

interface BehaviorDiagnosticProps {
  score: UserScore;
}

export default function BehaviorDiagnostic({ score }: BehaviorDiagnosticProps) {
  return (
    <div className="bento-card col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[#e11d48]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Diagnóstico Comportamental
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Behavior indicators */}
        <div className="grid grid-cols-2 gap-2">
          <MiniMetric
            label="Impulsividade"
            value={score.responseImpulsivity}
            color={score.responseImpulsivity > 60 ? "#e11d48" : score.responseImpulsivity > 40 ? "#d97706" : "#059669"}
            inverted
          />
          <MiniMetric
            label="Equilíbrio Presença"
            value={score.presenceBalance}
            color={Math.abs(score.presenceBalance - 50) > 25 ? "#e11d48" : Math.abs(score.presenceBalance - 50) > 15 ? "#d97706" : "#059669"}
            balanced
          />
          <MiniMetric
            label="Diversidade Tática"
            value={score.tacticalDiversity}
            color={score.tacticalDiversity > 60 ? "#059669" : score.tacticalDiversity > 30 ? "#d97706" : "#e11d48"}
          />
          <MiniMetric
            label="Carência"
            value={score.needinessIndex}
            color={score.needinessIndex > 60 ? "#e11d48" : score.needinessIndex > 40 ? "#d97706" : "#059669"}
            inverted
          />
        </div>

        {/* Strengths */}
        {score.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span className="text-[10px] font-medium tracking-widest uppercase text-[#059669]">
                Pontos Fortes
              </span>
            </div>
            <div className="space-y-1.5">
              {score.strengths.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-[#059669]/5 border border-[#059669]/10"
                >
                  <svg
                    className="w-3 h-3 text-[#059669] mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  <span className="text-[11px] text-[#a3a3a3]">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {score.weaknesses.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
              <span className="text-[10px] font-medium tracking-widest uppercase text-[#e11d48]">
                Áreas de Melhoria
              </span>
            </div>
            <div className="space-y-1.5">
              {score.weaknesses.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-[#e11d48]/5 border border-[#e11d48]/10"
                >
                  <svg
                    className="w-3 h-3 text-[#e11d48] mt-0.5 flex-shrink-0"
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
                  <span className="text-[11px] text-[#a3a3a3]">{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  color,
  inverted,
  balanced,
}: {
  label: string;
  value: number;
  color: string;
  inverted?: boolean;
  balanced?: boolean;
}) {
  let description = "";
  if (balanced) {
    if (value > 70) description = "Presente demais";
    else if (value < 30) description = "Ausente demais";
    else description = "Equilibrado";
  } else if (inverted) {
    if (value > 60) description = "Alto";
    else if (value > 40) description = "Moderado";
    else description = "Baixo";
  } else {
    if (value > 60) description = "Forte";
    else if (value > 30) description = "Médio";
    else description = "Fraco";
  }

  return (
    <div className="p-2.5 rounded-lg bg-[#0D0D0D]/50 border border-[#262626]/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#737373]">{label}</span>
        <span className="text-[10px] font-mono" style={{ color }}>
          {description}
        </span>
      </div>
      <div className="w-full h-1 rounded-full bg-[#262626]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
