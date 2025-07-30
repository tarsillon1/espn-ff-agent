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
} from "../espn";
import { mapTransactionItem, mapTeam, mapTeamOwner } from "./mappers";
import { clean } from "../utils";

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
    actingOwner: mapTeamOwner(
      findMemberById(league.members, transaction.memberId)
    ),
    affectedTeam: mapTeam(
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
    const transactions = league.transactions.map((transaction) =>
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
