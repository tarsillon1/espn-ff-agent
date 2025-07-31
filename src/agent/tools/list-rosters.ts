import z from "zod";
import { getLeagueCached, GetLeagueInput } from "../espn";
import { mapRoster } from "./mappers";

export function createListRostersTool(input: GetLeagueInput) {
  return {
    description:
      "List all rosters in the league. Includes roster name, member name, and players in the roster. Players are listed with their name, team, position, injury status, free agent budget remaining, transaction counter, and lineup (bench or starting) status.",
    parameters: z.object({}),
    execute: async () => {
      const league = await getLeagueCached(input);
      return league.teams.map((team) =>
        mapRoster(team, league.members, league.settings)
      );
    },
  };
}
