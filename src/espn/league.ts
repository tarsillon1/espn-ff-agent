import { writeFileSync } from "fs";
import { cache } from "@/utils";
import { baseUrl } from "./config";
import type { ESPNLeagueResponse, Member, Team } from "./types";

export type GetLeagueInput = {
  espnS2: string;
  espnSwid: string;
  leagueId: string;
  year: number;
};

export async function getLeague({
  espnS2,
  espnSwid,
  leagueId,
  year,
}: GetLeagueInput) {
  const res = await fetch(
    `${baseUrl}/seasons/${year}/segments/0/leagues/${leagueId}?view=mTransactions2&view=mTeam&view=mRoster&view=mSettings&view=mMatchupScore&view=mMatchup`,
    {
      headers: {
        Accept: "application/json",
        Cookie: `espn_s2=${espnS2}; SWID=${espnSwid}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch league transactions: ${res.status} ${await res.text()}`
    );
  }

  const data = await res.json();
  writeFileSync("league.json", JSON.stringify(data, null, 2));
  return data as ESPNLeagueResponse;
}

export function findMemberById(members: Member[], id: string) {
  return members.find((member) => member.id === id);
}

export function findRosterForPlayer(playerId: number, teams: Team[]) {
  return teams.find((team) =>
    team.roster.entries.some(
      (player) => player.playerId.toString() === playerId.toString()
    )
  );
}

export function findTeamById(teams: Team[], id: number) {
  return teams.find((team) => team.id === id);
}

export function findPlayerInRoster(playerId: number, team: Team) {
  return team.roster.entries.find(
    (player) => player.playerId.toString() === playerId.toString()
  );
}

export const getLeagueCached = cache(getLeague, 1000 * 60 * 5);
