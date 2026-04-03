"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  AppState,
  Contact,
  Interaction,
  VICTIM_TYPES,
  PIPELINE_STAGES,
  LOVE_LANGUAGES,
  CLOSING_GOALS,
  INTERACTION_CATEGORIES,
  type InteractionCategory,
  type LostReason,
  type PipelineStage,
} from "@/lib/types";
import { loadState, addInteraction, getContactInteractions, saveState, updateContact, manualStageChange, moveToLost } from "@/lib/store";
import { generateAlerts, calculateKPIs, type Alert } from "@/lib/engine";
import { generateProactiveAlerts } from "@/lib/alerts-engine";
import ActionBar from "@/components/ActionBar";
import AlertBanner, { type AlertItem } from "@/components/AlertBanner";
import PhaseTransitionModal from "@/components/PhaseTransitionModal";

export default function AlvoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<{
    oldPhase: string;
    newPhase: string;
    isLost: boolean;
  } | null>(null);
  const [showStageSelector, setShowStageSelector] = useState(false);
  const [editingClosingGoal, setEditingClosingGoal] = useState(false);
  const [closingGoalDraft, setClosingGoalDraft] = useState("");
  const [customClosingGoalDraft, setCustomClosingGoalDraft] = useState("");

  // Interaction form
  const [intCategory, setIntCategory] = useState<InteractionCategory>("digital_passive");
  const [intTypeId, setIntTypeId] = useState("");
  const [intDate, setIntDate] = useState(new Date().toISOString().split("T")[0]);
  const [intSentiment, setIntSentiment] = useState(0.5);
  const [intNotes, setIntNotes] = useState("");
  const [intInitiatedByTarget, setIntInitiatedByTarget] = useState(false);
  const [intDuration, setIntDuration] = useState("");
  const [intLocation, setIntLocation] = useState("");

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    const types = INTERACTION_CATEGORIES[intCategory].types;
    if (types.length > 0) setIntTypeId(types[0].id);
  }, [intCategory]);

  if (!state) return null;

  const contact = state.contacts.find((c) => c.id === id);
  if (!contact) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-[#e5e5e5] mb-2">Alvo nao encontrado</h2>
          <Link href="/alvos" className="text-sm text-[#8b5cf6] hover:underline">Voltar para Alvos</Link>
        </div>
      </div>
    );
  }

  const interactions = getContactInteractions(state, id);
  const alerts = generateAlerts(contact, state.interactions);
  const kpis = calculateKPIs(contact, state.interactions);

  const getArchetypeName = (archId: string) => VICTIM_TYPES.find((v) => v.id === archId)?.name || archId;
  const getArchetypeDesc = (archId: string) => VICTIM_TYPES.find((v) => v.id === archId)?.desc || "";
  const getStageName = (stageId: string) => PIPELINE_STAGES.find((s) => s.id === stageId)?.name || stageId;
  const getStagePhase = (stageId: string) => PIPELINE_STAGES.find((s) => s.id === stageId)?.phase || "";
  const getLoveLanguageName = (llId: string) => LOVE_LANGUAGES.find((l) => l.id === llId)?.name || "";

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "lead_generation": return "#06b6d4";
      case "qualification": return "#d97706";
      case "nurturing": return "#8b5cf6";
      case "closing": return "#e11d48";
      case "retention": return "#059669";
      default: return "#737373";
    }
  };

  const getInteractionName = (typeId: string) => {
    for (const cat of Object.values(INTERACTION_CATEGORIES)) {
      const found = cat.types.find((t) => t.id === typeId);
      if (found) return found.name;
    }
    return typeId;
  };

  const getCategoryName = (catId: string) => {
    return INTERACTION_CATEGORIES[catId as InteractionCategory]?.name || catId;
  };

  const sentimentColor = (v: number) => {
    if (v <= -0.5) return "#e11d48";
    if (v < 0) return "#d97706";
    if (v === 0) return "#737373";
    if (v <= 0.5) return "#059669";
    return "#7c3aed";
  };

  const alertColor = (type: Alert["type"]) => {
    switch (type) {
      case "danger": return "#e11d48";
      case "warning": return "#d97706";
      case "success": return "#059669";
      case "info": return "#06b6d4";
    }
  };

  const handleAddInteraction = () => {
    if (!intTypeId) return;
    const result = addInteraction(state, {
      contactId: id,
      typeId: intTypeId as any,
      category: intCategory,
      sentiment: intSentiment,
      date: new Date(intDate).toISOString(),
      notes: intNotes,
      initiatedByTarget: intInitiatedByTarget,
      duration: intDuration ? parseInt(intDuration) : undefined,
      location: intLocation || undefined,
    });
    setState(result.state);
    if (result.suggestedProgression) {
      setPendingTransition({
        oldPhase: contact.pipelineStage,
        newPhase: result.suggestedProgression,
        isLost: false,
      });
    }
    setIntNotes("");
    setIntSentiment(0.5);
    setIntInitiatedByTarget(false);
    setIntDuration("");
    setIntLocation("");
    setShowAddInteraction(false);
  };

  const handleConfirmTransition = (evidence: string, lostReason?: LostReason) => {
    if (!pendingTransition || !state) return;
    let newState: AppState;
    if (pendingTransition.isLost) {
      newState = moveToLost(state, id, lostReason!, evidence);
    } else {
      newState = manualStageChange(state, id, pendingTransition.newPhase as PipelineStage, evidence);
    }
    setState(newState);
    setPendingTransition(null);
  };

  const handleManualStageSelect = (newStage: PipelineStage) => {
    if (newStage === contact.pipelineStage) return;
    setPendingTransition({
      oldPhase: contact.pipelineStage,
      newPhase: newStage,
      isLost: false,
    });
    setShowStageSelector(false);
  };

  const stageColor = getStageColor(contact.pipelineStage);
  const stageIndex = ["lead_generation", "qualification", "nurturing", "closing", "retention"].indexOf(contact.pipelineStage);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-16 p-6">
        {/* Back + Header */}
        <header className="mb-6">
          <button
            onClick={() => router.push("/alvos")}
            className="flex items-center gap-2 text-sm text-[#737373] hover:text-[#a3a3a3] transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Alvos
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#7c3aed]/20 blur-xl scale-150" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center border-2 border-[#262626] ring-2 ring-[#7c3aed]/30 ring-offset-2 ring-offset-[#0D0D0D]">
                  <span className="text-xl font-bold text-[#8b5cf6]">
                    {contact.firstName[0]}{contact.lastName?.[0] || ""}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tighter text-[#e5e5e5]">
                  {contact.firstName} {contact.lastName}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm text-[#8b5cf6]">{getArchetypeName(contact.primaryArchetype)}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${stageColor}15`, color: stageColor, border: `1px solid ${stageColor}30` }}
                  >
                    {getStageName(contact.pipelineStage)} - {getStagePhase(contact.pipelineStage)}
                  </span>
                  {/* Meta de Fechamento badge */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        const currentGoal = contact.closingGoal || "";
                        const isPreset = CLOSING_GOALS.some((g) => g.id === currentGoal);
                        setClosingGoalDraft(isPreset ? currentGoal : currentGoal ? "outro" : "");
                        setCustomClosingGoalDraft(isPreset ? "" : currentGoal);
                        setEditingClosingGoal(!editingClosingGoal);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                      style={{
                        background: contact.closingGoal ? "#d9770615" : "#73737315",
                        color: contact.closingGoal ? "#d97706" : "#737373",
                        border: `1px solid ${contact.closingGoal ? "#d9770630" : "#73737330"}`,
                      }}
                    >
                      <span>🎯</span>
                      <span>{contact.closingGoal ? (CLOSING_GOALS.find((g) => g.id === contact.closingGoal)?.name || contact.closingGoal) : "Sem meta"}</span>
                      <svg className="w-2.5 h-2.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    {editingClosingGoal && (
                      <div className="absolute top-7 left-0 z-50 p-3 rounded-xl bg-[#161616] border border-[#262626] shadow-xl min-w-[240px]">
                        <div className="text-[10px] text-[#737373] mb-2 uppercase tracking-wider font-medium">Meta de Fechamento</div>
                        <div className="flex flex-col gap-1.5">
                          {CLOSING_GOALS.map((goal) => (
                            <button
                              key={goal.id}
                              onClick={() => {
                                setClosingGoalDraft(goal.id);
                                if (goal.id !== "outro") {
                                  setCustomClosingGoalDraft("");
                                }
                              }}
                              className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                closingGoalDraft === goal.id
                                  ? "bg-[#d97706]/15 text-[#d97706] border border-[#d97706]/30"
                                  : "bg-[#0D0D0D] text-[#a3a3a3] border border-[#262626] hover:border-[#333]"
                              }`}
                            >
                              {goal.name}
                            </button>
                          ))}
                        </div>
                        {closingGoalDraft === "outro" && (
                          <input
                            type="text"
                            value={customClosingGoalDraft}
                            onChange={(e) => setCustomClosingGoalDraft(e.target.value)}
                            placeholder="Descreva seu objetivo..."
                            className="w-full mt-2 px-2.5 py-1.5 rounded-lg bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#d97706]/50 transition-colors"
                            autoFocus
                          />
                        )}
                        <div className="flex gap-2 justify-end mt-2.5">
                          <button
                            onClick={() => setEditingClosingGoal(false)}
                            className="px-2.5 py-1 rounded-lg text-[10px] text-[#737373] hover:text-[#a3a3a3]"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              const newGoal = closingGoalDraft === "outro" ? customClosingGoalDraft : closingGoalDraft;
                              const newState = updateContact(state!, id, { closingGoal: newGoal || undefined });
                              setState(newState);
                              setEditingClosingGoal(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#d97706] text-white text-[10px] font-medium hover:bg-[#b45309] transition-colors"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddInteraction(!showAddInteraction)}
              className="px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nova Interacao
            </button>
          </div>

          {/* Pipeline bar */}
          <div className="mt-4 flex gap-1">
            {["Lead", "Qualification", "Nurturing", "Closing", "Retention"].map((stage, i) => (
              <div key={stage} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-1.5 rounded-full" style={{ background: i <= stageIndex ? stageColor : "#262626" }} />
                <span className="text-[9px]" style={{ color: i <= stageIndex ? stageColor : "#737373" }}>{stage}</span>
              </div>
            ))}
          </div>

          {/* Pipeline controls */}
          <div className="mt-3 flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowStageSelector(!showStageSelector)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-[#0D0D0D] border border-[#262626] text-[#a3a3a3] hover:border-[#333] transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Alterar Fase
              </button>
              {showStageSelector && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-[#161616] border border-[#262626] rounded-xl shadow-xl py-1 min-w-40">
                  {PIPELINE_STAGES.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => handleManualStageSelect(stage.id as PipelineStage)}
                      disabled={stage.id === contact.pipelineStage}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                        stage.id === contact.pipelineStage
                          ? "text-[#737373] cursor-default"
                          : "text-[#e5e5e5] hover:bg-[#262626]"
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: getStageColor(stage.id) }}
                      />
                      {stage.name}
                      {stage.id === contact.pipelineStage && (
                        <span className="text-[9px] text-[#737373] ml-auto">atual</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() =>
                setPendingTransition({
                  oldPhase: contact.pipelineStage,
                  newPhase: "lost",
                  isLost: true,
                })
              }
              className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Mover para Perdidos
            </button>
          </div>
        </header>

        {/* Proactive Alerts */}
        <AlertBanner
          alerts={generateProactiveAlerts(contact, state.interactions).map((a, i) => ({
            id: `alert-${i}`,
            alert_type: a.alert_type,
            title: a.title,
            description: a.description,
            priority: a.priority,
            action_suggested: a.action_suggested,
            contact_id: a.contact_id,
            contact_name: contact.firstName,
            dismissed: false,
            created_at: new Date().toISOString(),
          }))}
          onExecute={(alertId, action) => {
            // TODO: Record action as interaction
          }}
          onDismiss={(alertId) => {
            // TODO: Persist dismiss to Supabase
          }}
        />

        <div className="grid grid-cols-4 gap-4">
          {/* Metrics cards */}
          <div className="bento-card text-center">
            <div className="text-3xl font-bold tracking-tighter text-[#8b5cf6]">{Math.round(contact.mysteryCoefficient)}%</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mt-1">Misterio</div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
              <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${contact.mysteryCoefficient}%` }} />
            </div>
          </div>
          <div className="bento-card text-center">
            <div className="text-3xl font-bold tracking-tighter text-[#e11d48]">{Math.round(contact.tensionLevel)}%</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mt-1">Tensao</div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
              <div className="h-full rounded-full bg-[#e11d48]" style={{ width: `${contact.tensionLevel}%` }} />
            </div>
          </div>
          <div className="bento-card text-center">
            <div className="text-3xl font-bold tracking-tighter text-[#059669]">{Math.round(contact.victimScore)}%</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mt-1">Victim Score</div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
              <div className="h-full rounded-full bg-[#059669]" style={{ width: `${contact.victimScore}%` }} />
            </div>
          </div>
          <div className="bento-card text-center">
            <div className="text-3xl font-bold tracking-tighter text-[#d97706]">{Math.round(contact.scarcityScore)}%</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mt-1">Escassez</div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
              <div className="h-full rounded-full bg-[#d97706]" style={{ width: `${contact.scarcityScore}%` }} />
            </div>
          </div>

          {/* KPIs row */}
          <div className="bento-card">
            <div className="text-xs text-[#737373] mb-1">Taxa Perseguicao</div>
            <div className="text-xl font-bold text-[#8b5cf6]">{kpis.pursuitRate}%</div>
            <div className="text-[9px] text-[#737373]">Meta: &gt;70%</div>
          </div>
          <div className="bento-card">
            <div className="text-xs text-[#737373] mb-1">Sentimento Medio</div>
            <div className="text-xl font-bold" style={{ color: sentimentColor(kpis.avgSentiment) }}>
              {kpis.avgSentiment > 0 ? "+" : ""}{kpis.avgSentiment}
            </div>
            <div className="text-[9px] text-[#737373]">-1 a +1</div>
          </div>
          <div className="bento-card">
            <div className="text-xs text-[#737373] mb-1">Dias no Pipeline</div>
            <div className="text-xl font-bold text-[#06b6d4]">{kpis.daysInPipeline}d</div>
            <div className="text-[9px] text-[#737373]">{kpis.totalInteractions} interacoes</div>
          </div>
          <div className="bento-card">
            <div className="text-xs text-[#737373] mb-1">Encantamento</div>
            <div className="text-xl font-bold" style={{ color: contact.enchantmentScore >= 0 ? "#059669" : "#e11d48" }}>
              {contact.enchantmentScore > 0 ? "+" : ""}{(contact.enchantmentScore * 100).toFixed(0)}%
            </div>
            <div className="text-[9px] text-[#737373]">{contact.enchantmentScore > 0.5 ? "Encantado" : contact.enchantmentScore > 0 ? "Interessado" : "Neutro"}</div>
          </div>

          {/* Add Interaction Panel */}
          {showAddInteraction && (
            <div className="col-span-4 bento-card border-[#7c3aed]/20">
              <h3 className="text-sm font-medium text-[#8b5cf6] mb-4">Nova Interacao</h3>
              <div className="space-y-3">
                {/* Category */}
                <div>
                  <label className="text-xs text-[#737373] mb-1 block">Categoria</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(Object.entries(INTERACTION_CATEGORIES) as [InteractionCategory, typeof INTERACTION_CATEGORIES[InteractionCategory]][]).map(([key, cat]) => (
                      <button
                        key={key}
                        onClick={() => setIntCategory(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          intCategory === key
                            ? "bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/30"
                            : "bg-[#0D0D0D] text-[#737373] border border-[#262626] hover:border-[#333]"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs text-[#737373] mb-1 block">Tipo</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {INTERACTION_CATEGORIES[intCategory].types.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setIntTypeId(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          intTypeId === t.id
                            ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                            : "bg-[#0D0D0D] text-[#737373] border border-[#262626] hover:border-[#333]"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-[#737373] mb-1 block">Data</label>
                    <input
                      type="date"
                      value={intDate}
                      onChange={(e) => setIntDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#737373] mb-1 block">Quem iniciou?</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIntInitiatedByTarget(false)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          !intInitiatedByTarget
                            ? "bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/30"
                            : "bg-[#0D0D0D] text-[#737373] border border-[#262626]"
                        }`}
                      >
                        Eu
                      </button>
                      <button
                        onClick={() => setIntInitiatedByTarget(true)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          intInitiatedByTarget
                            ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                            : "bg-[#0D0D0D] text-[#737373] border border-[#262626]"
                        }`}
                      >
                        O Alvo
                      </button>
                    </div>
                  </div>
                  {(intCategory === "presencial_casual" || intCategory === "presencial_intimate") && (
                    <>
                      <div>
                        <label className="text-xs text-[#737373] mb-1 block">Duracao (min)</label>
                        <input
                          type="number"
                          value={intDuration}
                          onChange={(e) => setIntDuration(e.target.value)}
                          placeholder="90"
                          className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#737373] mb-1 block">Local</label>
                        <input
                          type="text"
                          value={intLocation}
                          onChange={(e) => setIntLocation(e.target.value)}
                          placeholder="Starbucks"
                          className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Sentiment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-[#737373]">Como foi?</label>
                    <span className="text-xs font-medium" style={{ color: sentimentColor(intSentiment) }}>
                      {intSentiment > 0 ? "+" : ""}{intSentiment.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-1} max={1} step={0.1}
                    value={intSentiment}
                    onChange={(e) => setIntSentiment(parseFloat(e.target.value))}
                    className="w-full accent-[#8b5cf6]"
                  />
                </div>

                {/* Notes */}
                <textarea
                  value={intNotes}
                  onChange={(e) => setIntNotes(e.target.value)}
                  placeholder="Detalhes: o que aconteceu, como reagiu, sinais importantes..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 resize-none"
                />

                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddInteraction(false)} className="px-3 py-1.5 rounded-lg text-xs text-[#737373]">
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddInteraction}
                    className="px-5 py-1.5 rounded-lg bg-[#059669] text-white text-xs font-medium hover:bg-[#047857] transition-colors"
                  >
                    Registrar Interacao
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info card */}
          <div className="col-span-2 bento-card">
            <h3 className="text-xs font-medium tracking-widest uppercase text-[#737373] mb-4">Perfil</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-[#737373]">Arquetipo</span>
                <span className="text-xs text-[#8b5cf6]">{getArchetypeName(contact.primaryArchetype)}</span>
              </div>
              {contact.secondaryArchetype && (
                <div className="flex justify-between">
                  <span className="text-xs text-[#737373]">Secundario</span>
                  <span className="text-xs text-[#a3a3a3]">{getArchetypeName(contact.secondaryArchetype)}</span>
                </div>
              )}
              {contact.loveLanguage && (
                <div className="flex justify-between">
                  <span className="text-xs text-[#737373]">Linguagem do Amor</span>
                  <span className="text-xs text-[#d97706]">{getLoveLanguageName(contact.loveLanguage)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-xs text-[#737373]">Descricao</span>
                <span className="text-xs text-[#a3a3a3] text-right max-w-[200px]">{getArchetypeDesc(contact.primaryArchetype)}</span>
              </div>
              {contact.notes && (
                <div className="pt-2 border-t border-[#262626]">
                  <span className="text-xs text-[#737373] block mb-1">Notas</span>
                  <p className="text-xs text-[#a3a3a3]">{contact.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vulnerability radar summary */}
          <div className="col-span-2 bento-card">
            <h3 className="text-xs font-medium tracking-widest uppercase text-[#737373] mb-4">Vulnerabilidades</h3>
            <div className="space-y-2.5">
              {Object.entries(contact.vulnerabilities).map(([key, value]) => {
                const labels: Record<string, string> = {
                  fantasy: "Fantasia", snobbery: "Snobismo", loneliness: "Solidao",
                  ego: "Ego", adventure: "Aventura", rebellion: "Rebeldia",
                };
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-[10px] text-[#737373] w-16">{labels[key]}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#0D0D0D] overflow-hidden">
                      <div className="h-full rounded-full bg-[#06b6d4]" style={{ width: `${value}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-[#06b6d4] w-8 text-right">{value}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interaction History */}
          <div className="col-span-4 bento-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
                  Historico de Interacoes ({interactions.length})
                </span>
              </div>
            </div>

            {interactions.length === 0 ? (
              <p className="text-xs text-[#737373]/50 text-center py-8">
                Nenhuma interacao registrada. Clique em &quot;Nova Interacao&quot; para comecar.
              </p>
            ) : (
              <div className="space-y-2">
                {interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#0D0D0D]/50 border border-[#262626]/50 hover:border-[#262626] transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: sentimentColor(interaction.sentiment) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-[#e5e5e5]">
                          {getInteractionName(interaction.typeId)}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#262626] text-[#737373]">
                          {getCategoryName(interaction.category)}
                        </span>
                        <span className="text-[9px]" style={{ color: interaction.initiatedByTarget ? "#059669" : "#8b5cf6" }}>
                          {interaction.initiatedByTarget ? "Iniciado pelo alvo" : "Iniciado por voce"}
                        </span>
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                          style={{ background: `${sentimentColor(interaction.sentiment)}10`, color: sentimentColor(interaction.sentiment) }}
                        >
                          {interaction.sentiment > 0 ? "+" : ""}{interaction.sentiment.toFixed(1)}
                        </span>
                      </div>
                      {interaction.notes && (
                        <p className="text-[10px] text-[#737373] mt-1">{interaction.notes}</p>
                      )}
                      {(interaction.duration || interaction.location) && (
                        <div className="flex gap-3 mt-1">
                          {interaction.duration && <span className="text-[9px] text-[#737373]">{interaction.duration}min</span>}
                          {interaction.location && <span className="text-[9px] text-[#737373]">{interaction.location}</span>}
                        </div>
                      )}
                      {/* Metrics snapshot */}
                      {interaction.mysteryAfter !== undefined && (
                        <div className="flex gap-3 mt-1.5">
                          <span className="text-[8px] text-[#8b5cf6]">M: {Math.round(interaction.mysteryAfter)}%</span>
                          <span className="text-[8px] text-[#e11d48]">T: {Math.round(interaction.tensionAfter || 0)}%</span>
                          <span className="text-[8px] text-[#059669]">E: {((interaction.enchantmentAfter || 0) * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#737373] flex-shrink-0">
                      {new Date(interaction.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Bar */}
      <ActionBar contact={contact} />

      {/* Phase Transition Modal */}
      <PhaseTransitionModal
        isOpen={pendingTransition !== null}
        onClose={() => setPendingTransition(null)}
        onConfirm={handleConfirmTransition}
        contactName={`${contact.firstName} ${contact.lastName}`}
        oldPhase={pendingTransition?.oldPhase || ""}
        newPhase={pendingTransition?.newPhase || ""}
        isLost={pendingTransition?.isLost || false}
      />
    </div>
  );
}
