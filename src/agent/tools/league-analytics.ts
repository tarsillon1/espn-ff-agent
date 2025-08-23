import { analyzeLeagueHistory, getLeagueHistory } from "@/espn";
import { GetLeagueInput, getLeagueCached } from "@/espn";

export async function getLeagueAnalytics(input: GetLeagueInput) {
  console.log("getting league analytics");

  const history = await getLeagueHistory(input);
  const leagueData = await getLeagueCached(input);
  const activeTeamIds = leagueData.teams.map((team) => team.id);
  const analytics = analyzeLeagueHistory(history, activeTeamIds);
  return analytics;
}
