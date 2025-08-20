import type { GenerateLambdaEvent, VoipLambdaEvent } from "../types";

import { generateFFText } from "@/agent/fantasy-football";
import { chunkAndSendFollowup } from "../followup";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const VOIP_SQS_QUEUE_URL = process.env.VOIP_SQS_QUEUE_URL;

const sqs = new SQSClient({
  region: "us-east-1",
});

export async function handler({
  applicationId,
  token,
  prompt,
  season,
  system,
  ...args
}: GenerateLambdaEvent) {
  try {
    console.log("generating text");

    const response = await generateFFText({
      prompt,
      season,
      system,
    });
    await chunkAndSendFollowup(applicationId, token, response.text);

    console.log("generating voice for commentary");

    const event = {
      ...args,
      applicationId,
      token,
      script: response.text,
    } as VoipLambdaEvent;

    await sqs.send(new SendMessageCommand({
      QueueUrl: VOIP_SQS_QUEUE_URL,
      MessageBody: JSON.stringify(event),
    }));
  } catch (err) {
    console.error("Failed to generate commentary", err);
  }
}
