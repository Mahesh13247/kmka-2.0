import { GoogleGenAI } from "@google/genai";
import type { Content } from "@google/genai";

let ai: GoogleGenAI | null = null;

const resolveApiKey = (): string | undefined => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return (
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_GOOGLE_GENAI_API_KEY ||
      import.meta.env.VITE_API_KEY
    );
  }
  return undefined;
};

function getAIClient(): GoogleGenAI | null {
  if (ai) {
    return ai;
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    console.warn(
      "Gemini API key is not configured. Set VITE_GEMINI_API_KEY (or VITE_GOOGLE_GENAI_API_KEY / VITE_API_KEY) in your environment to enable the chatbot."
    );
    return null;
  }

  ai = new GoogleGenAI({ apiKey });
  return ai;
}

export async function* generateChatResponseStream(
  history: Content[],
  message: string,
  isThinkingMode: boolean
): AsyncGenerator<string> {
  try {
    const client = getAIClient();
    if (!client) {
      yield "The Gemini assistant is not configured. Please set the required API key to use this feature.";
      return;
    }

    const modelName = isThinkingMode ? "gemini-2.5-pro" : "gemini-2.5-flash";

    const config = isThinkingMode
      ? { thinkingConfig: { thinkingBudget: 32768 } }
      : { tools: [{ googleSearch: {} }] };

    const contents: Content[] = [
      ...history,
      { role: "user", parts: [{ text: message }] },
    ];

    const stream = await client.models.generateContentStream({
      model: modelName,
      contents,
      config,
    });

    for await (const chunk of stream) {
      const text = chunk?.text;
      if (typeof text === "string" && text.length > 0) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    const message =
      error instanceof Error
        ? `Sorry, I encountered an error: ${error.message}`
        : "Sorry, I encountered an unknown error.";
    yield message;
  }
}
