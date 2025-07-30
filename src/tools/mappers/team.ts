import { findMemberById, Member, Team } from "../../espn";
import { clean } from "../../utils";

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

export function mapTeam(team: Team | undefined, members: Member[]) {
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
