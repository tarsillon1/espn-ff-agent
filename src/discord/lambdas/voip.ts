import { streamVoice } from "@/agent/voice/openai";
import { VoipLambdaEvent } from "../types";
import { createVoipClient, findVoiceChannel } from "../voip";
import { Readable } from "stream";
import { sendAudioFollowup } from "../followup";
import { VoiceChannel } from "discord.js";
import { SQSEvent } from "aws-lambda";

async function playVoice(channel: VoiceChannel, stream: ReadableStream) {
  const voip = await createVoipClient(channel);
  if (!voip) {
    console.warn("failed to create voip client");
    return;
  }

  console.log("playing voice");

  await voip.play(Readable.from(stream));
  voip.close();
}

async function processVoipEvent({
  applicationId,
  token,
  channelId,
  guildId,
  memberId,
  script,
  style,
}: VoipLambdaEvent) {
  const voice = await streamVoice(script, style);
  const [voipStream, followupStream] = voice.tee();

  console.log("creating voip client");

  const channel = await findVoiceChannel(guildId, channelId, memberId);
  if (!channel) {
    console.warn("failed to find voice channel");
    return;
  }

  if (channel.members.size !== 0) {
    await playVoice(channel, voipStream);
  }

  console.log("sending audio file followup");

  await sendAudioFollowup(
    applicationId,
    token,
    await new Response(followupStream).arrayBuffer(),
    "commentary.wav"
  );
}

export async function handler(sqsEvent: SQSEvent) {
  console.log("Processing VoIP SQS event:", JSON.stringify(sqsEvent, null, 2));

  for (const record of sqsEvent.Records) {
    try {
      const voipEvent: VoipLambdaEvent = JSON.parse(record.body);
      console.log("Processing VoIP event for guild:", voipEvent.guildId);

      await processVoipEvent(voipEvent);

      console.log(
        "Successfully processed VoIP event for guild:",
        voipEvent.guildId
      );
    } catch (error) {
      console.error("Failed to process VoIP event:", error);
      // Don't throw here to avoid retrying the entire batch
      // The message will be retried by SQS if needed
    }
  }
}
