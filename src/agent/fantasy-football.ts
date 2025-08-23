import {
  espnS2,
  espnSwid,
  findPlaysForSchedrule,
  getLeagueCached,
  getLeagueHistory,
  getPlayersCached,
  leagueId,
} from "@/espn";
import { Content, ToolListUnion } from "@google/genai";
import { createPodcastPrompt } from "./prompt";
import { google } from "./google";
import {
  needsDraft,
  needsHistory,
  needsMatchups,
  needsPlays,
  needsTransactions,
  needsRosters,
} from "./classifiers";
import {
  mapDraft,
  mapMatchups,
  mapTransactions,
  mapLeagueHistory,
  mapTeams,
  mapRosters,
  mapPlays,
} from "./mappers";

const groundingSystemInstruction = `
The 'fantasyLeague.draft' field contains all players that were drafted by players.
This is historical data and does not reflect current roster status.

The 'fantasyLeague.teams' field contains all teams in the fantasy league and their owners.

The 'fantasyLeague.rosters' field contains all NFL players that are currently rostered by fantasy league teams.

The 'fantasyLeague.matchups' field contains the current matchups for the week.

The 'fantasyLeague.transactions' field contains all transactions that have occurred in the league.

The 'fantasyLeague.history' field contains all historical data for the league.

The 'recentNFLHeadlines' field contains the most recent headlines from the NFL.

The 'recentNFLPlays' field contains the most recent plays from live NFL games.

IMPORTANT: Never use triple dashes (---). They may cause the voice to stop speaking mid-message. Use natural language and line breaks to separate sections instead.

IMPORTANT: Never use music or sound effects. (ex. (Intro music fades in and out))

IMPORTANT: Never use parentheses.

IMPORTANT: Never use colons to specify speakers. (ex. "Host:")

IMPORTANT: Never use dramatic pauses.
`;

const researchSystemInstruction = `
ALWAYS use the 'googleSearch' tool before providing commentary on players.
Always assume your internal knowledge is outdated unless proven otherwise by research.
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

  const leaguePromise = getLeagueCached(config);
  const playersPromise = getPlayersCached(config);
  const leagueHistoryPromise = getLeagueHistory(config);

  const matchupsPromise = leaguePromise.then(mapMatchups);
  const playsPromise = Promise.all([leaguePromise, matchupsPromise])
    .then(([league, matchups]) =>
      findPlaysForSchedrule(season, matchups.week, league)
    )
    .then(mapPlays);
  const draftPromise = Promise.all([leaguePromise, playersPromise]).then(
    ([league, players]) => mapDraft(league, players)
  );
  const historyPromise = Promise.all([
    leagueHistoryPromise,
    leaguePromise,
  ]).then(([history, league]) => mapLeagueHistory(history, league));
  const teamsPromise = leaguePromise.then(mapTeams);
  const rostersPromise = leaguePromise.then(mapRosters);

  const transactionsPromise = Promise.all([leaguePromise, playersPromise]).then(
    ([league, players]) => mapTransactions(league.transactions, players, league)
  );

  const classify = { systemPrompt: system, userPrompt: prompt };

  const [
    includePlays,
    includeDraft,
    includeHistory,
    includeMatchups,
    includeTransactions,
    includeRosters,
  ] = await Promise.all([
    needsPlays(classify),
    needsDraft(classify),
    needsHistory(classify),
    needsMatchups(classify),
    needsTransactions(classify),
    needsRosters(classify),
  ]);

  const grounding: Record<string, unknown> = {
    nfl: {
      plays: includePlays ? await playsPromise : undefined,
    },
    fantasyLeague: {
      draft: includeDraft ? await draftPromise : undefined,
      history: includeHistory ? await historyPromise : undefined,
      matchups: includeMatchups ? await matchupsPromise : undefined,
      transactions: includeTransactions ? await transactionsPromise : undefined,
      rosters: includeRosters ? await rostersPromise : undefined,
      season,
      teams: await teamsPromise,
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
    model: "gemini-2.5-pro",
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
