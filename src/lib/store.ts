import {
  AppState,
  Contact,
  ContactStatus,
  Interaction,
  PhaseTransition,
  PipelineStage,
  LostReason,
} from "./types";
import { applyInteractionImpact } from "./engine";

const STORAGE_KEY = "kissflow_state";

// Migração de IDs antigos de pipeline para os novos
const STAGE_MIGRATION: Record<string, string> = {
  lead_generation: "prospeccao",
  qualification: "qualificado",
  nurturing: "engajamento",
  closing: "fechamento",
  retention: "fechamento", // retention removido; contatos "won" recebem status "won"
};

const DEFAULT_STATE: AppState = {
  contacts: [],
  interactions: [],
  phaseHistory: [],
  activeContactId: null,
  seducerArchetype: "charmer",
};

// ===== Persistência localStorage =====

export function loadState(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as AppState;

    // Backward compat: garantir campos novos existem
    if (!parsed.phaseHistory) parsed.phaseHistory = [];
    parsed.contacts = parsed.contacts.map((c) => ({
      ...c,
      status: (c.status || "active") as ContactStatus,
      pipelineStage: (STAGE_MIGRATION[c.pipelineStage] || c.pipelineStage) as PipelineStage,
    })) as Contact[];

    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ===== Operações CRUD =====

export function createContact(
  data: Omit<
    Contact,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "mysteryCoefficient"
    | "tensionLevel"
    | "enchantmentScore"
    | "victimScore"
    | "scarcityScore"
    | "vulnerabilities"
    | "status"
  >
): Contact {
  const now = new Date().toISOString();
  return {
    ...data,
    id: generateId(),
    status: "active",
    mysteryCoefficient: 85,
    tensionLevel: 30,
    enchantmentScore: 0,
    victimScore: 10,
    scarcityScore: 70,
    vulnerabilities: {
      fantasy: 50,
      snobbery: 50,
      loneliness: 50,
      ego: 50,
      adventure: 50,
      rebellion: 50,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function addContact(state: AppState, contact: Contact): AppState {
  const newState = {
    ...state,
    contacts: [...state.contacts, contact],
    activeContactId: state.activeContactId || contact.id,
  };
  // Registrar transição de fase inicial
  const withTransition = addPhaseTransition(newState, {
    contactId: contact.id,
    oldPhase: "none",
    newPhase: contact.pipelineStage,
    evidence: "Contato criado",
  });
  saveState(withTransition);
  return withTransition;
}

export function updateContact(
  state: AppState,
  contactId: string,
  updates: Partial<Contact>
): AppState {
  const newState = {
    ...state,
    contacts: state.contacts.map((c) =>
      c.id === contactId
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteContact(
  state: AppState,
  contactId: string
): AppState {
  const newState = {
    ...state,
    contacts: state.contacts.filter((c) => c.id !== contactId),
    interactions: state.interactions.filter((i) => i.contactId !== contactId),
    phaseHistory: state.phaseHistory.filter((p) => p.contactId !== contactId),
    activeContactId:
      state.activeContactId === contactId ? null : state.activeContactId,
  };
  saveState(newState);
  return newState;
}

// ===== Interações =====

export interface AddInteractionResult {
  state: AppState;
  suggestedProgression?: PipelineStage;
}

export function addInteraction(
  state: AppState,
  interaction: Omit<
    Interaction,
    "id" | "mysteryAfter" | "tensionAfter" | "enchantmentAfter"
  >
): AddInteractionResult {
  const contact = state.contacts.find((c) => c.id === interaction.contactId);
  if (!contact) return { state };

  const fullInteraction: Interaction = {
    ...interaction,
    id: generateId(),
  };

  // Aplicar impacto nas métricas do contato
  const contactInteractions = state.interactions.filter(i => i.contactId === contact.id);
  const result = applyInteractionImpact(contact, fullInteraction, contactInteractions.length + 1);

  // Salvar snapshot das métricas após interação
  fullInteraction.mysteryAfter = result.contact.mysteryCoefficient;
  fullInteraction.tensionAfter = result.contact.tensionLevel;
  fullInteraction.enchantmentAfter = result.contact.enchantmentScore;

  const newState = {
    ...state,
    contacts: state.contacts.map((c) =>
      c.id === contact.id ? result.contact : c
    ),
    interactions: [...state.interactions, fullInteraction],
  };
  saveState(newState);

  return {
    state: newState,
    suggestedProgression: result.suggestedProgression,
  };
}

export function updateInteraction(
  state: AppState,
  interactionId: string,
  updates: Partial<Omit<Interaction, "id" | "contactId">>
): AppState {
  const newState = {
    ...state,
    interactions: state.interactions.map((i) =>
      i.id === interactionId ? { ...i, ...updates } : i
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteInteraction(
  state: AppState,
  interactionId: string
): AppState {
  const newState = {
    ...state,
    interactions: state.interactions.filter((i) => i.id !== interactionId),
  };
  saveState(newState);
  return newState;
}

// ===== Transições de Fase =====

export function addPhaseTransition(
  state: AppState,
  transition: Omit<PhaseTransition, "id" | "timestamp">
): AppState {
  const fullTransition: PhaseTransition = {
    ...transition,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  const newState = {
    ...state,
    phaseHistory: [...state.phaseHistory, fullTransition],
  };
  saveState(newState);
  return newState;
}

export function manualStageChange(
  state: AppState,
  contactId: string,
  newStage: PipelineStage,
  evidence: string
): AppState {
  const contact = state.contacts.find((c) => c.id === contactId);
  if (!contact) return state;

  const transition: Omit<PhaseTransition, "id" | "timestamp"> = {
    contactId,
    oldPhase: contact.pipelineStage,
    newPhase: newStage,
    evidence,
  };

  let newState = addPhaseTransition(state, transition);
  newState = updateContact(newState, contactId, {
    pipelineStage: newStage,
    status: "active",
  });

  return newState;
}

export function moveToLost(
  state: AppState,
  contactId: string,
  reason: LostReason,
  evidence: string
): AppState {
  const contact = state.contacts.find((c) => c.id === contactId);
  if (!contact) return state;

  const transition: Omit<PhaseTransition, "id" | "timestamp"> = {
    contactId,
    oldPhase: contact.pipelineStage,
    newPhase: "lost",
    evidence,
    lostReason: reason,
  };

  let newState = addPhaseTransition(state, transition);
  newState = updateContact(newState, contactId, {
    status: "lost",
    lostReason: reason,
    lostAt: new Date().toISOString(),
  });

  return newState;
}

export function moveToFreezer(
  state: AppState,
  contactId: string,
  evidence: string
): AppState {
  const contact = state.contacts.find((c) => c.id === contactId);
  if (!contact) return state;

  const transition: Omit<PhaseTransition, "id" | "timestamp"> = {
    contactId,
    oldPhase: contact.pipelineStage,
    newPhase: contact.pipelineStage,
    evidence: `Geladeira: ${evidence}`,
  };

  let newState = addPhaseTransition(state, transition);
  newState = updateContact(newState, contactId, {
    status: "frozen",
  });

  return newState;
}

export function markGoalAchieved(state: AppState, contactId: string, evidence: string): AppState {
  const contact = state.contacts.find(c => c.id === contactId);
  if (!contact) return state;

  const transition: Omit<PhaseTransition, "id" | "timestamp"> = {
    contactId,
    oldPhase: contact.pipelineStage,
    newPhase: contact.pipelineStage,
    evidence: `Meta alcançada: ${evidence}`,
  };

  let newState = addPhaseTransition(state, transition);
  newState = updateContact(newState, contactId, {
    status: "won",
    goalAchievedAt: new Date().toISOString(),
    goalEvidence: evidence,
  });
  return newState;
}

export function reactivateContact(
  state: AppState,
  contactId: string,
  evidence: string
): AppState {
  const contact = state.contacts.find((c) => c.id === contactId);
  if (!contact) return state;

  const transition: Omit<PhaseTransition, "id" | "timestamp"> = {
    contactId,
    oldPhase: "lost",
    newPhase: "engajamento",
    evidence,
  };

  let newState = addPhaseTransition(state, transition);
  newState = updateContact(newState, contactId, {
    status: "active",
    pipelineStage: "engajamento",
    lostReason: undefined,
    lostAt: undefined,
    postMortem: undefined,
  });

  return newState;
}

// ===== Consultas =====

export function setActiveContact(
  state: AppState,
  contactId: string | null
): AppState {
  const newState = { ...state, activeContactId: contactId };
  saveState(newState);
  return newState;
}

export function getContactInteractions(
  state: AppState,
  contactId: string
): Interaction[] {
  return state.interactions
    .filter((i) => i.contactId === contactId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getContactPhaseHistory(
  state: AppState,
  contactId: string
): PhaseTransition[] {
  return state.phaseHistory
    .filter((p) => p.contactId === contactId)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

// ===== Utils =====

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
