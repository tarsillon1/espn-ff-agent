import { getLeagueCached, GetLeagueInput } from "@/espn";
import { mapRoster } from "./mappers";
import { Type, type CallableTool } from "@google/genai";

const listRostersToolName = "listRosters";

export async function listRosters(input: GetLeagueInput) {
  const league = await getLeagueCached(input);
  return (league?.teams || []).map((team) => mapRoster(team, league));
}

export function createListRostersTool(input: GetLeagueInput): CallableTool {
  const listRostersBinded = listRosters.bind(null, input);
  return {
    callTool: async (functionCalls) => {
      const results = await Promise.all(
        functionCalls.map(async (call) => {
          if (call.name !== listRostersToolName) {
            return undefined;
          }

          const results = await listRostersBinded();
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
            name: "listRosters",
            description: "List all rosters in the league",
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
