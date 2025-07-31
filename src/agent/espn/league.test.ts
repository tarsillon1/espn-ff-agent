import { getLeague } from "./league";
import { espnS2, espnSwid, leagueId } from "./config";
import { ESPNLeagueResponse } from "./types";

it("should get league", async () => {
  const res: ESPNLeagueResponse = await getLeague({
    espnS2,
    espnSwid,
    leagueId,
    year: 2024,
  });

  expect(res.id).toBeDefined();
});
