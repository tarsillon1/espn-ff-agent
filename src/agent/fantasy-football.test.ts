import { generateFFText } from "./fantasy-football";

it("should generate a response", async () => {
  const response = await generateFFText({
    prompt: "how are the matchups looking this week?",
    season: 2024,
  });
  console.log(response.text);
}, 60000);
