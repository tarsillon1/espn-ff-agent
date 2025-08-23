import { generateFFText } from "./fantasy-football";

it("should generate a response", async () => {
  const response = await generateFFText({
    prompt: "why is matt so bad at fantasy football",
    season: 2024,
  });
  console.log(response.text);
}, 60000);
