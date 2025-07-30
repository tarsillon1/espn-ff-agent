import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createCommentatorPrompt } from "../prompt";
import { createFindPlayersTool } from "../tools";
import { leagueId, espnS2, espnSwid, year } from "../espn";
import { createListRostersTool } from "../tools/list-rosters";
import { createListTransactionsTool } from "../tools/list-transactions";

export async function commentate(input: string) {
  const config = {
    year,
    leagueId,
    espnS2,
    espnSwid,
  };

  const findPlayersTool = createFindPlayersTool(config);
  const listRostersTool = createListRostersTool(config);
  const listTransactionsTool = createListTransactionsTool(config);

  const result = await generateText({
    model: google("gemini-2.5-flash"),
    system: createCommentatorPrompt(),
    messages: [{ role: "user", content: input }],
    tools: {
      findPlayers: findPlayersTool,
      listRosters: listRostersTool,
      listTransactions: listTransactionsTool,
    },
    maxSteps: 100,
  });

  return result;
}
