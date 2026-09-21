/**
 * Fronteira linha ⇄ domínio.
 *
 * Este é o arquivo mais carregado da migração: é ele que permite que
 * `src/lib/types.ts` e os quatro motores puros (engine, analytics,
 * user-scoring, alerts-engine) continuem exatamente como estão.
 *
 * Duas traduções acontecem aqui:
 * - timestamps: Date (epoch ms no D1) ⇄ string ISO (o que o domínio espera)
 * - vulnerabilidades: 6 colunas ⇄ objeto aninhado
 *
 * Alguns nomes também divergem de propósito, porque o nome no banco é mais
 * explícito que o do domínio: `occurred_at` ⇄ `date`, `duration_minutes` ⇄
 * `duration`, `phase_transitions.created_at` ⇄ `timestamp`.
 */

import type {
  Contact,
  Interaction,
  InteractionCategory,
  InteractionTypeId,
  LoveLanguage,
  LostReason,
  PhaseTransition,
  PipelineStage,
  VictimType,
} from "@/lib/types";

import type { contacts, interactions, phaseTransitions } from "./db/schema";

type ContactRow = typeof contacts.$inferSelect;
type InteractionRow = typeof interactions.$inferSelect;
type TransitionRow = typeof phaseTransitions.$inferSelect;

const iso = (d: Date | null | undefined): string | undefined =>
  d ? d.toISOString() : undefined;

export function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    avatarUrl: row.avatarUrl ?? undefined,
    phone: row.phone ?? undefined,
    primaryArchetype: row.primaryArchetype as VictimType,
    secondaryArchetype: (row.secondaryArchetype as VictimType) ?? undefined,
    loveLanguage: (row.loveLanguage as LoveLanguage) ?? undefined,
    pipelineStage: row.pipelineStage as PipelineStage,
    status: row.status,
    closingGoal: row.closingGoal ?? undefined,
    lostReason: (row.lostReason as LostReason) ?? undefined,
    lostAt: iso(row.lostAt),
    postMortem: row.postMortem ?? undefined,
    goalAchievedAt: iso(row.goalAchievedAt),
    goalEvidence: row.goalEvidence ?? undefined,
    notes: row.notes,
    mysteryCoefficient: row.mysteryCoefficient,
    tensionLevel: row.tensionLevel,
    enchantmentScore: row.enchantmentScore,
    victimScore: row.victimScore,
    scarcityScore: row.scarcityScore,
    vulnerabilities: {
      fantasy: row.vulnFantasy,
      snobbery: row.vulnSnobbery,
      loneliness: row.vulnLoneliness,
      ego: row.vulnEgo,
      adventure: row.vulnAdventure,
      rebellion: row.vulnRebellion,
    },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Campos do domínio → colunas. Parcial: serve para insert e update. */
export function fromContact(
  c: Partial<Contact>
): Partial<typeof contacts.$inferInsert> {
  const out: Partial<typeof contacts.$inferInsert> = {};

  if (c.firstName !== undefined) out.firstName = c.firstName;
  if (c.lastName !== undefined) out.lastName = c.lastName;
  if (c.avatarUrl !== undefined) out.avatarUrl = c.avatarUrl ?? null;
  if (c.phone !== undefined) out.phone = c.phone ?? null;
  if (c.primaryArchetype !== undefined) out.primaryArchetype = c.primaryArchetype;
  if (c.secondaryArchetype !== undefined)
    out.secondaryArchetype = c.secondaryArchetype ?? null;
  if (c.loveLanguage !== undefined) out.loveLanguage = c.loveLanguage ?? null;
  if (c.pipelineStage !== undefined) out.pipelineStage = c.pipelineStage;
  if (c.status !== undefined) out.status = c.status;
  if (c.closingGoal !== undefined) out.closingGoal = c.closingGoal ?? null;
  if (c.lostReason !== undefined) out.lostReason = c.lostReason ?? null;
  if (c.lostAt !== undefined) out.lostAt = c.lostAt ? new Date(c.lostAt) : null;
  if (c.postMortem !== undefined) out.postMortem = c.postMortem ?? null;
  if (c.goalAchievedAt !== undefined)
    out.goalAchievedAt = c.goalAchievedAt ? new Date(c.goalAchievedAt) : null;
  if (c.goalEvidence !== undefined) out.goalEvidence = c.goalEvidence ?? null;
  if (c.notes !== undefined) out.notes = c.notes;

  if (c.mysteryCoefficient !== undefined)
    out.mysteryCoefficient = c.mysteryCoefficient;
  if (c.tensionLevel !== undefined) out.tensionLevel = c.tensionLevel;
  if (c.enchantmentScore !== undefined) out.enchantmentScore = c.enchantmentScore;
  if (c.victimScore !== undefined) out.victimScore = c.victimScore;
  if (c.scarcityScore !== undefined) out.scarcityScore = c.scarcityScore;

  if (c.vulnerabilities) {
    out.vulnFantasy = c.vulnerabilities.fantasy;
    out.vulnSnobbery = c.vulnerabilities.snobbery;
    out.vulnLoneliness = c.vulnerabilities.loneliness;
    out.vulnEgo = c.vulnerabilities.ego;
    out.vulnAdventure = c.vulnerabilities.adventure;
    out.vulnRebellion = c.vulnerabilities.rebellion;
  }

  return out;
}

export function toInteraction(row: InteractionRow): Interaction {
  return {
    id: row.id,
    contactId: row.contactId,
    typeId: row.typeId as InteractionTypeId,
    category: row.category as InteractionCategory,
    sentiment: row.sentiment,
    date: row.occurredAt.toISOString(),
    notes: row.notes,
    initiatedByTarget: row.initiatedByTarget,
    duration: row.durationMinutes ?? undefined,
    location: row.location ?? undefined,
    mysteryAfter: row.mysteryAfter ?? undefined,
    tensionAfter: row.tensionAfter ?? undefined,
    enchantmentAfter: row.enchantmentAfter ?? undefined,
  };
}

export function fromInteraction(
  i: Partial<Interaction>
): Partial<typeof interactions.$inferInsert> {
  const out: Partial<typeof interactions.$inferInsert> = {};

  if (i.contactId !== undefined) out.contactId = i.contactId;
  if (i.typeId !== undefined) out.typeId = i.typeId;
  if (i.category !== undefined) out.category = i.category;
  if (i.sentiment !== undefined) out.sentiment = i.sentiment;
  if (i.date !== undefined) out.occurredAt = new Date(i.date);
  if (i.notes !== undefined) out.notes = i.notes;
  if (i.initiatedByTarget !== undefined)
    out.initiatedByTarget = i.initiatedByTarget;
  if (i.duration !== undefined) out.durationMinutes = i.duration ?? null;
  if (i.location !== undefined) out.location = i.location ?? null;
  if (i.mysteryAfter !== undefined) out.mysteryAfter = i.mysteryAfter ?? null;
  if (i.tensionAfter !== undefined) out.tensionAfter = i.tensionAfter ?? null;
  if (i.enchantmentAfter !== undefined)
    out.enchantmentAfter = i.enchantmentAfter ?? null;

  return out;
}

export function toTransition(row: TransitionRow): PhaseTransition {
  return {
    id: row.id,
    contactId: row.contactId,
    oldPhase: row.oldPhase as PhaseTransition["oldPhase"],
    newPhase: row.newPhase as PhaseTransition["newPhase"],
    evidence: row.evidence,
    lostReason: (row.lostReason as LostReason) ?? undefined,
    timestamp: row.createdAt.toISOString(),
  };
}
