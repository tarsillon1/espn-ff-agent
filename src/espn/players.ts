import { cache } from "../utils";
import { baseUrl } from "./config";
import type { PlayerData } from "./types";

export type GetPlayersInput = {
  season: number;
  leagueId: string;
  espnS2: string;
  espnSwid: string;
};

const views = ["players_wl"].map((view) => `view=${view}`);

const filterHeader = "x-fantasy-filter";
const filterHeaderValue = JSON.stringify({
  players: {
    limit: 1500,
    sortDraftRanks: {
      sortPriority: 100,
      sortAsc: true,
      value: "STANDARD",
    },
  },
});

export async function getPlayers({
  season,
  leagueId,
  espnS2,
  espnSwid,
}: GetPlayersInput): Promise<PlayerData[]> {
  const res = await fetch(
    `${baseUrl}/seasons/${season}/segments/0/leagues/${leagueId}?${views}`,
    {
      headers: {
        Cookie: `espn_s2=${espnS2}; SWID=${espnSwid}`,
        [filterHeader]: filterHeaderValue,
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch players: ${res.status} ${await res.text()}`
    );
  }

  const data = (await res.json()) as { players: PlayerData[] };
  return data.players;
}

export const getPlayersCached = cache(getPlayers, 1000 * 60 * 60 * 24);

export function findPlayerById(players: PlayerData[], id: number) {
  return players.find((player) => player.player.id === id);
}
