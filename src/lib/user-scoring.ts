import { Interaction, Contact, SEDUCER_ARCHETYPES } from "./types";

// ===== Motor de Scoring do Usuario =====
// Analisa o comportamento do usuario (sedutor) com base nas interações registradas
// Utiliza estratégias clássicas de sedução, 48 Leis do Poder, Leis da Natureza Humana

export interface UserScore {
  // Scores principais (0-100)
  mysteryMaintenance: number;     // Quão bem mantém o mistério
  emotionalControl: number;       // Controle emocional e timing
  strategicPatience: number;      // Paciência estratégica (não ser ansioso)
  socialProofAwareness: number;   // Consciência de prova social
  adaptability: number;           // Capacidade de adaptar abordagem
  overallPower: number;           // Score geral de poder/influência

  // Indicadores comportamentais
  needinessIndex: number;         // 0-100 (0=nenhuma carência, 100=extrema carência)
  responseImpulsivity: number;    // 0-100 (0=paciente, 100=impulsivo)
  presenceBalance: number;        // 0-100 (50=equilibrado, 0=ausente demais, 100=presente demais)
  tacticalDiversity: number;      // 0-100 (diversidade de táticas usadas)

  // Diagnóstico textual
  strengths: string[];
  weaknesses: string[];
  nextLevelTip: string;
  greeneInsight: string;          // Insight estratégico de sedução
  powerLawApplied: string;        // Lei do poder relevante
  humanNatureInsight: string;     // Insight de Leis da Natureza Humana
}

export interface UserBehaviorSummary {
  totalInteractions: number;
  totalContacts: number;
  avgInteractionsPerDay: number;
  userInitiatedPercent: number;
  targetInitiatedPercent: number;
  avgSentiment: number;
  mostUsedTactic: string;
  leastUsedCategory: string;
  silenceCount: number;
  boldMoveCount: number;
  daysSinceFirstInteraction: number;
}

// ===== As 48 Leis do Poder (resumidas para scoring) =====
export const POWER_LAWS = [
  { number: 1, name: "Nunca ofusque o mestre", insight: "Faça sempre os que estão acima se sentirem superiores. Deixe seus alvos brilharem." },
  { number: 3, name: "Oculte suas intenções", insight: "Mantenha as pessoas desorientadas. Nunca revele o propósito por trás de suas ações." },
  { number: 4, name: "Diga sempre menos do que o necessário", insight: "Quanto mais você fala, mais comum parece e menos controle tem." },
  { number: 5, name: "Muito depende da reputação", insight: "A reputação é a pedra angular do poder. Proteja-a com sua vida." },
  { number: 6, name: "Chame a atenção a qualquer preço", insight: "Tudo é julgado pela aparência. O que não é visto, não conta." },
  { number: 9, name: "Vença pelas ações, não pela argumentação", insight: "Demonstre, não explique. Ações falam mais que mil palavras." },
  { number: 12, name: "Use a honestidade seletiva para desarmar", insight: "Um gesto sincero e generoso cobre dezenas de desonestidades." },
  { number: 16, name: "Use a ausência para aumentar respeito", insight: "Quanto mais você é visto e ouvido, mais comum parece. Saiba se retirar." },
  { number: 17, name: "Mantenha os outros em terror suspenso", insight: "Cultive uma aura de imprevisibilidade. A previsibilidade mata a fascinação." },
  { number: 20, name: "Não se comprometa com ninguém", insight: "Não se apresse para tomar lados. Mantenha sua independência." },
  { number: 25, name: "Recrie-se", insight: "Não aceite o papel que a sociedade lhe impõe. Forje sua identidade." },
  { number: 28, name: "Aja com ousadia", insight: "A hesitação cria brechas. A audácia elimina todas." },
  { number: 33, name: "Descubra o ponto fraco de cada um", insight: "Todos têm uma fraqueza. Encontre-a para ter influência." },
  { number: 36, name: "Despreze o que não pode ter", insight: "Ignorar é a melhor vingança. Quanto menos interesse demonstrar, mais poder terá." },
  { number: 40, name: "Despreze a refeição gratuita", insight: "O que é oferecido de graça tem custo oculto. Pague seu caminho." },
  { number: 43, name: "Trabalhe no coração e na mente dos outros", insight: "A coerção cria resistência. A sedução voluntária é permanente." },
  { number: 44, name: "Desarme e enfureça com o efeito espelho", insight: "Espelhar o outro seduz e desorienta." },
  { number: 48, name: "Assuma a falta de forma", insight: "Seja fluido e imprevisível. A rigidez é vulnerabilidade." },
] as const;

// ===== Leis da Natureza Humana (insights para scoring) =====
export const HUMAN_NATURE_LAWS = [
  { name: "Lei do Narcisismo", insight: "Todos são narcisistas. Transforme seu narcisismo em empatia para entender o outro profundamente." },
  { name: "Lei da Irracionalidade", insight: "Somos governados por emoções, não razão. Reconheça seus vieses emocionais antes de agir." },
  { name: "Lei do Papel Social", insight: "Todos usam máscaras sociais. Aprenda a ler além das aparências e controlar sua própria máscara." },
  { name: "Lei do Comportamento Compulsivo", insight: "O caráter é destino. Observe padrões repetitivos — eles revelam a essência da pessoa." },
  { name: "Lei da Cobiça", insight: "As pessoas sempre querem o que não têm. Crie ausência para despertar desejo." },
  { name: "Lei da Miopia", insight: "Humanos focam no imediato. Pense a longo prazo enquanto outros reagem ao momento." },
  { name: "Lei da Defensividade", insight: "Ninguém gosta de sentir que está sendo influenciado. Aborde de forma indireta." },
  { name: "Lei da Auto-Sabotagem", insight: "Sua atitude determina tudo. A insegurança se manifesta em comportamento carente." },
  { name: "Lei da Repressão", insight: "Todos têm um lado sombrio. Integre o seu em vez de reprimi-lo." },
  { name: "Lei da Inveja", insight: "A inveja é a emoção mais destrutiva e oculta. Nunca desperte inveja sem propósito estratégico." },
  { name: "Lei da Grandiosidade", insight: "Mantenha contato com a realidade. A grandiosidade distorce a percepção e causa queda." },
  { name: "Lei da Rigidez de Gênero", insight: "Integre qualidades masculinas e femininas para máxima atratividade e poder social." },
  { name: "Lei da Falta de Objetivo", insight: "Descubra seu propósito de vida. Pessoas com propósito irradiam carisma natural." },
  { name: "Lei da Conformidade", insight: "Todos querem pertencer. Use isso para criar conexão, mas não perca sua individualidade." },
  { name: "Lei da Agressividade", insight: "Reconheça agressão passiva nos outros. Responda com estratégia, não emoção." },
  { name: "Lei da Influência Geracional", insight: "Cada geração rebela contra a anterior. Entenda os valores geracionais do seu alvo." },
  { name: "Lei da Morte", insight: "A consciência da mortalidade intensifica cada momento. Viva com urgência estratégica." },
  { name: "Lei da Conexão Humana", insight: "Todos buscam conexão profunda. Seja autêntico na sua essência enquanto estratégico na execução." },
] as const;

/**
 * Calcula o sumario comportamental do usuario
 */
export function calculateBehaviorSummary(
  contacts: Contact[],
  interactions: Interaction[]
): UserBehaviorSummary {
  const total = interactions.length;
  const userInitiated = interactions.filter((i) => !i.initiatedByTarget).length;
  const targetInitiated = total - userInitiated;
  const silenceCount = interactions.filter((i) => i.typeId === "silence").length;
  const boldMoveCount = interactions.filter((i) => i.typeId === "bold_move").length;

  const avgSentiment = total > 0
    ? interactions.reduce((sum, i) => sum + i.sentiment, 0) / total
    : 0;

  // Calcular dias desde primeira interação
  const dates = interactions.map((i) => new Date(i.date).getTime());
  const firstDate = dates.length > 0 ? Math.min(...dates) : Date.now();
  const daysSince = Math.max(1, (Date.now() - firstDate) / (1000 * 60 * 60 * 24));

  // Tática mais usada
  const tacticCounts: Record<string, number> = {};
  interactions.forEach((i) => {
    tacticCounts[i.typeId] = (tacticCounts[i.typeId] || 0) + 1;
  });
  const mostUsedTactic = Object.entries(tacticCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "nenhuma";

  // Categoria menos usada
  const categoryCounts: Record<string, number> = {};
  interactions.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });
  const allCategories = ["digital_passive", "digital_active", "presencial_casual", "presencial_intimate", "strategic"];
  const leastUsedCategory = allCategories
    .sort((a, b) => (categoryCounts[a] || 0) - (categoryCounts[b] || 0))[0] || "strategic";

  return {
    totalInteractions: total,
    totalContacts: contacts.length,
    avgInteractionsPerDay: Math.round((total / daysSince) * 10) / 10,
    userInitiatedPercent: total > 0 ? Math.round((userInitiated / total) * 100) : 0,
    targetInitiatedPercent: total > 0 ? Math.round((targetInitiated / total) * 100) : 0,
    avgSentiment: Math.round(avgSentiment * 100) / 100,
    mostUsedTactic,
    leastUsedCategory,
    silenceCount,
    boldMoveCount,
    daysSinceFirstInteraction: Math.round(daysSince),
  };
}

/**
 * Calcula o score completo do usuario baseado em seu comportamento
 */
export function calculateUserScore(
  contacts: Contact[],
  interactions: Interaction[],
  seducerArchetype: string
): UserScore {
  const summary = calculateBehaviorSummary(contacts, interactions);

  // ===== 1. MYSTERY MAINTENANCE (0-100) =====
  // Baseado em: % de interações iniciadas pelo usuario (menos = mais misterioso)
  // + uso de táticas de silêncio + diversidade de abordagens
  let mysteryMaintenance = 50; // base

  // Se usuario inicia menos de 40% das interações, bom mistério
  if (summary.userInitiatedPercent < 40) mysteryMaintenance += 25;
  else if (summary.userInitiatedPercent < 55) mysteryMaintenance += 10;
  else if (summary.userInitiatedPercent > 70) mysteryMaintenance -= 25;
  else if (summary.userInitiatedPercent > 60) mysteryMaintenance -= 15;

  // Uso de silêncio estratégico
  if (summary.silenceCount > 0) {
    mysteryMaintenance += Math.min(20, summary.silenceCount * 5);
  }

  // Se interage demais por dia, perde mistério
  if (summary.avgInteractionsPerDay > 5) mysteryMaintenance -= 20;
  else if (summary.avgInteractionsPerDay > 3) mysteryMaintenance -= 10;

  // ===== 2. EMOTIONAL CONTROL (0-100) =====
  // Baseado em: consistência de sentimento, não ser reativo
  let emotionalControl = 50;

  // Se responde rápido demais em sequência (muitas interações/dia = impulsivo)
  if (summary.avgInteractionsPerDay <= 2) emotionalControl += 20;
  else if (summary.avgInteractionsPerDay > 4) emotionalControl -= 20;

  // Uso de táticas estratégicas mostra controle
  const strategicCount = interactions.filter((i) => i.category === "strategic").length;
  const strategicRatio = summary.totalInteractions > 0
    ? strategicCount / summary.totalInteractions
    : 0;
  if (strategicRatio > 0.2) emotionalControl += 15;
  else if (strategicRatio > 0.1) emotionalControl += 8;

  // Sentimento médio muito alto = pode estar sendo subserviente
  if (summary.avgSentiment > 0.8) emotionalControl -= 10;

  // ===== 3. STRATEGIC PATIENCE (0-100) =====
  // Baseado em: uso de recuo, silêncio, não pular etapas
  let strategicPatience = 50;

  // Silêncio é bom sinal de paciência
  strategicPatience += Math.min(25, summary.silenceCount * 8);

  // Muitas interações iniciadas pelo usuario = ansiedade
  if (summary.userInitiatedPercent > 65) strategicPatience -= 20;
  else if (summary.userInitiatedPercent < 45) strategicPatience += 15;

  // Bold moves prematuros (sem construção) = impaciente
  const lowScoreContacts = contacts.filter((c) => c.victimScore < 50);
  const prematureBoldMoves = interactions.filter(
    (i) => i.typeId === "bold_move" && lowScoreContacts.some((c) => c.id === i.contactId)
  ).length;
  if (prematureBoldMoves > 0) strategicPatience -= prematureBoldMoves * 15;

  // ===== 4. SOCIAL PROOF AWARENESS (0-100) =====
  // Baseado em: uso de triângulos, diversidade de alvos, não depender de um só
  let socialProofAwareness = 40;

  // Múltiplos alvos ativos = bom (não coloca todos os ovos em uma cesta)
  if (summary.totalContacts >= 3) socialProofAwareness += 25;
  else if (summary.totalContacts >= 2) socialProofAwareness += 15;

  // Uso de triângulos
  const triangleCount = interactions.filter((i) => i.typeId === "triangle").length;
  if (triangleCount > 0) socialProofAwareness += Math.min(20, triangleCount * 10);

  // ===== 5. ADAPTABILITY (0-100) =====
  // Baseado em: diversidade de tipos de interação usados
  let adaptability = 40;

  const uniqueTypes = new Set(interactions.map((i) => i.typeId)).size;
  const uniqueCategories = new Set(interactions.map((i) => i.category)).size;
  adaptability += Math.min(30, uniqueTypes * 3);
  adaptability += Math.min(20, uniqueCategories * 5);

  // Uso de táticas íntimas + digitais mostra range
  const hasIntimate = interactions.some((i) => i.category === "presencial_intimate");
  const hasDigital = interactions.some((i) => i.category === "digital_active");
  if (hasIntimate && hasDigital) adaptability += 10;

  // ===== INDICADORES COMPORTAMENTAIS =====

  // Neediness Index (0-100) — quanto mais alto, mais carente (índice de carência)
  let needinessIndex = 30;
  if (summary.userInitiatedPercent > 70) needinessIndex += 30;
  else if (summary.userInitiatedPercent > 55) needinessIndex += 15;
  else if (summary.userInitiatedPercent < 40) needinessIndex -= 15;
  if (summary.avgInteractionsPerDay > 5) needinessIndex += 25;
  else if (summary.avgInteractionsPerDay > 3) needinessIndex += 10;
  if (summary.silenceCount === 0 && summary.totalInteractions > 5) needinessIndex += 15;

  // Response Impulsivity (0-100)
  let responseImpulsivity = 30;
  if (summary.avgInteractionsPerDay > 4) responseImpulsivity += 30;
  else if (summary.avgInteractionsPerDay > 2) responseImpulsivity += 15;
  if (summary.silenceCount === 0 && summary.totalInteractions > 10) responseImpulsivity += 20;

  // Presence Balance (0=ausente, 50=equilibrado, 100=presente demais)
  let presenceBalance = 50;
  if (summary.avgInteractionsPerDay > 4) presenceBalance += 25;
  else if (summary.avgInteractionsPerDay > 2) presenceBalance += 10;
  else if (summary.avgInteractionsPerDay < 0.5) presenceBalance -= 25;
  else if (summary.avgInteractionsPerDay < 1) presenceBalance -= 10;

  // Tactical Diversity (0-100)
  let tacticalDiversity = 0;
  tacticalDiversity += Math.min(50, uniqueTypes * 5);
  tacticalDiversity += Math.min(30, uniqueCategories * 8);
  if (summary.silenceCount > 0) tacticalDiversity += 10;
  if (summary.boldMoveCount > 0) tacticalDiversity += 10;

  // Clamp all values
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  mysteryMaintenance = clamp(mysteryMaintenance);
  emotionalControl = clamp(emotionalControl);
  strategicPatience = clamp(strategicPatience);
  socialProofAwareness = clamp(socialProofAwareness);
  adaptability = clamp(adaptability);
  needinessIndex = clamp(needinessIndex);
  responseImpulsivity = clamp(responseImpulsivity);
  presenceBalance = clamp(presenceBalance);
  tacticalDiversity = clamp(tacticalDiversity);

  // Overall Power Score (média ponderada)
  const overallPower = clamp(
    mysteryMaintenance * 0.25 +
    emotionalControl * 0.2 +
    strategicPatience * 0.2 +
    socialProofAwareness * 0.15 +
    adaptability * 0.2
  );

  // ===== DIAGNÓSTICO =====
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (mysteryMaintenance >= 65) strengths.push("Manutenção de mistério forte");
  else if (mysteryMaintenance < 40) weaknesses.push("Revelando demais de si — reduza a exposição");

  if (emotionalControl >= 65) strengths.push("Bom controle emocional e timing");
  else if (emotionalControl < 40) weaknesses.push("Reações impulsivas — pratique o delay antes de responder");

  if (strategicPatience >= 65) strengths.push("Paciência estratégica exemplar");
  else if (strategicPatience < 40) weaknesses.push("Ansiedade no processo — confie no pipeline");

  if (socialProofAwareness >= 65) strengths.push("Boa gestão de prova social");
  else if (socialProofAwareness < 40) weaknesses.push("Dependência de um único alvo — diversifique");

  if (adaptability >= 65) strengths.push("Alta diversidade tática");
  else if (adaptability < 40) weaknesses.push("Abordagem repetitiva — explore novas táticas");

  if (needinessIndex > 60) weaknesses.push("Índice de carência alto — reduza a frequência de contato");
  if (needinessIndex < 25) strengths.push("Baixa carência — você transmite independência");

  if (presenceBalance > 70) weaknesses.push("Presente demais — crie espaços de ausência");
  else if (presenceBalance < 30) weaknesses.push("Ausente demais — o alvo pode perder interesse");

  // Selecionar lei do poder relevante
  const powerLawApplied = selectRelevantPowerLaw(summary, needinessIndex, mysteryMaintenance);

  // Selecionar insight da natureza humana
  const humanNatureInsight = selectHumanNatureInsight(summary, needinessIndex, emotionalControl);

  // Dica para próximo nível
  const nextLevelTip = generateNextLevelTip(
    overallPower, mysteryMaintenance, emotionalControl,
    strategicPatience, needinessIndex, summary
  );

  // Insight estratégico de sedução
  const greeneInsight = generateGreeneInsight(seducerArchetype, overallPower, summary);

  return {
    mysteryMaintenance,
    emotionalControl,
    strategicPatience,
    socialProofAwareness,
    adaptability,
    overallPower,
    needinessIndex,
    responseImpulsivity,
    presenceBalance,
    tacticalDiversity,
    strengths,
    weaknesses,
    nextLevelTip,
    greeneInsight,
    powerLawApplied,
    humanNatureInsight,
  };
}

function selectRelevantPowerLaw(
  summary: UserBehaviorSummary,
  needinessIndex: number,
  mysteryMaintenance: number
): string {
  if (needinessIndex > 60) {
    return `Lei #16: "${POWER_LAWS[7].name}" — ${POWER_LAWS[7].insight}`;
  }
  if (mysteryMaintenance < 40) {
    return `Lei #4: "${POWER_LAWS[2].name}" — ${POWER_LAWS[2].insight}`;
  }
  if (summary.userInitiatedPercent > 65) {
    return `Lei #36: "${POWER_LAWS[13].name}" — ${POWER_LAWS[13].insight}`;
  }
  if (summary.boldMoveCount === 0 && summary.totalInteractions > 10) {
    return `Lei #28: "${POWER_LAWS[11].name}" — ${POWER_LAWS[11].insight}`;
  }
  if (summary.totalContacts < 2) {
    return `Lei #20: "${POWER_LAWS[9].name}" — ${POWER_LAWS[9].insight}`;
  }
  return `Lei #17: "${POWER_LAWS[8].name}" — ${POWER_LAWS[8].insight}`;
}

function selectHumanNatureInsight(
  summary: UserBehaviorSummary,
  needinessIndex: number,
  emotionalControl: number
): string {
  if (needinessIndex > 60) {
    return `${HUMAN_NATURE_LAWS[7].name}: ${HUMAN_NATURE_LAWS[7].insight}`;
  }
  if (emotionalControl < 40) {
    return `${HUMAN_NATURE_LAWS[1].name}: ${HUMAN_NATURE_LAWS[1].insight}`;
  }
  if (summary.avgInteractionsPerDay > 4) {
    return `${HUMAN_NATURE_LAWS[5].name}: ${HUMAN_NATURE_LAWS[5].insight}`;
  }
  if (summary.totalContacts < 2) {
    return `${HUMAN_NATURE_LAWS[4].name}: ${HUMAN_NATURE_LAWS[4].insight}`;
  }
  return `${HUMAN_NATURE_LAWS[17].name}: ${HUMAN_NATURE_LAWS[17].insight}`;
}

function generateNextLevelTip(
  overall: number,
  mystery: number,
  emotional: number,
  patience: number,
  neediness: number,
  summary: UserBehaviorSummary
): string {
  if (overall < 30) {
    return "Foque em controlar a frequência. Defina uma regra: para cada mensagem que você envia, espere o alvo responder antes de enviar outra.";
  }
  if (neediness > 60) {
    return "Sua maior alavanca agora é REDUZIR a frequência de contato. Tente 48h sem iniciar conversa e observe como o alvo reage.";
  }
  if (mystery < 40) {
    return "Você está revelando demais. Na próxima conversa, responda com perguntas em vez de informações sobre si. Deixe lacunas.";
  }
  if (patience < 40) {
    return "A ansiedade está sabotando seu jogo. Antes de cada ação, pergunte: 'Isso aumenta minha posição ou minha necessidade de validação?'";
  }
  if (emotional < 40) {
    return "Pratique o 'delay estratégico': ao receber uma mensagem animadora, espere pelo menos 2x o tempo que o alvo levou para responder.";
  }
  if (overall < 60) {
    return "Incorpore mais táticas estratégicas: silêncios deliberados, insinuações e triangulação. O jogo de sedução é um xadrez, não uma corrida.";
  }
  if (summary.silenceCount === 0) {
    return "Você nunca usou o silêncio estratégico. É a arma mais poderosa: crie um vácuo de 48-72h e observe a reação.";
  }
  return "Você está no caminho certo. Foque em calibrar: leia as reações, ajuste a intensidade, e lembre-se — a sedução é uma dança, não uma marcha.";
}

function generateGreeneInsight(
  archetype: string,
  overallPower: number,
  summary: UserBehaviorSummary
): string {
  const arch = SEDUCER_ARCHETYPES.find((a) => a.id === archetype);
  const name = arch?.name || "Sedutor";

  if (overallPower < 30) {
    return `Como ${name}, você precisa retomar o controle do frame. A pessoa que se mostra primeiro perde o poder. Recue e deixe o outro vir até você.`;
  }
  if (overallPower < 50) {
    return `Seu arquétipo ${name} tem força natural em ${arch?.desc.toLowerCase() || "criar conexão"}. Use isso com mais intencionalidade — cada interação deve ter um propósito estratégico.`;
  }
  if (overallPower < 70) {
    return `Você está usando bem as qualidades do ${name}. O próximo passo é dominar o timing: "A pessoa que controla o ritmo controla o jogo." Alterne presença e ausência com mais precisão.`;
  }
  return `Excelente execução como ${name}. O maior sedutor não é aquele que força, mas aquele que cria um campo gravitacional. Continue sendo o centro, não o perseguidor.`;
}

/**
 * Calcula o score para exibição quando não há interações ainda
 */
export function getDefaultUserScore(): UserScore {
  return {
    mysteryMaintenance: 50,
    emotionalControl: 50,
    strategicPatience: 50,
    socialProofAwareness: 40,
    adaptability: 40,
    overallPower: 45,
    needinessIndex: 30,
    responseImpulsivity: 30,
    presenceBalance: 50,
    tacticalDiversity: 0,
    strengths: ["Perfil configurado — pronto para começar"],
    weaknesses: ["Sem dados suficientes — registre interações para análise completa"],
    nextLevelTip: "Cadastre seus alvos e comece a registrar interações. O sistema precisa de dados para analisar seu comportamento e sugerir melhorias.",
    greeneInsight: "A sedução começa com a observação. Antes de agir, observe. Antes de falar, escute. Antes de avançar, construa o terreno.",
    powerLawApplied: `Lei #3: "${POWER_LAWS[1].name}" — ${POWER_LAWS[1].insight}`,
    humanNatureInsight: `${HUMAN_NATURE_LAWS[0].name}: ${HUMAN_NATURE_LAWS[0].insight}`,
  };
}
