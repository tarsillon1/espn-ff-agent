import "dotenv/config";

import { createListNFLHeadlinesTool } from "./nfl-headlines";

it("should list nfl headlines", async () => {
  const listNFLHeadlines = createListNFLHeadlinesTool();
  const headlines = await listNFLHeadlines.execute();
  console.log(headlines);
  expect(headlines).toBeDefined();
});
