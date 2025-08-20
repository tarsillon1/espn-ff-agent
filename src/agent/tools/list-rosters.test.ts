import { espnS2, espnSwid, leagueId } from "@/espn";
import { createListRostersTool } from "./list-rosters";

it("should list rosters", async () => {
  const rosters = await createListRostersTool({
    leagueId: leagueId,
    espnS2: espnS2,
    espnSwid: espnSwid,
    season: 2024,
  }).execute();

  expect(rosters).toBeDefined();
});
