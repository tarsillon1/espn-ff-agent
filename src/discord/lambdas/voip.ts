import { streamVoice } from "@/agent/voice/openai";
import { VoipLambdaEvent } from "../types";
import { createVoipClient, findVoiceChannel } from "../voip";
import { Readable } from "stream";
import { sendAudioFollowup } from "../followup";

export async function handler({
  applicationId,
  token,
  voiceChannelId,
  guildId,
  memberId,
  script,
  style
}: VoipLambdaEvent) {
    const voice = await streamVoice(script, style);
    const [voipStream, followupStream] = voice.tee();

    console.log("creating voip client");

    const channel = await findVoiceChannel(guildId, voiceChannelId, memberId);
    if (!channel) {
      console.warn("failed to find voice channel");
      return;
    }

    const voip = await createVoipClient(channel);
    if (!voip) {
      console.warn("failed to create voip client");
      return;
    }

    console.log("playing voice");

    await voip.play(Readable.from(voipStream));
    voip.close();

    console.log("sending audio file followup");

    await sendAudioFollowup(
      applicationId,
      token,
      await new Response(followupStream).arrayBuffer(),
      "commentary.wav"
    );
}