import { Type } from "@google/genai";
import { google } from "../google";

const needsRostersSystemInstruction = `
You are a classifier. Given the system prompt, user request, and grounding data,
decide if fantasy football rosters data would be helpful for answering the user request.

The roster data contains all of the NFL players that are currently on each fantasy league team.

Rosters data is needed when discussing:
- Current fantasy league rosters
- Fantasy league roster status, ownership, and availability of NFL players
- Fantasy league team rankings
- Injuries
- Player performance (what went wrong, what went right)
- Trash talking players in the league (eviserate every player)

It is better to return 'true' than 'false' when you are unsure.

Respond with a boolean indicating if rosters data should be used to answer the user request.
`;

export type NeedsRostersInput = {
  userPrompt: string;
  systemPrompt: string;
};

export async function needsRosters(input: NeedsRostersInput) {
  const response = await google.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: {
      systemInstruction: needsRostersSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: { type: Type.BOOLEAN },
    },
    contents: [
      {
        text:
          "Classify the user request as needing roster data: " +
          JSON.stringify(input),
      },
    ],
  });

  const needsRosters = response.text?.toLocaleLowerCase?.()?.includes("true");
  console.log("needsRosters", {
    needsRosters: response.text,
    usage: response.usageMetadata,
  });
  return needsRosters;
}
