import { getLeagueCached, GetLeagueInput } from "@/espn";
import { mapRoster } from "./mappers";

export async function listRosters(input: GetLeagueInput) {
  const league = await getLeagueCached(input);
  return (league?.teams || []).map((team) => mapRoster(team, league));
}
