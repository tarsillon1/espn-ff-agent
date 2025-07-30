import z from "zod";
import {
  ESPNLeagueResponse,
  findMemberById,
  getLeagueCached,
  GetLeagueInput,
  Team,
} from "../espn";
import { mapTeamRosterEntry } from "./mappers";

function mapTeamToRoster(team: Team, league: ESPNLeagueResponse) {
  return {
    rosterName: team.name,
    owners: team.owners.map((owner) => {
      const member = findMemberById(league.members, owner);
      return {
        id: owner,
        displayName: member?.displayName,
        firstName: member?.firstName,
        lastName: member?.lastName,
      };
    }),
    players: team.roster.entries.map(mapTeamRosterEntry),
  };
}

export function createListRostersTool(input: GetLeagueInput) {
  return {
    description:
      "List all rosters in the league. Includes roster name, member name, and players in the roster. Players are listed with their name, team, position, injury status and lineup (bench or starting) status.",
    parameters: z.object({}),
    execute: async () => {
      const league = await getLeagueCached(input);
      return league.teams.map((team) => mapTeamToRoster(team, league));
    },
  };
}
