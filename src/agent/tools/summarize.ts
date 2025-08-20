import { GoogleGenAI } from "@google/genai";

export const summarizePrompt = `You are a helpful assistant that summarizes text. Do not include any other text in your response.`;

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

type SummarizeInput = {
  content: string | object;
  model?: "gemini-2.5-flash-lite" | "gemini-2.5-flash";
  system?: string;
};

export async function summarize({
  content,
  model = "gemini-2.5-flash-lite",
  system = summarizePrompt,
}: SummarizeInput) {
  const text = typeof content === "string" ? content : JSON.stringify(content);
  const summary = await genai.models.generateContent({
    model,
    config: {
      systemInstruction: system,
      temperature: 0.1,
    },
    contents: [
      {
        role: "user",
        parts: [{ text }],
      },
    ],
  });
  console.log(
    `used ${summary.usageMetadata?.totalTokenCount} to summarize ${text.length} to ${summary.text?.length}`
  );
  return summary.text;
}
