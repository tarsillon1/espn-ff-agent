import { getLeagueHistory } from "./history";
import { espnS2, espnSwid, leagueId } from "./config";

it("should get history", async () => {
  const history = await getLeagueHistory({
    leagueId: leagueId,
    espnS2: espnS2,
    espnSwid: espnSwid,
  });
  expect(history).toBeDefined();
});
