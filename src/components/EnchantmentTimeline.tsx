"use client";

interface InteractionData {
  date: string;
  enchantmentAfter?: number;
  sentiment: number;
}

interface EnchantmentTimelineProps {
  interactions?: InteractionData[];
}

function bezierPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const tension = 0.35;
    const cpx1 = p0.x + (p1.x - p0.x) * tension;
    const cpx2 = p1.x - (p1.x - p0.x) * tension;
    path += ` C ${cpx1} ${p0.y}, ${cpx2} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return path;
}

export default function EnchantmentTimeline({ interactions: propInteractions }: EnchantmentTimelineProps) {
  const width = 500;
  const height = 140;
  const padding = { top: 25, right: 20, bottom: 30, left: 20 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${day} ${months[d.getMonth()]}`;
  };

  // Build interactions from prop data
  const interactions = (propInteractions ?? [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((i) => ({
      date: formatDate(i.date),
      sentiment: i.sentiment,
      enchantmentAfter: i.enchantmentAfter,
    }));

  const hasData = interactions.length >= 2;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Encontro": return "bg-[#059669]";
      case "Presente": return "bg-[#d97706]";
      case "Silêncio": return "bg-[#e11d48]";
      case "Insinuação": return "bg-[#8b5cf6]";
      default: return "bg-[#06b6d4]";
    }
  };

  const points = hasData
    ? interactions.map((d, i) => ({
        x: padding.left + (i / (interactions.length - 1)) * chartW,
        y: padding.top + chartH / 2 - (d.sentiment / 1) * (chartH / 2),
      }))
    : [];

  const linePath = hasData ? bezierPath(points) : "";
  const areaPath = hasData
    ? linePath + ` L ${points[points.length - 1].x} ${padding.top + chartH / 2} L ${points[0].x} ${padding.top + chartH / 2} Z`
    : "";

  // Calculate stats
  const avgSentiment = hasData
    ? interactions.reduce((sum, i) => sum + i.sentiment, 0) / interactions.length
    : 0;
  const peakInteraction = hasData
    ? interactions.reduce((max, curr) => curr.sentiment > max.sentiment ? curr : max, interactions[0])
    : null;

  return (
    <div className="bento-card col-span-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Timeline de Encantamento
          </span>
        </div>
        <div className="flex items-center gap-3">
          {["Mensagem", "Encontro", "Silêncio", "Presente", "Insinuação"].map((type) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${getTypeIcon(type)}`} />
              <span className="text-[9px] text-[#737373]">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-32 text-[#737373] text-sm">
          Sem dados de interação
        </div>
      ) : (
        <>
          {/* Timeline chart */}
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="enchantGradPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <filter id="enchantGlow">
                <feGaussianBlur stdDeviation="2" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Zero line */}
            <line
              x1={padding.left} y1={padding.top + chartH / 2}
              x2={padding.left + chartW} y2={padding.top + chartH / 2}
              stroke="#262626" strokeWidth="0.5" strokeDasharray="6 4"
            />
            <text x={padding.left - 2} y={padding.top + 8} className="fill-[#737373]/40 text-[7px]" textAnchor="end">+</text>
            <text x={padding.left - 2} y={padding.top + chartH - 2} className="fill-[#737373]/40 text-[7px]" textAnchor="end">-</text>

            {/* Area fill */}
            <path d={areaPath} fill="url(#enchantGradPos)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2" filter="url(#enchantGlow)" />

            {/* Points and labels */}
            {points.map((p, i) => {
              const d = interactions[i];
              const isPositive = d.sentiment >= 0;
              return (
                <g key={i}>
                  {/* Vertical line to zero */}
                  <line
                    x1={p.x} y1={p.y}
                    x2={p.x} y2={padding.top + chartH / 2}
                    stroke={isPositive ? "#8b5cf6" : "#e11d48"}
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    opacity="0.3"
                  />
                  {/* Point */}
                  <circle
                    cx={p.x} cy={p.y} r="4"
                    fill={isPositive ? "#8b5cf6" : "#e11d48"}
                    stroke="#161616" strokeWidth="1.5"
                  />
                  {/* Date label */}
                  <text
                    x={p.x} y={height - 5}
                    textAnchor="middle"
                    className="fill-[#737373] text-[7px]"
                  >
                    {d.date}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Dopamine peak indicator */}
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-[#737373]">Pico de dopamina: <span className="text-[#8b5cf6] font-medium">{peakInteraction?.date ?? "—"}</span></span>
            <span className="text-[#737373]">Sentimento médio: <span className={`font-mono ${avgSentiment >= 0 ? "text-[#059669]" : "text-[#e11d48]"}`}>{avgSentiment >= 0 ? "+" : ""}{avgSentiment.toFixed(2)}</span></span>
          </div>
        </>
      )}
    </div>
  );
}
