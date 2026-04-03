"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadState } from "@/lib/store";
import { SEDUCER_ARCHETYPES } from "@/lib/types";
import {
  calculateUserScore,
  getDefaultUserScore,
  type UserScore,
} from "@/lib/user-scoring";
import { createSupabaseBrowser } from "@/lib/supabase";

interface UserProfile {
  displayName: string;
  gender: string;
  seducerArchetype: string;
  avatarUrl: string | null;
}

const ARCHETYPE_COLORS: Record<string, string> = {
  siren: "#e11d48",
  rake: "#dc2626",
  ideal_lover: "#8b5cf6",
  dandy: "#06b6d4",
  natural: "#059669",
  coquette: "#d97706",
  charmer: "#7c3aed",
  charismatic: "#3b82f6",
  star: "#a855f7",
};

export default function UserProfileCard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [score, setScore] = useState<UserScore>(getDefaultUserScore());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createSupabaseBrowser();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileData) {
            setProfile({
              displayName:
                profileData.display_name ||
                user.user_metadata?.display_name ||
                "Usuário",
              gender: profileData.gender || "other",
              seducerArchetype: profileData.seducer_archetype || "charmer",
              avatarUrl: profileData.avatar_url || null,
            });
          }
        }

        // Calculate scores from local state
        const state = loadState();
        if (state && state.interactions.length > 0) {
          const userScore = calculateUserScore(
            state.contacts,
            state.interactions,
            state.seducerArchetype
          );
          setScore(userScore);
        }
      } catch {
        // fallback silently
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const archetype = SEDUCER_ARCHETYPES.find(
    (a) => a.id === (profile?.seducerArchetype || "charmer")
  );
  const archetypeColor =
    ARCHETYPE_COLORS[profile?.seducerArchetype || "charmer"] || "#7c3aed";
  const initials = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  if (loading) {
    return (
      <div className="bento-card col-span-2 row-span-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
          <span className="text-xs text-[#737373]">Carregando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bento-card col-span-2 row-span-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse-glow"
            style={{ background: archetypeColor }}
          />
          <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
            Meu Perfil
          </span>
        </div>
        <Link
          href="/perfil"
          className="text-[10px] px-2.5 py-1 rounded-full bg-[#ffffff05] border border-[#262626] text-[#737373] hover:text-[#a3a3a3] hover:border-[#333] transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Avatar + Info */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-4">
          <div
            className="absolute inset-0 rounded-full blur-2xl scale-150 opacity-20"
            style={{ background: archetypeColor }}
          />
          <Link href="/perfil" className="block relative">
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#262626] ring-2 ring-offset-2 ring-offset-[#161616] cursor-pointer hover:scale-105 transition-transform"
              style={{ ["--tw-ring-color" as string]: `${archetypeColor}40` }}
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: archetypeColor }}
                  >
                    {initials}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Name */}
        <h2 className="text-xl font-semibold tracking-tighter mb-1">
          {profile?.displayName || "Usuário"}
        </h2>

        {/* Archetype badge */}
        <div
          className="px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{
            background: `${archetypeColor}15`,
            color: archetypeColor,
            border: `1px solid ${archetypeColor}30`,
          }}
        >
          {archetype?.name || "Sedutor"}
        </div>

        <p className="text-[10px] text-[#737373] text-center max-w-[220px] mb-4">
          {archetype?.desc}
        </p>

        {/* Power Score (circular) */}
        <div className="relative w-20 h-20 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#262626"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={archetypeColor}
              strokeWidth="3"
              strokeDasharray={`${score.overallPower}, 100`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-lg font-bold tracking-tighter"
              style={{ color: archetypeColor }}
            >
              {score.overallPower}
            </span>
            <span className="text-[8px] text-[#737373] uppercase tracking-wider">
              Poder
            </span>
          </div>
        </div>

        {/* Score bars */}
        <div className="w-full space-y-2">
          <ScoreBar
            label="Mistério"
            value={score.mysteryMaintenance}
            color="#8b5cf6"
          />
          <ScoreBar
            label="Controle"
            value={score.emotionalControl}
            color="#06b6d4"
          />
          <ScoreBar
            label="Paciência"
            value={score.strategicPatience}
            color="#059669"
          />
          <ScoreBar
            label="Prova Social"
            value={score.socialProofAwareness}
            color="#d97706"
          />
          <ScoreBar
            label="Adaptabilidade"
            value={score.adaptability}
            color="#e11d48"
          />
        </div>
      </div>

      {/* Neediness indicator */}
      <div className="mt-4 p-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#737373] uppercase tracking-wider">
            Índice de Carência
          </span>
          <span
            className="text-xs font-semibold"
            style={{
              color:
                score.needinessIndex > 60
                  ? "#e11d48"
                  : score.needinessIndex > 40
                  ? "#d97706"
                  : "#059669",
            }}
          >
            {score.needinessIndex}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#262626]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${score.needinessIndex}%`,
              background:
                score.needinessIndex > 60
                  ? "#e11d48"
                  : score.needinessIndex > 40
                  ? "#d97706"
                  : "#059669",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#737373] w-20 text-right">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[#262626]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[10px] font-mono w-7 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
