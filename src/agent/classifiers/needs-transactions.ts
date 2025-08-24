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

Respond with a boolean indicating if transactions data should be used to answer the user request.
`;

export async function needsTransactions(input: NeedsTransactionsInput) {
  const response = await google.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: {
      systemInstruction: needsTransactionsSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: { type: Type.BOOLEAN },
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

  const needsTransactions = response.text
    ?.toLocaleLowerCase?.()
    ?.includes("true");
  console.log("needsTransactions", {
    needsTransactions: response.text,
    usage: response.usageMetadata,
  });
  return needsTransactions;
}
