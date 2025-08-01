import { z } from "zod";
import {
  getPlayerPlays,
  getLeagueCached,
  GetLeagueInput,
  Member,
  Schedule,
  Team,
  PlayDetails,
  getTeamIdFromAbbr,
} from "@/espn";
import { mapMatchupWithScores, mapRosterBasicInfo } from "./mappers";
import { clean } from "@/utils";

function isPlayoffMatchup(matchup: Schedule) {
  return matchup.playoffTierType !== "NONE";
}

function hasPlayoffsStarted(matchups: Schedule[] | undefined) {
  return matchups?.some(isPlayoffMatchup);
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

function mapTeamsWithRecord(
  teams: Team[],
  members: Member[],
  schedule: Schedule[] | undefined
) {
  return teams.map((team) => {
    return {
      ...mapRosterBasicInfo(team, members),
      isEliminatedFromPlayoffs: isEliminatedFromPlayoffs(team.id, schedule),
      record: {
        regularSeason: {
          wins: team.record.overall.wins,
          ties: team.record.overall.ties,
          losses: team.record.overall.losses,
        },
      },
    };
  });
}

function getPlayerKey(fullName: string, team: string) {
  return `${fullName}-${team}`;
}

async function enrichMatchupsWithPlayerPlays(
  year: number,
  matchups: ReturnType<typeof mapMatchupWithScores>[]
) {
  const scoringPeriodPlayers = new Map<
    number,
    Map<
      string,
      { player: { fullName: string; team: string }; plays?: PlayDetails[] }
    >
  >();

  for (const matchup of matchups) {
    const period = matchup.scoringPeriodId || matchup.matchupPeriodId;
    const players: Map<string, { player: { fullName: string; team: string } }> =
      scoringPeriodPlayers.get(period) || new Map();
    const rosters = [matchup.home?.roster, matchup.away?.roster];
    for (const roster of rosters) {
      for (const player of roster || []) {
        const teamId = getTeamIdFromAbbr(player.player.team);
        const key = getPlayerKey(player.player.fullName, teamId);
        players.set(key, player);
      }
    }

    scoringPeriodPlayers.set(period, players);
  }

  for (const [week, players] of scoringPeriodPlayers.entries()) {
    const playersQuery = Array.from(players.values()).map((player) => ({
      playerName: player.player.fullName,
      teamId: getTeamIdFromAbbr(player.player.team),
    }));
    if (playersQuery.length === 0) {
      continue;
    }
    const playerPlayResults = await getPlayerPlays({
      year,
      week,
      players: playersQuery,
    });

    for (const { playerName, teamId, plays } of playerPlayResults) {
      const key = getPlayerKey(playerName, teamId);
      const player = players.get(key);
      if (player) {
        player.plays = plays;
      }
    }
  }

  return matchups;
}

export function createListMatchupsTool(input: GetLeagueInput) {
  async function listMatchups() {
    console.log("listing matchups");

    const league = await getLeagueCached(input);

    const mappedMatchups =
      league.schedule?.map((matchup) => mapMatchupWithScores(matchup)) || [];
    const matchups = clean(
      await enrichMatchupsWithPlayerPlays(league.seasonId, mappedMatchups)
    );
    const output = {
      matchups,
      teams: mapTeamsWithRecord(league.teams, league.members, league.schedule),
      hasPlayoffsStarted: hasPlayoffsStarted(league.schedule),
    };
    return output;
  }

  return {
    name: "listMatchups",
    description:
      "List all current and historical matchups in the league for the current season. Includes matchups, teams, and scores. Players are listed with their name, team, position, injury status, free agent budget remaining, transaction counter, and lineup (bench or starting) status. Also includes scoring plays from live games for each player.",
    parameters: z.object({}),
    execute: listMatchups,
  };
}
