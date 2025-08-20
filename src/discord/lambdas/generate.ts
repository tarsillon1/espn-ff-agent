import type { GenerateLambdaEvent, VoipLambdaEvent } from "../types";

import { generateFFText } from "@/agent/fantasy-football";
import { chunkAndSendFollowup } from "../followup";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { SQSEvent } from "aws-lambda";

const VOIP_SQS_QUEUE_URL = process.env.VOIP_SQS_QUEUE_URL;

const sqs = new SQSClient({
  region: "us-east-1",
});

async function processGenerateEvent({
  applicationId,
  token,
  prompt,
  channelId,
  guildId,
  memberId,
  season,
  system,
  search,
}: GenerateLambdaEvent) {
  console.log("generating text");

  const response = await generateFFText({
    prompt,
    season,
    system,
    search,
  });
  await chunkAndSendFollowup(applicationId, token, response.text);

  console.log("generating voice for commentary");

  const voipEvent: VoipLambdaEvent = {
    applicationId,
    token,
    channelId,
    guildId,
    memberId,
    script: response.text,
  };

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: VOIP_SQS_QUEUE_URL,
      MessageBody: JSON.stringify(voipEvent),
      MessageGroupId: guildId,
    })
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
