import { GoogleGenAI } from "@google/genai";
import type { Content } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!ai) {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("API_KEY environment variable is not set");
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

export async function* generateChatResponseStream(
  history: Content[],
  message: string,
  isThinkingMode: boolean
): AsyncGenerator<string> {
  try {
    const ai = getAIClient();
    const modelName = isThinkingMode ? "gemini-2.5-pro" : "gemini-2.5-flash";

    const config = isThinkingMode
      ? { thinkingConfig: { thinkingBudget: 32768 } }
      : { tools: [{ googleSearch: {} }] };

    const contents: Content[] = [
      ...history,
      { role: "user", parts: [{ text: message }] },
    ];

    const stream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config,
    });

    for await (const chunk of stream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error) {
      yield `Sorry, I encountered an error: ${error.message}`;
    }
    yield "Sorry, I encountered an unknown error.";
  }
}
