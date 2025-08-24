import type { GenerateLambdaEvent } from "../types";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getLeagueCached, espnS2, espnSwid, leagueId } from "@/espn";
import { createDraftRecapPrompt } from "@/agent/prompt";

const cronIntervalMs = parseInt(process.env.CRON_INTERVAL_MS || "0");
const generateQueueUrl = process.env.GENERATE_SQS_QUEUE_URL!;

const sqs = new SQSClient({ region: "us-east-1" });

export async function handler() {
  //   const season = new Date().getFullYear();
  const season = 2024; // testing
  const league = await getLeagueCached({
    espnS2,
    espnSwid,
    leagueId,
    season,
  });

  //   const draftCompletedAt = league.draftDetail.completeDate;
  //   const drafted =
  //     draftCompletedAt && draftCompletedAt > Date.now() - cronIntervalMs;
  //   if (!drafted) {
  //     return;
  //   }

  const event: GenerateLambdaEvent = {
    prompt: "Please give a full draft recap.",
    season,
    system: createDraftRecapPrompt(),
    destination: { type: "broadcast", leagueId: league.id.toString() },
  };

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: generateQueueUrl,
      MessageBody: JSON.stringify(event),
    })
  );
}
