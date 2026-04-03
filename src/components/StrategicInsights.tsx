"use client";

import { type UserScore } from "@/lib/user-scoring";

interface StrategicInsightsProps {
  score: UserScore;
}

export default function StrategicInsights({ score }: StrategicInsightsProps) {
  return (
    <div className="bento-card col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[#8b5cf6]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Insights Estratégicos
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Seduction insight */}
        <InsightCard
          icon="chess"
          label="Estratégia de Sedução"
          text={score.greeneInsight}
          color="#8b5cf6"
        />

        {/* Power Law */}
        <InsightCard
          icon="crown"
          label="48 Leis do Poder"
          text={score.powerLawApplied}
          color="#d97706"
        />

        {/* Human Nature */}
        <InsightCard
          icon="brain"
          label="Natureza Humana"
          text={score.humanNatureInsight}
          color="#06b6d4"
        />

        {/* Next level tip */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-[#7c3aed]/5 to-[#e11d48]/5 border border-[#7c3aed]/20">
          <div className="flex items-center gap-2 mb-1.5">
            <svg
              className="w-3.5 h-3.5 text-[#e11d48]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
            <span className="text-[10px] font-medium tracking-widest uppercase text-[#e11d48]">
              Próximo Nível
            </span>
          </div>
          <p className="text-xs text-[#a3a3a3] leading-relaxed">
            {score.nextLevelTip}
          </p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  label,
  text,
  color,
}: {
  icon: "chess" | "crown" | "brain";
  label: string;
  text: string;
  color: string;
}) {
  const icons = {
    chess: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
      />
    ),
    crown: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.77 1.522m0 0a6.003 6.003 0 01-3.77-1.522"
      />
    ),
    brain: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    ),
  };

  return (
    <div className="p-2.5 rounded-lg bg-[#0D0D0D]/50 border border-[#262626]/50">
      <div className="flex items-center gap-2 mb-1.5">
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          style={{ color }}
        >
          {icons[icon]}
        </svg>
        <span
          className="text-[10px] font-medium tracking-widest uppercase"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <p className="text-[11px] text-[#a3a3a3] leading-relaxed">{text}</p>
    </div>
  );
}
