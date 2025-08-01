import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createCommentatorPrompt } from "./prompt";
import {
  createFindPlayersTool,
  createLeagueAnalyticsTool,
  createListMatchupsTool,
} from "./tools";
import { leagueId, espnS2, espnSwid, year } from "@/espn";
import { createListRostersTool } from "./tools/list-rosters";
import { createListTransactionsTool } from "./tools/list-transactions";

export async function generateCommentaryText(
  input: string,
  system = createCommentatorPrompt()
) {
  const config = {
    year,
    leagueId,
    espnS2,
    espnSwid,
  };

  const findPlayersTool = createFindPlayersTool(config);
  const listRostersTool = createListRostersTool(config);
  const listTransactionsTool = createListTransactionsTool(config);
  const leagueAnalyticsTool = createLeagueAnalyticsTool(config);
  const listMatchupsTool = createListMatchupsTool(config);

  const result = await generateText({
    model: google("gemini-2.5-flash"),
    system,
    messages: [{ role: "user", content: input }],
    tools: {
      findPlayers: findPlayersTool,
      listRosters: listRostersTool,
      listTransactions: listTransactionsTool,
      leagueAnalytics: leagueAnalyticsTool,
      listMatchups: listMatchupsTool,
    },
    maxSteps: 100,
  });

  console.log("generate text usage", result.usage);

  return result;
}
