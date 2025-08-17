import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function streamVoice(instructions: string, input: string) {
  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "verse",
    input,
    instructions,
    response_format: "wav",
  });

  const stream = response.body;

  if (!stream) {
    throw new Error("Failed to stream voice");
  }

  return stream;
}
