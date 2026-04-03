import { NextRequest } from "next/server";
import { getFlashModel } from "@/lib/gemini";
import { buildChatSystemPrompt } from "@/lib/prompts";
import { buildContextPromptSection, type ContactContext } from "@/lib/context-engine";

export async function POST(request: NextRequest) {
  try {
    const { message, userProfile, targetContext, contactContext, history = [] } = await request.json();

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const model = getFlashModel();
    let systemPrompt = buildChatSystemPrompt(
      userProfile || { name: "Usuario", gender: "nao_informado", orientation: "nao_informado", archetype: "charmer" },
      targetContext
    );

    // Inject contact context (memory) if available
    if (contactContext) {
      systemPrompt += buildContextPromptSection(contactContext as ContactContext);
    }

    // Build chat history
    const chatHistory = history.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Entendido. Estou pronto para ajudar com estrategia de conquista. Como posso auxiliar?" }] },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return Response.json({ response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
