import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Safety settings - relaxed for relationship context
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// Gemini Flash - fast & cheap (~$0.001 per analysis)
export function getFlashModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });
}

// Gemini Pro - complex analysis (use sparingly)
export function getProModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-pro",
    safetySettings,
    generationConfig: {
      temperature: 0.5,
      topP: 0.9,
      maxOutputTokens: 4096,
    },
  });
}

// Flash with vision for screenshot/image analysis
export function getVisionModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  });
}

// Helper: convert base64 to Gemini Part
export function base64ToImagePart(base64Data: string, mimeType: string = "image/jpeg") {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

// Helper: convert URL to fetch + base64
export async function urlToImagePart(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = response.headers.get("content-type") || "image/jpeg";
  return base64ToImagePart(base64, mimeType);
}
