import { getLeagueHistory } from "./history";
import { espnS2, espnSwid, leagueId } from "./config";
import { analyzeLeagueHistory } from "./analytics";

it("should get league analaytics", async () => {
  const history = await getLeagueHistory({
    leagueId: leagueId,
    espnS2: espnS2,
    espnSwid: espnSwid,
  });

  const analytics = analyzeLeagueHistory(history);
  expect(analytics).toBeDefined();
});
