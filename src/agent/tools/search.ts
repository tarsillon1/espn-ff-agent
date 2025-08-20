import { z } from "zod";

export function createSearchTool() {
  async function search({ query }: { query: string }) {
    console.log("searching", query);

    const body = JSON.stringify({
      q: query,
      location: "United States",
      num: 10,
    });

    const response = await fetch("https://google.serper.dev/news", {
      method: "POST",
      body: body,
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY!,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      return { error: "Failed to search" };
    }
    const data = (await response.json()) as any;
    return data.news.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));
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
