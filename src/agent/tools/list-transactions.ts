import { z } from "zod";
import {
  ESPNLeagueResponse,
  findMemberById,
  findTeamById,
  getLeagueCached,
  GetLeagueInput,
  getPlayersCached,
  PlayerData,
  Transaction,
} from "@/espn";
import {
  mapTransactionItem,
  mapRosterBasicInfo,
  mapRosterOwner,
} from "./mappers";
import { clean } from "../../utils";
import { summarize, summarizePrompt } from "./summarize";

const summarizeTransactionsPrompt =
  summarizePrompt +
  `
You will be provided a list of fantasy football league transactions.
The response will be provided to another LLM that will use it to ground their response in the context of all league transactions.
Make sure to include all transactions with the date they were proposed.
Response should be formatted in a bulleted list highlighting all facts that can be deduced from the transactions.
Response should be concise but leave out as little information as possible.
`;

function mapTransaction(
  transaction: Transaction,
  players: PlayerData[],
  league: ESPNLeagueResponse
) {
  return {
    id: transaction.id,
    type: transaction.type,
    status: transaction.status,
    isPending: transaction.isPending,
    date: transaction.proposedDate
      ? new Date(transaction.proposedDate).toISOString()
      : undefined,
    actingOwner: mapRosterOwner(
      findMemberById(league.members, transaction.memberId)
    ),
    affectedRoster: mapRosterBasicInfo(
      findTeamById(league.teams, transaction.teamId),
      league.members
    ),
    items: transaction.items.map((item) =>
      mapTransactionItem(item, players, league)
    ),
  };
}

export function createListTransactionsTool(input: GetLeagueInput) {
  async function listTransactions() {
    const league = await getLeagueCached(input);
    const players = await getPlayersCached(input);
    const transactions = (league?.transactions || []).map((transaction) =>
      mapTransaction(transaction, players, league)
    );
    return clean(transactions);
  }

  return {
    name: "listTransactions",
    description: "List all transactions in the league",
    parameters: z.object({}),
    execute: listTransactions,
  };
}
