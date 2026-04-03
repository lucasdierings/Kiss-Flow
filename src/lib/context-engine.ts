// Motor de contexto por alvo
// Armazena e atualiza resumos estruturados para cada contato

const CONTEXT_KEY = "kissflow_contexts";

export interface ContactContext {
  contactId: string;
  summary: string;
  keyFacts: string[];
  communicationStyle: string;
  lastTopics: string[];
  emotionalState: string;
  updatedAt: string;
}

export function loadContexts(): Record<string, ContactContext> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getContactContext(contactId: string): ContactContext | null {
  const contexts = loadContexts();
  return contexts[contactId] || null;
}

export function saveContactContext(context: ContactContext): void {
  const contexts = loadContexts();
  contexts[context.contactId] = {
    ...context,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONTEXT_KEY, JSON.stringify(contexts));
}

export function deleteContactContext(contactId: string): void {
  const contexts = loadContexts();
  delete contexts[contactId];
  localStorage.setItem(CONTEXT_KEY, JSON.stringify(contexts));
}

export function buildContextPromptSection(context: ContactContext): string {
  const parts: string[] = [];

  if (context.summary) {
    parts.push(`RESUMO DA SITUAÇÃO ATUAL: ${context.summary}`);
  }

  if (context.keyFacts.length > 0) {
    parts.push(`FATOS IMPORTANTES SOBRE O ALVO:\n${context.keyFacts.map((f) => `- ${f}`).join("\n")}`);
  }

  if (context.communicationStyle) {
    parts.push(`ESTILO DE COMUNICAÇÃO DO ALVO: ${context.communicationStyle}`);
  }

  if (context.lastTopics.length > 0) {
    parts.push(`ÚLTIMOS ASSUNTOS DISCUTIDOS: ${context.lastTopics.join(", ")}`);
  }

  if (context.emotionalState) {
    parts.push(`ESTADO EMOCIONAL ATUAL PERCEBIDO: ${context.emotionalState}`);
  }

  if (parts.length === 0) return "";

  return `\n\nMEMÓRIA DE CONTEXTO (informações coletadas em conversas anteriores):\n${parts.join("\n\n")}

IMPORTANTE: Use estas informações para personalizar suas respostas e sugestões. Faça referência a fatos que você "lembra" naturalmente, como um estrategista que acompanha o caso de perto.`;
}
