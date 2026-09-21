/**
 * Schema D1 (SQLite) — fonte da verdade do banco do Kiss Flow.
 *
 * Convenções:
 * - Propriedades TS em camelCase, colunas SQL em snake_case. As tabelas do
 *   Better Auth dependem disso: o adapter procura os campos pelo NOME DA
 *   PROPRIEDADE (camelCase), não pelo nome da coluna.
 * - Timestamps: INTEGER epoch ms (`timestamp_ms`). A API converte para ISO
 *   na fronteira, então `src/lib/types.ts` e os motores puros não mudam.
 * - Métricas 0-100: REAL, não INTEGER. O engine.ts arredonda para UMA casa
 *   decimal; INTEGER truncaria e deslocaria todos os limiares de progressão.
 * - CHECK só em enums estáveis. Nada de CHECK em `typeId` (33 valores, o
 *   conjunto mais volátil) nem em `closingGoal` (aceita texto livre).
 * - Multi-tenancy é responsabilidade da aplicação: D1 não tem RLS. Todo
 *   índice composto começa por userId, e userId nunca vem do corpo da request.
 */

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch('subsecond') * 1000)`;

/* ────────────────────────────────────────────────────────────────
 * BETTER AUTH
 * Formato exigido pelo adapter Drizzle do Better Auth.
 * ──────────────────────────────────────────────────────────────── */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(now),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [
    index("session_user_idx").on(t.userId),
    index("session_expires_idx").on(t.expiresAt),
  ]
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    /**
     * Exigido pelo Better Auth a partir da 1.7. Sem ele o cadastro falha em
     * tempo de execução ("The field issuer does not exist"), e o typecheck
     * não acusa — o adapter resolve os campos por nome, não por tipo.
     */
    issuer: text("issuer").notNull().default(""),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [
    index("account_user_idx").on(t.userId),
    uniqueIndex("account_provider_idx").on(t.issuer, t.accountId),
  ]
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
);

/* ────────────────────────────────────────────────────────────────
 * PERFIL DO USUÁRIO
 * 1:1 com `user`. Separado para manter o objeto de sessão do Better
 * Auth (e o cookie cache) pequeno.
 * ──────────────────────────────────────────────────────────────── */

export const userProfile = sqliteTable("user_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),

  displayName: text("display_name"),
  gender: text("gender"),
  orientation: text("orientation"),
  ageRange: text("age_range"),
  avatarUrl: text("avatar_url"),

  // Cidade alimenta o alerta de proximidade (duas pessoas na mesma cidade).
  city: text("city"),
  // O que a pessoa busca — muda o TOM das sugestões, não só o conteúdo.
  relationshipGoal: text("relationship_goal"),
  // Como ela própria recebe afeto; ajuda a IA a calibrar o que sugerir.
  loveLanguage: text("love_language", {
    enum: ["words", "gifts", "acts", "time", "touch"],
  }),
  bio: text("bio"),

  // Vinha de DUAS fontes que já estavam dessincronizadas:
  // AppState.seducerArchetype (localStorage) e user_profiles (Supabase).
  seducerArchetype: text("seducer_archetype").notNull().default("charmer"),

  // Era AppState.activeContactId. Sem FK: o alvo pode ser apagado e a
  // limpeza é feita na aplicação (evita ciclo de FK com contacts).
  activeContactId: text("active_contact_id"),

  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" })
    .notNull()
    .default(false),

  // Stripe: campos preparados, ainda não usados por nenhuma integração.
  plan: text("plan", { enum: ["free", "premium"] })
    .notNull()
    .default("free"),
  planExpiresAt: integer("plan_expires_at", { mode: "timestamp_ms" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(now),
});

export const onboardingAnswer = sqliteTable(
  "onboarding_answer",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    questionKey: text("question_key").notNull(),
    answerValue: text("answer_value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [index("onboarding_answer_user_idx").on(t.userId)]
);

/* ────────────────────────────────────────────────────────────────
 * DOMÍNIO — antes tudo isto vivia na chave `kissflow_state` do
 * localStorage, por dispositivo e sem dono.
 * ──────────────────────────────────────────────────────────────── */

export const contacts = sqliteTable(
  "contacts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull().default(""),
    avatarUrl: text("avatar_url"),
    phone: text("phone"),

    primaryArchetype: text("primary_archetype").notNull(),
    secondaryArchetype: text("secondary_archetype"),
    loveLanguage: text("love_language", {
      enum: ["words", "gifts", "acts", "time", "touch"],
    }),

    pipelineStage: text("pipeline_stage", {
      enum: [
        "prospeccao",
        "qualificado",
        "engajamento",
        "agendamento",
        "fechamento",
      ],
    }).notNull(),

    status: text("status", { enum: ["active", "lost", "won", "frozen"] })
      .notNull()
      .default("active"),

    // Sem enum: aceita texto livre quando o preset escolhido é "outro".
    closingGoal: text("closing_goal"),

    lostReason: text("lost_reason", {
      enum: ["desistencia", "rejeicao", "sucesso_efemero"],
    }),
    lostAt: integer("lost_at", { mode: "timestamp_ms" }),
    postMortem: text("post_mortem"),
    goalAchievedAt: integer("goal_achieved_at", { mode: "timestamp_ms" }),
    goalEvidence: text("goal_evidence"),
    notes: text("notes").notNull().default(""),

    // REAL, não INTEGER — o engine arredonda para 1 casa decimal.
    mysteryCoefficient: real("mystery_coefficient").notNull().default(85),
    tensionLevel: real("tension_level").notNull().default(30),
    enchantmentScore: real("enchantment_score").notNull().default(0), // -1..1
    victimScore: real("victim_score").notNull().default(10), // "Receptividade" na UI
    scarcityScore: real("scarcity_score").notNull().default(70),

    // 6 colunas em vez de JSON: conjunto fechado, nunca estendido em runtime.
    vulnFantasy: integer("vuln_fantasy").notNull().default(50),
    vulnSnobbery: integer("vuln_snobbery").notNull().default(50),
    vulnLoneliness: integer("vuln_loneliness").notNull().default(50),
    vulnEgo: integer("vuln_ego").notNull().default(50),
    vulnAdventure: integer("vuln_adventure").notNull().default(50),
    vulnRebellion: integer("vuln_rebellion").notNull().default(50),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [
    // kanban, funil e ActiveContacts
    index("contacts_user_status_stage_idx").on(
      t.userId,
      t.status,
      t.pipelineStage
    ),
    index("contacts_user_updated_idx").on(t.userId, t.updatedAt),
  ]
);

export const interactions = sqliteTable(
  "interactions",
  {
    id: text("id").primaryKey(),
    // Desnormalizado de propósito: permite filtrar por dono sem join.
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contactId: text("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),

    // Sem enum: 33 valores em INTERACTION_CATEGORIES, o conjunto que mais muda.
    typeId: text("type_id").notNull(),
    category: text("category", {
      enum: [
        "digital_passive",
        "digital_active",
        "presencial_casual",
        "presencial_intimate",
        "strategic",
      ],
    }).notNull(),

    sentiment: real("sentiment").notNull().default(0), // -1..1
    // Vem do usuário. Guardar como epoch ms de meia-noite LOCAL — ver nota
    // de fuso em mappers.ts.
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull(),
    notes: text("notes").notNull().default(""),
    initiatedByTarget: integer("initiated_by_target", { mode: "boolean" })
      .notNull()
      .default(false),
    durationMinutes: integer("duration_minutes"),
    location: text("location"),

    // Snapshot das métricas depois desta interação.
    mysteryAfter: real("mystery_after"),
    tensionAfter: real("tension_after"),
    enchantmentAfter: real("enchantment_after"),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [
    index("interactions_user_contact_date_idx").on(
      t.userId,
      t.contactId,
      t.occurredAt
    ),
    index("interactions_user_date_idx").on(t.userId, t.occurredAt),
  ]
);

/**
 * Nunca existiu em banco nenhum — nem no Supabase — apesar de ser entidade
 * de primeira classe, com modal obrigatório e UI de histórico.
 */
export const phaseTransitions = sqliteTable(
  "phase_transitions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contactId: text("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    // Aceita também 'none' e 'lost' — ver PipelineStage em types.ts.
    oldPhase: text("old_phase").notNull(),
    newPhase: text("new_phase").notNull(),
    evidence: text("evidence").notNull(),
    lostReason: text("lost_reason", {
      enum: ["desistencia", "rejeicao", "sucesso_efemero"],
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [
    index("transitions_user_contact_idx").on(t.userId, t.contactId, t.createdAt),
    index("transitions_user_created_idx").on(t.userId, t.createdAt),
  ]
);

/**
 * Dá casa ao código de persistência que já existe em alerts-engine.ts
 * e nunca foi chamado. O índice único é exigido pelo upsert de lá.
 */
export const systemAlerts = sqliteTable(
  "system_alerts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contactId: text("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    alertType: text("alert_type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priority: text("priority", {
      enum: ["low", "medium", "high", "critical"],
    }).notNull(),
    actionSuggested: text("action_suggested"),
    tacticNumber: integer("tactic_number"),
    tacticName: text("tactic_name"),
    metricsContext: text("metrics_context"), // JSON opaco
    dismissed: integer("dismissed", { mode: "boolean" }).notNull().default(false),
    executed: integer("executed", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [
    uniqueIndex("alerts_dedupe_idx").on(t.userId, t.contactId, t.alertType),
    index("alerts_user_active_idx").on(t.userId, t.dismissed, t.createdAt),
  ]
);

/* ────────────────────────────────────────────────────────────────
 * TRAÇOS OBSERVADOS DO ALVO
 *
 * As seis vulnerabilidades viviam como colunas fixas em `contacts`, com
 * valor 50 por padrão — e NADA jamais as atualizava. O radar mostrava um
 * hexágono cheio em 50% que parecia medição e era só o padrão do sistema.
 *
 * Aqui cada eixo passa a ser um registro com procedência, exatamente o que o
 * contrato de dados do Gate 0 exige de atributo derivado: "Origem, timestamp,
 * confiança, correção e exclusão individual".
 *
 * Eixo sem linha nesta tabela significa NÃO MEDIDO, e a interface mostra
 * lacuna — não meio-termo.
 * ──────────────────────────────────────────────────────────────── */

export const contactTraits = sqliteTable(
  "contact_traits",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contactId: text("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),

    // fantasy | snobbery | loneliness | ego | adventure | rebellion
    axis: text("axis").notNull(),
    value: integer("value").notNull(), // 0-100

    /**
     * De onde veio o número. `declarado` é o usuário afirmando; `inferido` é
     * a IA lendo as notas das interações. Inferência NUNCA sobrescreve o que
     * foi declarado — vira sugestão pendente até o usuário aceitar.
     */
    source: text("source", { enum: ["declarado", "inferido"] }).notNull(),

    /** 0..1. Declaração do usuário entra como 1. */
    confidence: real("confidence").notNull().default(1),

    /** Em que a inferência se baseou, para o usuário poder discordar. */
    evidence: text("evidence"),

    /** Quantas interações existiam quando foi medido — envelhece o dado. */
    observedAt: integer("observed_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.contactId, t.axis] }),
    index("traits_user_contact_idx").on(t.userId, t.contactId),
  ]
);

/* ────────────────────────────────────────────────────────────────
 * MÍDIA (R2)
 * ──────────────────────────────────────────────────────────────── */

export const mediaUploads = sqliteTable(
  "media_uploads",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contactId: text("contact_id").references(() => contacts.id, {
      onDelete: "cascade",
    }),
    // Chave do objeto no bucket. A cascata do banco NÃO alcança o R2 —
    // a exclusão dos objetos é feita explicitamente na aplicação.
    r2Key: text("r2_key").notNull().unique(),
    kind: text("kind", {
      enum: ["avatar_user", "avatar_contact"],
    }).notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [index("media_user_created_idx").on(t.userId, t.createdAt)]
);

/* ────────────────────────────────────────────────────────────────
 * USO E COTAS
 * ──────────────────────────────────────────────────────────────── */

/**
 * O portão. Uma reserva atômica por requisição (INSERT ... ON CONFLICT
 * DO UPDATE ... WHERE count < limite), porque D1 não tem transação
 * interativa e um SELECT seguido de UPDATE correria risco de corrida.
 *
 * Não há reset nem cron: mês novo é chave nova, criada preguiçosamente.
 */
export const usageCounters = sqliteTable(
  "usage_counters",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    period: text("period").notNull(), // 'YYYY-MM' em UTC
    feature: text("feature").notNull(), // 'ai_analysis' | 'upload'
    count: integer("count").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [primaryKey({ columns: [t.userId, t.period, t.feature] })]
);

/** Append-only. Analítico, não é trilha de auditoria. */
export const usageEvents = sqliteTable(
  "usage_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contactId: text("contact_id"),
    feature: text("feature").notNull(), // bucket grosso, casa com usageCounters
    featureDetail: text("feature_detail").notNull(), // rota exata
    model: text("model"),
    tokensIn: integer("tokens_in"),
    tokensOut: integer("tokens_out"),
    latencyMs: integer("latency_ms"),
    status: text("status", { enum: ["ok", "error", "blocked"] })
      .notNull()
      .default("ok"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [index("usage_events_user_created_idx").on(t.userId, t.createdAt)]
);

/* ────────────────────────────────────────────────────────────────
 * LGPD — base pronta. As páginas de Termos/Privacidade e o fluxo de
 * aceite entram quando for lançar; a tabela existe desde já porque
 * consentimento é caro de retrofitar depois que já há dado.
 * ──────────────────────────────────────────────────────────────── */

export const userConsents = sqliteTable(
  "user_consents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: text("kind", {
      enum: ["terms", "privacy", "sensitive_data"],
    }).notNull(),
    termsVersion: text("terms_version").notNull(),
    grantedAt: integer("granted_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (t) => [index("consents_user_kind_idx").on(t.userId, t.kind)]
);

/* ────────────────────────────────────────────────────────────────
 * CARTEIRA DE CRÉDITOS DE IA & TRANSAÇÕES
 * ──────────────────────────────────────────────────────────────── */

export const aiCreditWallets = sqliteTable("ai_credit_wallets", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0), // Saldo disponível em créditos
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(now),
});

export const aiCreditTransactions = sqliteTable(
  "ai_credit_transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // + compra/bônus, - consumo
    reason: text("reason", {
      enum: ["purchase", "consumption", "bonus", "refund"],
    }).notNull(),
    referenceId: text("reference_id"), // ID da análise ou transação de pagamento
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [
    index("credit_tx_user_created_idx").on(t.userId, t.createdAt),
    /**
     * Idempotência do webhook da loja. A RevenueCat reentrega o mesmo evento
     * quando não recebe 2xx; sem esta trava, um retry creditaria de novo.
     *
     * Parcial de propósito: 'consumption' repete o referenceId (é o id da
     * pessoa analisada), então só as entradas de crédito são únicas.
     */
    uniqueIndex("credit_tx_grant_ref_idx")
      .on(t.referenceId)
      .where(
        sql`${t.reason} in ('purchase','bonus','refund') and ${t.referenceId} is not null`
      ),
  ]
);

/* ────────────────────────────────────────────────────────────────
 * BASE DE CONHECIMENTO (RAG ESTRATÉGICO)
 * ──────────────────────────────────────────────────────────────── */

export const knowledgeBase = sqliteTable(
  "knowledge_base",
  {
    id: text("id").primaryKey(),
    category: text("category", {
      enum: [
        "escuta",
        "clareza",
        "reciprocidade",
        "limites",
        "timing",
        "desapego",
        "empatia",
        "gestao_emocional",
        "escalada",
        "conflito",
      ],
    }).notNull(),
    principleTitle: text("principle_title").notNull(),
    content: text("content").notNull(),
    tacticalTip: text("tactical_tip").notNull(),
    riskLevel: text("risk_level", { enum: ["baixo", "moderado", "alto"] })
      .notNull()
      .default("baixo"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(now),
  },
  (t) => [index("knowledge_category_idx").on(t.category)]
);

export const schema = {
  user,
  session,
  account,
  verification,
  userProfile,
  onboardingAnswer,
  contacts,
  interactions,
  phaseTransitions,
  systemAlerts,
  contactTraits,
  mediaUploads,
  usageCounters,
  usageEvents,
  userConsents,
  aiCreditWallets,
  aiCreditTransactions,
  knowledgeBase,
};
