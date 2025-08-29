import {
  findPlayerById,
  findTeamById,
  ESPNLeagueResponse,
  PlayerData,
  TransactionItem,
  getSlotName,
  Transaction,
} from "@/espn";
import { mapPlayerData } from "./player";
import { clean } from "@/utils";

export function mapTransactionItem(
  item: TransactionItem,
  players: PlayerData[],
  league: ESPNLeagueResponse
) {
  const player = findPlayerById(players, item.playerId);
  const fromTeam = findTeamById(league.teams, item.fromTeamId);
  const toTeam = findTeamById(league.teams, item.toTeamId);
  return {
    player: mapPlayerData(player),
    fromTeamId: fromTeam?.id,
    toTeamId: toTeam?.id,
    fromLineupSlotId: getSlotName(item.fromLineupSlotId),
    toLineupSlotId: getSlotName(item.toLineupSlotId),
    type: item.type,
  };
}

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

export function mapTransactions(
  transactions: Transaction[],
  players: PlayerData[],
  league: ESPNLeagueResponse,
  filters?: {
    transactionsStartDate?: number;
  }
) {
  return clean(
    (transactions || [])
      .filter((transaction) => {
        if (filters?.transactionsStartDate) {
          return transaction.proposedDate > filters.transactionsStartDate;
        }
        return true;
      })
      .map((transaction) => mapTransaction(transaction, players, league))
  );
}
