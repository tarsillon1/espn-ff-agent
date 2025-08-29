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
 
It is better to return 'true' than 'false' when you are unsure.

Respond with a boolean indicating if matchups data should be used to answer the user request.
`;

export async function needsMatchups(input: NeedsMatchupsInput) {
  const response = await google.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: {
      systemInstruction: needsMatchupsSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: { type: Type.BOOLEAN },
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

  const needsMatchups = response.text?.toLocaleLowerCase?.()?.includes("true");
  console.log("needsMatchups", {
    needsMatchups: response.text,
    usage: response.usageMetadata,
  });
  return needsMatchups;
}
