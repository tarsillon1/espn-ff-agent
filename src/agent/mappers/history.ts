import {
  analyzeLeagueHistory,
  ESPNLeagueResponse,
  LeagueHistory,
} from "@/espn";

export function mapLeagueHistory(
  history: LeagueHistory,
  leagueData: Pick<ESPNLeagueResponse, "teams">
) {
  const analytics = analyzeLeagueHistory(history, leagueData.teams);
  return analytics;
}
