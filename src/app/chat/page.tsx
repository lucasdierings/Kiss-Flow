"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import ContactSelector from "@/components/chat/ContactSelector";
import { createSupabaseBrowser } from "@/lib/supabase";
import { getPersona, getObjectiveTone, type Persona } from "@/lib/persona";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  primary_archetype: string;
  pipeline_stage: string;
  mystery_coefficient: number;
  tension_level: number;
  enchantment_score: number;
  objective: string;
  gender: string;
}

interface UserProfile {
  display_name: string;
  gender: string;
  orientation: string;
  seducer_archetype: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [persona, setPersona] = useState<Persona>(getPersona(null));
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || null;
  const objectiveTone = getObjectiveTone(selectedContact?.objective);

  // Load user profile and contacts
  useEffect(() => {
    async function loadData() {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInitialLoading(false);
        return;
      }

      const [profileRes, contactsRes] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("id", user.id).single(),
        supabase.from("contacts").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      ]);

      if (profileRes.data) {
        const gender = profileRes.data.gender || "nao_informado";
        setUserProfile({
          display_name: profileRes.data.display_name,
          gender,
          orientation: profileRes.data.orientation || "nao_informado",
          seducer_archetype: profileRes.data.seducer_archetype || "charmer",
        });
        setPersona(getPersona(gender));
      }

      if (contactsRes.data) {
        setContacts(contactsRes.data as Contact[]);
      }

      setInitialLoading(false);
    }
    loadData();
  }, []);

  // Load chat history when contact changes
  useEffect(() => {
    async function loadHistory() {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (selectedContactId) {
        query = query.eq("contact_id", selectedContactId);
      } else {
        query = query.is("contact_id", null);
      }

      const { data } = await query;
      if (data) {
        setMessages(data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        })));
      }
    }
    if (!initialLoading) loadHistory();
  }, [selectedContactId, initialLoading]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get recent interactions for context
  const getRecentInteractions = useCallback(async () => {
    if (!selectedContactId) return "Nenhuma interacao registrada";
    const supabase = createSupabaseBrowser();
    const { data } = await supabase
      .from("interactions")
      .select("type_id, category, sentiment, date, notes, initiated_by_target")
      .eq("contact_id", selectedContactId)
      .order("date", { ascending: false })
      .limit(10);

    if (!data || data.length === 0) return "Nenhuma interacao registrada";
    return data.map((i) => `${i.date}: ${i.type_id} (sentimento: ${i.sentiment}, iniciado pelo alvo: ${i.initiated_by_target}) ${i.notes || ""}`).join("\n");
  }, [selectedContactId]);

  async function handleSend(message: string) {
    if (!userProfile) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build context
      const recentInteractions = await getRecentInteractions();
      let targetContext = undefined;
      if (selectedContact) {
        targetContext = {
          name: `${selectedContact.first_name} ${selectedContact.last_name}`.trim(),
          gender: selectedContact.gender || "nao_informado",
          archetype: selectedContact.primary_archetype || "nao_classificado",
          objective: selectedContact.objective || "romance",
          metrics: {
            mystery: selectedContact.mystery_coefficient,
            tension: selectedContact.tension_level,
            enchantment: selectedContact.enchantment_score,
          },
          recentInteractions,
        };
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          userProfile: {
            name: userProfile.display_name,
            gender: userProfile.gender,
            orientation: userProfile.orientation,
            archetype: userProfile.seducer_archetype,
          },
          targetContext,
          history: messages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response || data.error || "Erro ao processar resposta",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save to Supabase
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("ai_chat_messages").insert([
          { user_id: user.id, contact_id: selectedContactId, role: "user", content: message },
          { user_id: user.id, contact_id: selectedContactId, role: "assistant", content: assistantMsg.content },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Erro de conexao. Verifique se a GEMINI_API_KEY esta configurada.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }

    setLoading(false);
  }

  async function handleUpload(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const isAudio = file.type.startsWith("audio/");
      const isImage = file.type.startsWith("image/");

      if (!isImage && !isAudio) return;

      const uploadMsg: Message = {
        id: `user-upload-${Date.now()}`,
        role: "user",
        content: `📎 ${isImage ? "Screenshot" : "Audio"} enviado: ${file.name}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, uploadMsg]);
      setLoading(true);

      try {
        const endpoint = isImage ? "/api/ai/analyze-screenshot" : "/api/ai/analyze-screenshot";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        });

        const data = await response.json();
        const analysis = data.analysis;

        let content = "**Analise da imagem:**\n\n";
        if (analysis?.parse_error) {
          content += analysis.raw_response || "Nao foi possivel analisar.";
        } else if (analysis) {
          if (analysis.ocr_text) content += `**Texto detectado:**\n${analysis.ocr_text}\n\n`;
          if (analysis.sentiment_overall !== undefined) content += `**Sentimento geral:** ${analysis.sentiment_overall > 0 ? "Positivo" : analysis.sentiment_overall < 0 ? "Negativo" : "Neutro"} (${analysis.sentiment_overall})\n\n`;
          if (analysis.who_is_pursuing) content += `**Quem esta perseguindo:** ${analysis.who_is_pursuing}\n`;
          if (analysis.pursuit_ratio) content += `**Taxa de perseguicao:** ${analysis.pursuit_ratio}%\n\n`;
          if (analysis.suggested_tactic) {
            content += `**Tatica sugerida:** ${analysis.suggested_tactic.name} (Tatica ${analysis.suggested_tactic.number})\n`;
            content += `**Por que:** ${analysis.suggested_tactic.reason}\n`;
            content += `**Acao:** ${analysis.suggested_tactic.action}\n\n`;
          }
          if (analysis.alerts?.length) content += `**Alertas:** ${analysis.alerts.join(", ")}`;
        }

        setMessages((prev) => [...prev, {
          id: `analysis-${Date.now()}`,
          role: "assistant",
          content,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }]);
      } catch {
        setMessages((prev) => [...prev, {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Erro ao analisar o arquivo.",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }]);
      }

      setLoading(false);
    };
    reader.readAsDataURL(file);
  }

  // Welcome message based on persona and context
  const welcomeMessage = selectedContact
    ? `Estou analisando o perfil de **${selectedContact.first_name}**. Objetivo: ${objectiveTone.label}. Mystery: ${selectedContact.mystery_coefficient}%, Tension: ${selectedContact.tension_level}%. Como posso te ajudar com ${objectiveTone.description.toLowerCase()}?`
    : persona.greeting;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Header */}
      <header className="glass-strong border-b border-[#262626]/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-[#ffffff05] transition-colors text-[#737373] hover:text-[#a3a3a3]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-sm font-semibold tracking-tighter flex items-center gap-2">
              <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${persona.gradientFrom}, ${persona.gradientTo})` }}>
                {persona.name}
              </span>
              {selectedContact && (
                <span className="text-[#737373] font-normal">
                  — {selectedContact.first_name}
                </span>
              )}
            </h1>
            <p className="text-[10px] text-[#737373]">
              {persona.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            <span className="text-[10px] text-[#059669]">Gemini Flash</span>
          </div>
        </div>
      </header>

      {/* Contact selector */}
      {contacts.length > 0 && (
        <div className="px-4 py-2 border-b border-[#262626]/30">
          <ContactSelector
            contacts={contacts}
            selectedId={selectedContactId}
            onSelect={setSelectedContactId}
          />
        </div>
      )}

      {/* Messages area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Welcome message if no history */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed]/20 to-[#e11d48]/20 flex items-center justify-center mb-4 border border-[#7c3aed]/10">
              <svg className="w-8 h-8 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <p className="text-sm text-[#a3a3a3] max-w-md leading-relaxed">
              {welcomeMessage.replace(/\*\*/g, "")}
            </p>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-lg">
              {[
                selectedContact ? `Analise meu historico com ${selectedContact.first_name}` : null,
                selectedContact ? `Qual o proximo passo com ${selectedContact.first_name}?` : null,
                selectedContact && selectedContact.objective === "romance" ? "Como criar conexao emocional mais profunda?" : null,
                selectedContact && selectedContact.objective === "sexual" ? "Como escalar a tensao de forma natural?" : null,
                selectedContact && selectedContact.objective === "friendship" ? "Como me tornar indispensavel nessa amizade?" : null,
                !selectedContact ? "Como identificar o perfil de alguem que me interessa?" : null,
                !selectedContact ? "Me ajude a entender meu proprio perfil" : null,
                "Como funciona o equilibrio entre presenca e ausencia?",
              ].filter(Boolean).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion!)}
                  className="px-3 py-2 rounded-xl bg-[#161616] border border-[#262626] text-xs text-[#737373] hover:text-[#a3a3a3] hover:border-[#333] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e11d48] to-[#be123c] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
            </div>
            <div className="bg-[#161616] border border-[#262626] rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="glass-strong border-t border-[#262626]/50 px-4 py-3">
        <ChatInput
          onSend={handleSend}
          onUpload={handleUpload}
          disabled={loading}
          placeholder={
            selectedContact
              ? `Pergunte sobre ${selectedContact.first_name}...`
              : "Pergunte sobre estrategia de conquista..."
          }
        />
        <p className="text-[9px] text-[#737373]/40 text-center mt-2">
          {persona.emoji} {persona.name} — Powered by Gemini Flash
        </p>
      </div>
    </div>
  );
}
