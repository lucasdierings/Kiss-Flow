"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import CurrentVictim from "@/components/CurrentVictim";
import MysteryGauge from "@/components/MysteryGauge";
import TensionThermometer from "@/components/TensionThermometer";
import VulnerabilityRadar from "@/components/VulnerabilityRadar";
import EnchantmentTimeline from "@/components/EnchantmentTimeline";
import ScarcityIndex from "@/components/ScarcityIndex";
import KPICards from "@/components/KPICards";
import ActionBar from "@/components/ActionBar";
import AlertBanner, { type AlertItem } from "@/components/AlertBanner";
import { loadState } from "@/lib/store";
import { generateProactiveAlerts } from "@/lib/alerts-engine";

export default function Dashboard() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeContact, setActiveContact] = useState<ReturnType<typeof loadState>["contacts"][number] | null>(null);

  useEffect(() => {
    const state = loadState();
    if (!state) return;

    // Use the active contact or first contact
    const contact = state.contacts.find((c) => c.id === state.activeContactId) || state.contacts[0];
    if (contact) {
      setActiveContact(contact);
      const proactiveAlerts = generateProactiveAlerts(contact, state.interactions);
      setAlerts(
        proactiveAlerts.map((a, i) => ({
          id: `local-${i}`,
          alert_type: a.alert_type,
          title: a.title,
          description: a.description,
          priority: a.priority,
          action_suggested: a.action_suggested,
          contact_id: a.contact_id,
          contact_name: contact.firstName,
          dismissed: false,
          created_at: new Date().toISOString(),
        }))
      );
    }
  }, []);

  const handleExecuteAlert = useCallback((alertId: string, action: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Sidebar />

      {/* Main content - offset for sidebar */}
      <main className="ml-16 p-6 pb-28">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">
                Kiss{" "}
                <span className="bg-gradient-to-r from-[#8b5cf6] to-[#e11d48] bg-clip-text text-transparent">
                  Flow
                </span>
              </h1>
              <p className="text-sm text-[#737373] mt-1">
                Inteligencia estrategica para seus relacionamentos
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification bell */}
              <button className="relative p-2.5 rounded-xl bg-[#161616] border border-[#262626] hover:border-[#333] transition-colors">
                <svg className="w-5 h-5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#e11d48]" />
              </button>

              {/* System status */}
              <div className="glass-strong rounded-xl px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                <span className="text-xs text-[#737373]">NLP Ativo</span>
                <div className="w-px h-4 bg-[#262626]" />
                <span className="text-xs text-[#737373]">Dopamine Engine: <span className="text-[#8b5cf6]">ON</span></span>
              </div>
            </div>
          </div>
        </header>

        {/* Proactive Alerts */}
        <AlertBanner
          alerts={alerts}
          onExecute={handleExecuteAlert}
          onDismiss={handleDismissAlert}
        />

        {/* ===== BENTO GRID ===== */}
        <div className="grid grid-cols-4 gap-4 auto-rows-auto">
          {/* Row 1: Victim Profile (2x2) + Mystery Gauge + Scarcity Index */}
          <CurrentVictim />
          <MysteryGauge />
          <ScarcityIndex />

          {/* Row 2: Tension Thermometer (2 cols) + Vulnerability Radar */}
          <TensionThermometer />
          <VulnerabilityRadar />

          {/* Row 3: KPI Cards (4 cols) */}
          <KPICards />

          {/* Row 4: Enchantment Timeline (full width) */}
          <EnchantmentTimeline />

          {/* Row 5: Recent activity + Dopamine Engine */}
          <div className="bento-card col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
                  Atividade Recente
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { time: "2h atras", event: "Isabella visualizou seu story", color: "#059669" },
                { time: "4h atras", event: "Recuo estrategico finalizado (48h)", color: "#8b5cf6" },
                { time: "6h atras", event: "3 mensagens recebidas sem resposta", color: "#d97706" },
                { time: "1d atras", event: "Livro pessoal entregue — sentimento +0.6", color: "#e11d48" },
                { time: "2d atras", event: "Arquetipo reclassificado: Sonhador → Reformador", color: "#06b6d4" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0D0D0D]/50 border border-[#262626]/50 hover:border-[#262626] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#a3a3a3] truncate">{item.event}</p>
                  </div>
                  <span className="text-[10px] text-[#737373] flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#e11d48]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-xs font-medium tracking-widest uppercase text-[#737373]">
                  Motor de Dopamina
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                <span className="text-[10px] text-[#059669]">Ativo</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { rule: "Reforco intermitente ativado", status: "ON", desc: "Delay aleatorio 2-12h entre respostas", color: "#8b5cf6" },
                { rule: "Jejum de dopamina", status: "Standby", desc: "Proximo ciclo em 18h se interacao exceder limite", color: "#d97706" },
                { rule: "Coquette Mode", status: "OFF", desc: "Bloqueio total de 48-72h — ativar manualmente", color: "#e11d48" },
                { rule: "Alerta de Friendzone", status: "Safe", desc: "Tensao oscilando — sem plato detectado", color: "#059669" },
                { rule: "Climax emocional", status: "92%", desc: "Proximidade ao ponto de inversao de perseguicao", color: "#06b6d4" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0D0D0D]/50 border border-[#262626]/50"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[#a3a3a3]">{item.rule}</p>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                        style={{
                          background: `${item.color}10`,
                          color: item.color,
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#737373] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Bar */}
      <ActionBar contact={activeContact} />
    </div>
  );
}
