"use client";

import { useState, useEffect } from "react";
import { loadState } from "@/lib/store";
import type { Contact, Interaction } from "@/lib/types";

interface SalesComparisonRow {
  salesConcept: string;
  relationshipConcept: string;
  stageName: string;
  formula: string;
  tacticalObjective: string;
  metricValue: string;
}

export default function SalesToRelationshipMatrix() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    const state = loadState();
    if (state) {
      setContacts(state.contacts || []);
      setInteractions(state.interactions || []);
    }
  }, []);

  // Compute exact metrics from stored state
  const totalCount = contacts.length;
  const wonCount = contacts.filter((c) => c.status === "won").length;
  const lostCount = contacts.filter((c) => c.status === "lost").length;

  const winRate = totalCount > 0 ? ((wonCount / totalCount) * 100).toFixed(1) : "0.0";
  const lostRate = totalCount > 0 ? ((lostCount / totalCount) * 100).toFixed(1) : "0.0";

  const touchpointsCount = interactions.length;
  const avgTouchpoints = totalCount > 0 ? (touchpointsCount / totalCount).toFixed(1) : "0.0";

  const rows: SalesComparisonRow[] = [
    {
      salesConcept: "Lead Prospecting (Inbound / Outbound)",
      relationshipConcept: "Prospecção de Alvos",
      stageName: "Prospecção",
      formula: "Novos contatos inseridos no funil via Instagram, Tinder ou Presencial",
      tacticalObjective: "Atrair atenção sem demonstrar desespero; estabelecer presença social.",
      metricValue: `${contacts.filter((c) => c.pipelineStage === "prospeccao").length} alvos ativos`,
    },
    {
      salesConcept: "Lead Qualification (MQL -> SQL)",
      relationshipConcept: "Qualificação & Diagnóstico",
      stageName: "Qualificado",
      formula: "Validação de reciprocidade (Sentimento > 0.3 & Receptividade > 50%)",
      tacticalObjective: "Mapear o Radar de Vulnerabilidades (Ego, Fantasia, Aventura, etc.).",
      metricValue: `${contacts.filter((c) => c.pipelineStage === "qualificado").length} alvos qualificados`,
    },
    {
      salesConcept: "Nurturing / Value Demonstration",
      relationshipConcept: "Engajamento & Conexão",
      stageName: "Engajamento",
      formula: "Frequência de interações com Coeficiente de Mistério mantido > 60%",
      tacticalObjective: "Construir tensão emocional e antecipação através de Push-Pull e sinais mistos.",
      metricValue: `${contacts.filter((c) => c.pipelineStage === "engajamento").length} em engajamento`,
    },
    {
      salesConcept: "Sales Meeting / Demo Call",
      relationshipConcept: "Agendamento de Date",
      stageName: "Agendamento",
      formula: "Aceite de convite presencial para encontro de baixa pressão (Café/Drink)",
      tacticalObjective: "Testar a química presencial e preparar o terreno para o fechamento.",
      metricValue: `${contacts.filter((c) => c.pipelineStage === "encontro").length} dates agendados`,
    },
    {
      salesConcept: "Deal Closing / Contract Signed",
      relationshipConcept: "Fechamento & Conversão",
      stageName: "Fechamento",
      formula: "Ocorrência do 1º beijo (kiss: true) ou intimidade física",
      tacticalObjective: "Executar o movimento ousado na hora do clímax de tensão.",
      metricValue: `${wonCount} conquistas efetuadas`,
    },
    {
      salesConcept: "Closed Lost / Churn Analysis",
      relationshipConcept: "Perdido (Ghosting / Friendzone)",
      stageName: "Status: Lost / Frozen",
      formula: "Abandono de conversa ou desinteresse registrado com causa-raiz",
      tacticalObjective: "Registrar a causa-raiz (Post-Mortem) para recalibrar o modelo do sedutor.",
      metricValue: `${lostCount} perdidas (${lostRate}%)`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bento-card bg-gradient-to-r from-[#161616] via-[#20102b] to-[#161616] border-[#8b5cf6]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8b5cf6] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
            Matriz de Comparação Estratégica: Vendas B2B vs. CRM do Amor
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Engenharia de Conversão Aplicada a Relacionamentos
          </h2>
          <p className="text-sm text-[#a3a3a3] mt-1">
            Substituindo métricas vagas por fórmulas matemáticas exatas de atração, velocidade de fase e taxa de conversão.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0d0d0d] border border-[#262626] rounded-xl text-center">
            <div className="text-[10px] text-[#737373] uppercase font-mono">Taxa de Win (Fechamento)</div>
            <div className="text-lg font-bold text-[#059669]">{winRate}%</div>
          </div>
          <div className="p-3 bg-[#0d0d0d] border border-[#262626] rounded-xl text-center">
            <div className="text-[10px] text-[#737373] uppercase font-mono">Média de Touchpoints</div>
            <div className="text-lg font-bold text-[#8b5cf6]">{avgTouchpoints} / alvo</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card border-[#262626] p-4">
          <div className="text-xs text-[#737373] uppercase font-mono">Total de Alvos em Funil</div>
          <div className="text-2xl font-bold text-white mt-1">{totalCount}</div>
          <div className="text-[11px] text-[#059669] mt-1 font-mono">
            {contacts.filter((c) => c.status === "active").length} ativos no momento
          </div>
        </div>

        <div className="bento-card border-[#262626] p-4">
          <div className="text-xs text-[#737373] uppercase font-mono">Conquistas (Closed Won)</div>
          <div className="text-2xl font-bold text-[#059669] mt-1">{wonCount}</div>
          <div className="text-[11px] text-[#737373] mt-1 font-mono">
            {winRate}% de taxa de sucesso
          </div>
        </div>

        <div className="bento-card border-[#262626] p-4">
          <div className="text-xs text-[#737373] uppercase font-mono">Total Interações Gravadas</div>
          <div className="text-2xl font-bold text-[#06b6d4] mt-1">{touchpointsCount}</div>
          <div className="text-[11px] text-[#737373] mt-1 font-mono">
            Registro de touchpoints digitais & presenciais
          </div>
        </div>

        <div className="bento-card border-[#262626] p-4">
          <div className="text-xs text-[#737373] uppercase font-mono">Taxa de Churn / Perda</div>
          <div className="text-2xl font-bold text-[#e11d48] mt-1">{lostRate}%</div>
          <div className="text-[11px] text-[#737373] mt-1 font-mono">
            Ghosted / Friendzone auditadas
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bento-card p-0 overflow-hidden border-[#262626]">
        <div className="p-4 bg-[#161616] border-b border-[#262626] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>🔄 Mapeamento Direto por Etapas do Processo</span>
          </h3>
          <span className="text-xs font-mono text-[#8b5cf6] bg-[#8b5cf6]/10 px-2.5 py-1 rounded-full border border-[#8b5cf6]/20">
            6 Etapas Alinhadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#e5e5e5]">
            <thead className="bg-[#0d0d0d] text-[#737373] uppercase font-mono text-[10px] border-b border-[#262626]">
              <tr>
                <th className="py-3 px-4">Conceito de Vendas B2B</th>
                <th className="py-3 px-4">Conceito CRM do Amor</th>
                <th className="py-3 px-4">Fórmula & Origem Matemática</th>
                <th className="py-3 px-4">Objetivo Tático</th>
                <th className="py-3 px-4">Métrica Real no Sistema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]/60">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#ffffff03] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                    {row.salesConcept}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#8b5cf6]">
                    {row.relationshipConcept}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#a3a3a3] bg-[#0d0d0d]/40">
                    {row.formula}
                  </td>
                  <td className="py-3.5 px-4 text-[#a3a3a3]">
                    {row.tacticalObjective}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#059669]">
                    {row.metricValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
