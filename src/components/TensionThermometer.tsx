"use client";

import { useEffect, useRef } from "react";

import type { Interaction } from "@/lib/types";

/**
 * Tensão e encantamento ao longo do tempo.
 *
 * O QUE ESTE GRÁFICO ERA
 *
 * Ele recebia UM número — a tensão atual — e desenhava duas retas por sete
 * dias fixos (Seg a Dom) aplicando `jitter = (i - 3) * 5` com o comentário
 * "variação para interesse visual". Não havia série temporal nenhuma: os dias
 * eram decorativos e a subida do gráfico era artefato do jitter. As legendas
 * "Ansiedade" e "Desejo" também não existiam no motor, que tem um único
 * escalar de tensão.
 *
 * O QUE ELE É AGORA
 *
 * Cada interação grava `tensionAfter` e `enchantmentAfter` junto com a data.
 * Isso É uma série temporal real, e estava no banco desde a migração sem que
 * ninguém a usasse. O gráfico passa a lê-la: um ponto por interação, na ordem
 * em que aconteceram.
 *
 * Encantamento é guardado de -1 a 1 e aqui vira 0 a 100 só para caber no
 * mesmo eixo.
 */

interface TensionThermometerProps {
  /** Interações da pessoa em foco, com os instantâneos de métrica. */
  interactions?: Interaction[];
}

function bezierPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpx1 = p0.x + (p1.x - p0.x) / 3;
    const cpx2 = p0.x + (2 * (p1.x - p0.x)) / 3;
    path += ` C ${cpx1} ${p0.y}, ${cpx2} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return path;
}

export default function TensionThermometer({ interactions = [] }: TensionThermometerProps) {
  const canvasRef = useRef<SVGSVGElement>(null);

  // Só interações que carregam instantâneo. As antigas, gravadas antes de o
  // servidor passar a calcular, não têm — e são omitidas em vez de zeradas.
  const serie = [...interactions]
    .filter((i) => typeof i.tensionAfter === "number")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12);

  const data = serie.map((i) => ({
    day: new Date(i.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    anxiety: Math.max(0, Math.min(100, i.tensionAfter ?? 0)),
    desire: Math.max(0, Math.min(100, ((i.enchantmentAfter ?? 0) + 1) * 50)),
  }));

  // Uma linha precisa de pelo menos dois pontos para ter direção.
  if (data.length < 2) {
    return (
      <div className="bento-card col-span-2">
        <h3 className="text-xs uppercase tracking-widest text-[#737373]">
          Tensão e encantamento
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#737373]">
          {data.length === 0
            ? "Registre interações para acompanhar como a tensão e o encantamento evoluem."
            : "Falta uma interação para a linha ter direção. Com um ponto só não há tendência."}
        </p>
      </div>
    );
  }

  const width = 320;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const anxietyPoints = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d.anxiety / 100) * chartH,
  }));

  const desirePoints = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d.desire / 100) * chartH,
  }));

  const anxietyPath = bezierPath(anxietyPoints);
  const desirePath = bezierPath(desirePoints);

  // Area paths
  const anxietyArea = anxietyPath + ` L ${anxietyPoints[anxietyPoints.length - 1].x} ${padding.top + chartH} L ${anxietyPoints[0].x} ${padding.top + chartH} Z`;
  const desireArea = desirePath + ` L ${desirePoints[desirePoints.length - 1].x} ${padding.top + chartH} L ${desirePoints[0].x} ${padding.top + chartH} Z`;

  // Current tension calculation
  const lastAnxiety = data[data.length - 1].anxiety;
  const lastDesire = data[data.length - 1].desire;
  const tensionDelta = lastDesire - lastAnxiety;

  return (
    <div className="bento-card col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#e11d48]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Tensão e encantamento
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#e11d48]" />
            <span className="text-[10px] text-[#737373]">Tensão</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <span className="text-[10px] text-[#737373]">Encantamento</span>
          </div>
        </div>
      </div>

      {/* Wave chart */}
      <svg
        ref={canvasRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="anxietyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="desireGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <line
            key={v}
            x1={padding.left}
            y1={padding.top + chartH - (v / 100) * chartH}
            x2={padding.left + chartW}
            y2={padding.top + chartH - (v / 100) * chartH}
            stroke="#262626"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}

        {/* Areas */}
        <path d={anxietyArea} fill="url(#anxietyGrad)" />
        <path d={desireArea} fill="url(#desireGrad)" />

        {/* Lines */}
        <path d={anxietyPath} fill="none" stroke="#e11d48" strokeWidth="2" filter="url(#lineGlow)" />
        <path d={desirePath} fill="none" stroke="#8b5cf6" strokeWidth="2" filter="url(#lineGlow)" />

        {/* Dots */}
        {anxietyPoints.map((p, i) => (
          <circle key={`a-${i}`} cx={p.x} cy={p.y} r="3" fill="#e11d48" stroke="#161616" strokeWidth="1.5" />
        ))}
        {desirePoints.map((p, i) => (
          <circle key={`d-${i}`} cx={p.x} cy={p.y} r="3" fill="#8b5cf6" stroke="#161616" strokeWidth="1.5" />
        ))}

        {/* Day labels */}
        {data.map((d, i) => (
          <text
            key={d.day}
            x={padding.left + (i / (data.length - 1)) * chartW}
            y={height - 5}
            textAnchor="middle"
            className="fill-[#737373] text-[9px]"
          >
            {d.day}
          </text>
        ))}
      </svg>

      {/* Status bar */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${tensionDelta > 15 ? "bg-[#059669]" : tensionDelta > 0 ? "bg-[#d97706]" : "bg-[#e11d48]"}`} />
          <span className="text-[11px] text-[#737373]">
            {tensionDelta > 15
              ? "Encantamento à frente da tensão: o ritmo está bom"
              : tensionDelta > 0
              ? "Os dois caminham juntos: manter o ritmo"
              : "Tensão à frente do encantamento: vale suavizar"}
          </span>
        </div>
        <span className="text-xs font-mono text-[#8b5cf6]">
          {/* Arredondado: a diferença entre dois REAL vazava como
              "+-18.699999999999996pt" na tela. O sinal também era fixo em "+". */}
          {tensionDelta >= 0 ? "+" : "−"}
          {Math.abs(Math.round(tensionDelta))} pt
        </span>
      </div>
    </div>
  );
}
