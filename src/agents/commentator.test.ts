import { commentate } from "./commentator";

it("should commentate", async () => {
  const result = await commentate("what has been going on lately");
  console.log(result.text);
  expect(result).toBeDefined();
});
