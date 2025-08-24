import { Type } from "@google/genai";
import { google } from "../google";

const needsPlaysSystemInstruction = `
You are a classifier. Given the system prompt, user request, and grounding data,
decide if live NFL play data would be helpful for answering the user request.

Plays are needed when discussing the current week's games.

Plays are not needed when discussing:
- League draft
- League draft order
- League draft picks
- Free agency
- Waiver wire
- League transactions
- League standings
- League schedule
- League injuries
- Previous week's games

Respond with a boolean indicating if live NFL play data should be used to answer the user request.
`;

export type NeedsPlaysInput = {
  systemPrompt: string;
  userPrompt: string;
  grounding?: object;
};

export async function needsPlays(input: NeedsPlaysInput) {
  const response = await google.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: {
      systemInstruction: needsPlaysSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: { type: Type.BOOLEAN },
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Please classify the following request: " + JSON.stringify(input),
          },
        ],
      },
    ],
  });

  const needsPlays = response.text?.toLocaleLowerCase?.()?.includes("true");
  console.log("needsPlays", {
    needsPlays: response.text,
    usage: response.usageMetadata,
  });
  return needsPlays;
}
