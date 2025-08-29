import type {
  BroadcastDestination,
  Destination,
  GenerateLambdaEvent,
  InteractionDesitnation,
  VoipLambdaEvent,
} from "../types";

import { randomBytes } from "crypto";

import { generateFFText } from "@/agent/fantasy-football";
import { chunkAndSendInteractionFollowup } from "../followup";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQSEvent } from "aws-lambda";
import { findVoiceChannel } from "../voip";
import { getDiscordInstance } from "../client";
import { chunkAndSendText, findTextChannel } from "../text";
import { sqs } from "../sqs";
import { voipQueueUrl } from "../config";

async function handleInteractionFollowup(
  destination: InteractionDesitnation,
  text: string
): Promise<VoipLambdaEvent[]> {
  const { applicationId, interactionToken, guildId, channelId, memberId } =
    destination;
  const [channel] = await Promise.all([
    findVoiceChannel(guildId, channelId, memberId),
    chunkAndSendInteractionFollowup(applicationId, interactionToken, text),
  ]);
  return [
    {
      destination,
      script: text,
      voiceChannelId: channel?.id,
    },
  ];
}

async function handleBroadcastFollowup(
  destination: BroadcastDestination,
  text: string
): Promise<VoipLambdaEvent[]> {
  const discord = await getDiscordInstance();
  const guilds = [...discord.guilds.cache.values()];
  return Promise.all(
    guilds.map(async ({ id }) => {
      const [voiceChannel, textChannel] = await Promise.all([
        findVoiceChannel(id),
        findTextChannel(id),
      ]);
      if (textChannel) {
        await chunkAndSendText(textChannel, text);
      }
      return {
        destination: {
          ...destination,
          textChannelId: textChannel?.id,
        },
        script: text,
        voiceChannelId: voiceChannel?.id,
      };
    })
  );
}

function handleDestinationFollowup(destination: Destination, text: string) {
  if (destination.type === "interaction") {
    return handleInteractionFollowup(destination, text);
  }
  return handleBroadcastFollowup(destination, text);
}

async function processGenerateEvent({
  destination,
  prompt,
  season,
  system,
  research,
  filters,
}: GenerateLambdaEvent) {
  console.log("generating text");

  const response = await generateFFText({
    prompt,
    season,
    system,
    research,
    filters,
  });

  if (!response.text) {
    throw new Error("No text generated");
  }

  const voipEvents = await handleDestinationFollowup(
    destination,
    response.text
  );
  await Promise.all(
    voipEvents.map(async (voipEvent) =>
      sqs.send(
        new SendMessageCommand({
          QueueUrl: voipQueueUrl,
          MessageBody: JSON.stringify(voipEvent),
          MessageGroupId:
            voipEvent.voiceChannelId || randomBytes(16).toString("hex"),
        })
      )
    )
  );
}

export async function handler(sqsEvent: SQSEvent) {
  console.log(
    "Processing Generate SQS event:",
    JSON.stringify(sqsEvent, null, 2)
  );

  const batchItemFailures: { itemIdentifier: string }[] = [];

  await Promise.all(
    sqsEvent.Records.map(async (record) => {
      try {
        const generateEvent: GenerateLambdaEvent = JSON.parse(record.body);
        await processGenerateEvent(generateEvent);
      } catch (err) {
        console.error("Failed to generate commentary", err);
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    })
  );

  return batchItemFailures.length > 0 ? { batchItemFailures } : undefined;
}
