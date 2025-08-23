import { generateFFText } from "./fantasy-football";

it("should generate a response", async () => {
  const response = await generateFFText({
    prompt: "whos got the best team",
    season: 2024,
  });
  console.log(response.text);
}, 60000);
