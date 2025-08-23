import { Type } from "@google/genai";
import { google } from "../google";

export type NeedsTransactionsInput = {
  systemPrompt: string;
  userPrompt: string;
};

const needsTransactionsSystemInstruction = `
You are a classifier. Given the system prompt, user request, and grounding data,
decide if fantasy football transactions data would be helpful for answering the user request.

Transactions data is needed when discussing:
- League transactions
- Waiver wire
- Free agency
- Trades

Respond with a JSON object with a single property "needsTransactions" that is a boolean indicating if transactions data is required to answer.
`;

export async function needsTransactions(input: NeedsTransactionsInput) {
  const response = await google.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: {
      systemInstruction: needsTransactionsSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          needsTransactions: {
            type: Type.BOOLEAN,
          },
        },
        required: ["needsTransactions"],
      },
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Classify the user request as needing transactions data: " +
              JSON.stringify(input),
          },
        ],
      },
    ],
  });

  const result = JSON.parse(response.text || "{}");
  const needsTransactions = !!result.needsTransactions;
  console.log("needsTransactions", {
    needsTransactions,
    usage: response.usageMetadata,
  });
  return needsTransactions;
}
