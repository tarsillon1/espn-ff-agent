import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createPodcastPrompt } from "./prompt";
import {
  createFindPlayersTool,
  createLeagueAnalyticsTool,
  createListCurrentMatchupsTool,
} from "./tools";
import { leagueId, espnS2, espnSwid } from "@/espn";
import { createListRostersTool } from "./tools/list-rosters";
import { createListTransactionsTool } from "./tools/list-transactions";
import { createListNFLHeadlinesTool } from "./tools/nfl-headlines";

type GenerateFFTextInput = {
  prompt: string;
  season?: number;
  system?: string;
};

export async function generateFFText({
  prompt,
  season = new Date().getFullYear(),
  system = createPodcastPrompt(),
}: GenerateFFTextInput) {
  const config = {
    season,
    leagueId,
    espnS2,
    espnSwid,
  };

  const listRostersTool = createListRostersTool(config);
  const listNFLHeadlinesTool = createListNFLHeadlinesTool();

  const [fantasyLeagueRosters, recentNFLHeadlines] = await Promise.all([
    listRostersTool.execute?.(),
    listNFLHeadlinesTool.execute?.(),
  ]);

  const grounding = {
    role: "system",
    content: `
    Grounding data: ${JSON.stringify({
      recentNFLHeadlines,
      fantasyLeagueRosters,
    })}`,
  } as const;

  const findPlayersTool = createFindPlayersTool(config);
  const listTransactionsTool = createListTransactionsTool(config);
  const leagueAnalyticsTool = createLeagueAnalyticsTool(config);
  const listCurrentMatchupsTool = createListCurrentMatchupsTool(config);

  const result = await generateText({
    model: google("gemini-2.5-pro"),
    system,
    messages: [grounding, { role: "user", content: prompt }],
    tools: {
      findPlayers: findPlayersTool,
      listTransactions: listTransactionsTool,
      leagueAnalytics: leagueAnalyticsTool,
      listMatchups: listCurrentMatchupsTool,
    },
    maxSteps: 100,
    temperature: 0.5,
  });

  console.log("generate text usage", result.usage);

  return result;
}
