/**
 * Limites por plano.
 *
 * Ficam em código, não no banco: mudar um limite vira deploy, não migração,
 * e as chaves ganham tipagem. O único insumo vindo do banco é
 * `user_profile.plan`.
 *
 * Stripe ainda não está integrado — os campos stripe_customer_id e
 * stripe_subscription_id existem no schema, mas nada os preenche. Quando o
 * checkout entrar, só o webhook precisa escrever `plan` aqui.
 */

export type Plan = "free" | "premium";

/** Cotas de fluxo mensal — contadas em usage_counters. */
export type MonthlyFeature = "ai_analysis" | "upload";

export interface PlanLimits {
  /** Cardinalidade: alvos ativos simultâneos. Apagar um libera a vaga. */
  activeContacts: number;
  monthly: Record<MonthlyFeature, number>;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    activeContacts: 1,
    monthly: { ai_analysis: 5, upload: 3 },
  },
  premium: {
    activeContacts: Infinity,
    monthly: { ai_analysis: 100, upload: Infinity },
  },
};

export const FEATURE_LABELS: Record<MonthlyFeature, string> = {
  ai_analysis: "análises de IA",
  upload: "uploads",
};

/** Período do contador: 'YYYY-MM' em UTC. Mês novo = chave nova, sem cron. */
export function currentPeriod(at: Date = new Date()): string {
  return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function limitFor(plan: Plan, feature: MonthlyFeature): number {
  return PLAN_LIMITS[plan].monthly[feature];
}
