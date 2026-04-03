// ===== Arquétipos e Vítimas =====

export const SEDUCER_ARCHETYPES = [
  { id: "siren", name: "Sereia", desc: "Foco em estímulos visuais e energia magnética" },
  { id: "rake", name: "Libertino", desc: "Atenção obsessiva e devoção intensa" },
  { id: "ideal_lover", name: "Amante Ideal", desc: "Preenche o vazio específico do alvo" },
  { id: "dandy", name: "Dandi", desc: "Ambiguidade, estética e não-conformismo" },
  { id: "natural", name: "Natural", desc: "Espontaneidade e inocência desarmante" },
  { id: "coquette", name: "Coquete", desc: "Push-pull, alternância entre calor e frieza" },
  { id: "charmer", name: "Encantador", desc: "Foco total no ego do outro, validação" },
  { id: "charismatic", name: "Carismático", desc: "Confiança inabalável e propósito superior" },
  { id: "star", name: "Estrela", desc: "Mistério, distância e aura de ídolo" },
] as const;

export type SeducerArchetype = typeof SEDUCER_ARCHETYPES[number]["id"];

export const VICTIM_TYPES = [
  { id: "disappointed_dreamer", name: "Sonhador Decepcionado", desc: "Vive em mundos de fantasia, busca grandeza", need: "Mistério e grandeza" },
  { id: "spoiled_royalty", name: "Realeza Mimada", desc: "Snob que busca adoração", need: "Ser entretido e mimado" },
  { id: "new_prude", name: "Novo Prudente", desc: "Aparência social mas deseja transgressão", need: "Liberação sem julgamento" },
  { id: "faded_star", name: "Estrela Ofuscada", desc: "Já foi o centro das atenções", need: "Validação da glória passada" },
  { id: "novice", name: "Noviço", desc: "Jovem e curioso, busca experiência", need: "Conhecer o lado sombrio" },
  { id: "conqueror", name: "Conquistador", desc: "Competitivo e energético", need: "Desafio difícil de vencer" },
  { id: "exotic_fetishist", name: "Fetichista do Exótico", desc: "Detesta a própria classe social", need: "Alguém radicalmente diferente" },
  { id: "drama_queen", name: "Rainha do Drama", desc: "Odeia estabilidade", need: "Caos e intensidade emocional" },
  { id: "professor", name: "Professor", desc: "Hiper-intelectual e inseguro", need: "Escapar da mente, pura fisicalidade" },
  { id: "beauty", name: "Beleza", desc: "Adorada pela aparência, isolada", need: "Validação intelectual e profundidade" },
  { id: "aging_baby", name: "Bebê que Envelhece", desc: "Recusa responsabilidades", need: "Alguém que cuide dele" },
  { id: "rescuer", name: "Salvador", desc: "Atraído por pessoas com problemas", need: "Sentir-se superior ao ajudar" },
  { id: "roue", name: "Roué", desc: "Vivido, busca inocência perdida", need: "Alguém jovem e puro" },
  { id: "idol_worshipper", name: "Adorador de Ídolos", desc: "Falta autoconfiança", need: "Causa ou pessoa superior para servir" },
  { id: "sensualist", name: "Sensualista", desc: "Hiper-estimulado pelos sentidos", need: "Iscas físicas, perfumes, texturas" },
  { id: "lonely_leader", name: "Líder Solitário", desc: "Poderoso mas isolado", need: "Ser tratado como igual" },
  { id: "floating_gender", name: "Gênero Flutuante", desc: "Desconfortável com papéis rígidos", need: "Alma gêmea que flutue entre gêneros" },
  { id: "reformed_seducer", name: "Sedutor Reformado", desc: "Ex-sedutor que sente falta do jogo", need: "Ser seduzido novamente" },
] as const;

export type VictimType = typeof VICTIM_TYPES[number]["id"];

export const LOVE_LANGUAGES = [
  { id: "words", name: "Palavras de Afirmação", icon: "chat" },
  { id: "gifts", name: "Presentes", icon: "gift" },
  { id: "acts", name: "Atos de Serviço", icon: "hand" },
  { id: "time", name: "Tempo de Qualidade", icon: "clock" },
  { id: "touch", name: "Toque Físico", icon: "heart" },
] as const;

export type LoveLanguage = typeof LOVE_LANGUAGES[number]["id"];

export const PIPELINE_STAGES = [
  { id: "prospeccao", name: "Prospecção", tooltip: "Conhecendo e despertando interesse" },
  { id: "qualificado", name: "Qualificado(a)", tooltip: "Já demonstrou interesse, vale investir" },
  { id: "engajamento", name: "Engajamento", tooltip: "Conversas fluindo, conexão crescendo" },
  { id: "agendamento", name: "Agendamento", tooltip: "Marcando um encontro presencial" },
  { id: "fechamento", name: "Fechamento", tooltip: "Quase lá — momento decisivo" },
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number]["id"];

// ===== Status e Conversão =====

export type ContactStatus = "active" | "lost" | "won" | "frozen";

export type LostReason = "desistencia" | "rejeicao" | "sucesso_efemero";

export type ContactTemperature = "hot" | "warm" | "cold" | "frozen";

export const LOST_REASON_LABELS: Record<LostReason, string> = {
  desistencia: "Desistência",
  rejeicao: "Rejeição",
  sucesso_efemero: "Sucesso Efêmero",
};

export const STATUS_LABELS: Record<ContactStatus, string> = {
  active: "Ativo",
  lost: "Perdido",
  won: "Ganhamos!",
  frozen: "Geladeira",
};

export const CLOSING_GOALS = [
  { id: "primeiro_beijo", name: "Primeiro Beijo" },
  { id: "encontro_fisico", name: "Encontro Físico" },
  { id: "relacionamento", name: "Relacionamento" },
  { id: "amizade_profunda", name: "Amizade Profunda" },
  { id: "negocio_parceria", name: "Negócio/Parceria" },
  { id: "outro", name: "Outro" },
] as const;

export type ClosingGoalId = typeof CLOSING_GOALS[number]["id"];

export interface PhaseTransition {
  id: string;
  contactId: string;
  oldPhase: PipelineStage | "none" | "lost";
  newPhase: PipelineStage | "lost";
  evidence: string;
  lostReason?: LostReason;
  timestamp: string;
}

// ===== Tipos de Interação =====

export const INTERACTION_CATEGORIES = {
  digital_passive: {
    name: "Digital Passiva",
    desc: "Interações indiretas e de baixo investimento",
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
      { id: "voice_message", name: "Áudio/Mensagem de Voz", impact: { mystery: -7, tension: 12, enchantment: 0.35 }, weight: 7 },
      { id: "video_call", name: "Ligação de Vídeo", impact: { mystery: -10, tension: 18, enchantment: 0.5 }, weight: 9 },
      { id: "phone_call", name: "Ligação Telefônica", impact: { mystery: -8, tension: 15, enchantment: 0.45 }, weight: 8 },
    ],
  },
  presencial_casual: {
    name: "Presencial Casual",
    desc: "Encontros leves e sem compromisso",
    types: [
      { id: "coffee", name: "Café", impact: { mystery: -10, tension: 20, enchantment: 0.6 }, weight: 12 },
      { id: "lunch", name: "Almoço", impact: { mystery: -12, tension: 22, enchantment: 0.65 }, weight: 13 },
      { id: "walk", name: "Passeio/Caminhada", impact: { mystery: -8, tension: 18, enchantment: 0.55 }, weight: 11 },
      { id: "group_hangout", name: "Saída em Grupo", impact: { mystery: -5, tension: 12, enchantment: 0.3 }, weight: 8 },
      { id: "gym", name: "Academia Juntos", impact: { mystery: -7, tension: 15, enchantment: 0.4 }, weight: 10 },
    ],
  },
  presencial_intimate: {
    name: "Presencial Íntimo",
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
    name: "Estratégica",
    desc: "Táticas deliberadas de sedução",
    types: [
      { id: "gift", name: "Presente", impact: { mystery: -5, tension: 15, enchantment: 0.5 }, weight: 10 },
      { id: "surprise", name: "Surpresa", impact: { mystery: 5, tension: 20, enchantment: 0.7 }, weight: 14 },
      { id: "compliment", name: "Elogio Sutil", impact: { mystery: -3, tension: 10, enchantment: 0.3 }, weight: 6 },
      { id: "insinuation", name: "Insinuação", impact: { mystery: 5, tension: 12, enchantment: 0.25 }, weight: 7 },
      { id: "silence", name: "Silêncio/Recuo", impact: { mystery: 15, tension: -10, enchantment: -0.2 }, weight: 0 },
      { id: "triangle", name: "Criar Triângulo", impact: { mystery: 10, tension: 25, enchantment: 0.1 }, weight: 5 },
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
  phone?: string;
  primaryArchetype: VictimType;
  secondaryArchetype?: VictimType;
  loveLanguage?: LoveLanguage;
  pipelineStage: PipelineStage;
  status: ContactStatus;
  closingGoal?: string;
  lostReason?: LostReason;
  lostAt?: string;
  postMortem?: string;
  goalAchievedAt?: string;
  goalEvidence?: string;
  notes: string;
  // Métricas calculadas
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
  sentiment: number;            // -1 a 1 (como o usuário avalia que foi)
  date: string;                 // ISO date
  notes: string;
  initiatedByTarget: boolean;   // quem iniciou? alvo ou usuário
  duration?: number;            // minutos (para encontros)
  location?: string;
  // Snapshot das métricas após esta interação
  mysteryAfter?: number;
  tensionAfter?: number;
  enchantmentAfter?: number;
}

export interface AppState {
  contacts: Contact[];
  interactions: Interaction[];
  phaseHistory: PhaseTransition[];
  activeContactId: string | null;
  seducerArchetype: SeducerArchetype;
}

// Helper para obter todos os tipos de interação como lista plana
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
