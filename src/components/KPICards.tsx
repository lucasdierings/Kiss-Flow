"use client";

interface KPICardsProps {
  pursuitRate?: number;
  avgSentiment?: number;
  daysInPipeline?: number;
  interactionsPerWeek?: number;
}

export default function KPICards({ pursuitRate, avgSentiment, daysInPipeline, interactionsPerWeek }: KPICardsProps) {
  const kpis = [
    {
      label: "Taxa de Perseguição",
      value: pursuitRate != null ? `${pursuitRate}%` : "—",
      target: "> 70%",
      trend: pursuitRate != null && pursuitRate > 70 ? "Bom" : pursuitRate != null ? "Melhorar" : "",
      trendUp: pursuitRate != null && pursuitRate > 70,
      desc: "Alvo inicia a conversa",
      color: "#8b5cf6",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ),
    },
    {
      label: "Sentimento Médio",
      value: avgSentiment != null ? (avgSentiment >= 0 ? `+${avgSentiment}` : `${avgSentiment}`) : "—",
      target: "> 0.5",
      trend: avgSentiment != null && avgSentiment > 0.5 ? "Positivo" : avgSentiment != null ? "Neutro" : "",
      trendUp: avgSentiment != null && avgSentiment > 0,
      desc: "Média de sentimento das interações",
      color: "#059669",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      label: "Dias no Pipeline",
      value: daysInPipeline != null ? `${daysInPipeline}d` : "—",
      target: "Acompanhar",
      trend: daysInPipeline != null && daysInPipeline > 30 ? "Longo" : daysInPipeline != null ? "Recente" : "",
      trendUp: daysInPipeline != null && daysInPipeline <= 30,
      desc: "Tempo desde o primeiro contato",
      color: "#d97706",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
        </svg>
      ),
    },
    {
      label: "Interações/Semana",
      value: interactionsPerWeek != null ? `${interactionsPerWeek}` : "—",
      target: "3-5/sem",
      trend: interactionsPerWeek != null && interactionsPerWeek >= 3 ? "Ativo" : interactionsPerWeek != null ? "Baixo" : "",
      trendUp: interactionsPerWeek != null && interactionsPerWeek >= 3,
      desc: "Frequência semanal de contato",
      color: "#06b6d4",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
      ),
    },
  ];
  return (
    <>
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bento-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg" style={{ background: `${kpi.color}10` }}>
              <div style={{ color: kpi.color }}>{kpi.icon}</div>
            </div>
            <div
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: kpi.trendUp ? "#05966910" : "#e11d4810",
                color: kpi.trendUp ? "#059669" : "#e11d48",
              }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={kpi.trendUp ? "M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" : "M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"}
                />
              </svg>
              {kpi.trend}
            </div>
          </div>

          <div className="text-2xl font-bold tracking-tighter mb-0.5" style={{ color: kpi.color }}>
            {kpi.value}
          </div>
          <div className="text-xs text-[#a3a3a3] font-medium">{kpi.label}</div>
          <div className="text-[10px] text-[#737373] mt-1">{kpi.desc}</div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[9px] text-[#737373]">Meta: {kpi.target}</span>
            <div className="flex-1 h-px bg-[#262626]" />
          </div>
        </div>
      ))}
    </>
  );
}
