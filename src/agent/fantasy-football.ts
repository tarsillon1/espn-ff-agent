import { espnS2, espnSwid, leagueId } from "@/espn";
import { Content, ToolListUnion } from "@google/genai";
import { createPodcastPrompt } from "./prompt";
import {
  findPlays,
  getDraft,
  getLeagueAnalytics,
  listCurrentMatchups,
  listNFLHeadlines,
  listRosters,
  listTransactions,
} from "./tools";
import { google } from "./google";
import { needsDraft, needsHistory, needsPlays } from "./classifiers";

const groundingSystemInstruction = `
The 'fantasyLeague.draft' field contains all players that were drafted by players.
This is historical data and does not reflect current roster status.

The 'fantasyLeague.rosters' field contains all players that are actively rostered by players.

The 'fantasyLeague.matchups' field contains the current matchups for the week.

The 'fantasyLeague.transactions' field contains all transactions that have occurred in the league.

The 'fantasyLeague.history' field contains all historical data for the league.

The 'recentNFLHeadlines' field contains the most recent headlines from the NFL.

The 'recentNFLPlays' field contains the most recent plays from live NFL games.
`;

const researchSystemInstruction = `
ALWAYS use the 'googleSearch' tool before providing commentary on players.
Always assume your internal knowledge is outdated unless proven otherwise by research.

When providing commentary on matchups use the 'googleSearch' tool to find real life notable plays and stats for players.
`;

type GenerateFFTextInput = {
  prompt: string;
  season?: number;
  system?: string;
  research?: boolean;
};

function getSize(value: unknown) {
  return Object.fromEntries(
    Object.entries(value as object).map(([key, value]) => [
      key,
      JSON.stringify(value || "").length,
    ])
  );
}

function logGroundingDataSize(grounding: Record<string, unknown>) {
  const size = Object.fromEntries(
    Object.entries(grounding).map(([key, value]) => [key, getSize(value)])
  );
  console.log("grounding data size", size);
}

export async function generateFFText({
  prompt,
  season = new Date().getFullYear(),
  system = createPodcastPrompt(),
  research = true,
}: GenerateFFTextInput) {
  const config = { season, leagueId, espnS2, espnSwid };

  const listCurrentMatchupsPromise = listCurrentMatchups(config);
  const playsPromise = listCurrentMatchupsPromise.then((matchups) =>
    findPlays(season, matchups.week, matchups.matchups)
  );

  const draftPromise = getDraft(config);
  const historyPromise = getLeagueAnalytics(config);

  const classify = { systemPrompt: system, userPrompt: prompt };

  const [
    rosters,
    matchups,
    transactions,
    headlines,
    includePlays,
    includeDraft,
    includeHistory,
  ] = await Promise.all([
    listRosters(config),
    listCurrentMatchupsPromise,
    listTransactions(config),
    listNFLHeadlines(),
    needsPlays(classify),
    needsDraft(classify),
    needsHistory(classify),
  ]);

  const grounding: Record<string, unknown> = {
    nfl: {
      headlines,
      plays: includePlays ? await playsPromise : undefined,
    },
    fantasyLeague: {
      draft: includeDraft ? await draftPromise : undefined,
      history: includeHistory ? await historyPromise : undefined,
      season,
      rosters,
      matchups,
      transactions,
    },
  };

  logGroundingDataSize(grounding);

  const systemInstruction =
    system +
    groundingSystemInstruction +
    (research ? researchSystemInstruction : "");

  const contents: Content[] = [
    {
      role: "user",
      parts: [
        {
          text: `Grounding data: ${JSON.stringify(grounding)}`,
        },
      ],
    },
    { role: "user", parts: [{ text: prompt }] },
  ];

  const tools: ToolListUnion = [];
  if (research) {
    tools.push({ googleSearch: {} });
  }

  const result = await google.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction,
      temperature: 0.5,
      tools,
    },
    contents,
  });

  console.log("generate text usage", result.usageMetadata);

  return result;
}
