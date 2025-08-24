import { streamVoice } from "@/agent/voice/openai";
import {
  BroadcastDestination,
  Destination,
  InteractionDesitnation,
  VoipLambdaEvent,
} from "../types";
import { findChannelAndPlayVoice } from "../voip";
import { sendInteractionAudioFollowup } from "../followup";
import { SQSEvent } from "aws-lambda";
import { sendAudioToTextChannel } from "../text";

async function handleInteractionFollowup(
  { applicationId, interactionToken }: InteractionDesitnation,
  followupStream: ReadableStream
) {
  await sendInteractionAudioFollowup(
    applicationId,
    interactionToken,
    await new Response(followupStream).arrayBuffer(),
    "commentary.wav"
  );
}

async function handleBroadcastFollowup(
  destination: BroadcastDestination,
  followupStream: ReadableStream
) {
  if (!destination.textChannelId) {
    console.warn("no text channel id");
    return;
  }

  await sendAudioToTextChannel(destination.textChannelId, followupStream);

  return [];
}

async function handleDestinationFollowup(
  destination: Destination,
  followupStream: ReadableStream
) {
  if (destination.type === "interaction") {
    return handleInteractionFollowup(destination, followupStream);
  }
  return handleBroadcastFollowup(destination, followupStream);
}

async function processVoipEvent({
  voiceChannelId,
  script,
  style,
  destination,
}: VoipLambdaEvent) {
  const voice = await streamVoice(script, style);
  const [voipStream, followupStream] = voice.tee();

  console.log("creating voip client");

  if (voiceChannelId) {
    await findChannelAndPlayVoice(voiceChannelId, voipStream);
  }

  console.log("sending audio file followup");

  await handleDestinationFollowup(destination, followupStream);
}

export async function handler(sqsEvent: SQSEvent) {
  for (const record of sqsEvent.Records) {
    try {
      const voipEvent: VoipLambdaEvent = JSON.parse(record.body);
      console.log("processing voip event:", voipEvent);

      await processVoipEvent(voipEvent);
    } catch (error) {
      console.error("Failed to process VoIP event:", error);
      // Don't throw here to avoid retrying the entire batch
      // The message will be retried by SQS if needed
    }
  }
}
