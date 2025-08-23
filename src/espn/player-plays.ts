import { nflBaseUrl } from "./config";

export interface PlayerPlaysInput {
  season: number;
  week: number;
  players: Array<{
    playerName: string;
    teamId: string;
  }>;
}

export interface PlayDetails {
  text: string;
  time: string;
  down?: number;
  distance?: number;
  quarter: number;
  timeRemaining: string;
  yardLine?: number;
  gameId: string;
  driveId?: string;
  playId: string;
}

export interface PlayWithPlayers {
  play: PlayDetails;
  playersInvolved: Array<{
    playerName: string;
    teamId: string;
  }>;
}

export async function getPlayerPlays({
  season,
  week,
  players,
}: PlayerPlaysInput): Promise<PlayWithPlayers[]> {
  const gamesUrl = `${nflBaseUrl}/scoreboard?week=${week}&dates=${season}`;
  const gamesResponse = await fetch(gamesUrl);

  if (!gamesResponse.ok) {
    throw new Error(`Failed to fetch games: ${gamesResponse.status}`);
  }

  const gamesData = (await gamesResponse.json()) as any;
  const allGames = gamesData.events || [];

  const allPlays: PlayWithPlayers[] = [];

  for (const game of allGames) {
    const gamePlays = await getPlaysFromGame(game.id, players);
    allPlays.push(...gamePlays);
  }

  // Sort plays by game, quarter, and time
  allPlays.sort((a, b) => {
    if (a.play.gameId !== b.play.gameId) {
      return a.play.gameId.localeCompare(b.play.gameId);
    }
    if (a.play.quarter !== b.play.quarter) {
      return a.play.quarter - b.play.quarter;
    }
    return a.play.time.localeCompare(b.play.time);
  });

  return allPlays;
}

async function getPlaysFromGame(
  gameId: string,
  players: Array<{ playerName: string; teamId: string }>
): Promise<PlayWithPlayers[]> {
  try {
    const summaryUrl = `${nflBaseUrl}/summary?event=${gameId}`;
    const response = await fetch(summaryUrl);

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as any;
    const playsWithPlayers: PlayWithPlayers[] = [];

    // Check drives for all plays
    if (data.drives) {
      const drives = data.drives.previous || data.drives.current || [];
      for (const drive of drives) {
        if (!drive.plays || !Array.isArray(drive.plays)) {
          continue;
        }

        // For each play, check if any of our players are involved
        for (const play of drive.plays) {
          const playersInvolved: Array<{ playerName: string; teamId: string }> =
            [];

          // Check which players are involved in this play
          for (const player of players) {
            if (
              drive.team.id === player.teamId &&
              isPlayerInPlay(play.text, player.playerName)
            ) {
              playersInvolved.push(player);
            }
          }

          // Only include plays where at least one of our players is involved
          if (playersInvolved.length > 0) {
            const playDetails: PlayDetails = {
              text: play.text,
              time: play.clock?.displayValue || "",
              down: play.start?.down || undefined,
              distance: play.start?.distance || undefined,
              quarter: play.period?.number || 1,
              timeRemaining: play.clock?.displayValue || "",
              yardLine: play.start?.yardLine || undefined,
              gameId: gameId,
              driveId: drive.id,
              playId: play.id,
            };

            playsWithPlayers.push({
              play: playDetails,
              playersInvolved,
            });
          }
        }
      }
    }

    return playsWithPlayers;
  } catch (error) {
    // Continue with other games even if one fails
    return [];
  }
}

function getPlayerNameVariations(playerName: string): string[] {
  const playerNameLower = playerName.toLowerCase();
  const playerFirstName = playerNameLower.split(" ")[0];
  const playerLastName = playerNameLower.split(" ")[1];

  const variations = [playerNameLower];
  for (let i = 0; i < playerFirstName.length - 1; i++) {
    const firstLetterOfFirstName = playerFirstName.substring(0, i + 1);
    const playerShortName = `${firstLetterOfFirstName}.${playerLastName}`;
    variations.push(playerShortName);
  }

  return variations;
}

function isPlayerInPlay(playText: string, playerName: string): boolean {
  if (!playText) return false;
  const lowerPlayText = playText.toLowerCase();
  const nameVariations = getPlayerNameVariations(playerName);
  return nameVariations.some((variation) => lowerPlayText.includes(variation));
}
