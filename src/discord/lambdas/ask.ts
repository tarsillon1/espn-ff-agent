import type { AskLambdaEvent } from "../types";

import { generateFFText } from "@/agent/fantasy-football";
import { chunkAndSendFollowup, sendAudioFollowup } from "../followup";
import { streamVoice } from "@/agent/voice/openai";
import { podcastStylePrompt } from "@/agent/prompt";
import { createVoipClient, findVoiceChannel } from "../voip";
import { Readable } from "stream";

// this is a manually invoked lambda
export async function handler({
  applicationId,
  token,
  prompt,
  voiceChannelId,
  guildId,
  memberId,
  season,
  system,
}: AskLambdaEvent) {
  try {
    console.log("generating text");

    const response = await generateFFText({
      prompt,
      season,
      system,
    });
    await chunkAndSendFollowup(applicationId, token, response.text);

    console.log("generating voice for commentary");

    const voice = await streamVoice(podcastStylePrompt, response.text);
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
  } catch (err) {
    console.error("Failed to generate commentary", err);
  }
}
