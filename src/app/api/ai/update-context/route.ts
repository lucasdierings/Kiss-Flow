import { NextRequest } from "next/server";
import { getFlashModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { contactName, currentContext, recentInteractions, chatMessages } =
      await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = getFlashModel();

    const prompt = `Você é o motor de memória do Kiss Flow. Sua tarefa é analisar as interações recentes e conversas com um alvo e produzir um resumo estruturado atualizado.

ALVO: ${contactName}

${currentContext ? `CONTEXTO ANTERIOR:\n${JSON.stringify(currentContext, null, 2)}` : "Nenhum contexto anterior."}

${recentInteractions ? `INTERAÇÕES RECENTES:\n${recentInteractions}` : ""}

${chatMessages ? `ÚLTIMAS MENSAGENS DO CHAT:\n${chatMessages}` : ""}

Analise tudo acima e retorne um JSON VÁLIDO com:
{
  "summary": "Resumo conciso da situação atual com o alvo (2-3 frases)",
  "keyFacts": ["fato 1", "fato 2", ...],
  "communicationStyle": "Como o alvo se comunica (direto, evasivo, emotivo, etc)",
  "lastTopics": ["assunto 1", "assunto 2", ...],
  "emotionalState": "Estado emocional atual percebido do alvo"
}

REGRAS:
- Mantenha fatos do contexto anterior que ainda são relevantes
- Adicione novos fatos descobertos nas interações/chat recentes
- Atualize o resumo e estado emocional com base nas informações mais recentes
- Máximo 8 keyFacts (priorize os mais relevantes)
- Máximo 5 lastTopics
- Seja objetivo e conciso
- Retorne APENAS o JSON, sem markdown ou explicações`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const context = JSON.parse(jsonMatch[0]);
    return Response.json({ context });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Update context error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
