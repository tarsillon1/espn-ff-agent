import { cache } from "@/utils";
import { baseUrl } from "./config";
import type { ESPNLeagueResponse, Member, Team, Transaction } from "./types";

export type GetLeagueInput = {
  espnS2: string;
  espnSwid: string;
  leagueId: string;
  season: number;
};

export async function getLeague({
  espnS2,
  espnSwid,
  leagueId,
  season,
}: GetLeagueInput) {
  const url = `${baseUrl}/seasons/${season}/segments/0/leagues/${leagueId}?view=mTransactions2&view=mTeam&view=mRoster&view=mSettings&view=mMatchupScore&view=mMatchup&view=mDraftDetail`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Cookie: `espn_s2=${espnS2}; SWID=${espnSwid}`,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch league: ${res.status} ${await res.text()}`
    );
  }

  const data = await res.json();
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

export function isLineupTransaction(transaction: Transaction) {
  // if a transaction has any items that are not LINEUP, it is not a lineup transaction
  return !transaction.items.some((item) => item.type !== "LINEUP");
}

export const getLeagueCached = cache(getLeague, 1000 * 60 * 5);
