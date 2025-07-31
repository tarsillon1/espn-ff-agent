import {
  findMemberById,
  LeagueSettings,
  Member,
  Team,
  TransactionCounter,
} from "@/espn";
import { mapTeamRosterEntry } from "./player";

export function mapRosterOwner(member: Member | undefined) {
  if (!member) {
    return undefined;
  }
  return {
    id: member.id,
    displayName: member.displayName,
    firstName: member?.firstName,
    lastName: member?.lastName,
  };
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

export function mapRosterBasicInfo(team: Team | undefined, members: Member[]) {
  if (!team) {
    return undefined;
  }
  return {
    id: team.id,
    name: team.name,
    abbrev: team.abbrev,
    owners: team.owners.map((owner) => {
      const member = findMemberById(members, owner);
      return mapRosterOwner(member);
    }),
  };
}

export function mapRoster(
  team: Team | undefined,
  members: Member[],
  settings: LeagueSettings
) {
  if (!team) {
    return undefined;
  }
  const rosterBasicInfo = mapRosterBasicInfo(team, members);
  return {
    ...rosterBasicInfo,
    transactionCounter: mapTransactionCounter(
      team.transactionCounter,
      settings
    ),
    players: team.roster.entries.map(mapTeamRosterEntry),
  };
}
