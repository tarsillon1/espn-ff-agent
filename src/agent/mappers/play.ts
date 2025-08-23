import type { PlayWithPlayers } from "@/espn";

export function mapPlay(play: PlayWithPlayers) {
  return {
    text: play.play.text,
    time: play.play.time,
    down: play.play.down,
    distance: play.play.distance,
    quarter: play.play.quarter,
    timeRemaining: play.play.timeRemaining,
    yardLine: play.play.yardLine,
    gameId: play.play.gameId,
  };
}

export function mapPlays(playerPlayResults: PlayWithPlayers[]) {
  return playerPlayResults.map(mapPlay);
}
