import { espnS2, espnSwid, leagueId } from "@/espn";
import { Content, GoogleGenAI, ToolListUnion } from "@google/genai";
import { createPodcastPrompt } from "./prompt";
import {
  getDraft,
  getLeagueAnalytics,
  listCurrentMatchups,
  listNFLHeadlines,
  listRosters,
  listTransactions,
} from "./tools";

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const groundingSystemInstruction = `
The 'fantasyLeague.draft' field contains all players that were drafted by players.
This is historical data and does not reflect current roster status.

The 'fantasyLeague.rosters' field contains all players that are actively rostered by players.

The 'fantasyLeague.matchups' field contains the current matchups for the week.

The 'fantasyLeague.transactions' field contains all transactions that have occurred in the league.

The 'fantasyLeague.history' field contains all historical data for the league.

The 'recentNFLHeadlines' field contains the most recent headlines from the NFL.
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

export async function generateFFText({
  prompt,
  season = new Date().getFullYear(),
  system = createPodcastPrompt(),
  research = true,
}: GenerateFFTextInput) {
  const config = { season, leagueId, espnS2, espnSwid };

  const [rosters, history, draft, matchups, transactions, recentNFLHeadlines] =
    await Promise.all([
      listRosters(config),
      getLeagueAnalytics(config),
      getDraft(config),
      listCurrentMatchups(config),
      listTransactions(config),
      listNFLHeadlines(),
    ]);

  const grounding = {
    recentNFLHeadlines,
    fantasyLeague: {
      season,
      history,
      draft,
      rosters,
      matchups,
      transactions,
    },
  };

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

  console.log(JSON.stringify(contents).length);

  const result = await genai.models.generateContent({
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
