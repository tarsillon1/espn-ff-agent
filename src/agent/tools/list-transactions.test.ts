import "dotenv/config";

import { createListTransactionsTool } from "./list-transactions";
import { espnS2, espnSwid, leagueId } from "@/espn";

it("should list transcations", async () => {
  const listTransactions = createListTransactionsTool({
    leagueId: leagueId,
    espnS2: espnS2,
    espnSwid: espnSwid,
    season: 2024,
  });
  const transactions = await listTransactions.execute();
  console.log(transactions);
  expect(transactions).toBeDefined();
});
