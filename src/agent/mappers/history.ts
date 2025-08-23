import {
  analyzeLeagueHistory,
  ESPNLeagueResponse,
  LeagueHistory,
} from "@/espn";

export function mapLeagueHistory(
  history: LeagueHistory,
  leagueData: Pick<ESPNLeagueResponse, "teams">
) {
  const activeTeamIds = leagueData.teams.map((team) => team.id);
  const analytics = analyzeLeagueHistory(history, activeTeamIds);
  return analytics;
}
