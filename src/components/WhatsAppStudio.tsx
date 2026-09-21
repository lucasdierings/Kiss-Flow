"use client";

import { useState, useEffect } from "react";
import { loadState } from "@/lib/store";
import type { Contact } from "@/lib/types";

type ScenarioCategory = "icebreaker" | "invite" | "recovery" | "flirt";

interface MessageTemplate {
  id: string;
  category: ScenarioCategory;
  title: string;
  tactic: string;
  content: string;
  objective: string;
  timing: string;
  successRate: number;
}

const TEMPLATES_DATABASE: MessageTemplate[] = [
  {
    id: "ice-1",
    category: "icebreaker",
    title: "Reação Descontraída a Story",
    tactic: "Arte da Insinuação",
    content: "Você sempre escolhe os lugares com a melhor energia ou foi mera coincidência dessa vez? 😏",
    objective: "Iniciar conversa sem parecer esforçado.",
    timing: "Responda a um story de lugar ou viagem.",
    successRate: 92,
  },
  {
    id: "ice-2",
    category: "icebreaker",
    title: "Observação Curiosa & Provocativa",
    tactic: "Sinais Mistos",
    content: "Tive a impressão de que você tem cara de quem apronta bastante mas tenta passar uma imagem de ajuizada...",
    objective: "Criar curiosidade imediata sobre a percepção do seducer.",
    timing: "Início de papo ou DM inicial.",
    successRate: 88,
  },
  {
    id: "inv-1",
    category: "invite",
    title: "Convite de Baixa Pressão (Café/Vinho Rápido)",
    tactic: "Falsa Sensação de Segurança",
    content: "Vou passar perto do centro quinta no fim da tarde pra tomar uma taça de vinho/café. Se você for uma boa companhia nos primeiros 20 minutos, deixo você ficar mais tempo. Topa?",
    objective: "Agendar o 1º Date tirando a pressão de um 'grande encontro'.",
    timing: "Após 2-3 dias de boa conversa com bom engajamento.",
    successRate: 95,
  },
  {
    id: "inv-2",
    category: "invite",
    title: "Gatilho de Experiência Exclusiva",
    tactic: "Incentivar Transgressão",
    content: "Descobri um bar escondido que pouca gente conhece e pensei que você tem exatamente a vibe de lá. Vamos Quinta às 20h, sem desculpas.",
    objective: "Demonstrar atitude firme e bom gosto social.",
    timing: "Quando o nível de tensão estiver acima de 60%.",
    successRate: 89,
  },
  {
    id: "rec-1",
    category: "recovery",
    title: "Quebra de Geladeira / Resgate Leve",
    tactic: "Recuo Estratégico",
    content: "Passei por aquele café hoje e lembrei daquela sua teoria bizarra. Espero que você não tenha sido capturada por alienígenas! 😂",
    objective: "Retomar contato pós-silêncio sem demonstrar cobrança ou ressentimento.",
    timing: "Após 4 a 7 dias sem troca de mensagens.",
    successRate: 84,
  },
  {
    id: "rec-2",
    category: "recovery",
    title: "Puxão de Orelha Bem-Humorado (Push-Pull)",
    tactic: "Sinais Mistos",
    content: "Acho que vou mandar colocar sua foto em embalagem de leite como 'desaparecida' kkk. Como tá essa semana corrida?",
    objective: "Mostrar desapego e humor leve.",
    timing: "Usar quando a resposta demorar mais de 24h.",
    successRate: 81,
  },
  {
    id: "fli-1",
    category: "flirt",
    title: "Elogio Qualificado com Puxão",
    tactic: "Arte da Insinuação",
    content: "Adoro pessoas com essa sua inteligência e ironia. O único problema é que você sabe disso e usa a seu favor...",
    objective: "Elevar o nível de tensão emocional e validação seletiva.",
    timing: "Durante o auge do papo à noite.",
    successRate: 94,
  },
  {
    id: "fli-2",
    category: "flirt",
    title: "Desafio de Química Presencial",
    tactic: "Movimento Ousado",
    content: "Por texto você se garante bastante, quero só ver se sustenta esse olhar confiante pessoalmente no nosso date.",
    objective: "Desafiar o ego e preparar o terreno para a química física.",
    timing: "Na véspera do encontro marcado.",
    successRate: 91,
  },
];

export default function WhatsAppStudio() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<ScenarioCategory>("icebreaker");
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>(TEMPLATES_DATABASE[0]);
  const [customDraft, setCustomDraft] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [draftAnalysis, setDraftAnalysis] = useState<{
    needinessScore: number;
    emotionalControl: number;
    mysteryImpact: number;
    feedback: string;
  } | null>(null);

  useEffect(() => {
    const state = loadState();
    if (state && state.contacts.length > 0) {
      setContacts(state.contacts);
      setSelectedContactId(state.contacts[0].id);
    }
  }, []);

  const currentContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
  const filteredTemplates = TEMPLATES_DATABASE.filter((t) => t.category === activeCategory);

  const handleSelectTemplate = (tpl: MessageTemplate) => {
    setSelectedTemplate(tpl);
    setCustomDraft(tpl.content);
    setDraftAnalysis(null);
  };

  const handleAnalyzeDraft = () => {
    if (!customDraft.trim()) return;

    const text = customDraft.toLowerCase();
    let neediness = 15;
    let control = 85;
    let mystery = 75;
    const notes: string[] = [];

    if (text.includes("por favor") || text.includes("saudades") || text.includes("me responde") || text.includes("por que sumiu")) {
      neediness += 45;
      control -= 30;
      notes.push("Alto risco de carência perceptível. Evite cobrar tempo ou atenção.");
    }
    if (text.length > 150) {
      mystery -= 25;
      notes.push("Texto muito extenso. Reduza para manter o mistério e a leveza.");
    }
    if (text.includes("?") && (text.match(/\?/g) || []).length > 2) {
      neediness += 20;
      notes.push("Muitas perguntas em uma única mensagem causam pressão e interrogatório.");
    }

    if (notes.length === 0) {
      notes.push("Mensagem com excelente equilíbrio entre postura, desapego e interesse qualificado.");
    }

    setDraftAnalysis({
      needinessScore: Math.min(neediness, 100),
      emotionalControl: Math.max(control, 0),
      mysteryImpact: Math.max(mystery, 0),
      feedback: notes.join(" "),
    });
  };

  const handleSendWhatsApp = () => {
    const textToSend = customDraft || selectedTemplate.content;
    navigator.clipboard.writeText(textToSend);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const rawPhone = currentContact?.phone ? currentContact.phone.replace(/\D/g, "") : "";
    const phoneNum = rawPhone.length >= 10 ? (rawPhone.startsWith("55") ? rawPhone : `55${rawPhone}`) : "";

    const url = phoneNum
      ? `https://wa.me/${phoneNum}?text=${encodeURIComponent(textToSend)}`
      : `https://wa.me/?text=${encodeURIComponent(textToSend)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bento-card bg-gradient-to-r from-[#161616] via-[#1a102f] to-[#161616] border-[#8b5cf6]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8b5cf6] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            WhatsApp Seduction Studio & Copywriting Engine
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Central de Mensagens & Simulador em Tempo Real
          </h2>
          <p className="text-sm text-[#a3a3a3] mt-1">
            Scripts estratégicos validados por arquetipos, com cálculo de carência, tom e disparo de 1-clique para o WhatsApp.
          </p>
        </div>

        {/* Target Selector */}
        <div className="flex items-center gap-3 bg-[#0d0d0d]/80 p-2.5 rounded-xl border border-[#262626]">
          <span className="text-xs text-[#737373] whitespace-nowrap">Alvo Atual:</span>
          {contacts.length > 0 ? (
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="bg-[#161616] text-sm text-white font-medium border border-[#262626] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#8b5cf6]"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName || ""} ({c.pipelineStage})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-[#e11d48]">Nenhum alvo cadastrado</span>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Categories + Templates */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory("icebreaker")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === "icebreaker"
                  ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20"
                  : "bg-[#161616] text-[#737373] hover:text-white border border-[#262626]"
              }`}
            >
              🧊 Icebreakers (Stories & DMs)
            </button>

            <button
              onClick={() => setActiveCategory("invite")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === "invite"
                  ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20"
                  : "bg-[#161616] text-[#737373] hover:text-white border border-[#262626]"
              }`}
            >
              ☕ Convite para Date (Baiting)
            </button>

            <button
              onClick={() => setActiveCategory("recovery")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === "recovery"
                  ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20"
                  : "bg-[#161616] text-[#737373] hover:text-white border border-[#262626]"
              }`}
            >
              👻 Resgate de Ghosting
            </button>

            <button
              onClick={() => setActiveCategory("flirt")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === "flirt"
                  ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20"
                  : "bg-[#161616] text-[#737373] hover:text-white border border-[#262626]"
              }`}
            >
              🔥 Flirte & Tensão Sexual
            </button>
          </div>

          <div className="space-y-3">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1f1733] border-[#8b5cf6] shadow-md shadow-[#8b5cf6]/10"
                      : "bg-[#161616] border-[#262626] hover:border-[#333]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{tpl.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#8b5cf6]/20 text-[#8b5cf6]">
                        {tpl.tactic}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#059669]">
                      {tpl.successRate}% Eficiência
                    </span>
                  </div>

                  <p className="text-xs text-[#e5e5e5] italic bg-[#0d0d0d]/60 p-2.5 rounded-lg border border-[#262626]">
                    "{tpl.content}"
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#737373]">
                    <span>🎯 {tpl.objective}</span>
                    <span>⏳ {tpl.timing}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Copywriting Box */}
          <div className="bento-card space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>✍️ Validador de Rascunho Próprio</span>
              <button
                onClick={handleAnalyzeDraft}
                className="text-xs text-[#8b5cf6] hover:underline font-medium"
              >
                Analisar Risco de Carência
              </button>
            </h3>

            <textarea
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              placeholder="Digite a sua mensagem personalizada para validar antes de enviar..."
              className="w-full h-24 bg-[#0d0d0d] text-xs text-white border border-[#262626] rounded-xl p-3 focus:outline-none focus:border-[#8b5cf6] resize-none"
            />

            {draftAnalysis && (
              <div className="p-3 bg-[#0d0d0d] border border-[#262626] rounded-xl space-y-2 animate-float-up">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[#161616] border border-[#262626]">
                    <div className="text-[10px] text-[#737373]">Risco Carência</div>
                    <div className={`font-bold ${draftAnalysis.needinessScore > 40 ? "text-[#e11d48]" : "text-[#059669]"}`}>
                      {draftAnalysis.needinessScore}%
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#161616] border border-[#262626]">
                    <div className="text-[10px] text-[#737373]">Controle Emocional</div>
                    <div className="font-bold text-[#8b5cf6]">{draftAnalysis.emotionalControl}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#161616] border border-[#262626]">
                    <div className="text-[10px] text-[#737373]">Impacto Mistério</div>
                    <div className="font-bold text-[#06b6d4]">{draftAnalysis.mysteryImpact}%</div>
                  </div>
                </div>

                <p className="text-xs text-[#a3a3a3]">💡 <span className="text-white font-medium">Diagnóstico:</span> {draftAnalysis.feedback}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Phone / WhatsApp Simulator */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bento-card border-[#262626] p-4 bg-[#0a0a0a] relative flex flex-col h-full min-h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626] mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#8b5cf6]/50 bg-[#161616] flex items-center justify-center">
                  {currentContact?.avatarUrl ? (
                    <img src={currentContact.avatarUrl} alt={currentContact.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-[#8b5cf6]">
                      {currentContact ? currentContact.firstName[0] : "A"}
                    </span>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#059669] border border-[#0d0d0d]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {currentContact ? `${currentContact.firstName} ${currentContact.lastName || ""}` : "Alvo Selecionado"}
                  </div>
                  <div className="text-[10px] text-[#059669] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                    online no WhatsApp
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#737373] bg-[#161616] px-2.5 py-1 rounded-full border border-[#262626]">
                {currentContact?.pipelineStage || "Em conversa"}
              </div>
            </div>

            <div className="flex-1 space-y-4 py-2 overflow-y-auto px-1">
              <div className="flex items-start gap-2">
                <div className="max-w-[85%] bg-[#1f2937] text-white p-3 rounded-2xl rounded-tl-none text-xs shadow-md border border-[#374151]">
                  <p className="font-sans">
                    Hey! Vi seu story do fim de semana. Aquele lugar é bom mesmo? 👀
                  </p>
                  <span className="text-[9px] text-[#9ca3af] block text-right mt-1 font-mono">14:32</span>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[88%] bg-[#054740] text-white p-3 rounded-2xl rounded-tr-none text-xs shadow-lg border border-[#0d5c53] animate-float-up">
                  <p className="font-sans whitespace-pre-wrap">
                    {customDraft || selectedTemplate.content}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-[#8696a0] mt-1 font-mono">
                    <span>14:34</span>
                    <svg className="w-3.5 h-3.5 text-[#53bdeb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="text-center my-3">
                <span className="text-[10px] bg-[#161616] text-[#8b5cf6] border border-[#8b5cf6]/30 px-3 py-1 rounded-full font-mono">
                  💡 Gatilho: {selectedTemplate.tactic} ({selectedTemplate.successRate}% eficácia)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#262626] mt-auto space-y-2">
              <button
                onClick={handleSendWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#25D366]/20 cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                {copied ? "Copiado! Abrindo WhatsApp..." : "Abrir no WhatsApp Web/App"}
              </button>
              <div className="text-center text-[10px] text-[#737373]">
                Disparo via <code className="text-[#8b5cf6]">wa.me</code> com cópia automática para área de transferência.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
