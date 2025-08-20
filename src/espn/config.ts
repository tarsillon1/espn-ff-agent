import "dotenv/config";

export const espnSwid = process.env.ESPN_SWID!;
export const espnS2 = process.env.ESPN_S2!;
export const leagueId = process.env.ESPN_LEAGUE_ID!;
export const baseUrl =
  "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl";
export const nflBaseUrl =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl";
