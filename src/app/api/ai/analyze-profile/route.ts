import { NextRequest, NextResponse } from "next/server";
import { getVisionModel, base64ToImagePart } from "@/lib/gemini";
import { PROMPT_ANALYZE_PROFILE } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType = "image/jpeg" } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const model = getVisionModel();
    const imagePart = base64ToImagePart(image, mimeType);

    const result = await model.generateContent([
      PROMPT_ANALYZE_PROFILE,
      imagePart,
    ]);

    const response = result.response;
    const text = response.text();

    let analysis;
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text);
    } catch {
      analysis = { raw_response: text, parse_error: true };
    }

    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Profile analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
