import { ESPNLeagueResponse, PlayerData } from "@/espn";
import { mapBasicPlayerInfo } from "./player";

export async function mapDraft(
  league: Pick<ESPNLeagueResponse, "draftDetail" | "teams">,
  players: PlayerData[]
) {
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
