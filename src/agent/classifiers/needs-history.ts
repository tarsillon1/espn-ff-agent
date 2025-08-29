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
- Trash talking players in the league (eviserate every player)

It is better to return 'true' than 'false' when you are unsure.

Respond with a boolean indicating if fantasy football history data should be used to answer the user request.
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
      responseSchema: { type: Type.BOOLEAN },
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

  const needsHistory = response.text?.toLocaleLowerCase?.()?.includes("true");
  console.log("needsHistory", {
    needsHistory: response.text,
    usage: response.usageMetadata,
  });
  return needsHistory;
}
