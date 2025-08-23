import { generateFFText } from "./fantasy-football";

it("should generate a response", async () => {
  const response = await generateFFText({
    prompt: "is CJ stroud in the 10th a good pick?",
    season: 2024,
  });
  console.log(response.text);
}, 60000);
