import { z } from "zod";

const PIPELINE = [
  "prospeccao",
  "qualificado",
  "engajamento",
  "agendamento",
  "fechamento",
] as const;

const CATEGORY = [
  "digital_passive",
  "digital_active",
  "presencial_casual",
  "presencial_intimate",
  "strategic",
] as const;

const LOST_REASON = ["desistencia", "rejeicao", "sucesso_efemero"] as const;

export const vulnerabilitiesSchema = z.object({
  fantasy: z.number().min(0).max(100),
  snobbery: z.number().min(0).max(100),
  loneliness: z.number().min(0).max(100),
  ego: z.number().min(0).max(100),
  adventure: z.number().min(0).max(100),
  rebellion: z.number().min(0).max(100),
});

/** Interação sem os campos que o SERVIDOR calcula (id e snapshots). */
export const interactionInputSchema = z.object({
  typeId: z.string().min(1),
  category: z.enum(CATEGORY),
  sentiment: z.number().min(-1).max(1),
  date: z.iso.datetime(),
  notes: z.string().default(""),
  initiatedByTarget: z.boolean().default(false),
  duration: z.number().int().positive().optional(),
  location: z.string().optional(),
});

export const createContactSchema = z.object({
  contact: z.object({
    firstName: z.string().min(1, "Nome é obrigatório"),
    lastName: z.string().default(""),
    avatarUrl: z.string().optional(),
    phone: z.string().optional(),
    primaryArchetype: z.string().min(1),
    secondaryArchetype: z.string().optional(),
    loveLanguage: z.enum(["words", "gifts", "acts", "time", "touch"]).optional(),
    pipelineStage: z.enum(PIPELINE),
    closingGoal: z.string().optional(),
    notes: z.string().default(""),
    vulnerabilities: vulnerabilitiesSchema.optional(),
  }),
  pastInteractions: z.array(interactionInputSchema).optional(),
});

/**
 * Update de contato. Métricas NÃO entram de propósito: quem as calcula é o
 * engine no servidor. Aceitá-las aqui deixaria o cliente gravar
 * victimScore 100 — que é exatamente o buraco que a migração fecha.
 */
export const updateContactSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  primaryArchetype: z.string().optional(),
  secondaryArchetype: z.string().nullable().optional(),
  loveLanguage: z
    .enum(["words", "gifts", "acts", "time", "touch"])
    .nullable()
    .optional(),
  closingGoal: z.string().nullable().optional(),
  notes: z.string().optional(),
  postMortem: z.string().optional(),
  vulnerabilities: vulnerabilitiesSchema.optional(),
});

export const updateInteractionSchema = interactionInputSchema.partial();

/** A regra da evidência vivia duplicada em três telas. Agora é uma só. */
const evidence = z.string().min(10, "Descreva a evidência (mín. 10 caracteres)");

export const transitionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("stage"), newStage: z.enum(PIPELINE), evidence }),
  z.object({ action: z.literal("lost"), lostReason: z.enum(LOST_REASON), evidence }),
  z.object({ action: z.literal("freeze"), evidence }),
  z.object({ action: z.literal("won"), evidence }),
  z.object({ action: z.literal("reactivate"), evidence }),
]);

export const updateProfileSchema = z.object({
  displayName: z.string().nullable().optional(),
  city: z.string().max(80).nullable().optional(),
  relationshipGoal: z.string().max(40).nullable().optional(),
  loveLanguage: z
    .enum(["words", "gifts", "acts", "time", "touch"])
    .nullable()
    .optional(),
  bio: z.string().max(500).nullable().optional(),
  gender: z.string().nullable().optional(),
  orientation: z.string().nullable().optional(),
  ageRange: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  seducerArchetype: z.string().optional(),
  activeContactId: z.string().nullable().optional(),
  onboardingCompleted: z.boolean().optional(),
});
