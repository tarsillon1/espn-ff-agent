import {
  Schedule,
  ScheduleTeam,
  getTeamNameAndAbbr,
  getPosition,
  ESPNLeagueResponse,
  RosterEntryForMatchupPeriod,
} from "@/espn";

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

export function mapScheduleTeam(scheduleTeam: ScheduleTeam) {
  return {
    teamId: scheduleTeam.teamId,
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
      injured: entry.playerPoolEntry.player.injured,
      injuryStatus: entry.playerPoolEntry.player.injuryStatus,
      lineupLocked: entry.playerPoolEntry.lineupLocked,
    },
  };
}

export function mapScheduleTeamWithScores(
  scheduleTeam: ScheduleTeam | undefined,
  isWinner: boolean,
  league: Pick<ESPNLeagueResponse, "schedule">
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
  league: Pick<ESPNLeagueResponse, "schedule">
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

function getRoster(matchup: ScheduleTeam) {
  return (
    matchup?.rosterForMatchupPeriod?.entries ||
    matchup?.rosterForScoringPeriod?.entries
  );
}

function hasRoster(matchup: Schedule) {
  const awayRoster = getRoster(matchup.away);
  const homeRoster = getRoster(matchup.home);
  return !!awayRoster?.length && !!homeRoster?.length;
}

export function mapMatchups(league: Pick<ESPNLeagueResponse, "schedule">) {
  const currentMatchup = league.schedule?.find(hasRoster);
  const currentPeriodId = getPeriodId(currentMatchup) || 1;

  const matchups =
    league.schedule
      ?.filter((schedule) => getPeriodId(schedule) === currentPeriodId)
      ?.map((matchup) => mapMatchupWithScores(matchup, league)) || [];
  return {
    matchups,
    week: currentPeriodId,
    hasPlayoffsStarted: hasPlayoffsStarted(league.schedule),
  };
}
