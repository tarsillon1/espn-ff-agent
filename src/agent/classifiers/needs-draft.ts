import { Type } from "@google/genai";
import { google } from "../google";

const needsDraftSystemInstruction = `
You are a classifier. Given the system prompt, user request, and grounding data,
decide if fantasy football draft data would be helpful for answering the user request.

Draft data is needed when discussing:
- League draft
- League draft order
- League draft picks

Respond with a JSON object with a single property "needsDraft" that is a boolean indicating if fantasy football draft data is required to answer.
`;

export type NeedsDraftInput = {
  systemPrompt: string;
  userPrompt: string;
};

export async function needsDraft(input: NeedsDraftInput) {
  const response = await google.models.generateContent({
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: needsDraftSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          needsDraft: {
            type: Type.BOOLEAN,
          },
        },
        required: ["needsDraft"],
      },
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

  const result = JSON.parse(response.text || "{}");
  const needsDraft = !!result.needsDraft;
  console.log("needsDraft", needsDraft);
  return needsDraft;
}
