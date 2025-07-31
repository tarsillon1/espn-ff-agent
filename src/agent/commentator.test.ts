import { commentate } from "./commentator";

it("should commentate", async () => {
  const result = await commentate(
    "Create an update on the latest free agency period"
  );
  console.log(result.text);
  expect(result).toBeDefined();
});
