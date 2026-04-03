// ===== Arquetipos e Vitimas (Robert Greene) =====

export const SEDUCER_ARCHETYPES = [
  { id: "siren", name: "Sereia", desc: "Foco em estimulos visuais e energia magnetica" },
  { id: "rake", name: "Libertino", desc: "Atencao obsessiva e devocao intensa" },
  { id: "ideal_lover", name: "Amante Ideal", desc: "Preenche o vazio especifico do alvo" },
  { id: "dandy", name: "Dandi", desc: "Ambiguidade, estetica e nao-conformismo" },
  { id: "natural", name: "Natural", desc: "Espontaneidade e inocencia desarmante" },
  { id: "coquette", name: "Coquete", desc: "Push-pull, alternancia entre calor e frieza" },
  { id: "charmer", name: "Encantador", desc: "Foco total no ego do outro, validacao" },
  { id: "charismatic", name: "Carismatico", desc: "Confianca inabalavel e proposito superior" },
  { id: "star", name: "Estrela", desc: "Misterio, distancia e aura de idolo" },
] as const;

export type SeducerArchetype = typeof SEDUCER_ARCHETYPES[number]["id"];

export const VICTIM_TYPES = [
  { id: "disappointed_dreamer", name: "Sonhador Decepcionado", desc: "Vive em mundos de fantasia, busca grandeza", need: "Misterio e grandeza" },
  { id: "spoiled_royalty", name: "Realeza Mimada", desc: "Snob que busca adoracao", need: "Ser entretido e mimado" },
  { id: "new_prude", name: "Novo Prudente", desc: "Aparencia social mas deseja transgressao", need: "Liberacao sem julgamento" },
  { id: "faded_star", name: "Estrela Ofuscada", desc: "Ja foi o centro das atencoes", need: "Validacao da gloria passada" },
  { id: "novice", name: "Novico", desc: "Jovem e curioso, busca experiencia", need: "Conhecer o lado sombrio" },
  { id: "conqueror", name: "Conquistador", desc: "Competitivo e energetico", need: "Desafio dificil de vencer" },
  { id: "exotic_fetishist", name: "Fetichista do Exotico", desc: "Detesta a propria classe social", need: "Alguem radicalmente diferente" },
  { id: "drama_queen", name: "Rainha do Drama", desc: "Odeia estabilidade", need: "Caos e intensidade emocional" },
  { id: "professor", name: "Professor", desc: "Hiper-intelectual e inseguro", need: "Escapar da mente, pura fisicalidade" },
  { id: "beauty", name: "Beleza", desc: "Adorada pela aparencia, isolada", need: "Validacao intelectual e profundidade" },
  { id: "aging_baby", name: "Bebe que Envelhece", desc: "Recusa responsabilidades", need: "Alguem que cuide dele" },
  { id: "rescuer", name: "Salvador", desc: "Atraido por pessoas com problemas", need: "Sentir-se superior ao ajudar" },
  { id: "roue", name: "Roue", desc: "Vivido, busca inocencia perdida", need: "Alguem jovem e puro" },
  { id: "idol_worshipper", name: "Adorador de Idolos", desc: "Falta autoconfianca", need: "Causa ou pessoa superior para servir" },
  { id: "sensualist", name: "Sensualista", desc: "Hiper-estimulado pelos sentidos", need: "Iscas fisicas, perfumes, texturas" },
  { id: "lonely_leader", name: "Lider Solitario", desc: "Poderoso mas isolado", need: "Ser tratado como igual" },
  { id: "floating_gender", name: "Genero Flutuante", desc: "Desconfortavel com papeis rigidos", need: "Alma gemea que flutue entre generos" },
  { id: "reformed_seducer", name: "Sedutor Reformado", desc: "Ex-sedutor que sente falta do jogo", need: "Ser seduzido novamente" },
] as const;

export type VictimType = typeof VICTIM_TYPES[number]["id"];

export const LOVE_LANGUAGES = [
  { id: "words", name: "Palavras de Afirmacao", icon: "chat" },
  { id: "gifts", name: "Presentes", icon: "gift" },
  { id: "acts", name: "Atos de Servico", icon: "hand" },
  { id: "time", name: "Tempo de Qualidade", icon: "clock" },
  { id: "touch", name: "Toque Fisico", icon: "heart" },
] as const;

export type LoveLanguage = typeof LOVE_LANGUAGES[number]["id"];

export const PIPELINE_STAGES = [
  { id: "lead_generation", name: "Lead Generation", phase: "Despertar Interesse" },
  { id: "qualification", name: "Qualification", phase: "Liderar para o Desvio" },
  { id: "nurturing", name: "Nurturing", phase: "Aprofundar o Vinculo" },
  { id: "closing", name: "Closing", phase: "Movimento Ousado" },
  { id: "retention", name: "Retention", phase: "Pos-Efeitos" },
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number]["id"];

// ===== Tipos de Interacao =====

export const INTERACTION_CATEGORIES = {
  digital_passive: {
    name: "Digital Passiva",
    desc: "Interacoes indiretas e de baixo investimento",
    types: [
      { id: "story_view", name: "Visualizou Story", impact: { mystery: 0, tension: 2, enchantment: 0.05 }, weight: 1 },
      { id: "like_post", name: "Curtiu Post", impact: { mystery: -2, tension: 3, enchantment: 0.1 }, weight: 2 },
      { id: "like_story", name: "Reagiu ao Story", impact: { mystery: -3, tension: 5, enchantment: 0.15 }, weight: 3 },
      { id: "follow", name: "Seguiu/Adicionou", impact: { mystery: -5, tension: 8, enchantment: 0.2 }, weight: 4 },
    ],
  },
  digital_active: {
    name: "Digital Ativa",
    desc: "Conversas e mensagens diretas",
    types: [
      { id: "reply_story", name: "Respondeu Story", impact: { mystery: -5, tension: 10, enchantment: 0.2 }, weight: 5 },
      { id: "dm_casual", name: "DM Casual", impact: { mystery: -5, tension: 8, enchantment: 0.25 }, weight: 6 },
      { id: "dm_deep", name: "Conversa Profunda", impact: { mystery: -8, tension: 15, enchantment: 0.4 }, weight: 8 },
      { id: "voice_message", name: "Audio/Mensagem de Voz", impact: { mystery: -7, tension: 12, enchantment: 0.35 }, weight: 7 },
      { id: "video_call", name: "Ligacao de Video", impact: { mystery: -10, tension: 18, enchantment: 0.5 }, weight: 9 },
      { id: "phone_call", name: "Ligacao Telefonica", impact: { mystery: -8, tension: 15, enchantment: 0.45 }, weight: 8 },
    ],
  },
  presencial_casual: {
    name: "Presencial Casual",
    desc: "Encontros leves e sem compromisso",
    types: [
      { id: "coffee", name: "Cafe", impact: { mystery: -10, tension: 20, enchantment: 0.6 }, weight: 12 },
      { id: "lunch", name: "Almoco", impact: { mystery: -12, tension: 22, enchantment: 0.65 }, weight: 13 },
      { id: "walk", name: "Passeio/Caminhada", impact: { mystery: -8, tension: 18, enchantment: 0.55 }, weight: 11 },
      { id: "group_hangout", name: "Saida em Grupo", impact: { mystery: -5, tension: 12, enchantment: 0.3 }, weight: 8 },
      { id: "gym", name: "Academia Juntos", impact: { mystery: -7, tension: 15, enchantment: 0.4 }, weight: 10 },
    ],
  },
  presencial_intimate: {
    name: "Presencial Intimo",
    desc: "Encontros com mais intimidade e investimento emocional",
    types: [
      { id: "dinner", name: "Jantar", impact: { mystery: -15, tension: 25, enchantment: 0.75 }, weight: 15 },
      { id: "movie", name: "Cinema/Filme", impact: { mystery: -10, tension: 20, enchantment: 0.6 }, weight: 13 },
      { id: "concert", name: "Show/Evento", impact: { mystery: -12, tension: 22, enchantment: 0.7 }, weight: 14 },
      { id: "cooking", name: "Cozinhar Juntos", impact: { mystery: -15, tension: 25, enchantment: 0.8 }, weight: 16 },
      { id: "trip", name: "Viagem/Passeio Longo", impact: { mystery: -20, tension: 30, enchantment: 0.9 }, weight: 20 },
      { id: "sleepover", name: "Pernoite", impact: { mystery: -25, tension: 35, enchantment: 0.95 }, weight: 25 },
    ],
  },
  strategic: {
    name: "Estrategica",
    desc: "Taticas deliberadas de seducao",
    types: [
      { id: "gift", name: "Presente", impact: { mystery: -5, tension: 15, enchantment: 0.5 }, weight: 10 },
      { id: "surprise", name: "Surpresa", impact: { mystery: 5, tension: 20, enchantment: 0.7 }, weight: 14 },
      { id: "compliment", name: "Elogio Sutil", impact: { mystery: -3, tension: 10, enchantment: 0.3 }, weight: 6 },
      { id: "insinuation", name: "Insinuacao", impact: { mystery: 5, tension: 12, enchantment: 0.25 }, weight: 7 },
      { id: "silence", name: "Silencio/Recuo", impact: { mystery: 15, tension: -10, enchantment: -0.2 }, weight: 0 },
      { id: "triangle", name: "Criar Triangulo", impact: { mystery: 10, tension: 25, enchantment: 0.1 }, weight: 5 },
      { id: "bold_move", name: "Movimento Ousado", impact: { mystery: -20, tension: 35, enchantment: 0.9 }, weight: 25 },
      { id: "vulnerability", name: "Mostrar Vulnerabilidade", impact: { mystery: -10, tension: 15, enchantment: 0.6 }, weight: 12 },
    ],
  },
} as const;

export type InteractionCategory = keyof typeof INTERACTION_CATEGORIES;
export type InteractionTypeId = typeof INTERACTION_CATEGORIES[InteractionCategory]["types"][number]["id"];

// ===== Entidades =====

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  primaryArchetype: VictimType;
  secondaryArchetype?: VictimType;
  loveLanguage?: LoveLanguage;
  pipelineStage: PipelineStage;
  notes: string;
  // Metricas calculadas
  mysteryCoefficient: number;   // 0-100
  tensionLevel: number;         // 0-100
  enchantmentScore: number;     // -1 a 1
  victimScore: number;          // 0-100
  scarcityScore: number;        // 0-100
  // Vulnerabilidades (radar)
  vulnerabilities: {
    fantasy: number;       // 0-100
    snobbery: number;
    loneliness: number;
    ego: number;
    adventure: number;
    rebellion: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  contactId: string;
  typeId: InteractionTypeId;
  category: InteractionCategory;
  sentiment: number;            // -1 a 1 (como o usuario avalia que foi)
  date: string;                 // ISO date
  notes: string;
  initiatedByTarget: boolean;   // quem iniciou? alvo ou usuario
  duration?: number;            // minutos (para encontros)
  location?: string;
  // Snapshot das metricas apos esta interacao
  mysteryAfter?: number;
  tensionAfter?: number;
  enchantmentAfter?: number;
}

export interface AppState {
  contacts: Contact[];
  interactions: Interaction[];
  activeContactId: string | null;
  seducerArchetype: SeducerArchetype;
}

// Helper para obter todos os tipos de interacao como lista plana
export function getAllInteractionTypes() {
  const types: Array<{
    id: string;
    name: string;
    category: InteractionCategory;
    categoryName: string;
    impact: { mystery: number; tension: number; enchantment: number };
    weight: number;
  }> = [];

  for (const [catKey, cat] of Object.entries(INTERACTION_CATEGORIES)) {
    for (const type of cat.types) {
      types.push({
        ...type,
        category: catKey as InteractionCategory,
        categoryName: cat.name,
      });
    }
  }

  return types;
}
