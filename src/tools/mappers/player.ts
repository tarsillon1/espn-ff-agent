import {
  getPosition,
  getTeamNameAndAbbr,
  PlayerData,
  TeamRosterEntry,
} from "../../espn";

export function mapTeamRosterEntry(entry: TeamRosterEntry) {
  const player = entry.playerPoolEntry.player;
  const team = getTeamNameAndAbbr(player.proTeamId);
  const position = getPosition(player.defaultPositionId);
  return {
    id: player.id,
    fullName: player.fullName,
    team: team.abbr,
    position: position.abbr,
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
  const team = getTeamNameAndAbbr(player.proTeamId);
  const position = getPosition(player.defaultPositionId);
  return {
    id: player.id,
    fullName: player.fullName,
    team: team.abbr,
    position: position.abbr,
  };
}
