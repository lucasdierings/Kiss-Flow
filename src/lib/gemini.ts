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
 * Alias, não versão fixa, de propósito.
 *
 * O código vinha preso em "gemini-2.0-flash", que o Google aposentou: a API
 * passou a responder 404 e a rota quebrou sem ninguém mudar uma linha. Este
 * projeto não tem operação para perseguir depreciação de modelo, então o
 * alias — que o Google move para o flash atual — troca uma quebra silenciosa
 * por uma variação de comportamento visível.
 *
 * Se algum dia a estabilidade do prompt passar a importar mais que isso,
 * fixe uma versão E crie um lembrete para revisá-la.
 */
export const FLASH_MODEL = "gemini-flash-latest";

export async function getFlashModel() {
  const key = await geminiKey();
  if (!key) throw new Error("GEMINI_API_KEY ausente");

  return new GoogleGenerativeAI(key).getGenerativeModel({
    model: FLASH_MODEL,
    safetySettings,
    generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 2048 },
  });
}
