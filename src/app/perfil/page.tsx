"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { createSupabaseBrowser } from "@/lib/supabase";
import { SEDUCER_ARCHETYPES } from "@/lib/types";
import { ARCHETYPE_RESULTS } from "@/lib/archetype-quiz";
import { loadState } from "@/lib/store";
import {
  calculateUserScore,
  getDefaultUserScore,
  calculateBehaviorSummary,
  type UserScore,
  type UserBehaviorSummary,
} from "@/lib/user-scoring";

const GENDER_OPTIONS = [
  { id: "male", label: "Homem" },
  { id: "female", label: "Mulher" },
  { id: "non_binary", label: "Não-binário" },
  { id: "other", label: "Outro" },
];

const ORIENTATION_OPTIONS = [
  { id: "heterosexual", label: "Heterossexual" },
  { id: "homosexual", label: "Homossexual" },
  { id: "bisexual", label: "Bissexual" },
  { id: "pansexual", label: "Pansexual" },
  { id: "other", label: "Outro" },
];

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

export default function PerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [seducerArchetype, setSeducerArchetype] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Scores
  const [userScore, setUserScore] = useState<UserScore>(getDefaultUserScore());
  const [summary, setSummary] = useState<UserBehaviorSummary | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowser();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setDisplayName(profileData.display_name || "");
          setGender(profileData.gender || "");
          setOrientation(profileData.orientation || "");
          setAgeRange(profileData.age_range || "");
          setSeducerArchetype(profileData.seducer_archetype || "");
          setAvatarUrl(profileData.avatar_url || null);
        }

        // Calculate scores
        const state = loadState();
        if (state) {
          if (state.interactions.length > 0) {
            setUserScore(
              calculateUserScore(
                state.contacts,
                state.interactions,
                state.seducerArchetype
              )
            );
            setSummary(
              calculateBehaviorSummary(state.contacts, state.interactions)
            );
          }
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_profiles")
        .update({
          display_name: displayName,
          gender,
          orientation,
          age_range: ageRange,
          seducer_archetype: seducerArchetype,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB max

    setUploading(true);
    try {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop();
      const filePath = `avatars/${user.id}/profile.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("kissflow-media")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("kissflow-media").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Save URL to profile
      await supabase
        .from("user_profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
    } catch {
      // handle error
    } finally {
      setUploading(false);
    }
  }

  const archetype = SEDUCER_ARCHETYPES.find((a) => a.id === seducerArchetype);
  const archetypeColor = ARCHETYPE_COLORS[seducerArchetype] || "#7c3aed";
  const archetypeResult = ARCHETYPE_RESULTS[seducerArchetype as keyof typeof ARCHETYPE_RESULTS];
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <Sidebar />
        <main className="ml-16 p-6 flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Sidebar />

      <main className="ml-16 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-xl bg-[#161616] border border-[#262626] hover:border-[#333] transition-colors"
              >
                <svg
                  className="w-5 h-5 text-[#737373]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tighter">
                  Meu Perfil
                </h1>
                <p className="text-sm text-[#737373]">
                  Gerencie sua identidade e acompanhe sua evolução
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
              style={{
                background: saved
                  ? "#059669"
                  : `linear-gradient(135deg, ${archetypeColor}, ${archetypeColor}cc)`,
                color: "white",
              }}
            >
              {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Alterações"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6">
          {/* Left column: Avatar + basic info */}
          <div className="col-span-1 space-y-4">
            {/* Avatar card */}
            <div className="bento-card flex flex-col items-center">
              <div className="relative mb-4 group">
                <div
                  className="absolute inset-0 rounded-full blur-2xl scale-150 opacity-20"
                  style={{ background: archetypeColor }}
                />
                <div
                  className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#262626] cursor-pointer ring-2 ring-offset-2 ring-offset-[#161616] group-hover:ring-4 transition-all"
                  style={{
                    ["--tw-ring-color" as string]: `${archetypeColor}40`,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
                      <span
                        className="text-3xl font-bold"
                        style={{ color: archetypeColor }}
                      >
                        {initials}
                      </span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploading ? (
                      <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-[10px] text-[#737373]">
                Clique para alterar foto
              </p>

              {/* Archetype badge */}
              {archetype && (
                <div
                  className="mt-3 px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    background: `${archetypeColor}15`,
                    color: archetypeColor,
                    border: `1px solid ${archetypeColor}30`,
                  }}
                >
                  {archetype.name}
                </div>
              )}
              {archetypeResult && (
                <p className="text-[11px] text-[#737373] text-center mt-2 max-w-[200px]">
                  {archetypeResult.description}
                </p>
              )}
            </div>

            {/* Power score */}
            <div className="bento-card">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 36 36"
                  >
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
                      strokeDasharray={`${userScore.overallPower}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-2xl font-bold tracking-tighter"
                      style={{ color: archetypeColor }}
                    >
                      {userScore.overallPower}
                    </span>
                    <span className="text-[9px] text-[#737373] uppercase tracking-wider">
                      Poder
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-[#737373]">
                  Score geral baseado nas suas interações
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Edit form + Stats */}
          <div className="col-span-2 space-y-4">
            {/* Edit form */}
            <div className="bento-card">
              <h3 className="text-sm font-medium tracking-widest uppercase text-[#737373] mb-4">
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-[#737373] mb-1.5">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:border-[#7c3aed] focus:outline-none transition-colors"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#737373] mb-1.5">
                    Gênero
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:border-[#7c3aed] focus:outline-none transition-colors"
                  >
                    <option value="">Selecione</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#737373] mb-1.5">
                    Orientação
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:border-[#7c3aed] focus:outline-none transition-colors"
                  >
                    <option value="">Selecione</option>
                    {ORIENTATION_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#737373] mb-1.5">
                    Faixa Etária
                  </label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:border-[#7c3aed] focus:outline-none transition-colors"
                  >
                    <option value="">Selecione</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45+">45+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#737373] mb-1.5">
                    Estilo de Sedução
                  </label>
                  <select
                    value={seducerArchetype}
                    onChange={(e) => setSeducerArchetype(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:border-[#7c3aed] focus:outline-none transition-colors"
                  >
                    <option value="">Selecione</option>
                    {SEDUCER_ARCHETYPES.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {a.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Archetype details */}
            {archetypeResult && (
              <div className="bento-card">
                <h3 className="text-sm font-medium tracking-widest uppercase text-[#737373] mb-4">
                  Seu Estilo: {archetype?.name}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                      <span className="text-[10px] font-medium tracking-widest uppercase text-[#059669]">
                        Forças
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {archetypeResult.strengths.map((s: string, i: number) => (
                        <li
                          key={i}
                          className="text-xs text-[#a3a3a3] flex items-start gap-1.5"
                        >
                          <span className="text-[#059669] mt-0.5">+</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
                      <span className="text-[10px] font-medium tracking-widest uppercase text-[#e11d48]">
                        Fraquezas
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {archetypeResult.weaknesses.map(
                        (w: string, i: number) => (
                          <li
                            key={i}
                            className="text-xs text-[#a3a3a3] flex items-start gap-1.5"
                          >
                            <span className="text-[#e11d48] mt-0.5">-</span>
                            {w}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
                {archetypeResult.ideal_victims &&
                  archetypeResult.ideal_victims.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#262626]">
                      <span className="text-[10px] font-medium tracking-widest uppercase text-[#d97706]">
                        Alvos Ideais
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {archetypeResult.ideal_victims.map(
                          (v: string, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-1 rounded-full bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20"
                            >
                              {v}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Behavior Summary */}
            {summary && (
              <div className="bento-card">
                <h3 className="text-sm font-medium tracking-widest uppercase text-[#737373] mb-4">
                  Resumo Comportamental
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <StatCard
                    label="Interações"
                    value={summary.totalInteractions.toString()}
                    sub="total"
                    color="#8b5cf6"
                  />
                  <StatCard
                    label="Alvos"
                    value={summary.totalContacts.toString()}
                    sub="ativos"
                    color="#06b6d4"
                  />
                  <StatCard
                    label="Você Inicia"
                    value={`${summary.userInitiatedPercent}%`}
                    sub="das vezes"
                    color={
                      summary.userInitiatedPercent > 65
                        ? "#e11d48"
                        : "#059669"
                    }
                  />
                  <StatCard
                    label="Alvo Inicia"
                    value={`${summary.targetInitiatedPercent}%`}
                    sub="das vezes"
                    color={
                      summary.targetInitiatedPercent > 50
                        ? "#059669"
                        : "#d97706"
                    }
                  />
                  <StatCard
                    label="Média/Dia"
                    value={summary.avgInteractionsPerDay.toString()}
                    sub="interações"
                    color="#d97706"
                  />
                  <StatCard
                    label="Sentimento"
                    value={summary.avgSentiment > 0 ? `+${summary.avgSentiment}` : summary.avgSentiment.toString()}
                    sub="médio"
                    color={
                      summary.avgSentiment > 0.3
                        ? "#059669"
                        : summary.avgSentiment < -0.3
                        ? "#e11d48"
                        : "#d97706"
                    }
                  />
                  <StatCard
                    label="Silêncios"
                    value={summary.silenceCount.toString()}
                    sub="estratégicos"
                    color="#8b5cf6"
                  />
                  <StatCard
                    label="Movimentos"
                    value={summary.boldMoveCount.toString()}
                    sub="ousados"
                    color="#e11d48"
                  />
                </div>
              </div>
            )}

            {/* Score breakdown */}
            <div className="bento-card">
              <h3 className="text-sm font-medium tracking-widest uppercase text-[#737373] mb-4">
                Detalhamento de Scores
              </h3>
              <div className="space-y-3">
                <ScoreRow
                  label="Manutenção de Mistério"
                  value={userScore.mysteryMaintenance}
                  desc="Quão bem você mantém o enigma e a distância estratégica"
                  color="#8b5cf6"
                />
                <ScoreRow
                  label="Controle Emocional"
                  value={userScore.emotionalControl}
                  desc="Capacidade de não reagir impulsivamente"
                  color="#06b6d4"
                />
                <ScoreRow
                  label="Paciência Estratégica"
                  value={userScore.strategicPatience}
                  desc="Saber esperar o momento certo para agir"
                  color="#059669"
                />
                <ScoreRow
                  label="Prova Social"
                  value={userScore.socialProofAwareness}
                  desc="Gestão de imagem e múltiplas opções"
                  color="#d97706"
                />
                <ScoreRow
                  label="Adaptabilidade"
                  value={userScore.adaptability}
                  desc="Diversidade de abordagens e táticas"
                  color="#e11d48"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-[#0D0D0D] border border-[#262626]">
      <div className="text-lg font-semibold tracking-tighter" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-[#737373]">{label}</div>
      <div className="text-[9px] text-[#737373]/60">{sub}</div>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  desc,
  color,
}: {
  label: string;
  value: number;
  desc: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#a3a3a3]">{label}</span>
        <span className="text-xs font-mono font-semibold" style={{ color }}>
          {value}/100
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#262626]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <p className="text-[10px] text-[#737373] mt-1">{desc}</p>
    </div>
  );
}
