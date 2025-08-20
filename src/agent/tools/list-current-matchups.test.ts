import "dotenv/config";

import { createListCurrentMatchupsTool } from "./list-current-matchups";
import { espnS2, espnSwid, leagueId } from "@/espn";

it("should list current matchups", async () => {
  const listCurrentMatchups = createListCurrentMatchupsTool({
    leagueId: leagueId,
    espnS2: espnS2,
    espnSwid: espnSwid,
    season: 2024,
  });
  const matchups = await listCurrentMatchups.execute();
  expect(matchups).toBeDefined();
});
