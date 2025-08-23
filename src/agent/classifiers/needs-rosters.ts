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

Respond with a JSON object with a single property "needsRosters" that is a boolean indicating if rosters data is required to answer.
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
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          needsRosters: { type: Type.BOOLEAN },
        },
        required: ["needsRosters"],
      },
    },
    contents: [
      {
        text:
          "Classify the user request as needing roster data: " +
          JSON.stringify(input),
      },
    ],
  });

  const result = JSON.parse(response.text || "{}");
  const needsRosters = !!result.needsRosters;
  console.log("needsRosters", {
    needsRosters,
    usage: response.usageMetadata,
  });
  return needsRosters;
}
