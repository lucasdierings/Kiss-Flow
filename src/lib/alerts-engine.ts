import { Contact, Interaction } from "./types";
import { createSupabaseBrowser } from "./supabase";

// ===== Greene's 24 Seduction Tactics =====

export const GREENE_TACTICS: Record<
  number,
  { number: number; name: string; description: string }
> = {
  1: { number: 1, name: "Escolher a Vitima Certa", description: "Identificar alvos receptivos que preencham lacunas em suas vidas" },
  2: { number: 2, name: "Criar Falsa Sensacao de Seguranca", description: "Aproximar-se indiretamente, como amigo, para baixar as defesas" },
  3: { number: 3, name: "Enviar Sinais Ambiguos", description: "Misturar calor e frieza para gerar curiosidade e interpretacoes" },
  4: { number: 4, name: "Criar Triangulacao", description: "Usar uma terceira presenca para gerar ciumes e validacao social" },
  5: { number: 5, name: "Criar Necessidade", description: "Despertar ansiedade e insatisfacao para que busquem voce como alivio" },
  6: { number: 6, name: "Dominar a Arte da Insinuacao", description: "Plantar ideias sutis que crescem na mente do alvo sem resistencia" },
  7: { number: 7, name: "Entrar no Espirito do Outro", description: "Espelhar desejos, valores e fantasias nao-ditas do alvo" },
  8: { number: 8, name: "Criar Tentacao", description: "Acenar com algo proibido ou inalcancavel que eles desejam secretamente" },
  9: { number: 9, name: "Manter Suspense", description: "Variar ritmo e comportamento para manter o alvo em constante espera" },
  10: { number: 10, name: "Usar o Poder das Palavras", description: "Elogios personalizados, promessas vagas e linguagem hipnotica" },
  11: { number: 11, name: "Prestar Atencao aos Detalhes", description: "Pequenos gestos personalizados demonstram devocao sem pedir nada" },
  12: { number: 12, name: "Poetizar sua Presenca", description: "Tornar encontros memoraveis com cenarios, musica e simbolismo" },
  13: { number: 13, name: "Desarmar com Fragilidade Estrategica", description: "Mostrar vulnerabilidade calculada para criar empatia e conexao" },
  14: { number: 14, name: "Confundir Desejo com Realidade", description: "Criar uma bolha onde fantasia e realidade se misturam" },
  15: { number: 15, name: "Isolar a Vitima", description: "Afastar do circulo habitual para intensificar a dependencia" },
  16: { number: 16, name: "Provar seu Valor", description: "Demonstrar sacrificio ou coragem para elevar seu valor percebido" },
  17: { number: 17, name: "Efetuar uma Regressao", description: "Fazer o alvo reviver sentimentos da infancia e dependencia" },
  18: { number: 18, name: "Agitar Sentimentos Espirituais", description: "Tocar temas de destino, proposito e transcendencia" },
  19: { number: 19, name: "Misturar Prazer com Dor", description: "Alternar entre dar e retirar para criar vinculo emocional intenso" },
  20: { number: 20, name: "Dar Espaco para Cair", description: "Criar situacao onde o alvo se sente livre para ceder aos proprios desejos" },
  21: { number: 21, name: "Recuo Estrategico", description: "Retirar-se no momento certo para que o alvo sinta o vazio e persiga" },
  22: { number: 22, name: "Usar Mediadores Fisicos", description: "Presentes simbolicos, cartas e objetos que mantenham sua presenca" },
  23: { number: 23, name: "Movimento Ousado", description: "Agir decisivamente no momento de maximo desejo e menor resistencia" },
  24: { number: 24, name: "Cuidar dos Pos-Efeitos", description: "Manter o encanto apos a conquista para evitar ressentimento" },
};

// ===== Alert Types =====

export type AlertType =
  | "friendzone_risk"
  | "climax_ready"
  | "silence_needed"
  | "excessive_frequency"
  | "mystery_critical"
  | "target_pursuing"
  | "extended_silence"
  | "high_enchantment"
  | "archetype_shift";

export type AlertPriority = "low" | "medium" | "high" | "critical";

export interface ProactiveAlert {
  contact_id: string;
  alert_type: AlertType;
  title: string;
  description: string;
  priority: AlertPriority;
  action_suggested: string;
  tactic_number?: number;
  tactic_name?: string;
  metrics_context?: Record<string, number>;
}

export interface PersistedAlert extends ProactiveAlert {
  id: string;
  user_id: string;
  dismissed: boolean;
  executed: boolean;
  created_at: string;
}

// ===== Alert Generation =====

export function generateProactiveAlerts(
  contact: Contact,
  interactions: Interaction[]
): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];
  const contactInteractions = interactions
    .filter((i) => i.contactId === contact.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const now = Date.now();
  const last24h = contactInteractions.filter(
    (i) => now - new Date(i.date).getTime() < 24 * 60 * 60 * 1000
  );
  const userInitiated24h = last24h.filter((i) => !i.initiatedByTarget);

  // 1. Excessive Frequency
  if (userInitiated24h.length >= 4) {
    const tactic = GREENE_TACTICS[21];
    alerts.push({
      contact_id: contact.id,
      alert_type: "excessive_frequency",
      title: "Frequencia Excessiva Detectada",
      description: `${userInitiated24h.length} interacoes suas nas ultimas 24h com ${contact.firstName}. O excesso desvaloriza sua presenca e anula o efeito dopaminergico. Jejum imediato necessario.`,
      priority: "critical",
      action_suggested: tactic.name,
      tactic_number: tactic.number,
      tactic_name: tactic.name,
      metrics_context: {
        interactions_24h: userInitiated24h.length,
        mystery: contact.mysteryCoefficient,
        scarcity: contact.scarcityScore,
      },
    });
  }

  // 2. Silence Needed (3+ interactions without being excessive)
  if (userInitiated24h.length >= 3 && userInitiated24h.length < 4) {
    const tactic = GREENE_TACTICS[21];
    alerts.push({
      contact_id: contact.id,
      alert_type: "silence_needed",
      title: "Recuo Sugerido",
      description: `${userInitiated24h.length} interacoes em 24h. Proximidade em excesso gera saciedade. Um recuo agora manteria a tensao e restauraria escassez.`,
      priority: "high",
      action_suggested: tactic.name,
      tactic_number: tactic.number,
      tactic_name: tactic.name,
      metrics_context: {
        interactions_24h: userInitiated24h.length,
        scarcity: contact.scarcityScore,
      },
    });
  }

  // 3. Mystery Critical
  if (contact.mysteryCoefficient < 25) {
    const tactic = GREENE_TACTICS[9];
    alerts.push({
      contact_id: contact.id,
      alert_type: "mystery_critical",
      title: "Misterio em Nivel Critico",
      description: `Coeficiente de misterio em ${contact.mysteryCoefficient}%. Voce revelou demais. 48h de silencio absoluto para restaurar o enigma e recriar curiosidade.`,
      priority: "high",
      action_suggested: "48h de silencio absoluto",
      tactic_number: tactic.number,
      tactic_name: tactic.name,
      metrics_context: {
        mystery: contact.mysteryCoefficient,
        enchantment: Math.round(contact.enchantmentScore * 100),
      },
    });
  }

  // 4. Friendzone Risk
  if (contact.tensionLevel > 35 && contact.tensionLevel < 55) {
    const recentFive = contactInteractions.slice(0, 5);
    const tensionFlat =
      recentFive.length >= 5 &&
      recentFive.every(
        (i) => Math.abs((i.tensionAfter || 50) - contact.tensionLevel) < 5
      );

    if (tensionFlat) {
      const tactic = GREENE_TACTICS[4];
      alerts.push({
        contact_id: contact.id,
        alert_type: "friendzone_risk",
        title: "Perigo de Friendzone",
        description: `Tensao estabilizada em ${contact.tensionLevel}% por 5+ interacoes com ${contact.firstName}. Zona de conforto emocional = morte da seducao. Quebre o padrao com triangulacao ou conflito doce.`,
        priority: "high",
        action_suggested: tactic.name,
        tactic_number: tactic.number,
        tactic_name: tactic.name,
        metrics_context: {
          tension: contact.tensionLevel,
          enchantment: Math.round(contact.enchantmentScore * 100),
          mystery: contact.mysteryCoefficient,
        },
      });
    }
  }

  // 5. Climax Ready
  if (contact.victimScore > 70 && contact.enchantmentScore > 0.7) {
    const tactic = GREENE_TACTICS[23];
    alerts.push({
      contact_id: contact.id,
      alert_type: "climax_ready",
      title: "Momento para Movimento Ousado",
      description: `Victim Score ${contact.victimScore}%, Encantamento ${Math.round(contact.enchantmentScore * 100)}%. ${contact.firstName} esta no pico de receptividade. Hesitar agora pode significar perder a janela.`,
      priority: "critical",
      action_suggested: tactic.name,
      tactic_number: tactic.number,
      tactic_name: tactic.name,
      metrics_context: {
        victimScore: contact.victimScore,
        enchantment: Math.round(contact.enchantmentScore * 100),
        tension: contact.tensionLevel,
      },
    });
  }

  // 6. Target Pursuing
  const totalRecent = contactInteractions.slice(0, 10);
  const targetInitiated = totalRecent.filter((i) => i.initiatedByTarget).length;
  if (totalRecent.length >= 3 && targetInitiated / totalRecent.length > 0.7) {
    const tactic = GREENE_TACTICS[9];
    const pursuitRate = Math.round((targetInitiated / totalRecent.length) * 100);
    alerts.push({
      contact_id: contact.id,
      alert_type: "target_pursuing",
      title: "Inversao de Perseguicao Ativa",
      description: `${contact.firstName} esta iniciando ${pursuitRate}% das interacoes recentes. A presa se tornou cacadora. Mantenha escassez para intensificar.`,
      priority: "medium",
      action_suggested: "Manter escassez e suspense",
      tactic_number: tactic.number,
      tactic_name: tactic.name,
      metrics_context: {
        pursuitRate,
        targetInitiated,
        totalInteractions: totalRecent.length,
      },
    });
  }

  // 7. Extended Silence
  const lastInteraction = contactInteractions[0];
  if (lastInteraction && contact.pipelineStage !== "retention") {
    const daysSince =
      (now - new Date(lastInteraction.date).getTime()) / (24 * 60 * 60 * 1000);
    if (daysSince > 5) {
      const tactic = GREENE_TACTICS[6];
      alerts.push({
        contact_id: contact.id,
        alert_type: "extended_silence",
        title: "Silencio Prolongado",
        description: `${Math.round(daysSince)} dias sem interacao com ${contact.firstName}. Silencio prolongado pode passar de estrategico a esquecimento. Uma insinuacao sutil reativaria sem comprometer misterio.`,
        priority: daysSince > 10 ? "high" : "medium",
        action_suggested: "Insinuacao sutil de reativacao",
        tactic_number: tactic.number,
        tactic_name: tactic.name,
        metrics_context: {
          daysSilent: Math.round(daysSince),
          mystery: contact.mysteryCoefficient,
        },
      });
    }
  }

  // 8. High Enchantment
  if (
    contact.enchantmentScore > 0.8 &&
    contact.pipelineStage !== "closing" &&
    contact.pipelineStage !== "retention"
  ) {
    const tactic = GREENE_TACTICS[23];
    alerts.push({
      contact_id: contact.id,
      alert_type: "high_enchantment",
      title: "Encantamento Elevado",
      description: `Encantamento em ${Math.round(contact.enchantmentScore * 100)}% mas pipeline ainda em ${contact.pipelineStage}. Metricas indicam que ${contact.firstName} esta pronta para escalacao. Considere avancar o pipeline.`,
      priority: "medium",
      action_suggested: "Escalar pipeline",
      tactic_number: tactic.number,
      tactic_name: tactic.name,
      metrics_context: {
        enchantment: Math.round(contact.enchantmentScore * 100),
        victimScore: contact.victimScore,
        tension: contact.tensionLevel,
      },
    });
  }

  return alerts;
}

// ===== Supabase Persistence =====

export async function persistAlerts(
  userId: string,
  alerts: ProactiveAlert[]
): Promise<PersistedAlert[]> {
  if (alerts.length === 0) return [];

  const supabase = createSupabaseBrowser();

  const rows = alerts.map((alert) => ({
    user_id: userId,
    contact_id: alert.contact_id,
    alert_type: alert.alert_type,
    title: alert.title,
    description: alert.description,
    priority: alert.priority,
    action_suggested: alert.action_suggested,
    tactic_number: alert.tactic_number ?? null,
    tactic_name: alert.tactic_name ?? null,
    metrics_context: alert.metrics_context ?? null,
    dismissed: false,
    executed: false,
  }));

  const { data, error } = await supabase
    .from("system_alerts")
    .upsert(rows, {
      onConflict: "user_id,contact_id,alert_type",
      ignoreDuplicates: false,
    })
    .select();

  if (error) throw new Error(`Failed to persist alerts: ${error.message}`);

  return (data ?? []) as PersistedAlert[];
}

export async function dismissAlert(alertId: string): Promise<void> {
  const supabase = createSupabaseBrowser();

  const { error } = await supabase
    .from("system_alerts")
    .update({ dismissed: true })
    .eq("id", alertId);

  if (error) throw new Error(`Failed to dismiss alert: ${error.message}`);
}

export async function executeAlert(alertId: string): Promise<void> {
  const supabase = createSupabaseBrowser();

  const { error } = await supabase
    .from("system_alerts")
    .update({ executed: true, dismissed: true })
    .eq("id", alertId);

  if (error) throw new Error(`Failed to execute alert: ${error.message}`);
}

export async function getActiveAlerts(
  userId: string,
  contactId?: string
): Promise<PersistedAlert[]> {
  const supabase = createSupabaseBrowser();

  let query = supabase
    .from("system_alerts")
    .select("*")
    .eq("user_id", userId)
    .eq("dismissed", false)
    .order("created_at", { ascending: false });

  if (contactId) {
    query = query.eq("contact_id", contactId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch alerts: ${error.message}`);

  return (data ?? []) as PersistedAlert[];
}
