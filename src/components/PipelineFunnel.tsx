"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadState } from "@/lib/store";
import { type Contact, PIPELINE_STAGES } from "@/lib/types";

interface FunnelStage {
  id: string;
  name: string;
  phase: string;
  count: number;
  contacts: { id: string; name: string; score: number }[];
  color: string;
}

const STAGE_COLORS: Record<string, string> = {
  lead_generation: "#06b6d4",
  qualification: "#8b5cf6",
  nurturing: "#d97706",
  closing: "#e11d48",
  retention: "#059669",
};

const STAGE_LABELS: Record<string, string> = {
  lead_generation: "Prospecção",
  qualification: "Qualificação",
  nurturing: "Nutrição",
  closing: "Fechamento",
  retention: "Retenção",
};

export default function PipelineFunnel() {
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);

  useEffect(() => {
    const state = loadState();
    if (!state) return;

    setTotalContacts(state.contacts.length);

    const funnelStages: FunnelStage[] = PIPELINE_STAGES.map((stage) => {
      const contactsInStage = state.contacts.filter(
        (c) => c.pipelineStage === stage.id
      );
      return {
        id: stage.id,
        name: STAGE_LABELS[stage.id] || stage.name,
        phase: stage.phase,
        count: contactsInStage.length,
        contacts: contactsInStage.map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName || ""}`.trim(),
          score: c.victimScore,
        })),
        color: STAGE_COLORS[stage.id] || "#737373",
      };
    });

    setStages(funnelStages);
  }, []);

  const maxCount = Math.max(1, ...stages.map((s) => s.count));

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
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
            />
          </svg>
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Funil de Conquista
          </span>
        </div>
        <span className="text-[10px] text-[#737373]">
          {totalContacts} alvo{totalContacts !== 1 ? "s" : ""} ativo{totalContacts !== 1 ? "s" : ""}
        </span>
      </div>

      {totalContacts === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            className="w-10 h-10 text-[#262626] mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
          <p className="text-xs text-[#737373] mb-2">Nenhum alvo cadastrado</p>
          <Link
            href="/alvos/novo"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 text-[#8b5cf6] border border-[#7c3aed]/20 hover:bg-[#7c3aed]/20 transition-colors"
          >
            + Adicionar primeiro alvo
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {stages.map((stage, idx) => {
            // Funnel width: largest stage = 100%, others proportional
            const widthPercent =
              stage.count > 0
                ? Math.max(25, (stage.count / maxCount) * 100)
                : 15;

            return (
              <div key={stage.id}>
                {/* Stage bar */}
                <div className="flex items-center gap-3">
                  <div className="w-20 text-right">
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: stage.color }}
                    >
                      {stage.name}
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <div
                      className="h-8 rounded-lg flex items-center justify-between px-3 transition-all duration-700"
                      style={{
                        width: `${widthPercent}%`,
                        background: `${stage.color}15`,
                        border: `1px solid ${stage.color}30`,
                      }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: stage.color }}
                      >
                        {stage.count}
                      </span>
                      {/* Contact avatars */}
                      <div className="flex -space-x-1.5">
                        {stage.contacts.slice(0, 4).map((contact) => (
                          <Link
                            key={contact.id}
                            href={`/alvos/${contact.id}`}
                            className="w-5 h-5 rounded-full bg-[#0D0D0D] border border-[#262626] flex items-center justify-center hover:scale-125 transition-transform z-10"
                            title={contact.name}
                          >
                            <span className="text-[7px] font-semibold text-[#a3a3a3]">
                              {contact.name[0]}
                            </span>
                          </Link>
                        ))}
                        {stage.contacts.length > 4 && (
                          <div className="w-5 h-5 rounded-full bg-[#0D0D0D] border border-[#262626] flex items-center justify-center">
                            <span className="text-[7px] text-[#737373]">
                              +{stage.contacts.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom link */}
      {totalContacts > 0 && (
        <div className="mt-4 pt-3 border-t border-[#262626]/50 flex items-center justify-between">
          <Link
            href="/alvos"
            className="text-[10px] text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
          >
            Ver todos os alvos →
          </Link>
          <Link
            href="/alvos/novo"
            className="text-[10px] px-2.5 py-1 rounded-full bg-[#7c3aed]/10 text-[#8b5cf6] border border-[#7c3aed]/20 hover:bg-[#7c3aed]/20 transition-colors"
          >
            + Novo alvo
          </Link>
        </div>
      )}
    </div>
  );
}
