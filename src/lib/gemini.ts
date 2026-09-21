import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

/**
 * Cliente do Gemini.
 *
 * Construído POR REQUISIÇÃO. A versão anterior fazia
 * `new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")` no escopo do
 * módulo — mesma armadilha descrita em src/server/db/client.ts. No Worker o
 * módulo é avaliado no cold start, quando as variáveis do Cloudflare ainda
 * não estão em `process.env`; o cliente nascia com chave vazia e toda chamada
 * falhava. Era o motivo de a rota responder 503 com a chave configurada.
 */

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

async function geminiKey(): Promise<string> {
  const { env } = await getCloudflareContext({ async: true });
  return env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
}

/** Permite recusar a requisição antes de cobrar cota do usuário. */
export async function isAiConfigured(): Promise<boolean> {
  return (await geminiKey()).length > 0;
}

/**
 * Cadeia de modelos, tentada em ordem.
 *
 * Duas lições medidas neste projeto:
 *
 * 1. Versão fixa apodrece. O código estava preso em "gemini-2.0-flash", que o
 *    Google aposentou; a API passou a responder 404 e a rota quebrou sem
 *    ninguém mexer numa linha.
 * 2. Um nome só não basta. Medindo 4 chamadas por modelo com faturamento
 *    ativo: gemini-flash-latest 2/4, gemini-3.5-flash 0/4,
 *    gemini-3-flash-preview 4/4, gemini-3.1-flash-lite 3/4. O 503 de
 *    capacidade não é raro, e não atinge todos os modelos ao mesmo tempo.
 *
 * Por isso o alias vem primeiro — acompanha o que o Google promove — e um
 * concreto atrás dele cobre a indisponibilidade. Se o preview sumir, a cadeia
 * degrada sozinha em vez de derrubar a rota.
 *
 * Refaça a medição quando a latência incomodar; ver o comentário sobre o
 * critério de 15s do Gate 0 em docs/manual-execucao-10-semanas.md.
 */
export const MODEL_CHAIN = ["gemini-flash-latest", "gemini-3-flash-preview"];

/** Primeiro da cadeia — o nome registrado em usage_events. */
export const FLASH_MODEL = MODEL_CHAIN[0];

export async function getFlashModel(model: string = FLASH_MODEL) {
  const key = await geminiKey();
  if (!key) throw new Error("GEMINI_API_KEY ausente");

  return new GoogleGenerativeAI(key).getGenerativeModel({
    model,
    safetySettings,
    generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 2048 },
  });
}

/**
 * Gera conteúdo com repetição em falha transitória.
 *
 * O 503 "high demand" da API do Gemini é frequente: medido em ~50% das
 * chamadas mesmo com faturamento ativo. Sem repetir, metade dos usuários vê
 * erro numa ação que é o coração do produto.
 *
 * Só repete o que é transitório (503, 429, 500). Um 400 ou 404 é defeito
 * nosso — prompt inválido, modelo inexistente — e repetir só atrasa o erro.
 */
const TRANSIENT = new Set([429, 500, 503]);

function statusOf(error: unknown): number | undefined {
  const status = (error as { status?: unknown })?.status;
  if (typeof status === "number") return status;
  // O SDK às vezes só traz o código na mensagem.
  const match = String((error as { message?: string })?.message ?? "").match(
    /\[(\d{3})\s/
  );
  return match ? Number(match[1]) : undefined;
}

export interface GenerationResult {
  text: string;
  /** Qual modelo respondeu de fato — vai para usage_events. */
  model: string;
}

export async function generateWithRetry(
  parts: Array<{ text: string }>,
  { attemptsPerModel = 2, baseDelayMs = 600 } = {}
): Promise<GenerationResult> {
  let lastError: unknown;

  for (const modelName of MODEL_CHAIN) {
    const model = await getFlashModel(modelName);

    for (let attempt = 1; attempt <= attemptsPerModel; attempt += 1) {
      try {
        const result = await model.generateContent(parts);
        return { text: result.response.text(), model: modelName };
      } catch (error) {
        lastError = error;
        const status = statusOf(error);

        // Erro nosso (prompt inválido, modelo inexistente): repetir só atrasa.
        if (!status || !TRANSIENT.has(status)) throw error;

        // Última tentativa deste modelo: parte para o próximo sem esperar.
        if (attempt === attemptsPerModel) break;

        const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 250;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Extrai o objeto JSON de uma resposta do modelo.
 *
 * Modelos de texto não garantem formato, por mais explícita que seja a
 * instrução: às vezes envolvem o JSON em cerca de código, às vezes escrevem
 * uma frase antes ("Aqui está a análise:"). O `JSON.parse` direto quebrava
 * nos dois casos, e a rota respondia "formato que não consegui aproveitar"
 * com um JSON perfeitamente válido no meio do texto.
 *
 * Estratégia: tira as cercas, tenta o texto inteiro e, falhando, recorta do
 * primeiro `{` até o último `}`.
 */
export function extrairJson(bruto: string): unknown {
  const limpo = bruto
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(limpo);
  } catch {
    const inicio = limpo.indexOf("{");
    const fim = limpo.lastIndexOf("}");
    if (inicio === -1 || fim <= inicio) {
      throw new Error("Resposta sem JSON reconhecível");
    }
    return JSON.parse(limpo.slice(inicio, fim + 1));
  }
}
