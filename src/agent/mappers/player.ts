import {
  getPosition,
  getTeamNameAndAbbr,
  PlayerData,
  PlayerForScoringPeriod,
  PlayerInfo,
  TeamPlayer,
  TeamRosterEntry,
} from "@/espn";

export function mapBasicPlayerInfo(
  player: TeamPlayer | PlayerForScoringPeriod | PlayerInfo
) {
  const team = getTeamNameAndAbbr(player.proTeamId);
  const position = getPosition(player.defaultPositionId);
  return {
    id: player.id,
    fullName: player.fullName,
    team: team.abbr,
    position: position.abbr,
  };
}

export function mapTeamRosterEntry(entry: TeamRosterEntry) {
  const player = entry.playerPoolEntry.player;
  const basicPlayerInfo = mapBasicPlayerInfo(player);
  return {
    ...basicPlayerInfo,
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
