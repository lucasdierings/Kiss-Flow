import { Contact, Interaction } from "./types";
import { createSupabaseBrowser } from "./supabase";

// ===== 24 Táticas de Sedução =====

export const GREENE_TACTICS: Record<
  number,
  { number: number; name: string; description: string }
> = {
  1: { number: 1, name: "Escolher a Vítima Certa", description: "Identificar alvos receptivos que preencham lacunas em suas vidas" },
  2: { number: 2, name: "Criar Falsa Sensação de Segurança", description: "Aproximar-se indiretamente, como amigo, para baixar as defesas" },
  3: { number: 3, name: "Enviar Sinais Ambíguos", description: "Misturar calor e frieza para gerar curiosidade e interpretações" },
  4: { number: 4, name: "Criar Triangulação", description: "Usar uma terceira presença para gerar ciúmes e validação social" },
  5: { number: 5, name: "Criar Necessidade", description: "Despertar ansiedade e insatisfação para que busquem você como alívio" },
  6: { number: 6, name: "Dominar a Arte da Insinuação", description: "Plantar ideias sutis que crescem na mente do alvo sem resistência" },
  7: { number: 7, name: "Entrar no Espírito do Outro", description: "Espelhar desejos, valores e fantasias não-ditas do alvo" },
  8: { number: 8, name: "Criar Tentação", description: "Acenar com algo proibido ou inalcançável que eles desejam secretamente" },
  9: { number: 9, name: "Manter Suspense", description: "Variar ritmo e comportamento para manter o alvo em constante espera" },
  10: { number: 10, name: "Usar o Poder das Palavras", description: "Elogios personalizados, promessas vagas e linguagem hipnótica" },
  11: { number: 11, name: "Prestar Atenção aos Detalhes", description: "Pequenos gestos personalizados demonstram devoção sem pedir nada" },
  12: { number: 12, name: "Poetizar sua Presença", description: "Tornar encontros memoráveis com cenários, música e simbolismo" },
  13: { number: 13, name: "Desarmar com Fragilidade Estratégica", description: "Mostrar vulnerabilidade calculada para criar empatia e conexão" },
  14: { number: 14, name: "Confundir Desejo com Realidade", description: "Criar uma bolha onde fantasia e realidade se misturam" },
  15: { number: 15, name: "Isolar a Vítima", description: "Afastar do círculo habitual para intensificar a dependência" },
  16: { number: 16, name: "Provar seu Valor", description: "Demonstrar sacrifício ou coragem para elevar seu valor percebido" },
  17: { number: 17, name: "Efetuar uma Regressão", description: "Fazer o alvo reviver sentimentos da infância e dependência" },
  18: { number: 18, name: "Agitar Sentimentos Espirituais", description: "Tocar temas de destino, propósito e transcendência" },
  19: { number: 19, name: "Misturar Prazer com Dor", description: "Alternar entre dar e retirar para criar vínculo emocional intenso" },
  20: { number: 20, name: "Dar Espaço para Cair", description: "Criar situação onde o alvo se sente livre para ceder aos próprios desejos" },
  21: { number: 21, name: "Recuo Estratégico", description: "Retirar-se no momento certo para que o alvo sinta o vazio e persiga" },
  22: { number: 22, name: "Usar Mediadores Físicos", description: "Presentes simbólicos, cartas e objetos que mantenham sua presença" },
  23: { number: 23, name: "Movimento Ousado", description: "Agir decisivamente no momento de máximo desejo e menor resistência" },
  24: { number: 24, name: "Cuidar dos Pós-Efeitos", description: "Manter o encanto após a conquista para evitar ressentimento" },
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
      title: "Frequência Excessiva Detectada",
      description: `${userInitiated24h.length} interações suas nas últimas 24h com ${contact.firstName}. O excesso desvaloriza sua presença e anula o efeito dopaminérgico. Jejum imediato necessário.`,
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
      description: `${userInitiated24h.length} interações em 24h. Proximidade em excesso gera saciedade. Um recuo agora manteria a tensão e restauraria escassez.`,
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
      title: "Mistério em Nível Crítico",
      description: `Coeficiente de mistério em ${contact.mysteryCoefficient}%. Você revelou demais. 48h de silêncio absoluto para restaurar o enigma e recriar curiosidade.`,
      priority: "high",
      action_suggested: "48h de silêncio absoluto",
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
        description: `Tensão estabilizada em ${contact.tensionLevel}% por 5+ interações com ${contact.firstName}. Zona de conforto emocional = morte da sedução. Quebre o padrão com triangulação ou conflito doce.`,
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
      description: `Victim Score ${contact.victimScore}%, Encantamento ${Math.round(contact.enchantmentScore * 100)}%. ${contact.firstName} está no pico de receptividade. Hesitar agora pode significar perder a janela.`,
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
      title: "Inversão de Perseguição Ativa",
      description: `${contact.firstName} está iniciando ${pursuitRate}% das interações recentes. A presa se tornou caçadora. Mantenha escassez para intensificar.`,
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
        title: "Silêncio Prolongado",
        description: `${Math.round(daysSince)} dias sem interação com ${contact.firstName}. Silêncio prolongado pode passar de estratégico a esquecimento. Uma insinuação sutil reativaria sem comprometer mistério.`,
        priority: daysSince > 10 ? "high" : "medium",
        action_suggested: "Insinuação sutil de reativação",
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
      description: `Encantamento em ${Math.round(contact.enchantmentScore * 100)}% mas pipeline ainda em ${contact.pipelineStage}. Métricas indicam que ${contact.firstName} está pronta para escalação. Considere avançar o pipeline.`,
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
