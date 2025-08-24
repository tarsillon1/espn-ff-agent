import { Type } from "@google/genai";
import { google } from "../google";

const needsDraftSystemInstruction = `
You are a classifier. Given the system prompt, user request, and grounding data,
decide if fantasy football draft data would be helpful for answering the user request.

Draft data is needed when discussing:
- League draft
- League draft order
- League draft picks

Respond with a boolean indicating if fantasy football draft data should be used to answer the user request.
`;

export type NeedsDraftInput = {
  systemPrompt: string;
  userPrompt: string;
};

export async function needsDraft(input: NeedsDraftInput) {
  const response = await google.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: {
      systemInstruction: needsDraftSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: { type: Type.BOOLEAN },
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Classify the user request as needing draft data: " +
              JSON.stringify(input),
          },
        ],
      },
    ],
  });

  const needsDraft = response.text?.toLocaleLowerCase?.()?.includes("true");
  console.log("needsDraft", {
    needsDraft: response.text,
    usage: response.usageMetadata,
  });
  return needsDraft;
}
