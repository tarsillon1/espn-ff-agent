import { getLeagueHistory } from "./history";
import { espnS2, espnSwid, leagueId } from "./config";
import { analyzeLeagueHistory } from "./analytics";
import { writeFileSync } from "fs";
import { getLeagueCached } from "./league";

it("should get league analaytics", async () => {
  const league = await getLeagueCached({
    leagueId: leagueId,
    espnS2: espnS2,
    espnSwid: espnSwid,
    season: 2025,
  });
  const history = await getLeagueHistory({
    leagueId: leagueId,
    espnS2: espnS2,
    espnSwid: espnSwid,
  });

  const analytics = analyzeLeagueHistory(history, league.teams);
  writeFileSync("analytics.json", JSON.stringify(analytics, null, 2));
  expect(analytics).toBeDefined();
});
