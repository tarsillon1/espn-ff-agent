import { generateFFText } from "./fantasy-football";

it("should generate a response", async () => {
  const response = await generateFFText({
    prompt: "give me a waiver wire recap for this week",
    season: 2024,
  });
  console.log(response.text);
}, 60000);
