import { Type } from "@google/genai";
import { google } from "../google";

export type NeedsMatchupsInput = {
  systemPrompt: string;
  userPrompt: string;
};

const needsMatchupsSystemInstruction = `
You are a classifier. Given the system prompt, user request, and grounding data,
decide if fantasy football or live NFL matchups data would be helpful for answering the user request.

Matchups are needed when discussing the current week's games.

Matchups are not needed when discussing:
 - Previous week's games
 - League schedule (unless for the current week)
 - League injuries
 - League standings
 - League transactions
 - League draft
 - League draft order
 - League draft picks

Respond with a JSON object with a single property "needsMatchups" that is a boolean indicating if matchups data is required to answer.
`;

export async function needsMatchups(input: NeedsMatchupsInput) {
  const response = await google.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: {
      systemInstruction: needsMatchupsSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          needsMatchups: {
            type: Type.BOOLEAN,
          },
        },
        required: ["needsMatchups"],
      },
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Classify the user request as needing matchups data: " +
              JSON.stringify(input),
          },
        ],
      },
    ],
  });

  const result = JSON.parse(response.text || "{}");
  const needsMatchups = !!result.needsMatchups;
  console.log("needsMatchups", {
    needsMatchups,
    usage: response.usageMetadata,
  });
  return needsMatchups;
}
