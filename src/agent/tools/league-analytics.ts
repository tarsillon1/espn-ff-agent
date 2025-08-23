import { analyzeLeagueHistory, getLeagueHistory } from "@/espn";
import { GetLeagueInput, getLeagueCached } from "@/espn";
import { mapRosterBasicInfo } from "./mappers";
import { Type, type CallableTool } from "@google/genai";

async function leagueAnalytics(input: GetLeagueInput) {
  const history = await getLeagueHistory(input);
  const leagueData = await getLeagueCached(input);
  const activeTeamIds = leagueData.teams.map((team) => team.id);
  const analytics = analyzeLeagueHistory(history, activeTeamIds);

  const output = {
    rosters: leagueData.teams.map((team) =>
      mapRosterBasicInfo(team, leagueData.members)
    ),
    analytics: analytics,
  };
  return output;
}

const leagueAnalyticsToolName = "leagueAnalytics";

export function createLeagueAnalyticsTool(input: GetLeagueInput): CallableTool {
  const leagueAnalyticsBinded = leagueAnalytics.bind(null, input);
  return {
    callTool: async (functionCalls) => {
      const results = await Promise.all(
        functionCalls.map(async (call) => {
          if (call.name !== leagueAnalyticsToolName) {
            return undefined;
          }

          const results = await leagueAnalyticsBinded();
          return {
            functionResponse: {
              id: call.id,
              name: call.name,
              response: { results },
            },
          };
        })
      );
      return results.filter((result) => !!result);
    },
    tool: async () => {
      return {
        functionDeclarations: [
          {
            name: leagueAnalyticsToolName,
            description:
              "Get comprehensive historical analytics for the league, including team performance, head-to-head records, playoff appearances, and championships. The data is enriched with team names and owner information. Teams are marked as active or inactive based on current league membership.",
            parameters: {
              type: Type.OBJECT,
              properties: {},
              required: [],
            },
          },
        ],
      };
    },
  };
}
