import { NextResponse } from "next/server";
import { getFlashModel } from "@/lib/gemini";
import {
  buildMentorSystemPrompt,
  retrieveKnowledgeChunks,
} from "@/lib/rag-engine";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const {
      mentor = "donjuan", // 'donjuan' ou 'cleopatra'
      target = {
        name: "Gabriela Lima",
        archetype: "A Sereia",
        stage: "Flerte Rendendo",
        mysteryScore: 82,
        tensionScore: 68,
        interestScore: 90,
      },
      userProfile = {
        name: "Lucas",
        gender: mentor === "donjuan" ? "masculino" : "feminino",
      },
      userMessage = "",
      category,
    } = body;

    // 1. Recuperação semântica de princípios na Base de Conhecimento RAG
    const relevantChunks = retrieveKnowledgeChunks(category, userMessage);

    // 2. Construção do prompt do estrategista (Don Juan ou Cleópatra)
    const systemPrompt = buildMentorSystemPrompt(
      mentor,
      userProfile,
      target,
      relevantChunks
    );

    // 3. Fallback inteligente se a chave GEMINI_API_KEY não estiver configurada no ambiente local
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        mentor: mentor === "donjuan" ? "Don Juan" : "Cleópatra",
        diagnosis: `[Modo Offline/Simulado] Observei que ${target.name} respondeu com validação e abertura. Ela está no estágio de ${target.stage}. A estratégia ideal é não alongar papo digital e propor avanço com uma sugestão leve.`,
        options: [
          {
            title: "Opção 1: Natural & Desafiadora",
            text: `Sabia que você tinha bom gosto! Mas aposto que você ainda não provou a torta de lá. Sexta a gente vai tirar a prova.`,
          },
          {
            title: "Opção 2: Espirituosa & Curta",
            text: `Esse lugar tem esse poder mesmo. E olha que você ainda não viu o meu lugar secreto pra tomar drinks 😉`,
          },
          {
            title: "Opção 3: Pausa & Desapego",
            text: `Que bom que curtiu! Tô numa correria hoje, mais tarde te conto o que você precisa pedir da próxima vez.`,
          },
        ],
        principleApplied: relevantChunks[0]?.principleTitle || "Fechamento Progressivo",
        source: "offline_fallback",
      });
    }

    // 4. Chamada ao Gemini 2.0 Flash
    const model = getFlashModel();
    const result = await model.generateContent([
      { text: systemPrompt },
      {
        text: `O usuário enviou a seguinte mensagem ou print da conversa com ${target.name}:\n"${userMessage}"\n\nGere o diagnóstico e as 3 opções de jogada tática no formato JSON solicitado.`,
      },
    ]);

    const responseText = result.response.text();

    // 5. Parse seguro do JSON retornado pelo modelo
    let parsedData;
    try {
      const cleanJson = responseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsedData = JSON.parse(cleanJson);
    } catch {
      parsedData = {
        diagnosis: responseText,
        options: [
          {
            title: "Opção 1: Sugestão Principal",
            text: "Interessante! O que acha de tomar um café na quinta pra gente colocar a conversa em dia?",
          },
        ],
        principleApplied: "Calibragem e Convite Progressivo",
      };
    }

    return NextResponse.json({
      success: true,
      mentor: mentor === "donjuan" ? "Don Juan" : "Cleópatra",
      ...parsedData,
    });
  } catch (error) {
    console.error("Erro na API de conselho:", error);
    return NextResponse.json(
      {
        error: "Falha ao gerar conselho estratégico",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
