import { GoogleGenAI } from "@google/genai";

export const google = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
