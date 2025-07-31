import { getPlayers } from "./players";
import { espnS2, espnSwid, leagueId } from "./config";

it("should get players ", async () => {
  const res = await getPlayers({
    year: 2025,
    leagueId,
    espnS2,
    espnSwid,
  });
  expect(res.length).toBeGreaterThan(0);
});
