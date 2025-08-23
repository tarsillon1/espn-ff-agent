import { Content, GoogleGenAI } from "@google/genai";
import { createPodcastPrompt } from "./prompt";
import {
  createFindPlayersTool,
  createLeagueAnalyticsTool,
  createListCurrentMatchupsTool,
  createListTransactionsTool,
  listNFLHeadlines,
  listRosters,
  combineTools,
  createResearchTool,
} from "./tools";
import { leagueId, espnS2, espnSwid } from "@/espn";

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

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
  const config = {
    season,
    leagueId,
    espnS2,
    espnSwid,
  };

  const [fantasyLeagueRosters, recentNFLHeadlines] = await Promise.all([
    listRosters(config),
    listNFLHeadlines(),
  ]);

  const groundingData = {
    recentNFLHeadlines,
    fantasyLeagueRosters,
    fantasyLeagueYear: season,
  };

  const researchTool = createResearchTool(groundingData);

  const webResearch = research
    ? await researchTool.callTool([
        {
          name: "research",
          args: { prompt },
        },
      ])
    : null;

  const researchInstruction = research
    ? `\nALWAYS use the 'research' tool before providing commentary on players. Always assume your internal knowledge is outdated unless proven otherwise by research.`
    : "";

  const groundingInstruction = `\nGrounding data: ${JSON.stringify({
    ...groundingData,
    webResearch,
  })}`;

  const systemInstruction = system + researchInstruction + groundingInstruction;

  const findPlayersTool = createFindPlayersTool(config);
  const listTransactionsTool = createListTransactionsTool(config);
  const leagueAnalyticsTool = createLeagueAnalyticsTool(config);
  const listCurrentMatchupsTool = createListCurrentMatchupsTool(config);

  const tools = [
    findPlayersTool,
    listTransactionsTool,
    leagueAnalyticsTool,
    listCurrentMatchupsTool,
  ];
  if (research) {
    tools.push(researchTool);
  }

  const contents: Content[] = [{ role: "user", parts: [{ text: prompt }] }];

  const result = await genai.models.generateContent({
    model: "gemini-2.5-pro",
    config: {
      systemInstruction,
      temperature: 0.5,
      tools: [combineTools(tools)],
    },
    contents,
  });

  console.log("generate text usage", result.usageMetadata?.promptTokenCount);

  return result;
}
