"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  VICTIM_TYPES,
  LOVE_LANGUAGES,
  PIPELINE_STAGES,
  INTERACTION_CATEGORIES,
  type VictimType,
  type LoveLanguage,
  type PipelineStage,
  type InteractionCategory,
} from "@/lib/types";
import { loadState, createContact, addContact, addInteraction } from "@/lib/store";

export default function NovoAlvoPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [primaryArchetype, setPrimaryArchetype] = useState<VictimType>("disappointed_dreamer");
  const [secondaryArchetype, setSecondaryArchetype] = useState<VictimType | "">("");
  const [loveLanguage, setLoveLanguage] = useState<LoveLanguage | "">("");
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("lead_generation");
  const [notes, setNotes] = useState("");

  // Interacoes passadas
  const [pastInteractions, setPastInteractions] = useState<Array<{
    typeId: string;
    category: InteractionCategory;
    date: string;
    sentiment: number;
    notes: string;
    initiatedByTarget: boolean;
    duration?: number;
    location?: string;
  }>>([]);
  const [showAddInteraction, setShowAddInteraction] = useState(false);

  // Form da interacao
  const [intCategory, setIntCategory] = useState<InteractionCategory>("digital_passive");
  const [intTypeId, setIntTypeId] = useState("");
  const [intDate, setIntDate] = useState(new Date().toISOString().split("T")[0]);
  const [intSentiment, setIntSentiment] = useState(0.5);
  const [intNotes, setIntNotes] = useState("");
  const [intInitiatedByTarget, setIntInitiatedByTarget] = useState(false);
  const [intDuration, setIntDuration] = useState("");
  const [intLocation, setIntLocation] = useState("");

  // Quando muda categoria, resetar tipo
  useEffect(() => {
    const types = INTERACTION_CATEGORIES[intCategory].types;
    if (types.length > 0) setIntTypeId(types[0].id);
  }, [intCategory]);

  const handleAddPastInteraction = () => {
    if (!intTypeId) return;
    setPastInteractions([
      ...pastInteractions,
      {
        typeId: intTypeId,
        category: intCategory,
        date: new Date(intDate).toISOString(),
        sentiment: intSentiment,
        notes: intNotes,
        initiatedByTarget: intInitiatedByTarget,
        duration: intDuration ? parseInt(intDuration) : undefined,
        location: intLocation || undefined,
      },
    ]);
    // Reset form
    setIntNotes("");
    setIntSentiment(0.5);
    setIntInitiatedByTarget(false);
    setIntDuration("");
    setIntLocation("");
    setShowAddInteraction(false);
  };

  const handleRemoveInteraction = (index: number) => {
    setPastInteractions(pastInteractions.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!firstName.trim()) return;

    let state = loadState();
    const contact = createContact({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      primaryArchetype,
      secondaryArchetype: secondaryArchetype || undefined,
      loveLanguage: loveLanguage || undefined,
      pipelineStage,
      notes,
    });

    state = addContact(state, contact);

    // Adicionar interacoes passadas (em ordem cronologica)
    const sorted = [...pastInteractions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    for (const pi of sorted) {
      state = addInteraction(state, {
        contactId: contact.id,
        typeId: pi.typeId as any,
        category: pi.category,
        sentiment: pi.sentiment,
        date: pi.date,
        notes: pi.notes,
        initiatedByTarget: pi.initiatedByTarget,
        duration: pi.duration,
        location: pi.location,
      });
    }

    router.push(`/alvos/${contact.id}`);
  };

  const getInteractionName = (typeId: string, category: InteractionCategory) => {
    const cat = INTERACTION_CATEGORIES[category];
    return cat.types.find((t) => t.id === typeId)?.name || typeId;
  };

  const sentimentLabel = (v: number) => {
    if (v <= -0.5) return "Muito Negativo";
    if (v < 0) return "Negativo";
    if (v === 0) return "Neutro";
    if (v <= 0.5) return "Positivo";
    return "Muito Positivo";
  };

  const sentimentColor = (v: number) => {
    if (v <= -0.5) return "#e11d48";
    if (v < 0) return "#d97706";
    if (v === 0) return "#737373";
    if (v <= 0.5) return "#059669";
    return "#7c3aed";
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-16 p-6 max-w-3xl">
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[#737373] hover:text-[#a3a3a3] transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Voltar
          </button>
          <h1 className="text-3xl font-bold tracking-tighter">
            Novo{" "}
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#e11d48] bg-clip-text text-transparent">
              Alvo
            </span>
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            Quanto mais informacao, mais precisa sera a analise
          </p>
        </header>

        <div className="space-y-6">
          {/* Dados basicos */}
          <section className="bento-card">
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#737373] mb-4">
              Dados do Alvo
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#737373] mb-1 block">Nome *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nome"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] mb-1 block">Sobrenome</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sobrenome"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 transition-colors"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-[#737373] mb-1 block">Notas / Contexto</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Como voce conheceu? O que sabe sobre essa pessoa? Situacoes relevantes..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 transition-colors resize-none"
              />
            </div>
          </section>

          {/* Classificacao */}
          <section className="bento-card">
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#737373] mb-4">
              Classificacao (Greene)
            </h2>

            <div className="mb-4">
              <label className="text-xs text-[#737373] mb-2 block">Arquetipo Primario da Vitima</label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                {VICTIM_TYPES.map((vt) => (
                  <button
                    key={vt.id}
                    onClick={() => setPrimaryArchetype(vt.id as VictimType)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      primaryArchetype === vt.id
                        ? "bg-[#7c3aed]/10 border-[#7c3aed]/30 text-[#8b5cf6]"
                        : "bg-[#0D0D0D] border-[#262626] text-[#a3a3a3] hover:border-[#333]"
                    }`}
                  >
                    <div className="text-xs font-medium">{vt.name}</div>
                    <div className="text-[10px] text-[#737373] mt-0.5">{vt.need}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#737373] mb-1 block">Linguagem do Amor</label>
                <select
                  value={loveLanguage}
                  onChange={(e) => setLoveLanguage(e.target.value as LoveLanguage)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50 transition-colors"
                >
                  <option value="">Ainda nao identificada</option>
                  {LOVE_LANGUAGES.map((ll) => (
                    <option key={ll.id} value={ll.id}>{ll.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#737373] mb-1 block">Fase do Pipeline</label>
                <select
                  value={pipelineStage}
                  onChange={(e) => setPipelineStage(e.target.value as PipelineStage)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50 transition-colors"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - {s.phase}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Interacoes passadas */}
          <section className="bento-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-medium tracking-widest uppercase text-[#737373]">
                  Historico de Interacoes
                </h2>
                <p className="text-[10px] text-[#737373]/60 mt-0.5">
                  Adicione encontros e interacoes passadas para uma analise mais precisa
                </p>
              </div>
              <button
                onClick={() => setShowAddInteraction(!showAddInteraction)}
                className="px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 text-[#8b5cf6] text-xs font-medium border border-[#7c3aed]/20 hover:bg-[#7c3aed]/20 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Adicionar
              </button>
            </div>

            {/* Add interaction form */}
            {showAddInteraction && (
              <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#262626] mb-4 space-y-3">
                {/* Category */}
                <div>
                  <label className="text-xs text-[#737373] mb-1 block">Categoria</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(Object.entries(INTERACTION_CATEGORIES) as [InteractionCategory, typeof INTERACTION_CATEGORIES[InteractionCategory]][]).map(([key, cat]) => (
                      <button
                        key={key}
                        onClick={() => setIntCategory(key)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                          intCategory === key
                            ? "bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/30"
                            : "bg-[#161616] text-[#737373] border border-[#262626]"
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
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                          intTypeId === t.id
                            ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                            : "bg-[#161616] text-[#737373] border border-[#262626]"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date + initiated by */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#737373] mb-1 block">Data</label>
                    <input
                      type="date"
                      value={intDate}
                      onChange={(e) => setIntDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#262626] text-xs text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
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
                            : "bg-[#161616] text-[#737373] border border-[#262626]"
                        }`}
                      >
                        Eu
                      </button>
                      <button
                        onClick={() => setIntInitiatedByTarget(true)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          intInitiatedByTarget
                            ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                            : "bg-[#161616] text-[#737373] border border-[#262626]"
                        }`}
                      >
                        O Alvo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sentiment slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-[#737373]">Como foi? (Sentimento)</label>
                    <span className="text-xs font-medium" style={{ color: sentimentColor(intSentiment) }}>
                      {sentimentLabel(intSentiment)} ({intSentiment > 0 ? "+" : ""}{intSentiment.toFixed(1)})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.1}
                    value={intSentiment}
                    onChange={(e) => setIntSentiment(parseFloat(e.target.value))}
                    className="w-full accent-[#8b5cf6]"
                  />
                  <div className="flex justify-between text-[9px] text-[#737373]/50">
                    <span>Pessimo</span>
                    <span>Neutro</span>
                    <span>Incrivel</span>
                  </div>
                </div>

                {/* Duration & Location (for presencial) */}
                {(intCategory === "presencial_casual" || intCategory === "presencial_intimate") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#737373] mb-1 block">Duracao (minutos)</label>
                      <input
                        type="number"
                        value={intDuration}
                        onChange={(e) => setIntDuration(e.target.value)}
                        placeholder="Ex: 90"
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#262626] text-xs text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#737373] mb-1 block">Local</label>
                      <input
                        type="text"
                        value={intLocation}
                        onChange={(e) => setIntLocation(e.target.value)}
                        placeholder="Ex: Starbucks Faria Lima"
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#262626] text-xs text-[#e5e5e5] focus:outline-none focus:border-[#7c3aed]/50"
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-xs text-[#737373] mb-1 block">Detalhes</label>
                  <textarea
                    value={intNotes}
                    onChange={(e) => setIntNotes(e.target.value)}
                    placeholder="O que aconteceu? Como ela reagiu? Detalhes importantes..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#262626] text-xs text-[#e5e5e5] placeholder:text-[#737373]/50 focus:outline-none focus:border-[#7c3aed]/50 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddInteraction(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#737373] hover:text-[#a3a3a3]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddPastInteraction}
                    className="px-4 py-1.5 rounded-lg bg-[#059669] text-white text-xs font-medium hover:bg-[#047857] transition-colors"
                  >
                    Adicionar Interacao
                  </button>
                </div>
              </div>
            )}

            {/* List of added interactions */}
            {pastInteractions.length > 0 ? (
              <div className="space-y-2">
                {pastInteractions
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((pi, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0D0D0D] border border-[#262626]">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: sentimentColor(pi.sentiment) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#e5e5e5] font-medium">
                          {getInteractionName(pi.typeId, pi.category)}
                        </span>
                        <span className="text-[9px] text-[#737373]">
                          {pi.initiatedByTarget ? "Iniciado pelo alvo" : "Iniciado por voce"}
                        </span>
                      </div>
                      {pi.notes && (
                        <p className="text-[10px] text-[#737373] mt-0.5 truncate">{pi.notes}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-[#737373] flex-shrink-0">
                      {new Date(pi.date).toLocaleDateString("pt-BR")}
                    </span>
                    <button
                      onClick={() => handleRemoveInteraction(i)}
                      className="text-[#737373] hover:text-[#e11d48] transition-colors flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#737373]/50 text-center py-4">
                Nenhuma interacao adicionada ainda. Voce pode adicionar depois tambem.
              </p>
            )}
          </section>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-sm text-[#737373] hover:text-[#a3a3a3] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!firstName.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Criar Alvo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
