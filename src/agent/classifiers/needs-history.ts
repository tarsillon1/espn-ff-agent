import { google } from "../google";
import { Type } from "@google/genai";

const needsHistorySystemInstruction = `
You are a classifier. Given the system prompt, user request, and grounding data,
decide if fantasy football history data would be helpful for answering the user request.

History data is needed when discussing fantasy team's:
- League history
- Head to head record
- Playoff record
- Championship record
- Record
- Points scored
- Playoff appearances
- Historical performance

Respond with a JSON object with a single property "needsHistory" that is a boolean indicating if fantasy football history data is required to answer.
`;

export type NeedsHistoryInput = {
  systemPrompt: string;
  userPrompt: string;
};

export async function needsHistory(input: NeedsHistoryInput) {
  const response = await google.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: {
      systemInstruction: needsHistorySystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          needsHistory: {
            type: Type.BOOLEAN,
          },
        },
        required: ["needsHistory"],
      },
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Classify the user request as needing history data: " +
              JSON.stringify(input),
          },
        ],
      },
    ],
  });

  const result = JSON.parse(response.text || "{}");
  const needsHistory = !!result.needsHistory;
  console.log("needsHistory", {
    needsHistory,
    result,
    usage: response.usageMetadata,
  });
  return needsHistory;
}
