import {
  getLeagueCached,
  GetLeagueInput,
  Schedule,
  ScheduleTeam,
} from "@/espn";
import {
  getPeriodId,
  hasPlayoffsStarted,
  mapMatchupWithScores,
} from "./mappers";

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

export async function listCurrentMatchups(input: GetLeagueInput) {
  console.log("listing matchups");

  const league = await getLeagueCached(input);

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
