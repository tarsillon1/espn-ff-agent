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
import { Type, type CallableTool } from "@google/genai";

function getPlayerKey(fullName: string, team: string) {
  return `${fullName}-${team}`;
}

async function enrichMatchupsWithPlayerPlays(
  season: number,
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
    season,
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

async function listCurrentMatchups(input: GetLeagueInput) {
  console.log("listing matchups");

  const league = await getLeagueCached(input);

  const currentMatchup = league.schedule?.find(hasRoster);
  const currentPeriodId = getPeriodId(currentMatchup) || 1;

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
  return {
    matchups,
    hasPlayoffsStarted: hasPlayoffsStarted(league.schedule),
  };
}

const listCurrentMatchupsToolName = "listCurrentMatchups";

export function createListCurrentMatchupsTool(
  input: GetLeagueInput
): CallableTool {
  const listCurrentMatchupsBinded = listCurrentMatchups.bind(null, input);
  return {
    callTool: async (functionCalls) => {
      const results = await Promise.all(
        functionCalls.map(async (call) => {
          if (call.name !== listCurrentMatchupsToolName) {
            return undefined;
          }

          const results = await listCurrentMatchupsBinded();
          return {
            functionResponse: {
              id: call.id,
              name: call.name,
              response: { results },
            },
          };
        })
      );
      return results.filter((result) => !!result);
    },
    tool: async () => {
      return {
        functionDeclarations: [
          {
            name: listCurrentMatchupsToolName,
            description:
              "List matchups in the league for the current scoring period",
            parameters: {
              type: Type.OBJECT,
              properties: {},
              required: [],
            },
          },
        ],
      };
    },
  };
}
