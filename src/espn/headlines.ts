import Parser from "rss-parser";

const parser = new Parser();

export async function getHeadlines() {
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

  const rssItems = [...headlines.items, ...transactions.items].map((item) => ({
    title: item.title,
    description: item.description,
    published: item.pubDate,
    link: item.link,
  }));

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
