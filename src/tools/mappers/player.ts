import {
  getPosition,
  getTeamNameAndAbbr,
  PlayerData,
  TeamRosterEntry,
} from "../../espn";

export function mapTeamRosterEntry(entry: TeamRosterEntry) {
  const player = entry.playerPoolEntry.player;
  return {
    id: player.id,
    fullName: player.fullName,
    team: getTeamNameAndAbbr(player.proTeamId),
    position: getPosition(player.defaultPositionId),
    injured: player.injured,
    injuryStatus: player.injuryStatus,
    isBenched: entry.lineupSlotId === undefined,
  };
}

export function mapPlayerData(playerData: PlayerData | undefined) {
  if (!playerData) {
    return undefined;
  }
  const player = playerData.player;
  return {
    id: player.id,
    fullName: player.fullName,
    team: getTeamNameAndAbbr(player.proTeamId),
    position: getPosition(player.defaultPositionId),
  };
}
