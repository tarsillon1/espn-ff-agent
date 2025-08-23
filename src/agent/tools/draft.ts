import { getLeagueCached, GetLeagueInput, getPlayersCached } from "@/espn";
import { mapBasicPlayerInfo } from "./mappers";

export async function getDraft(input: GetLeagueInput) {
  const [league, players] = await Promise.all([
    getLeagueCached(input),
    getPlayersCached(input),
  ]);
  const {
    draftDetail: { drafted, inProgress, picks },
    teams,
  } = league;
  const playersMap = new Map(players.map((p) => [p.player.id, p]));
  const rosteredPlayers = new Map(
    teams.flatMap((t) => t.roster.entries.map((r) => [r.playerId, t.id]))
  );
  return {
    drafted,
    inProgress,
    picks: picks.map((p) => {
      const player = playersMap.get(p.playerId);
      const rosterStatus = rosteredPlayers.get(p.playerId);
      return {
        pickNumber: p.overallPickNumber,
        round: p.roundId,
        player: player ? mapBasicPlayerInfo(player.player) : undefined,
        hasPicked: !!player,
        pickedByTeamId: p.teamId,
        rosterStatus: rosterStatus ? "active" : "dropped",
      };
    }),
  };
}
