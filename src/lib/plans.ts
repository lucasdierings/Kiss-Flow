/**
 * Planos, limites e preços.
 *
 * Ficam em código, não no banco: mudar um limite vira deploy, não migração,
 * e as chaves ganham tipagem. O único insumo vindo do banco é
 * `user_profile.plan`.
 *
 * MODELO (definido em 21/09/2026)
 *
 * Duas camadas que se somam, e é assim que `reserveAnalysis` cobra:
 *
 *  1. Franquia mensal do plano — renova sozinha, não acumula.
 *  2. Carteira de créditos avulsos — comprada à parte, não expira, e só é
 *     tocada depois que a franquia do mês acaba.
 *
 * O plano pago tira o teto de pessoas, mas NÃO dá análises ilimitadas: cada
 * análise custa dinheiro de verdade em API, e franquia infinita transformaria
 * o preço fixo numa aposta contra o usuário mais pesado.
 */

export type Plan = "free" | "premium";

/** Cotas de fluxo mensal — contadas em usage_counters. */
export type MonthlyFeature = "ai_analysis" | "upload";

export interface PlanLimits {
  /** Cardinalidade: pessoas ativas ao mesmo tempo. Apagar uma libera a vaga. */
  activeContacts: number;
  monthly: Record<MonthlyFeature, number>;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    // Três, e não uma. Com um alvo só o produto não tem o que comparar, o
    // funil não existe e "prova social" fica constante — a auditoria do
    // scoring mostrou a dimensão saturando justamente em 3 pessoas.
    activeContacts: 3,
    monthly: { ai_analysis: 5, upload: 3 },
  },
  premium: {
    activeContacts: Infinity,
    monthly: { ai_analysis: 100, upload: Infinity },
  },
};

export interface PlanInfo {
  id: Plan;
  nome: string;
  precoCentavos: number;
  periodo: "mensal" | null;
  resumo: string;
  inclui: string[];
}

export const PLAN_INFO: Record<Plan, PlanInfo> = {
  free: {
    id: "free",
    nome: "Gratuito",
    precoCentavos: 0,
    periodo: null,
    resumo: "Para testar o método com poucas pessoas.",
    inclui: [
      "Até 3 pessoas ativas",
      "5 análises de IA por mês",
      "3 envios de imagem por mês",
      "Diagnóstico comportamental completo",
    ],
  },
  premium: {
    id: "premium",
    nome: "Pro",
    precoCentavos: 2990,
    periodo: "mensal",
    resumo: "Para quem gerencia várias frentes ao mesmo tempo.",
    inclui: [
      "Pessoas ativas ilimitadas",
      "100 análises de IA por mês",
      "Envios de imagem ilimitados",
      "Créditos avulsos quando a franquia acabar",
    ],
  },
};

/**
 * Pacotes de créditos avulsos.
 *
 * Os preços aqui são de exibição. Quem manda em produção é a App Store e o
 * Google Play: o preço real vem do SDK da loja em tempo de execução, e é o
 * webhook que credita a carteira. Ver docs/pagamentos.md.
 */
export interface CreditPack {
  id: string;
  nome: string;
  creditos: number;
  precoCentavos: number;
  destaque?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "credits_25", nome: "Avulso", creditos: 25, precoCentavos: 1990 },
  { id: "credits_60", nome: "Recarga", creditos: 60, precoCentavos: 3990, destaque: true },
  { id: "credits_150", nome: "Volume", creditos: 150, precoCentavos: 7990 },
];

export const FEATURE_LABELS: Record<MonthlyFeature, string> = {
  ai_analysis: "análises de IA",
  upload: "envios de imagem",
};

/** Período do contador: 'YYYY-MM' em UTC. Mês novo = chave nova, sem cron. */
export function currentPeriod(at: Date = new Date()): string {
  return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function limitFor(plan: Plan, feature: MonthlyFeature): number {
  return PLAN_LIMITS[plan].monthly[feature];
}

export function formatarPreco(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
