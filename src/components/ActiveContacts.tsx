"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadState } from "@/lib/store";
import { type Contact, VICTIM_TYPES } from "@/lib/types";

interface ContactSummary {
  id: string;
  name: string;
  archetype: string;
  stage: string;
  victimScore: number;
  mystery: number;
  tension: number;
  enchantment: number;
  interactionCount: number;
  daysSinceLastInteraction: number | null;
  avatarUrl?: string;
}

const STAGE_LABELS: Record<string, string> = {
  lead_generation: "Prospecção",
  qualification: "Qualificação",
  nurturing: "Nutrição",
  closing: "Fechamento",
  retention: "Retenção",
};

const STAGE_COLORS: Record<string, string> = {
  lead_generation: "#06b6d4",
  qualification: "#8b5cf6",
  nurturing: "#d97706",
  closing: "#e11d48",
  retention: "#059669",
};

export default function ActiveContacts() {
  const [contacts, setContacts] = useState<ContactSummary[]>([]);

  useEffect(() => {
    const state = loadState();
    if (!state) return;

    const activeContacts = state.contacts.filter(c => c.status !== "lost");

    const summaries: ContactSummary[] = activeContacts.map((c) => {
      const contactInteractions = state.interactions.filter(
        (i) => i.contactId === c.id
      );
      const lastInteraction = contactInteractions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      const daysSince = lastInteraction
        ? Math.round(
            (Date.now() - new Date(lastInteraction.date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      const victimType = VICTIM_TYPES.find(
        (v) => v.id === c.primaryArchetype
      );

      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName || ""}`.trim(),
        archetype: victimType?.name || "Não definido",
        stage: c.pipelineStage,
        victimScore: c.victimScore,
        mystery: c.mysteryCoefficient,
        tension: c.tensionLevel,
        enchantment: c.enchantmentScore,
        interactionCount: contactInteractions.length,
        daysSinceLastInteraction: daysSince,
        avatarUrl: c.avatarUrl,
      };
    });

    // Sort by victim score descending (most promising first)
    summaries.sort((a, b) => b.victimScore - a.victimScore);
    setContacts(summaries);
  }, []);

  if (contacts.length === 0) {
    return null; // PipelineFunnel already handles empty state
  }

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
              d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
            />
          </svg>
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Alvos Ativos
          </span>
        </div>
        <span className="text-[10px] text-[#737373]">
          Por prioridade
        </span>
      </div>

      <div className="space-y-2">
        {contacts.slice(0, 5).map((contact) => {
          const stageColor = STAGE_COLORS[contact.stage] || "#737373";

          return (
            <Link
              key={contact.id}
              href={`/alvos/${contact.id}`}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0D0D0D]/50 border border-[#262626]/50 hover:border-[#262626] transition-colors group"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#262626] flex-shrink-0">
                {contact.avatarUrl ? (
                  <img
                    src={contact.avatarUrl}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#8b5cf6]">
                      {contact.name[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#e5e5e5] truncate">
                    {contact.name}
                  </span>
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${stageColor}15`,
                      color: stageColor,
                      border: `1px solid ${stageColor}30`,
                    }}
                  >
                    {STAGE_LABELS[contact.stage]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[9px] text-[#737373]">
                    {contact.archetype}
                  </span>
                  {contact.daysSinceLastInteraction !== null && (
                    <span
                      className="text-[9px]"
                      style={{
                        color:
                          contact.daysSinceLastInteraction > 7
                            ? "#e11d48"
                            : contact.daysSinceLastInteraction > 3
                            ? "#d97706"
                            : "#737373",
                      }}
                    >
                      {contact.daysSinceLastInteraction === 0
                        ? "hoje"
                        : `${contact.daysSinceLastInteraction}d atrás`}
                    </span>
                  )}
                </div>
              </div>

              {/* Mini metrics */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <MiniScore
                  label="VS"
                  value={contact.victimScore}
                  color="#8b5cf6"
                />
                <MiniScore
                  label="M"
                  value={contact.mystery}
                  color="#06b6d4"
                />
                <MiniScore
                  label="T"
                  value={contact.tension}
                  color="#d97706"
                />
              </div>

              {/* Arrow */}
              <svg
                className="w-4 h-4 text-[#737373]/0 group-hover:text-[#737373] transition-colors flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          );
        })}
      </div>

      {contacts.length > 5 && (
        <div className="mt-3 text-center">
          <Link
            href="/alvos"
            className="text-[10px] text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
          >
            Ver todos os {contacts.length} alvos →
          </Link>
        </div>
      )}
    </div>
  );
}

function MiniScore({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <div
        className="text-[10px] font-mono font-semibold"
        style={{ color }}
      >
        {Math.round(value)}
      </div>
      <div className="text-[7px] text-[#737373]">{label}</div>
    </div>
  );
}
