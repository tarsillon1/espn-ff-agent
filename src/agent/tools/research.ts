import {
  CallableTool,
  Content,
  FunctionCall,
  GoogleGenAI,
  Type,
} from "@google/genai";

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const systemInstruction = `
You an assistant responsible for providing real world data to ground another LLM assistant.
You will be provided with the system instruction of the other LLM assistant, the user's request and some grounding data.
Your goal is to search and extract content from the web for the latest information to ground the other LLM assistant.
Provide a summary that is as detailed as possible of all the information you have found.
`;

export type ResearchInput = {
  prompt: string;
  grounding: object;
};

export async function research({ prompt, grounding }: ResearchInput) {
  console.log("researching", prompt);

  const contents: Content[] = [
    {
      role: "user",
      parts: [
        {
          text:
            "Please research based on the following information: \n" +
            JSON.stringify({ prompt, grounding }),
        },
      ],
    },
  ];
  const reasearch = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction,
      temperature: 0.5,
      tools: [{ googleSearch: {} }],
    },
    contents,
  });

  console.log("research", reasearch.text);

  return reasearch.text;
}

export function createResearchTool(grounding: object): CallableTool {
  return {
    callTool: async (functionCalls: FunctionCall[]) => {
      const results = await Promise.all(
        functionCalls.map(async (call) => {
          const prompt = call.args?.prompt as string;
          if (!prompt) {
            return {
              functionResponse: {
                id: call.id,
                name: call.name,
                response: {
                  error:
                    "Field 'prompt' is missing in the function call. Please try again with 'prompt' defined.",
                },
              },
            };
          }
          const result = await research({ prompt, grounding });
          return {
            functionResponse: {
              id: call.id,
              name: call.name,
              response: { result },
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
            name: "research",
            description:
              "Uses web search to gather the latest real-world data and provide a detailed summary for grounding another LLM assistant.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
              },
              required: ["prompt"],
            },
          },
        ],
      };
    },
  };
}
