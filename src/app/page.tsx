"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import UserProfileCard from "@/components/UserProfileCard";
import MysteryGauge from "@/components/MysteryGauge";
import TensionThermometer from "@/components/TensionThermometer";
import VulnerabilityRadar from "@/components/VulnerabilityRadar";
import EnchantmentTimeline from "@/components/EnchantmentTimeline";
import ScarcityIndex from "@/components/ScarcityIndex";
import KPICards from "@/components/KPICards";
import ActionBar from "@/components/ActionBar";
import AlertBanner, { type AlertItem } from "@/components/AlertBanner";
import StrategicInsights from "@/components/StrategicInsights";
import BehaviorDiagnostic from "@/components/BehaviorDiagnostic";
import PipelineFunnel from "@/components/PipelineFunnel";
import ActiveContacts from "@/components/ActiveContacts";
import { loadState } from "@/lib/store";
import { generateProactiveAlerts } from "@/lib/alerts-engine";
import { calculateUserScore, getDefaultUserScore, type UserScore } from "@/lib/user-scoring";

export default function Dashboard() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeContact, setActiveContact] = useState<ReturnType<typeof loadState>["contacts"][number] | null>(null);
  const [userScore, setUserScore] = useState<UserScore>(getDefaultUserScore());

  useEffect(() => {
    const state = loadState();
    if (!state) return;

    // Calculate user score from all interactions
    if (state.interactions.length > 0) {
      const score = calculateUserScore(state.contacts, state.interactions, state.seducerArchetype);
      setUserScore(score);
    }

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
                Inteligência estratégica para seus relacionamentos
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
          {/* Row 1: User Profile (2x2) + Pipeline Funnel (2 cols) */}
          <UserProfileCard />
          <PipelineFunnel />

          {/* Row 2: Active Contacts (2 cols) + Strategic Insights (2 cols) */}
          <ActiveContacts />
          <StrategicInsights score={userScore} />

          {/* Row 3: KPI Cards (4 cols) */}
          <KPICards />

          {/* Row 4: Behavior Diagnostic (2 cols) + Mystery Gauge + Scarcity Index */}
          <BehaviorDiagnostic score={userScore} />
          <MysteryGauge />
          <ScarcityIndex />

          {/* Row 5: Tension Thermometer (2 cols) + Vulnerability Radar */}
          <TensionThermometer />
          <VulnerabilityRadar />

          {/* Row 6: Enchantment Timeline (full width) */}
          <EnchantmentTimeline />
        </div>
      </main>

      {/* Floating Action Bar */}
      <ActionBar contact={activeContact} />
    </div>
  );
}
