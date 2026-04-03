import { AppState, Contact, Interaction } from "./types";
import { applyInteractionImpact } from "./engine";

const STORAGE_KEY = "kissflow_state";

const DEFAULT_STATE: AppState = {
  contacts: [],
  interactions: [],
  activeContactId: null,
  seducerArchetype: "charmer",
};

// ===== Persistencia localStorage =====

export function loadState(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw) as AppState;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ===== Operacoes CRUD =====

export function createContact(data: Omit<Contact, "id" | "createdAt" | "updatedAt" | "mysteryCoefficient" | "tensionLevel" | "enchantmentScore" | "victimScore" | "scarcityScore" | "vulnerabilities">): Contact {
  const now = new Date().toISOString();
  return {
    ...data,
    id: generateId(),
    mysteryCoefficient: 85, // comeca misterioso
    tensionLevel: 30,       // tensao baixa no inicio
    enchantmentScore: 0,    // neutro
    victimScore: 10,        // baixo, precisa construir
    scarcityScore: 70,      // comeca escasso
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
  saveState(newState);
  return newState;
}

export function updateContact(state: AppState, contactId: string, updates: Partial<Contact>): AppState {
  const newState = {
    ...state,
    contacts: state.contacts.map((c) =>
      c.id === contactId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteContact(state: AppState, contactId: string): AppState {
  const newState = {
    ...state,
    contacts: state.contacts.filter((c) => c.id !== contactId),
    interactions: state.interactions.filter((i) => i.contactId !== contactId),
    activeContactId: state.activeContactId === contactId ? null : state.activeContactId,
  };
  saveState(newState);
  return newState;
}

export function addInteraction(
  state: AppState,
  interaction: Omit<Interaction, "id" | "mysteryAfter" | "tensionAfter" | "enchantmentAfter">
): AppState {
  const contact = state.contacts.find((c) => c.id === interaction.contactId);
  if (!contact) return state;

  const fullInteraction: Interaction = {
    ...interaction,
    id: generateId(),
  };

  // Aplicar impacto nas metricas do contato
  const updatedContact = applyInteractionImpact(contact, fullInteraction);

  // Salvar snapshot das metricas apos interacao
  fullInteraction.mysteryAfter = updatedContact.mysteryCoefficient;
  fullInteraction.tensionAfter = updatedContact.tensionLevel;
  fullInteraction.enchantmentAfter = updatedContact.enchantmentScore;

  const newState = {
    ...state,
    contacts: state.contacts.map((c) => (c.id === contact.id ? updatedContact : c)),
    interactions: [...state.interactions, fullInteraction],
  };
  saveState(newState);
  return newState;
}

export function setActiveContact(state: AppState, contactId: string | null): AppState {
  const newState = { ...state, activeContactId: contactId };
  saveState(newState);
  return newState;
}

export function getContactInteractions(state: AppState, contactId: string): Interaction[] {
  return state.interactions
    .filter((i) => i.contactId === contactId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ===== Utils =====

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
