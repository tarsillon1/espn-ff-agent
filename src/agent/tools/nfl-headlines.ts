import Parser from "rss-parser";
import { z } from "zod";
import { summarize, summarizePrompt } from "./summarize";

const parser = new Parser();

const summarizeHeadlinesPrompt =
  summarizePrompt +
  `You will be provided a list of sports related news. 
  Only include NFL related news in your response. 
  The response will be provided to another LLM that will use it to ground their response in the context of current NFL news.
  Response should be concise but leave out as little information as possible.`;

export function createListNFLHeadlinesTool() {
  async function listNFLHeadlines() {
    console.log("listing nfl headlines");

    const [headlines, transactions, espnNews] = await Promise.all([
      parser.parseURL("https://www.espn.com/espn/rss/nfl/news"),
      parser.parseURL("https://www.espn.com/espn/rss/nfl/transactions"),
      await fetch(
        "https://site.api.espn.com/apis/site/v2/sports/football/nfl/news"
      ),
    ]);

    const espnNewsJson: any = await espnNews.json();
    const jsonItems = espnNewsJson.articles.map(
      ({ headline, description, published, links }: any) => ({
        title: headline,
        description: description,
        published,
        link: links?.web?.href,
      })
    );

    const rssItems = [...headlines.items, ...transactions.items].map(
      (item) => ({
        title: item.title,
        description: item.description,
        published: item.pubDate,
        link: item.link,
      })
    );

    const items = [...rssItems, ...jsonItems];

    const dedupedItems = new Map<string, (typeof items)[number]>();
    for (const item of items) {
      if (!item.link) {
        continue;
      }
      dedupedItems.set(item.link, item);
    }
    const deduped = Array.from(dedupedItems.values());
    return deduped;
  }

  return {
    name: "listNFLHeadlines",
    description: "List most recent NFL headlines.",
    parameters: z.object({}),
    execute: listNFLHeadlines,
  };
}
