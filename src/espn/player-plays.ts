import { nflBaseUrl } from "./config";

export interface PlayerPlaysInput {
  year: number;
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
}

export interface PlayerPlaysResult {
  playerName: string;
  teamId: string;
  plays: PlayDetails[];
}

export async function getPlayerPlays({
  year,
  week,
  players,
}: PlayerPlaysInput): Promise<PlayerPlaysResult[]> {
  const gamesUrl = `${nflBaseUrl}/scoreboard?week=${week}&dates=${year}`;
  const gamesResponse = await fetch(gamesUrl);

  if (!gamesResponse.ok) {
    throw new Error(`Failed to fetch games: ${gamesResponse.status}`);
  }

  const gamesData = (await gamesResponse.json()) as any;
  const allGames = gamesData.events || [];

  const results: PlayerPlaysResult[] = players.map((player) => ({
    playerName: player.playerName,
    teamId: player.teamId,
    plays: [],
  }));

  for (const game of allGames) {
    const gamePlays = await getBulkPlayerPlaysFromGame(game.id, players);

    for (let i = 0; i < players.length; i++) {
      results[i].plays.push(...gamePlays[i]);
    }
  }

  return results;
}

async function getBulkPlayerPlaysFromGame(
  gameId: string,
  players: Array<{ playerName: string; teamId: string }>
): Promise<PlayDetails[][]> {
  try {
    const summaryUrl = `${nflBaseUrl}/summary?event=${gameId}`;
    const response = await fetch(summaryUrl);

    if (!response.ok) {
      return players.map(() => []);
    }

    const data = (await response.json()) as any;
    const playerPlays: PlayDetails[][] = players.map(() => []);

    // Check drives for all plays
    if (data.drives) {
      const drives = data.drives.previous || data.drives.current || [];
      for (const drive of drives) {
        if (!drive.plays || !Array.isArray(drive.plays)) {
          continue;
        }

        // For each play, check if any of our players are involved
        for (const play of drive.plays) {
          for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (
              drive.team.id === player.teamId &&
              isPlayerInPlay(play.text, player.playerName)
            ) {
              const playDetails: PlayDetails = {
                text: play.text,
                time: play.clock?.displayValue || "",
                down: play.start?.down || undefined,
                distance: play.start?.distance || undefined,
                quarter: play.period?.number || 1,
                timeRemaining: play.clock?.displayValue || "",
                yardLine: play.start?.yardLine || undefined,
              };
              playerPlays[i].push(playDetails);
            }
          }
        }
      }
    }

    return playerPlays;
  } catch (error) {
    // Continue with other games even if one fails
    return players.map(() => []);
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
