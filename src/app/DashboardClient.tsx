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
import QuickLogFAB from "@/components/QuickLogFAB";
import AlertBanner, { type AlertItem } from "@/components/AlertBanner";
import StrategicInsights from "@/components/StrategicInsights";
import BehaviorDiagnostic from "@/components/BehaviorDiagnostic";
import PipelineFunnel from "@/components/PipelineFunnel";
import ActiveContacts from "@/components/ActiveContacts";
import ConversionAnalytics from "@/components/ConversionAnalytics";
import type { AppState, Contact } from "@/lib/types";
import { generateProactiveAlerts } from "@/lib/alerts-engine";
import { calculateUserScore, getDefaultUserScore, type UserScore } from "@/lib/user-scoring";
import { calculateKPIs } from "@/lib/engine";
import RecursoBloqueado from "@/components/RecursoBloqueado";
import {
  avaliarRecurso,
  medirProgresso,
  proximosRecursos,
  type DadosProgresso,
} from "@/lib/progression";

/**
 * Dados reais, vindos da API.
 *
 * Antes isto lia `loadState()` do localStorage — por dispositivo, sem dono e
 * vazio numa conta recém-criada. O efeito era pior que a ausência de dados:
 * o painel exibia os padrões de `getDefaultUserScore()` (poder 45, barras em
 * 50) como se fossem medições do usuário.
 *
 * Agora, enquanto a carga não termina, `carregando` segura a renderização
 * dos números. Nada de valor padrão travestido de resultado.
 */
export default function DashboardClient() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [allInteractions, setAllInteractions] = useState<AppState["interactions"]>([]);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [estado, setEstado] = useState<AppState | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [progresso, setProgresso] = useState<DadosProgresso>({
    alvos: 0,
    interacoes: 0,
    maiorHistorico: 0,
    transicoes: 0,
  });

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const resposta = await fetch("/api/crm/state");
      if (!resposta.ok || cancelado) {
        if (!cancelado) setCarregando(false);
        return;
      }

      const state: AppState = await resposta.json();
      if (cancelado) return;

      setEstado(state);
      setAllInteractions(state.interactions);
      setProgresso(
        medirProgresso(state.contacts, state.interactions, state.phaseHistory ?? [])
      );

      // Sem interações não há o que medir: o score fica nulo e a UI mostra
      // o estado inicial em vez de números inventados.
      setUserScore(
        state.interactions.length > 0
          ? calculateUserScore(state.contacts, state.interactions, state.seducerArchetype)
          : null
      );

      // Use the active contact or first contact
      const contact =
        state.contacts.find((c) => c.id === state.activeContactId) || state.contacts[0];
      if (contact) {
        setActiveContact(contact);
        const proactiveAlerts = generateProactiveAlerts(
          contact,
          state.interactions,
          state.phaseHistory || []
        );
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

      setCarregando(false);
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  const handleExecuteAlert = useCallback((alertId: string, action: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const diagnostico = avaliarRecurso("diagnostico", progresso);
  const funil = avaliarRecurso("funil", progresso);
  const conversao = avaliarRecurso("analytics_conversao", progresso);
  const aSeguir = proximosRecursos(progresso, 3);

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

        {/* Demo Data Bar */}
        <div className="mb-6">
        </div>

        {/* Proactive Alerts */}
        <AlertBanner
          alerts={alerts}
          onExecute={handleExecuteAlert}
          onDismiss={handleDismissAlert}
        />

        {aSeguir.length > 0 && !carregando && (
          <section className="bento-card mb-4">
            <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">
              Seu percurso
            </h2>
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Cada recurso abre quando passa a ter dado suficiente para ser confiável.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {aSeguir.map(({ recurso, estado }) => (
                <div key={recurso.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--foreground)]">{recurso.nome}</span>
                    <span className="tabular-nums text-[var(--muted)]">
                      {Math.round(estado.progresso * 100)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--card-border)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] transition-all duration-500"
                      style={{ width: `${Math.max(estado.progresso * 100, 3)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                    {estado.falta[0]}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== BENTO GRID ===== */}
        <div className="grid grid-cols-4 gap-4 auto-rows-auto">
          {/* Row 1: User Profile (2x2) + Pipeline Funnel (2 cols) */}
          <UserProfileCard />
          {funil.liberado ? (
            <PipelineFunnel state={estado} />
          ) : (
            <RecursoBloqueado titulo="Funil de conquista" estado={funil} className="col-span-2" />
          )}

          {/* Row 2: Active Contacts (2 cols) + Strategic Insights (2 cols) */}
          <ActiveContacts state={estado} />
          {diagnostico.liberado && userScore ? (
            <StrategicInsights score={userScore} />
          ) : (
            <RecursoBloqueado
              titulo="Insights estratégicos"
              estado={diagnostico}
              className="col-span-2"
            />
          )}

          {/* Row 3: Conversion Analytics (full width) */}
          {conversao.liberado ? (
            <ConversionAnalytics state={estado} />
          ) : (
            <RecursoBloqueado titulo="Análise de conversão" estado={conversao} className="col-span-4" />
          )}

          {/* Row 4: KPI Cards (4 cols) */}
          <KPICards
            {...(activeContact ? (() => {
              const kpis = calculateKPIs(activeContact, allInteractions);
              return {
                pursuitRate: kpis.pursuitRate,
                avgSentiment: kpis.avgSentiment,
                daysInPipeline: kpis.daysInPipeline,
                interactionsPerWeek: kpis.interactionsPerWeek,
              };
            })() : {})}
          />

          {/* Row 4: Behavior Diagnostic (2 cols) + Mystery Gauge + Scarcity Index */}
          {diagnostico.liberado && userScore ? (
            <BehaviorDiagnostic score={userScore} />
          ) : (
            <RecursoBloqueado
              titulo="Diagnóstico comportamental"
              estado={diagnostico}
              className="col-span-2"
            />
          )}
          <MysteryGauge value={activeContact?.mysteryCoefficient} />
          <ScarcityIndex value={activeContact?.scarcityScore} />

          {/* Row 5: Tension Thermometer (2 cols) + Vulnerability Radar */}
          <TensionThermometer value={activeContact?.tensionLevel} />
          <VulnerabilityRadar vulnerabilities={activeContact?.vulnerabilities} />

          {/* Row 6: Enchantment Timeline (full width) */}
          <EnchantmentTimeline
            interactions={activeContact
              ? allInteractions
                  .filter((i) => i.contactId === activeContact.id)
                  .map((i) => ({ date: i.date, enchantmentAfter: i.enchantmentAfter, sentiment: i.sentiment }))
              : []
            }
          />
        </div>
      </main>

      {/* Floating Action Bar */}
      <ActionBar contact={activeContact} />
      <QuickLogFAB />
    </div>
  );
}
