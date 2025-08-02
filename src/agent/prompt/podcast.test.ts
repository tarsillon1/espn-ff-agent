import { generateFFText } from "../fantasy-football";

it("should be able to generate a podcast script", async () => {
  const podcast = await generateFFText("recap latest matchups");
  console.log(podcast.text);
  expect(podcast.text).toBeDefined();
});
