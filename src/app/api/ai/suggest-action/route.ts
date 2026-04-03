import { NextRequest, NextResponse } from "next/server";
import { getFlashModel } from "@/lib/gemini";
import { PROMPT_SUGGEST_ACTION } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, targetProfile, interactions, objective } = await request.json();

    if (!targetProfile) {
      return NextResponse.json({ error: "Target profile is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const model = getFlashModel();

    const contextPrompt = `${PROMPT_SUGGEST_ACTION}

DADOS DO USUARIO:
${JSON.stringify(userProfile, null, 2)}

DADOS DO ALVO:
${JSON.stringify(targetProfile, null, 2)}

OBJETIVO: ${objective || "romance"}

HISTORICO DE INTERACOES RECENTES (ultimas 10):
${JSON.stringify(interactions?.slice(-10) || [], null, 2)}

Analise e sugira a proxima acao.`;

    const result = await model.generateContent(contextPrompt);
    const text = result.response.text();

    let suggestion;
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      suggestion = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text);
    } catch {
      suggestion = { raw_response: text, parse_error: true };
    }

    return NextResponse.json({ suggestion });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Action suggestion error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
