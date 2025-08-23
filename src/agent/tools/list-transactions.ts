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
import { Type, type CallableTool } from "@google/genai";

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

async function listTransactions(input: GetLeagueInput) {
  const league = await getLeagueCached(input);
  const players = await getPlayersCached(input);
  const transactions = (league?.transactions || []).map((transaction) =>
    mapTransaction(transaction, players, league)
  );
  return clean(transactions);
}

const listTransactionsToolName = "listTransactions";

export function createListTransactionsTool(
  input: GetLeagueInput
): CallableTool {
  const listTransactionsBinded = listTransactions.bind(null, input);
  return {
    callTool: async (functionCalls) => {
      const results = await Promise.all(
        functionCalls.map(async (call) => {
          if (call.name !== listTransactionsToolName) {
            return undefined;
          }

          const results = await listTransactionsBinded();
          return {
            functionResponse: {
              id: call.id,
              name: call.name,
              response: { results },
            },
          };
        })
      );
      return results.filter((result) => !!result);
    },
    tool: async () => {
      return {
        functionDeclarations: [
          {
            name: listTransactionsToolName,
            description: "List all transactions in the league",
            parameters: {
              type: Type.OBJECT,
              properties: {},
              required: [],
            },
          },
        ],
      };
    },
  };
}
