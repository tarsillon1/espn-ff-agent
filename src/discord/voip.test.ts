import { findVoiceChannel } from "./voip";

it("finds the correct voice channel", async () => {
  const channel = await findVoiceChannel(
    "339173103366045697",
    "1410821706037071923",
    "294254911158222848"
  );
  console.log(channel?.name);
});
