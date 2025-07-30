import z from "zod";
import { analyzeLeagueHistory } from "../espn/analytics";
import { getLeagueHistory } from "../espn/history";
import { GetLeagueInput, getLeagueCached } from "../espn";
import { mapTeamBasicInfo } from "./mappers";
import { writeFileSync } from "fs";
export function createLeagueAnalyticsTool(input: GetLeagueInput) {
  return {
    description:
      "Get comprehensive historical analytics for the league, including team performance, head-to-head records, playoff appearances, and championships. The data is enriched with team names and owner information. Teams are marked as active or inactive based on current league membership.",
    parameters: z.object({}),
    execute: async () => {
      const history = await getLeagueHistory(input);
      const leagueData = await getLeagueCached(input);
      const activeTeamIds = leagueData.teams.map((team) => team.id);
      const analytics = analyzeLeagueHistory(history, activeTeamIds);
      const output = {
        teams: leagueData.teams.map((team) =>
          mapTeamBasicInfo(team, leagueData.members)
        ),
        analytics: analytics,
      };

      writeFileSync("analytics.json", JSON.stringify(output, null, 2));

      return output;
    },
  };
}
