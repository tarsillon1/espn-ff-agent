import {
  findMemberById,
  LeagueSettings,
  Member,
  Team,
  TransactionCounter,
} from "../../espn";
import { clean } from "../../utils";
import { mapTeamRosterEntry } from "./player";

export function mapTeamOwner(member: Member | undefined) {
  if (!member) {
    return undefined;
  }
  return clean({
    id: member.id,
    displayName: member.displayName,
    firstName: member?.firstName,
    lastName: member?.lastName,
  });
}

export function mapTransactionCounter(
  transactionCounter: TransactionCounter,
  settings: LeagueSettings
) {
  return {
    acquisitionBudgetSpent: transactionCounter.acquisitionBudgetSpent,
    acquisitionBudgetRemaining:
      settings.acquisitionSettings?.acquisitionBudget ??
      0 - transactionCounter.acquisitionBudgetSpent,
    acquisitions: transactionCounter.acquisitions,
    drops: transactionCounter.drops,
  };
}

export function mapTeamBasicInfo(team: Team | undefined, members: Member[]) {
  if (!team) {
    return undefined;
  }
  return {
    id: team.id,
    name: team.name,
    abbrev: team.abbrev,
    owners: team.owners.map((owner) => {
      const member = findMemberById(members, owner);
      return mapTeamOwner(member);
    }),
  };
}

export function mapTeam(
  team: Team | undefined,
  members: Member[],
  settings: LeagueSettings
) {
  if (!team) {
    return undefined;
  }
  const teamBasicInfo = mapTeamBasicInfo(team, members);
  return {
    ...teamBasicInfo,
    transactionCounter: mapTransactionCounter(
      team.transactionCounter,
      settings
    ),
    players: team.roster.entries.map(mapTeamRosterEntry),
  };
}
