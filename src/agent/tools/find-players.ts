import {
  ESPNLeagueResponse,
  findMemberById,
  findPlayerInRoster,
  findRosterForPlayer,
  getLeagueCached,
  getPlayers,
  GetPlayersInput,
  getPosition,
  getTeamNameAndAbbr,
} from "@/espn";

import MiniSearch, { SearchResult } from "minisearch";
import { cache } from "../../utils";
import { mapRosterOwner } from "./mappers";
import { Type, type CallableTool } from "@google/genai";

async function createPlayerIndex(input: GetPlayersInput) {
  const players = await getPlayers(input);

  const items = players.map((player) => {
    const team = getTeamNameAndAbbr(player.player.proTeamId);
    const position = getPosition(player.player.defaultPositionId);
    return {
      id: player.player.id.toString(),
      fullName: player.player.fullName,
      team: { name: team.name, abbr: team.abbr },
      position,
      searchText: `${player.player.fullName} ${team.name} ${team.abbr} ${position.name} ${position.abbr}`,
    };
  });

  const search = new MiniSearch({
    fields: [
      "fullName",
      "team.name",
      "team.abbr",
      "position.name",
      "position.abbr",
    ],
    searchOptions: {
      boost: { fullName: 2, "team.name": 1, "position.name": 1 },
      fuzzy: 0.2,
      prefix: true,
    },
    storeFields: ["fullName", "team", "position"],
  });

  search.addAll(items);
  return search;
}

function mapSearchResultToPlayerDocument(
  result: SearchResult,
  league: ESPNLeagueResponse
) {
  const roster = findRosterForPlayer(result.id, league.teams);
  const playerInRoster = roster
    ? findPlayerInRoster(result.id, roster)
    : undefined;
  return {
    player: {
      fullName: result.fullName,
      team: result.team,
      position: result.position,
      rosteredBy: roster
        ? {
            rosterName: roster.name,
            owners: roster.owners.map((owner) => {
              const member = findMemberById(league.members, owner);
              return mapRosterOwner(member);
            }),
          }
        : undefined,
      isFreeAgent: roster === undefined,
      injured: playerInRoster?.playerPoolEntry.player.injured,
      injuryStatus: playerInRoster?.playerPoolEntry.player.injuryStatus,
      isBenched: playerInRoster?.lineupSlotId === undefined,
    },
    score: result.score,
  };
}

const createPlayerIndexCached = cache(createPlayerIndex, 1000 * 60 * 60 * 24);

async function executeFindPlayers(
  input: GetPlayersInput,
  {
    query,
    limit = 5,
  }: {
    query: string;
    limit: number;
  }
) {
  console.log("finding players", query, limit);

  const search =
    (await createPlayerIndexCached(input)) ||
    new MiniSearch({
      fields: [],
    });
  const league = await getLeagueCached(input);
  const results = search
    .search(query)
    .slice(0, limit)
    .map((result) => mapSearchResultToPlayerDocument(result, league));
  return results;
}

const findPlayersToolName = "findPlayers";

export function createFindPlayersTool(input: GetPlayersInput): CallableTool {
  const executeFindPlayersBinded = executeFindPlayers.bind(null, input);
  return {
    callTool: async (functionCalls) => {
      const results = await Promise.all(
        functionCalls.map(async (call) => {
          if (call.name !== findPlayersToolName) {
            return undefined;
          }

          const query = call.args?.query as string;
          const limit = call.args?.limit as number;
          if (!query) {
            return {
              functionResponse: {
                id: call.id,
                name: call.name,
                response: {
                  error:
                    "Field 'query' is missing in the function call. Please try again with 'query' defined.",
                },
              },
            };
          }
          const results = await executeFindPlayersBinded({ query, limit });
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
            name: findPlayersToolName,
            description:
              "Find players that match the query. Includes information such as the player's name, team, position, injury status and benched status.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                query: {
                  type: Type.STRING,
                  description:
                    "The query to search for. This can include the player's name, team, and position (Ex. 'Mahomes Chiefs QB'). Multiple players can also be search for at once (Ex. 'Mahomes Chiefs QB Adams Packers WR')",
                },
                limit: {
                  type: Type.NUMBER,
                  description: "The maximum number of players to return",
                },
              },
              required: ["query"],
            },
          },
        ],
      };
    },
  };
}
