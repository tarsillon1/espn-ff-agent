import { generateFFText } from "./fantasy-football";

it("should generate a response", async () => {
  const response = await generateFFText({
    prompt: "who won the recent trade",
  });
  console.log(response.text);
}, 60000);
