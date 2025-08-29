import {
  getLeagueCached,
  espnS2,
  espnSwid,
  leagueId,
  isLineupTransaction,
} from "@/espn";
import { cronIntervalMs, generateQueueUrl } from "../config";
import { GenerateLambdaEvent } from "../types";
import { createTransactionRecapPrompt } from "@/agent/prompt/transaction";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqs } from "../sqs";

const lastRunDate = Date.now() - cronIntervalMs;

export async function handler() {
  const season = new Date().getFullYear();
  const league = await getLeagueCached({
    espnS2,
    espnSwid,
    leagueId,
    season,
  });
  const transactions = league.transactions;
  const transactionsSinceLastRun = transactions
    .filter((transaction) => transaction.proposedDate > lastRunDate)
    .filter((transaction) => !isLineupTransaction(transaction));
  if (!transactionsSinceLastRun.length) {
    return;
  }

  const event: GenerateLambdaEvent = {
    prompt: "Please give a recent transaction recap.",
    season,
    system: createTransactionRecapPrompt(),
    destination: { type: "broadcast", leagueId: league.id.toString() },
    filters: {
      transactionsStartDate: lastRunDate,
    },
  };

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: generateQueueUrl,
      MessageBody: JSON.stringify(event),
    })
  );
}
