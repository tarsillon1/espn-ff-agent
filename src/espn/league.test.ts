import { getLeague } from "./league";
import { espnS2, espnSwid, leagueId } from "./config";
import { ESPNLeagueResponse } from "./types";
import { writeFileSync } from "fs";

it("should get league", async () => {
  const res: ESPNLeagueResponse = await getLeague({
    espnS2,
    espnSwid,
    leagueId,
    season: 2024,
  });
  writeFileSync("league.json", JSON.stringify(res, null, 2));
  expect(res.id).toBeDefined();
});
