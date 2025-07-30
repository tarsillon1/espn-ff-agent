import { commentate } from "./commentator";

it("should commentate", async () => {
  const result = await commentate("who is doing well this season?");
  console.log(result.text);
  expect(result).toBeDefined();
});
