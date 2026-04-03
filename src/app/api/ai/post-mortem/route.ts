import { NextRequest, NextResponse } from "next/server";
import { getFlashModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const {
      contactName,
      contactArchetype,
      closingGoal,
      lostReason,
      pipelineStageWhenLost,
      totalInteractions,
      daysInPipeline,
      avgSentiment,
      userInitiatedPercent,
      phaseHistory,
      lastInteractions,
    } = await request.json();

    if (!contactName) {
      return NextResponse.json(
        { error: "Contact name is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = getFlashModel();

    const prompt = `Você é um analista estratégico de operações interpessoais. Analise esta operação que resultou em perda e gere um relatório conciso.

DADOS DA OPERAÇÃO:
- Alvo: ${contactName}
- Perfil do alvo: ${contactArchetype || "Não definido"}
- Meta de fechamento: ${closingGoal || "Não definida"}
- Motivo da perda: ${lostReason || "Não especificado"}
- Fase quando perdido: ${pipelineStageWhenLost || "Desconhecida"}
- Total de interações: ${totalInteractions || 0}
- Dias no pipeline: ${daysInPipeline || 0}
- Sentimento médio: ${avgSentiment || 0}
- % de interações iniciadas pelo operador: ${userInitiatedPercent || 0}%
- Histórico de fases: ${phaseHistory || "Sem dados"}
- Últimas interações: ${lastInteractions || "Sem dados"}

GERE UMA ANÁLISE PÓS-OPERAÇÃO em português-BR:

1. **Diagnóstico**: O que deu errado? Identifique o ponto de falha principal.
2. **Padrão Detectado**: Há um comportamento recorrente que contribuiu para a perda?
3. **Momento Crítico**: Em que momento a operação poderia ter sido salva?
4. **Lição Estratégica**: O que fazer diferente na próxima operação similar?

Seja direto, analítico e objetivo. Máximo 200 palavras. Não cite livros ou autores.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ analysis: text });
  } catch (error) {
    console.error("Post-mortem error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar análise pós-operação" },
      { status: 500 }
    );
  }
}
