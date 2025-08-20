import { z } from "zod";
import { tavily } from "@tavily/core";

const apiKey = process.env.TAVILY_API_KEY!;

const tvly = tavily({ apiKey });

export function createSearchTool() {
  async function search({ query }: { query: string }) {
    console.log("searching", query);

    try {
      const response = await tvly.search(query, {
        topic: "news",
        maxResults: 10,
        searchDepth: "basic",
      });

      return response.results.map((result) => ({
        title: result.title,
        content: result.content,
        published: result.publishedDate,
        link: result.url,
      }));
    } catch (error) {
      console.error("Failed to search", error);
      return { error: "Failed to search" };
    }
  }

  return {
    name: "search",
    description: "Search the web for the latest news and information.",
    parameters: z.object({
      query: z.string(),
    }),
    execute: search,
  };
}
