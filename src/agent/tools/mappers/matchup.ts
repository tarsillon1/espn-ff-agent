import {
  Schedule,
  ScheduleTeam,
  findTeamById,
  Member,
  Team,
  getTeamNameAndAbbr,
  getPosition,
} from "@/espn";
import { mapRosterBasicInfo } from "./team";

export function mapScheduleTeam(
  scheduleTeam: ScheduleTeam,
  teams: Team[],
  members: Member[]
) {
  const team = findTeamById(teams, scheduleTeam.teamId);
  return {
    roster: mapRosterBasicInfo(team, members),
    adjustment: scheduleTeam.adjustment,
    totalPoints: scheduleTeam.totalPoints,
  };
}

export function mapScheduleTeamWithScores(
  scheduleTeam: ScheduleTeam | undefined
) {
  if (!scheduleTeam) {
    return undefined;
  }
  return {
    teamId: scheduleTeam.teamId,
    totalPoints: scheduleTeam.totalPoints,
    adjustment: scheduleTeam.adjustment,
    roster: scheduleTeam.rosterForMatchupPeriod?.entries.map((entry) => {
      const team = getTeamNameAndAbbr(entry.playerPoolEntry.player.proTeamId);
      const position = getPosition(
        entry.playerPoolEntry.player.defaultPositionId
      );
      return {
        appliedStatTotal: entry.playerPoolEntry.appliedStatTotal,
        player: {
          id: entry.playerPoolEntry.player.id,
          fullName: entry.playerPoolEntry.player.fullName,
          team: team.abbr,
          position: position.abbr,
        },
      };
    }),
  };
}

export function mapMatchupWithScores(matchup: Schedule) {
  return {
    id: matchup.id,
    matchupPeriodId: matchup.matchupPeriodId,
    scoringPeriodId: matchup.scoringPeriodId,
    winner: matchup.winner,
    away: mapScheduleTeamWithScores(matchup.away),
    home: mapScheduleTeamWithScores(matchup.home),
    playoffTierType: matchup.playoffTierType,
  };
}
