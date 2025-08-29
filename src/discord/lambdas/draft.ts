import type { GenerateLambdaEvent } from "../types";

import { createDraftRecapPrompt } from "@/agent/prompt";
import { espnS2, espnSwid, getLeagueCached, leagueId } from "@/espn";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { cronIntervalMs, generateQueueUrl } from "../config";
import { sqs } from "../sqs";

export async function handler() {
  const season = new Date().getFullYear();
  const league = await getLeagueCached({
    espnS2,
    espnSwid,
    leagueId,
    season,
  });

  const draftCompletedAt = league.draftDetail.completeDate;
  const drafted =
    draftCompletedAt && draftCompletedAt > Date.now() - cronIntervalMs;
  if (!drafted) {
    return;
  }

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
