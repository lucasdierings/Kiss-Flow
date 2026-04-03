import {
  Contact,
  Interaction,
  INTERACTION_CATEGORIES,
  InteractionCategory,
  PIPELINE_STAGES,
} from "./types";

// ===== Motor de Regras de Negocio =====
// Baseado nos PDFs: dopamina, timing, Greene tactics

/**
 * Aplica o impacto de uma interacao nas metricas do contato.
 * Regras:
 * - Mystery diminui com exposicao e aumenta com silencio/distancia
 * - Tension e o conflito doce (ansiedade vs desejo) - deve oscilar, nao estabilizar
 * - Enchantment acumula com interacoes positivas, cai com excesso ou monotonia
 * - Scarcity sobe quando o usuario e escasso, cai quando disponivel demais
 */
export function applyInteractionImpact(
  contact: Contact,
  interaction: Interaction
): Contact {
  const category = interaction.category as InteractionCategory;
  const cat = INTERACTION_CATEGORIES[category];
  const typeInfo = cat.types.find((t) => t.id === interaction.typeId);

  if (!typeInfo) return contact;

  const impact = typeInfo.impact;
  const sentiment = interaction.sentiment; // -1 a 1

  // Modificadores baseados em quem iniciou
  const initiatorMultiplier = interaction.initiatedByTarget ? 0.5 : 1.0;
  // Se o alvo iniciou, nosso misterio nao cai tanto

  // 1. MYSTERY: clamped 0-100
  let newMystery = contact.mysteryCoefficient + impact.mystery * initiatorMultiplier;

  // Bonus: se alvo iniciou, nosso misterio sobe levemente
  if (interaction.initiatedByTarget) {
    newMystery += 3;
  }

  // 2. TENSION: deve oscilar - interacoes positivas aumentam desejo, negativas aumentam ansiedade
  let tensionDelta = impact.tension * (1 + Math.abs(sentiment) * 0.5);

  // Silencio reduz tensao temporariamente (cria vazio)
  if (interaction.typeId === "silence") {
    tensionDelta = impact.tension; // negativo, reduz
  }

  let newTension = contact.tensionLevel + tensionDelta * 0.3;

  // 3. ENCHANTMENT: sentimento positivo aumenta, negativo diminui
  let enchantmentDelta = impact.enchantment * (sentiment > 0 ? sentiment : sentiment * 0.5);
  let newEnchantment = contact.enchantmentScore + enchantmentDelta;

  // 4. SCARCITY: baseado na frequencia de interacao do usuario
  let scarcityDelta = interaction.initiatedByTarget ? 5 : -3;
  if (interaction.typeId === "silence") scarcityDelta = 10;
  let newScarcity = contact.scarcityScore + scarcityDelta;

  // 5. VICTIM SCORE: sobe com interacoes de alta qualidade e sentimento positivo
  let victimDelta = typeInfo.weight * 0.2 * Math.max(0, sentiment);
  if (interaction.initiatedByTarget) victimDelta += 2; // alvo investindo = bom sinal
  let newVictimScore = contact.victimScore + victimDelta;

  // Clamp all values
  newMystery = clamp(newMystery, 0, 100);
  newTension = clamp(newTension, 0, 100);
  newEnchantment = clamp(newEnchantment, -1, 1);
  newScarcity = clamp(newScarcity, 0, 100);
  newVictimScore = clamp(newVictimScore, 0, 100);

  // Detectar avanço de pipeline
  const newStage = evaluatePipelineProgression(
    contact.pipelineStage,
    newVictimScore,
    newEnchantment,
    newTension
  );

  return {
    ...contact,
    mysteryCoefficient: Math.round(newMystery * 10) / 10,
    tensionLevel: Math.round(newTension * 10) / 10,
    enchantmentScore: Math.round(newEnchantment * 100) / 100,
    scarcityScore: Math.round(newScarcity * 10) / 10,
    victimScore: Math.round(newVictimScore * 10) / 10,
    pipelineStage: newStage,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Avalia se o contato deve avancar no pipeline baseado nas metricas.
 */
function evaluatePipelineProgression(
  currentStage: string,
  victimScore: number,
  enchantment: number,
  tension: number
): Contact["pipelineStage"] {
  const stageIndex = PIPELINE_STAGES.findIndex((s) => s.id === currentStage);

  // Criterios para avancar
  if (currentStage === "lead_generation" && victimScore > 20 && enchantment > 0.1) {
    return "qualification";
  }
  if (currentStage === "qualification" && victimScore > 40 && enchantment > 0.3) {
    return "nurturing";
  }
  if (currentStage === "nurturing" && victimScore > 65 && enchantment > 0.6 && tension > 40) {
    return "closing";
  }
  if (currentStage === "closing" && victimScore > 85 && enchantment > 0.8) {
    return "retention";
  }

  return currentStage as Contact["pipelineStage"];
}

/**
 * Gera alertas e sugestoes baseados no estado atual do contato.
 */
export interface Alert {
  type: "danger" | "warning" | "success" | "info";
  title: string;
  message: string;
  action?: string;
}

export function generateAlerts(contact: Contact, interactions: Interaction[]): Alert[] {
  const alerts: Alert[] = [];
  const recentInteractions = interactions
    .filter((i) => i.contactId === contact.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const last24h = recentInteractions.filter(
    (i) => Date.now() - new Date(i.date).getTime() < 24 * 60 * 60 * 1000
  );

  const lastByUser = last24h.filter((i) => !i.initiatedByTarget);

  // 1. Excesso de interacao (Jejum de Dopamina necessario)
  if (lastByUser.length >= 4) {
    alerts.push({
      type: "danger",
      title: "Frequencia Excessiva Detectada",
      message: `${lastByUser.length} interacoes suas nas ultimas 24h. Risco de desvalorizacao. Bloqueio sugerido.`,
      action: "Iniciar Recuo Estrategico",
    });
  }

  // 2. Mystery muito baixo
  if (contact.mysteryCoefficient < 25) {
    alerts.push({
      type: "warning",
      title: "Misterio em Nivel Critico",
      message: "Voce revelou demais. Sugere-se 48h de silencio para restaurar o enigma.",
      action: "Ativar Silencio",
    });
  }

  // 3. Tensao estabilizada (risco de friendzone)
  if (contact.tensionLevel > 35 && contact.tensionLevel < 55) {
    const tensionFlat = recentInteractions.length >= 5 &&
      recentInteractions.slice(0, 5).every(
        (i) => Math.abs((i.tensionAfter || 50) - contact.tensionLevel) < 5
      );
    if (tensionFlat) {
      alerts.push({
        type: "warning",
        title: "Perigo de Friendzone",
        message: "Tensao estabilizada por 5+ interacoes. Inicie conflito ou retraimento.",
        action: "Criar Triangulo",
      });
    }
  }

  // 4. Reciprocidade linguistica (momento para movimento ousado)
  if (contact.victimScore > 70 && contact.enchantmentScore > 0.7) {
    alerts.push({
      type: "success",
      title: "Reciprocidade Alta Detectada",
      message: `Victim Score ${contact.victimScore}%, Encantamento ${Math.round(contact.enchantmentScore * 100)}%. Considere o Movimento Ousado.`,
      action: "Executar Movimento Ousado",
    });
  }

  // 5. Alvo iniciando mais que o usuario (bom sinal)
  const targetInitiated = recentInteractions.filter((i) => i.initiatedByTarget).length;
  const totalRecent = recentInteractions.length;
  if (totalRecent >= 3 && targetInitiated / totalRecent > 0.7) {
    alerts.push({
      type: "success",
      title: "Inversao de Perseguicao Ativa",
      message: `O alvo esta iniciando ${Math.round((targetInitiated / totalRecent) * 100)}% das interacoes. Mantenha a escassez.`,
    });
  }

  // 6. Muito tempo sem interacao
  const lastInteraction = recentInteractions[0];
  if (lastInteraction) {
    const daysSince = (Date.now() - new Date(lastInteraction.date).getTime()) / (24 * 60 * 60 * 1000);
    if (daysSince > 5 && contact.pipelineStage !== "retention") {
      alerts.push({
        type: "info",
        title: "Silencio Prolongado",
        message: `${Math.round(daysSince)} dias sem interacao. Considere uma acao sutil para reativar.`,
        action: "Enviar Insinuacao",
      });
    }
  }

  return alerts;
}

/**
 * Calcula KPIs agregados para um contato.
 */
export function calculateKPIs(contact: Contact, interactions: Interaction[]) {
  const contactInteractions = interactions
    .filter((i) => i.contactId === contact.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const total = contactInteractions.length;
  const targetInitiated = contactInteractions.filter((i) => i.initiatedByTarget).length;

  // Taxa de perseguicao (% que o alvo inicia)
  const pursuitRate = total > 0 ? Math.round((targetInitiated / total) * 100) : 0;

  // Sentimento medio
  const avgSentiment = total > 0
    ? contactInteractions.reduce((sum, i) => sum + i.sentiment, 0) / total
    : 0;

  // Dias no pipeline
  const daysInPipeline = Math.round(
    (Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Interacoes por semana
  const weeks = Math.max(1, daysInPipeline / 7);
  const interactionsPerWeek = Math.round((total / weeks) * 10) / 10;

  return {
    pursuitRate,
    avgSentiment: Math.round(avgSentiment * 100) / 100,
    daysInPipeline,
    totalInteractions: total,
    interactionsPerWeek,
  };
}

// ===== Helpers =====

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
