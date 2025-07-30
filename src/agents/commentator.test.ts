import { commentate } from "./commentator";

it("should commentate", async () => {
  const result = await commentate("who are the best teams in this league?");
  console.log(result.text);
  expect(result).toBeDefined();
});
