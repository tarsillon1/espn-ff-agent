import { z } from "zod";
import {
  getPlayerPlays,
  getLeagueCached,
  GetLeagueInput,
  Schedule,
  PlayDetails,
  getTeamIdFromAbbr,
  ScheduleTeam,
} from "@/espn";
import {
  getPeriodId,
  hasPlayoffsStarted,
  mapMatchupWithScores,
} from "./mappers";
import { clean } from "@/utils";

function getPlayerKey(fullName: string, team: string) {
  return `${fullName}-${team}`;
}

async function enrichMatchupsWithPlayerPlays(
  year: number,
  currentPeriodId: number,
  matchups: ReturnType<typeof mapMatchupWithScores>[]
) {
  const scoringPeriodPlayers = new Map<
    string,
    { player: { fullName: string; team: string }; plays?: PlayDetails[] }
  >();

  for (const matchup of matchups) {
    const period = matchup.scoringPeriodId || matchup.matchupPeriodId;
    if (period !== currentPeriodId) {
      continue;
    }
    const rosters = [matchup.home?.roster, matchup.away?.roster];
    for (const roster of rosters) {
      for (const player of roster?.players || []) {
        const teamId = getTeamIdFromAbbr(player.player.team);
        const key = getPlayerKey(player.player.fullName, teamId);
        scoringPeriodPlayers.set(key, player);
      }
    }
  }

  const playersQuery = Array.from(scoringPeriodPlayers.values()).map(
    (player) => ({
      playerName: player.player.fullName,
      teamId: getTeamIdFromAbbr(player.player.team),
    })
  );
  if (playersQuery.length === 0) {
    return matchups;
  }

  const playerPlayResults = await getPlayerPlays({
    year,
    week: currentPeriodId,
    players: playersQuery,
  });

  for (const { playerName, teamId, plays } of playerPlayResults) {
    const key = getPlayerKey(playerName, teamId);
    const player = scoringPeriodPlayers.get(key);
    if (player) {
      player.plays = plays;
    }
  }

  return matchups;
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

export function createListCurrentMatchupsTool(input: GetLeagueInput) {
  async function listCurrentMatchups() {
    console.log("listing matchups");

    const league = await getLeagueCached(input);

    const currentMatchup = league.schedule?.find(hasRoster);
    const currentPeriodId = getPeriodId(currentMatchup);
    if (!currentPeriodId) {
      throw new Error("No current period found. Please try again later.");
    }

    const mappedMatchups =
      league.schedule
        ?.filter((schedule) => getPeriodId(schedule) === currentPeriodId)
        ?.map((matchup) => mapMatchupWithScores(matchup, league)) || [];
    const matchups = clean(
      await enrichMatchupsWithPlayerPlays(
        league.seasonId,
        currentPeriodId,
        mappedMatchups
      )
    );
    const output = {
      matchups,
      hasPlayoffsStarted: hasPlayoffsStarted(league.schedule),
    };

    return output;
  }

  return {
    name: "listCurrentMatchups",
    description:
      "List matchups in the league for the current scoring period. Includes matchups, teams, and scores. Players are listed with their name, team, position, injury status, free agent budget remaining, transaction counter, and lineup (bench or starting) status. Also includes scoring plays from live games for each player.",
    parameters: z.object({}),
    execute: listCurrentMatchups,
  };
}
