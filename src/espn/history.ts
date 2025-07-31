import { baseUrl } from "./config";
import { LeagueHistory } from "./types";

const getPath = (leagueId: string) =>
  `/leagueHistory/${leagueId}?view=mMatchup&view=mTeam&view=mSettings`;

export type GetLeagueHistoryInput = {
  leagueId: string;
  espnS2: string;
  espnSwid: string;
};

export async function getLeagueHistory(
  input: GetLeagueHistoryInput
): Promise<LeagueHistory> {
  const url = `${baseUrl}${getPath(input.leagueId)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Cookie: `espn_s2=${input.espnS2}; SWID=${input.espnSwid}`,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch league history: ${res.status} ${await res.text()}`
    );
  }

  const data = await res.json();

  return data as LeagueHistory;
}
