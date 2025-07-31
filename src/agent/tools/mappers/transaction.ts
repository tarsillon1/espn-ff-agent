import { findPlayerById, findTeamById } from "../../espn";
import { ESPNLeagueResponse, PlayerData, TransactionItem } from "../../espn";
import { mapPlayerData } from "./player";
import { mapRosterBasicInfo } from "./team";

export function mapTransactionItem(
  item: TransactionItem,
  players: PlayerData[],
  league: ESPNLeagueResponse
) {
  const player = findPlayerById(players, item.playerId);
  const fromTeam = findTeamById(league.teams, item.fromTeamId);
  const toTeam = findTeamById(league.teams, item.toTeamId);
  return {
    player: mapPlayerData(player),
    fromTeam: mapRosterBasicInfo(fromTeam, league.members),
    toTeam: mapRosterBasicInfo(toTeam, league.members),
    fromLineupSlotId: item.fromLineupSlotId,
    toLineupSlotId: item.toLineupSlotId,
    type: item.type,
  };
}
