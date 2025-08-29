import {
  LeagueHistory,
  LeagueSnapshot,
  HistorySchedule,
  HistoryTeam,
  ESPNLeagueResponse,
  Team,
} from "./types";

export interface TeamStats {
  teamId: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  winPercentage: number;
  averagePointsScored: number;
  totalPointsScored: number;
  totalGamesPlayed: number;
  playoffAppearances: number;
  championshipAppearances: number;
  championshipsWon: number;
  seasons: SeasonStats[];
  headToHeadRecords: HeadToHeadRecord[];
}

export interface SeasonStats {
  seasonId: number;
  wins: number;
  losses: number;
  ties: number;
  pointsScored: number;
  gamesPlayed: number;
  madePlayoffs: boolean;
  madeChampionship: boolean;
  wonChampionship: boolean;
  playoffSeed?: number;
  totalPoints?: number;
}

export interface HeadToHeadRecord {
  opponentTeamId: number;
  wins: number;
  losses: number;
  ties: number;
  totalGames: number;
  winPercentage: number;
}

export interface LeagueAnalytics {
  teams: { [teamId: number]: TeamStats };
  totalSeasons: number;
  dateRange: {
    earliest: Date;
    latest: Date;
  };
}

export function analyzeLeagueHistory(
  history: LeagueHistory,
  teams: Pick<Team, "id">[]
): LeagueAnalytics {
  const teamStats: { [teamId: number]: TeamStats } = {};

  let earliestDate = new Date();
  let latestDate = new Date(0);

  const includedTeamSet = new Set(teams.map((t) => t.id));

  teams.forEach((team) => {
    teamStats[team.id] = {
      teamId: team.id,
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      winPercentage: 0,
      averagePointsScored: 0,
      totalPointsScored: 0,
      totalGamesPlayed: 0,
      playoffAppearances: 0,
      championshipAppearances: 0,
      championshipsWon: 0,
      seasons: [],
      headToHeadRecords: [],
    };
  });

  // Process each season/snapshot
  history.forEach((snapshot: LeagueSnapshot) => {
    const seasonId = snapshot.seasonId;
    const snapshotDate = new Date(snapshot.status.activatedDate);

    if (snapshotDate < earliestDate) earliestDate = snapshotDate;
    if (snapshotDate > latestDate) latestDate = snapshotDate;

    // Process teams in this snapshot
    snapshot.teams.forEach((team: HistoryTeam) => {
      if (!includedTeamSet.has(team.id)) {
        return;
      }

      // Initialize season stats
      const seasonStats: SeasonStats = {
        seasonId,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsScored: 0,
        gamesPlayed: 0,
        madePlayoffs: false,
        madeChampionship: false,
        wonChampionship: false,
        playoffSeed: team.playoffSeed,
        totalPoints: team.points,
      };

      teamStats[team.id].seasons.push(seasonStats);
    });

    // Process schedule/matches for this season
    snapshot.schedule.forEach((match: HistorySchedule) => {
      const homeTeam = match.home;
      const awayTeam = match.away;

      if (!homeTeam || !awayTeam) return;

      // Skip matches that don't involve any of the included teams if filtering is enabled
      if (
        !includedTeamSet.has(homeTeam.teamId) &&
        !includedTeamSet.has(awayTeam.teamId)
      ) {
        return;
      }

      // Determine winner and update records
      if (match.winner === "HOME") {
        updateTeamSeasonStats(
          teamStats,
          homeTeam.teamId,
          seasonId,
          true,
          false,
          homeTeam.totalPoints
        );
        updateTeamSeasonStats(
          teamStats,
          awayTeam.teamId,
          seasonId,
          false,
          true,
          awayTeam.totalPoints
        );
        updateHeadToHeadRecord(
          teamStats,
          homeTeam.teamId,
          awayTeam.teamId,
          true,
          false,
          includedTeamSet
        );
        updateHeadToHeadRecord(
          teamStats,
          awayTeam.teamId,
          homeTeam.teamId,
          false,
          true,
          includedTeamSet
        );
      } else if (match.winner === "AWAY") {
        updateTeamSeasonStats(
          teamStats,
          awayTeam.teamId,
          seasonId,
          true,
          false,
          awayTeam.totalPoints
        );
        updateTeamSeasonStats(
          teamStats,
          homeTeam.teamId,
          seasonId,
          false,
          true,
          homeTeam.totalPoints
        );
        updateHeadToHeadRecord(
          teamStats,
          awayTeam.teamId,
          homeTeam.teamId,
          true,
          false,
          includedTeamSet
        );
        updateHeadToHeadRecord(
          teamStats,
          homeTeam.teamId,
          awayTeam.teamId,
          false,
          true,
          includedTeamSet
        );
      } else {
        // Tie
        updateTeamSeasonStats(
          teamStats,
          homeTeam.teamId,
          seasonId,
          false,
          false,
          homeTeam.totalPoints
        );
        updateTeamSeasonStats(
          teamStats,
          awayTeam.teamId,
          seasonId,
          false,
          false,
          awayTeam.totalPoints
        );
        updateHeadToHeadRecord(
          teamStats,
          homeTeam.teamId,
          awayTeam.teamId,
          false,
          false,
          includedTeamSet
        );
        updateHeadToHeadRecord(
          teamStats,
          awayTeam.teamId,
          homeTeam.teamId,
          false,
          false,
          includedTeamSet
        );
      }
    });

    // Determine playoff and championship appearances
    determinePlayoffAndChampionshipStats(teamStats, seasonId, snapshot);
  });

  // Calculate aggregate statistics
  Object.values(teamStats).forEach((team) => {
    team.totalWins = team.seasons.reduce((sum, season) => sum + season.wins, 0);
    team.totalLosses = team.seasons.reduce(
      (sum, season) => sum + season.losses,
      0
    );
    team.totalTies = team.seasons.reduce((sum, season) => sum + season.ties, 0);
    team.totalGamesPlayed = team.seasons.reduce(
      (sum, season) => sum + season.gamesPlayed,
      0
    );
    team.totalPointsScored = team.seasons.reduce(
      (sum, season) => sum + season.pointsScored,
      0
    );

    team.winPercentage =
      team.totalGamesPlayed > 0
        ? (team.totalWins + team.totalTies * 0.5) / team.totalGamesPlayed
        : 0;

    team.averagePointsScored =
      team.totalGamesPlayed > 0
        ? team.totalPointsScored / team.totalGamesPlayed
        : 0;

    team.playoffAppearances = team.seasons.reduce(
      (sum, season) => sum + (season.madePlayoffs ? 1 : 0),
      0
    );
    team.championshipAppearances = team.seasons.reduce(
      (sum, season) => sum + (season.madeChampionship ? 1 : 0),
      0
    );
    team.championshipsWon = team.seasons.reduce(
      (sum, season) => sum + (season.wonChampionship ? 1 : 0),
      0
    );

    // Calculate win percentages for head-to-head records
    team.headToHeadRecords.forEach((record) => {
      record.winPercentage =
        record.totalGames > 0
          ? (record.wins + record.ties * 0.5) / record.totalGames
          : 0;
    });
  });

  return {
    teams: teamStats,
    totalSeasons: history.length,
    dateRange: {
      earliest: earliestDate,
      latest: latestDate,
    },
  };
}

function updateTeamSeasonStats(
  teams: { [teamId: number]: TeamStats },
  teamId: number,
  seasonId: number,
  isWin: boolean,
  isLoss: boolean,
  pointsScored: number
) {
  const team = teams[teamId];
  if (!team) return;

  const season = team.seasons.find((s) => s.seasonId === seasonId);
  if (!season) return;

  if (isWin) season.wins++;
  else if (isLoss) season.losses++;
  else season.ties++;

  season.pointsScored += pointsScored;
  season.gamesPlayed++;
}

function updateHeadToHeadRecord(
  teams: { [teamId: number]: TeamStats },
  teamId: number,
  opponentId: number,
  isWin: boolean,
  isLoss: boolean,
  includedTeamSet: Set<number>
) {
  const team = teams[teamId];
  if (!team) return;

  if (!includedTeamSet.has(teamId) || !includedTeamSet.has(opponentId)) {
    return;
  }

  let record = team.headToHeadRecords.find(
    (r) => r.opponentTeamId === opponentId
  );
  if (!record) {
    record = {
      opponentTeamId: opponentId,
      wins: 0,
      losses: 0,
      ties: 0,
      totalGames: 0,
      winPercentage: 0,
    };
    team.headToHeadRecords.push(record);
  }

  if (isWin) record.wins++;
  else if (isLoss) record.losses++;
  else record.ties++;

  record.totalGames++;
}

function determinePlayoffAndChampionshipStats(
  teams: { [teamId: number]: TeamStats },
  seasonId: number,
  snapshot: LeagueSnapshot
) {
  const playoffTeamCount =
    snapshot.settings.scheduleSettings?.playoffTeamCount || 6;

  // Use team data from the snapshot to determine playoff and championship status
  snapshot.teams.forEach((team) => {
    const teamStats = teams[team.id];
    if (!teamStats) return;

    const season = teamStats.seasons.find((s) => s.seasonId === seasonId);
    if (!season) return;

    // Determine playoff appearance based on seed and league settings
    // A team made playoffs if their seed is less than or equal to the number of playoff teams
    // and their seed is greater than 0 (0 typically means no seed/eliminated)
    if (team.playoffSeed > 0 && team.playoffSeed <= playoffTeamCount) {
      season.madePlayoffs = true;
    }

    // Determine championship appearance and win
    // Championship participants are rank 1 and 2 in calculated final rankings
    if (team.rankCalculatedFinal === 1 || team.rankCalculatedFinal === 2) {
      season.madeChampionship = true;

      // Championship winner is determined by calculated final rank
      if (team.rankCalculatedFinal === 1) {
        season.wonChampionship = true;
      }
    }
  });
}
