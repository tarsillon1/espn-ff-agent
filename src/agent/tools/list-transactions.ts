import {
  ESPNLeagueResponse,
  getLeagueCached,
  GetLeagueInput,
  getPlayersCached,
  PlayerData,
  Transaction,
} from "@/espn";
import { mapTransactionItem } from "./mappers";
import { clean } from "../../utils";

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
    actingOwnerId: transaction.memberId,
    affectedTeamId: transaction.teamId,
    items: transaction.items.map((item) =>
      mapTransactionItem(item, players, league)
    ),
  };
}

export async function listTransactions(input: GetLeagueInput) {
  const league = await getLeagueCached(input);
  const players = await getPlayersCached(input);
  const transactions = (league?.transactions || []).map((transaction) =>
    mapTransaction(transaction, players, league)
  );
  return clean(transactions);
}
