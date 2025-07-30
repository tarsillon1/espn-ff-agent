import { z } from "zod";
import {
  getLeagueCached,
  GetLeagueInput,
  Member,
  Schedule,
  Team,
} from "../espn";
import { mapMatchupWithScores, mapTeamBasicInfo } from "./mappers";
import { clean } from "../utils";
import { writeFileSync } from "fs";

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
      ...mapTeamBasicInfo(team, members),
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

export function createListMatchupsTool(input: GetLeagueInput) {
  async function listMatchups() {
    const league = await getLeagueCached(input);

    const matchups =
      league.schedule?.map((matchup) => mapMatchupWithScores(matchup)) || [];

    const output = {
      matchups: clean(matchups as Record<string, unknown>[]),
      teams: mapTeamsWithRecord(league.teams, league.members, league.schedule),
      hasPlayoffsStarted: hasPlayoffsStarted(league.schedule),
    };
    writeFileSync("matchups.json", JSON.stringify(output, null, 2));
    return output;
  }

  return {
    name: "listMatchups",
    description:
      "List all current and historical matchups in the league for the current season. Includes matchups, teams, and scores.",
    parameters: z.object({}),
    execute: listMatchups,
  };
}
