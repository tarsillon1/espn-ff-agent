import {
  Schedule,
  ScheduleTeam,
  findTeamById,
  Member,
  Team,
  getTeamNameAndAbbr,
  getPosition,
  ESPNLeagueResponse,
  RosterEntryForMatchupPeriod,
} from "@/espn";
import { mapRosterBasicInfo } from "./team";

export function getPeriodId(schedule: Schedule | undefined) {
  return schedule?.scoringPeriodId || schedule?.matchupPeriodId;
}

export function hasPlayoffsStarted(matchups: Schedule[] | undefined) {
  return matchups?.some(isPlayoffMatchup);
}

function isPlayoffMatchup(matchup: Schedule) {
  return matchup.playoffTierType !== "NONE";
}

function isChampionshipMatchup(
  matchup: Schedule,
  schedule: Schedule[] | undefined
) {
  if (matchup.playoffTierType !== "WINNERS_BRACKET") {
    return false;
  }
  const winnerBracketCount = schedule?.filter(
    (schedule) =>
      schedule.playoffTierType === "WINNERS_BRACKET" &&
      getPeriodId(schedule) === getPeriodId(matchup)
  ).length;
  return winnerBracketCount === 1;
}

function isEliminatedFromPlayoffs(
  teamId: number,
  matchups: Schedule[] | undefined
) {
  return matchups?.some((matchup) => {
    const isTeamGame =
      matchup.away?.teamId === teamId || matchup.home?.teamId === teamId;
    const teamSide = matchup.away?.teamId === teamId ? "AWAY" : "HOME";
    return (
      isTeamGame && isPlayoffMatchup(matchup) && matchup.winner !== teamSide
    );
  });
}

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

export function mapRosterForPeriod(entry: RosterEntryForMatchupPeriod) {
  const team = getTeamNameAndAbbr(entry.playerPoolEntry.player.proTeamId);
  const position = getPosition(entry.playerPoolEntry.player.defaultPositionId);
  return {
    appliedStatTotal: entry.playerPoolEntry.appliedStatTotal,
    playerId: entry.playerPoolEntry.player.id,
    player: {
      playerId: entry.playerPoolEntry.player.id,
      fullName: entry.playerPoolEntry.player.fullName,
      team: team.abbr,
      position: position.abbr,
      lineupLocked: entry.playerPoolEntry.lineupLocked,
    },
  };
}

export function mapScheduleTeamWithScores(
  scheduleTeam: ScheduleTeam | undefined,
  isWinner: boolean,
  league: ESPNLeagueResponse
) {
  if (!scheduleTeam) {
    return undefined;
  }
  const roster =
    scheduleTeam.rosterForScoringPeriod || scheduleTeam.rosterForMatchupPeriod;
  const players = roster?.entries.map(mapRosterForPeriod);

  return {
    isWinner,
    totalPoints: scheduleTeam.totalPoints,
    roster: {
      teamId: scheduleTeam.teamId,
      isEliminatedFromPlayoffs: isEliminatedFromPlayoffs(
        scheduleTeam.teamId,
        league.schedule
      ),
      players,
    },
  };
}

export function mapMatchupWithScores(
  matchup: Schedule,
  league: ESPNLeagueResponse
) {
  const output = {
    id: matchup.id,
    matchupPeriodId: matchup.matchupPeriodId,
    scoringPeriodId: matchup.scoringPeriodId,
    playoffTierType: matchup.playoffTierType,
    isChampionshipMatchup: isChampionshipMatchup(matchup, league.schedule),
    isWinnerDecided: matchup.winner !== "UNDECIDED",
  };
  return {
    ...output,
    away: mapScheduleTeamWithScores(
      matchup.away,
      matchup.winner === "AWAY",
      league
    ),
    home: mapScheduleTeamWithScores(
      matchup.home,
      matchup.winner === "HOME",
      league
    ),
  };
}
