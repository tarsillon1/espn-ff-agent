import { CallableTool, FunctionCall } from "@google/genai";

export function combineTools(tools: CallableTool[]): CallableTool {
  return {
    callTool: async (functionCalls: FunctionCall[]) => {
      const results = (
        await Promise.all(tools.map((tool) => tool.callTool(functionCalls)))
      ).flatMap((r) => r);
      return results.filter((result) => !!result);
    },
    tool: async () => {
      return {
        functionDeclarations: (
          await Promise.all(tools.map((tool) => tool.tool()))
        )
          .flatMap((tool) => tool.functionDeclarations)
          .filter((f) => !!f),
      };
    },
  };
}
