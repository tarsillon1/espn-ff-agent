import { commentate } from "./commentator";

it("should commentate", async () => {
  const result = await commentate(
    "can you give me a scoring update for this week?"
  );
  console.log(result.text);
  expect(result).toBeDefined();
});
