import { getHeadlines } from "@/espn/headlines";
import { Type, type CallableTool } from "@google/genai";

export async function listNFLHeadlines() {
  console.log("listing nfl headlines");
  return getHeadlines();
}

const listNFLHeadlinesToolName = "listNFLHeadlines";

export function createListNFLHeadlinesTool(): CallableTool {
  return {
    callTool: async (functionCalls) => {
      const results = await Promise.all(
        functionCalls.map(async (call) => {
          if (call.name !== listNFLHeadlinesToolName) {
            return undefined;
          }

          const results = await listNFLHeadlines();
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
            name: listNFLHeadlinesToolName,
            description: "List most recent NFL headlines.",
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
