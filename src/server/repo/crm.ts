/**
 * Operações de domínio do CRM.
 *
 * Regra central: a lógica de negócio roda AQUI, no servidor. Antes o cliente
 * calculava as métricas em engine.ts e mandava o resultado pronto — qualquer
 * um podia gravar victimScore 100. `engine.ts` é puro, então roda idêntico
 * no Worker sem alteração nenhuma.
 *
 * D1 não tem transação interativa: toda operação com mais de uma escrita usa
 * db.batch(), senão aplica pela metade.
 */

import { and, asc, desc, eq, sql } from "drizzle-orm";

import { applyInteractionImpact } from "@/lib/engine";
import type {
  AppState,
  Contact,
  Interaction,
  LostReason,
  PipelineStage,
  SeducerArchetype,
} from "@/lib/types";

import type { Ctx } from "../guard";
import { newId } from "../guard";
import {
  contacts,
  interactions,
  phaseTransitions,
  userProfile,
} from "../db/schema";
import {
  fromContact,
  fromInteraction,
  toContact,
  toInteraction,
  toTransition,
} from "../mappers";

/** Carga inicial: substitui o loadState() do localStorage. */
export async function loadState(ctx: Ctx): Promise<AppState> {
  const { db, userId } = ctx;

  const [contactRows, interactionRows, transitionRows, profileRows] =
    await db.batch([
      db.select().from(contacts).where(eq(contacts.userId, userId)),
      db
        .select()
        .from(interactions)
        .where(eq(interactions.userId, userId))
        .orderBy(asc(interactions.occurredAt)),
      db
        .select()
        .from(phaseTransitions)
        .where(eq(phaseTransitions.userId, userId))
        .orderBy(asc(phaseTransitions.createdAt)),
      db.select().from(userProfile).where(eq(userProfile.userId, userId)),
    ]);

  const profile = profileRows[0];

  return {
    contacts: contactRows.map(toContact),
    interactions: interactionRows.map(toInteraction),
    phaseHistory: transitionRows.map(toTransition),
    activeContactId: profile?.activeContactId ?? null,
    seducerArchetype: (profile?.seducerArchetype ??
      "charmer") as SeducerArchetype,
  };
}

/** Lista dos contatos do usuário, mais recentes primeiro. */
export async function listContacts(ctx: Ctx): Promise<Contact[]> {
  const rows = await ctx.db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, ctx.userId))
    .orderBy(desc(contacts.updatedAt));
  return rows.map(toContact);
}

export async function getContact(ctx: Ctx, id: string) {
  const rows = await ctx.db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.userId, ctx.userId)));
  return rows[0] ? toContact(rows[0]) : null;
}

export async function countActiveContacts(ctx: Ctx): Promise<number> {
  const [row] = await ctx.db
    .select({ total: sql<number>`count(*)` })
    .from(contacts)
    .where(and(eq(contacts.userId, ctx.userId), eq(contacts.status, "active")));
  return row?.total ?? 0;
}

export interface CreateContactInput {
  contact: Omit<Contact, "id" | "createdAt" | "updatedAt">;
  /**
   * Interações passadas informadas no cadastro. Precisam ser reproduzidas em
   * ordem cronológica no MESMO batch: applyInteractionImpact depende da ordem
   * e do interactionCount, então N inserts independentes dariam outro número.
   */
  pastInteractions?: Array<
    Omit<Interaction, "id" | "contactId" | "mysteryAfter" | "tensionAfter" | "enchantmentAfter">
  >;
}

export async function createContact(
  ctx: Ctx,
  input: CreateContactInput
): Promise<{ contact: Contact; interactions: Interaction[] }> {
  const { db, userId } = ctx;
  const id = newId();
  const nowDate = new Date();

  // Contato base com as métricas iniciais semeadas pelo servidor.
  let contact: Contact = {
    ...input.contact,
    id,
    status: input.contact.status ?? "active",
    mysteryCoefficient: 85,
    tensionLevel: 30,
    enchantmentScore: 0,
    victimScore: 10,
    scarcityScore: 70,
    vulnerabilities: input.contact.vulnerabilities ?? {
      fantasy: 50,
      snobbery: 50,
      loneliness: 50,
      ego: 50,
      adventure: 50,
      rebellion: 50,
    },
    createdAt: nowDate.toISOString(),
    updatedAt: nowDate.toISOString(),
  };

  // Reproduz as interações passadas em ordem, acumulando o impacto.
  const past = [...(input.pastInteractions ?? [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const built: Interaction[] = [];

  past.forEach((raw, index) => {
    const full: Interaction = { ...raw, id: newId(), contactId: id };
    const result = applyInteractionImpact(contact, full, index + 1);
    full.mysteryAfter = result.contact.mysteryCoefficient;
    full.tensionAfter = result.contact.tensionLevel;
    full.enchantmentAfter = result.contact.enchantmentScore;
    contact = result.contact;
    built.push(full);
  });

  const statements = [
    db.insert(contacts).values({
      ...(fromContact(contact) as typeof contacts.$inferInsert),
      id,
      userId,
      createdAt: nowDate,
      updatedAt: nowDate,
    }),
    db.insert(phaseTransitions).values({
      id: newId(),
      userId,
      contactId: id,
      oldPhase: "none",
      newPhase: contact.pipelineStage,
      evidence: "Contato criado",
      createdAt: nowDate,
    }),
    ...built.map((i) =>
      db.insert(interactions).values({
        ...(fromInteraction(i) as typeof interactions.$inferInsert),
        id: i.id,
        userId,
        contactId: id,
      })
    ),
  ] as const;

  await db.batch(statements as unknown as Parameters<typeof db.batch>[0]);

  return { contact, interactions: built };
}

export async function updateContact(
  ctx: Ctx,
  id: string,
  updates: Partial<Contact>
): Promise<Contact | null> {
  const existing = await getContact(ctx, id);
  if (!existing) return null;

  await ctx.db
    .update(contacts)
    .set({ ...fromContact(updates), updatedAt: new Date() })
    .where(and(eq(contacts.id, id), eq(contacts.userId, ctx.userId)));

  return getContact(ctx, id);
}

export async function deleteContact(ctx: Ctx, id: string): Promise<boolean> {
  const existing = await getContact(ctx, id);
  if (!existing) return false;

  // interactions, phase_transitions e system_alerts saem por ON DELETE CASCADE.
  await ctx.db
    .delete(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.userId, ctx.userId)));
  return true;
}

export interface AddInteractionResult {
  interaction: Interaction;
  contact: Contact;
  suggestedProgression?: PipelineStage;
}

export async function addInteraction(
  ctx: Ctx,
  contactId: string,
  raw: Omit<
    Interaction,
    "id" | "contactId" | "mysteryAfter" | "tensionAfter" | "enchantmentAfter"
  >
): Promise<AddInteractionResult | null> {
  const { db, userId } = ctx;

  const contact = await getContact(ctx, contactId);
  if (!contact) return null;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(interactions)
    .where(
      and(eq(interactions.userId, userId), eq(interactions.contactId, contactId))
    );
  const count = (countRow?.total ?? 0) + 1;

  const full: Interaction = { ...raw, id: newId(), contactId };
  const result = applyInteractionImpact(contact, full, count);

  full.mysteryAfter = result.contact.mysteryCoefficient;
  full.tensionAfter = result.contact.tensionLevel;
  full.enchantmentAfter = result.contact.enchantmentScore;

  await db.batch([
    db.insert(interactions).values({
      ...(fromInteraction(full) as typeof interactions.$inferInsert),
      id: full.id,
      userId,
      contactId,
    }),
    db
      .update(contacts)
      .set({ ...fromContact(result.contact), updatedAt: new Date() })
      .where(and(eq(contacts.id, contactId), eq(contacts.userId, userId))),
  ]);

  return {
    interaction: full,
    contact: result.contact,
    suggestedProgression: result.suggestedProgression,
  };
}

export async function updateInteraction(
  ctx: Ctx,
  id: string,
  updates: Partial<Interaction>
): Promise<Interaction | null> {
  const rows = await ctx.db
    .select()
    .from(interactions)
    .where(and(eq(interactions.id, id), eq(interactions.userId, ctx.userId)));
  if (!rows[0]) return null;

  await ctx.db
    .update(interactions)
    .set(fromInteraction(updates))
    .where(and(eq(interactions.id, id), eq(interactions.userId, ctx.userId)));

  const [updated] = await ctx.db
    .select()
    .from(interactions)
    .where(and(eq(interactions.id, id), eq(interactions.userId, ctx.userId)));
  return updated ? toInteraction(updated) : null;
}

export async function deleteInteraction(ctx: Ctx, id: string): Promise<boolean> {
  const rows = await ctx.db
    .select()
    .from(interactions)
    .where(and(eq(interactions.id, id), eq(interactions.userId, ctx.userId)));
  if (!rows[0]) return false;

  await ctx.db
    .delete(interactions)
    .where(and(eq(interactions.id, id), eq(interactions.userId, ctx.userId)));
  return true;
}

/**
 * Uma rota para as cinco transições.
 *
 * manualStageChange, moveToLost, moveToFreezer, markGoalAchieved e
 * reactivateContact faziam exatamente o mesmo par de escritas: inserir em
 * phase_transitions e atualizar o contato. Juntando, sobra um batch só e um
 * único lugar para a regra da evidência.
 */
export type TransitionAction =
  | { action: "stage"; newStage: PipelineStage; evidence: string }
  | { action: "lost"; lostReason: LostReason; evidence: string }
  | { action: "freeze"; evidence: string }
  | { action: "won"; evidence: string }
  | { action: "reactivate"; evidence: string };

export async function changeStage(
  ctx: Ctx,
  contactId: string,
  input: TransitionAction
): Promise<Contact | null> {
  const { db, userId } = ctx;

  const contact = await getContact(ctx, contactId);
  if (!contact) return null;

  const nowDate = new Date();
  let newPhase: string = contact.pipelineStage;
  let updates: Partial<Contact> = {};
  let evidence = input.evidence;
  let lostReason: LostReason | undefined;

  switch (input.action) {
    case "stage":
      newPhase = input.newStage;
      updates = { pipelineStage: input.newStage, status: "active" };
      break;
    case "lost":
      newPhase = "lost";
      lostReason = input.lostReason;
      updates = {
        status: "lost",
        lostReason: input.lostReason,
        lostAt: nowDate.toISOString(),
      };
      break;
    case "freeze":
      evidence = `Geladeira: ${input.evidence}`;
      updates = { status: "frozen" };
      break;
    case "won":
      evidence = `Meta alcançada: ${input.evidence}`;
      updates = {
        status: "won",
        goalAchievedAt: nowDate.toISOString(),
        goalEvidence: input.evidence,
      };
      break;
    case "reactivate":
      newPhase = "engajamento";
      updates = { status: "active", pipelineStage: "engajamento" };
      break;
  }

  // `fromContact` ignora chaves undefined de propósito (é o que permite
  // updates parciais). Para LIMPAR colunas na reativação, o null precisa
  // ser explícito aqui — passar undefined manteria o motivo da perda.
  const clearOnReactivate =
    input.action === "reactivate"
      ? { lostReason: null, lostAt: null, postMortem: null }
      : {};

  await db.batch([
    db.insert(phaseTransitions).values({
      id: newId(),
      userId,
      contactId,
      oldPhase: input.action === "reactivate" ? "lost" : contact.pipelineStage,
      newPhase,
      evidence,
      lostReason: lostReason ?? null,
      createdAt: nowDate,
    }),
    db
      .update(contacts)
      .set({ ...fromContact(updates), ...clearOnReactivate, updatedAt: nowDate })
      .where(and(eq(contacts.id, contactId), eq(contacts.userId, userId))),
  ]);

  return getContact(ctx, contactId);
}
