"use client";

import { useEffect, useState } from "react";

interface MysteryGaugeProps {
  value?: number; // 0-100
}

export default function MysteryGauge({ value: propValue }: MysteryGaugeProps) {
  const [value, setValue] = useState(0);
  const targetValue = propValue ?? 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setValue(targetValue), 300);
    return () => clearTimeout(timer);
  }, [targetValue]);

  const getLabel = (v: number) => {
    if (v < 25) return "Transparente";
    if (v < 50) return "Visivel";
    if (v < 75) return "Misterioso";
    return "Enigmatico";
  };

  const getColor = (v: number) => {
    if (v < 25) return "#ef4444";
    if (v < 50) return "#d97706";
    if (v < 75) return "#8b5cf6";
    return "#7c3aed";
  };

  return (
    <div className="bento-card flex flex-col items-center justify-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Misterio
          </span>
        </div>
      </div>

      {/* Circular gauge */}
      <div className="relative w-36 h-36">
        {/* Background glow */}
        <div className="absolute inset-0 rounded-full bg-[#7c3aed]/10 blur-xl" />

        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#262626"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Value */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={getColor(value)}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          {/* Glow effect */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={getColor(value)}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            opacity="0.3"
            filter="url(#glow)"
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tighter">{targetValue === 0 ? "—" : `${value}%`}</span>
          <span className="text-[10px] text-[#737373] uppercase tracking-wider">
            {getLabel(value)}
          </span>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-4 text-center">
        <p className="text-[11px] text-[#737373]">
          {targetValue > 0 ? `${100 - targetValue}% do perfil revelado ao alvo` : "Sem dados de mistério"}
        </p>
        {targetValue > 50 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            <span className="text-[10px] text-[#059669]">Nível ideal de ocultação</span>
          </div>
        )}
      </div>
    </div>
  );
}
