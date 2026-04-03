import {
  AppState,
  Contact,
  PhaseTransition,
  PipelineStage,
  PIPELINE_STAGES,
  LostReason,
  LOST_REASON_LABELS,
} from "./types";

// ===== Motor de Analytics de Conversão =====

export interface ConversionRate {
  fromPhase: string;
  toPhase: string;
  fromLabel: string;
  toLabel: string;
  rate: number; // 0-100
  total: number;
  converted: number;
}

export interface ConversionSpeed {
  phase: string;
  label: string;
  avgDays: number;
  count: number;
}

export interface Bottleneck {
  phase: string;
  label: string;
  lossRate: number; // 0-100
  avgDwellDays: number;
  lostCount: number;
  totalReached: number;
}

export interface LossAnalysis {
  total: number;
  byReason: Record<LostReason, number>;
}

export interface AnalyticsSummary {
  conversionRates: ConversionRate[];
  conversionSpeeds: ConversionSpeed[];
  bottlenecks: Bottleneck[];
  lossAnalysis: LossAnalysis;
  phaseDistribution: Record<string, number>;
  overallConversionRate: number;
  avgTimeToClose: number | null;
}

const PHASE_LABELS: Record<string, string> = {
  lead_generation: "Prospecção",
  qualification: "Qualificação",
  nurturing: "Nutrição",
  closing: "Fechamento",
  retention: "Retenção",
};

const PHASE_ORDER: PipelineStage[] = [
  "lead_generation",
  "qualification",
  "nurturing",
  "closing",
  "retention",
];

/**
 * Calcula taxas de conversão entre cada par de fases consecutivas
 */
export function getConversionRates(
  phaseHistory: PhaseTransition[]
): ConversionRate[] {
  const rates: ConversionRate[] = [];

  for (let i = 0; i < PHASE_ORDER.length - 1; i++) {
    const from = PHASE_ORDER[i];
    const to = PHASE_ORDER[i + 1];

    // Contatos que chegaram na fase "from"
    const reachedFrom = new Set(
      phaseHistory
        .filter((t) => t.newPhase === from || t.oldPhase === "none")
        .map((t) => t.contactId)
    );

    // Contatos que avançaram para "to"
    const advancedTo = new Set(
      phaseHistory
        .filter((t) => t.oldPhase === from && t.newPhase === to)
        .map((t) => t.contactId)
    );

    const total = reachedFrom.size || 1;
    const converted = advancedTo.size;

    rates.push({
      fromPhase: from,
      toPhase: to,
      fromLabel: PHASE_LABELS[from] || from,
      toLabel: PHASE_LABELS[to] || to,
      rate: Math.round((converted / total) * 100),
      total,
      converted,
    });
  }

  return rates;
}

/**
 * Calcula velocidade média de conversão (dias em cada fase antes de avançar)
 */
export function getConversionSpeeds(
  phaseHistory: PhaseTransition[]
): ConversionSpeed[] {
  const speeds: ConversionSpeed[] = [];

  for (const phase of PHASE_ORDER) {
    // Para cada contato, pegar o tempo entre entrar e sair da fase
    const entries = phaseHistory.filter((t) => t.newPhase === phase);
    const exits = phaseHistory.filter(
      (t) => t.oldPhase === phase && t.newPhase !== phase
    );

    const durations: number[] = [];

    for (const entry of entries) {
      const exit = exits.find(
        (e) =>
          e.contactId === entry.contactId &&
          new Date(e.timestamp).getTime() >
            new Date(entry.timestamp).getTime()
      );
      if (exit) {
        const days =
          (new Date(exit.timestamp).getTime() -
            new Date(entry.timestamp).getTime()) /
          (1000 * 60 * 60 * 24);
        durations.push(days);
      }
    }

    const avgDays =
      durations.length > 0
        ? Math.round(
            (durations.reduce((a, b) => a + b, 0) / durations.length) * 10
          ) / 10
        : 0;

    speeds.push({
      phase,
      label: PHASE_LABELS[phase] || phase,
      avgDays,
      count: durations.length,
    });
  }

  return speeds;
}

/**
 * Detecta gargalos: fases com maior taxa de perda ou maior tempo de permanência
 */
export function getBottlenecks(
  phaseHistory: PhaseTransition[],
  contacts: Contact[]
): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];

  for (const phase of PHASE_ORDER) {
    // Contatos que alcançaram esta fase
    const reachedPhase = new Set(
      phaseHistory
        .filter((t) => t.newPhase === phase)
        .map((t) => t.contactId)
    );

    // Contatos perdidos a partir desta fase
    const lostFromPhase = phaseHistory.filter(
      (t) => t.oldPhase === phase && t.newPhase === "lost"
    );

    // Contatos atualmente parados nesta fase
    const stuckInPhase = contacts.filter(
      (c) => c.status === "active" && c.pipelineStage === phase
    );

    // Tempo médio de permanência dos que ainda estão na fase
    const dwellDays = stuckInPhase.map((c) => {
      const lastTransition = phaseHistory
        .filter((t) => t.contactId === c.id && t.newPhase === phase)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        )[0];

      const entryDate = lastTransition
        ? new Date(lastTransition.timestamp)
        : new Date(c.createdAt);

      return (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    });

    const avgDwell =
      dwellDays.length > 0
        ? Math.round(
            (dwellDays.reduce((a, b) => a + b, 0) / dwellDays.length) * 10
          ) / 10
        : 0;

    const totalReached = Math.max(1, reachedPhase.size);
    const lossRate = Math.round(
      (lostFromPhase.length / totalReached) * 100
    );

    bottlenecks.push({
      phase,
      label: PHASE_LABELS[phase] || phase,
      lossRate,
      avgDwellDays: avgDwell,
      lostCount: lostFromPhase.length,
      totalReached: reachedPhase.size,
    });
  }

  // Ordenar por taxa de perda (maior primeiro)
  return bottlenecks.sort((a, b) => b.lossRate - a.lossRate);
}

/**
 * Análise de perdas por motivo
 */
export function getLossAnalysis(contacts: Contact[]): LossAnalysis {
  const lost = contacts.filter((c) => c.status === "lost");
  const byReason: Record<LostReason, number> = {
    desistencia: 0,
    rejeicao: 0,
    sucesso_efemero: 0,
  };

  for (const c of lost) {
    if (c.lostReason) {
      byReason[c.lostReason]++;
    }
  }

  return { total: lost.length, byReason };
}

/**
 * Distribuição atual de contatos por fase
 */
export function getPhaseDistribution(
  contacts: Contact[]
): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const phase of PHASE_ORDER) {
    dist[phase] = contacts.filter(
      (c) => c.status === "active" && c.pipelineStage === phase
    ).length;
  }
  dist["lost"] = contacts.filter((c) => c.status === "lost").length;
  return dist;
}

/**
 * Calcula resumo completo de analytics
 */
export function calculateAnalytics(state: AppState): AnalyticsSummary {
  const conversionRates = getConversionRates(state.phaseHistory);
  const conversionSpeeds = getConversionSpeeds(state.phaseHistory);
  const bottlenecks = getBottlenecks(state.phaseHistory, state.contacts);
  const lossAnalysis = getLossAnalysis(state.contacts);
  const phaseDistribution = getPhaseDistribution(state.contacts);

  // Taxa geral: % de contatos que chegaram a closing ou retention
  const totalContacts = state.contacts.length || 1;
  const closedOrRetained = state.contacts.filter(
    (c) =>
      c.pipelineStage === "closing" || c.pipelineStage === "retention"
  ).length;
  const overallConversionRate = Math.round(
    (closedOrRetained / totalContacts) * 100
  );

  // Tempo médio até closing
  const closingTransitions = state.phaseHistory.filter(
    (t) => t.newPhase === "closing"
  );
  let avgTimeToClose: number | null = null;
  if (closingTransitions.length > 0) {
    const times = closingTransitions.map((t) => {
      const contact = state.contacts.find((c) => c.id === t.contactId);
      if (!contact) return 0;
      return (
        (new Date(t.timestamp).getTime() -
          new Date(contact.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
      );
    });
    avgTimeToClose =
      Math.round(
        (times.reduce((a, b) => a + b, 0) / times.length) * 10
      ) / 10;
  }

  return {
    conversionRates,
    conversionSpeeds,
    bottlenecks,
    lossAnalysis,
    phaseDistribution,
    overallConversionRate,
    avgTimeToClose,
  };
}

/**
 * Gera texto de análise de gargalo para a IA
 */
export function generateBottleneckInsight(
  analytics: AnalyticsSummary
): string {
  const worst = analytics.bottlenecks[0];
  if (!worst || worst.lossRate === 0) {
    return "Sem gargalos detectados. Continue monitorando o funil.";
  }

  const lossAnalysis = analytics.lossAnalysis;
  const totalLost = lossAnalysis.total;

  let insight = `Gargalo principal: ${worst.label} (${worst.lossRate}% de perda).`;

  if (worst.avgDwellDays > 7) {
    insight += ` Tempo médio de permanência: ${worst.avgDwellDays} dias — indica estagnação.`;
  }

  if (totalLost > 0) {
    const topReason = (
      Object.entries(lossAnalysis.byReason) as [LostReason, number][]
    ).sort((a, b) => b[1] - a[1])[0];

    if (topReason[1] > 0) {
      insight += ` Principal motivo de perda: ${LOST_REASON_LABELS[topReason[0]]} (${topReason[1]} de ${totalLost}).`;
    }
  }

  return insight;
}
