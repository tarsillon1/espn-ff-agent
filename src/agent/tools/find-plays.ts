import { getPlayerPlays, getTeamIdFromAbbr } from "@/espn";
import { mapMatchupWithScores } from "./mappers";
import { PlayDetails } from "@/espn";

function getPlayerKey(fullName: string, team: string) {
  return `${fullName}-${team}`;
}

export async function findPlays(
  season: number,
  week: number,
  matchups: ReturnType<typeof mapMatchupWithScores>[]
) {
  console.log("finding plays", season, week);

  const scoringPeriodPlayers = new Map<
    string,
    { player: { fullName: string; team: string }; plays?: PlayDetails[] }
  >();

  for (const matchup of matchups) {
    const period = matchup.scoringPeriodId || matchup.matchupPeriodId;
    if (period !== week) {
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
    return [];
  }

  const playerPlayResults = await getPlayerPlays({
    season,
    week,
    players: playersQuery,
  });

  return playerPlayResults.map(
    ({
      play: {
        text,
        time,
        down,
        distance,
        quarter,
        timeRemaining,
        yardLine,
        gameId,
      },
    }) => ({
      text,
      time,
      down,
      distance,
      quarter,
      timeRemaining,
      yardLine,
      gameId,
    })
  );
}
