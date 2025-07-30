// ESPN Fantasy Football API Response Types

export interface ESPNLeagueResponse {
  draftDetail: DraftDetail;
  gameId: number;
  id: number;
  members: Member[];
  scoringPeriodId: number;
  seasonId: number;
  segmentId: number;
  status: LeagueStatus;
  teams: Team[];
  transactions: Transaction[];
}

export interface DraftDetail {
  drafted: boolean;
  inProgress: boolean;
}

export interface LeagueStatus {
  activatedDate: number;
  createdAsLeagueType: number;
  currentLeagueType: number;
  currentMatchupPeriod: number;
  finalScoringPeriod: number;
  firstScoringPeriod: number;
  isActive: boolean;
  isExpired: boolean;
  isFull: boolean;
  isPlayoffMatchupEdited: boolean;
  isToBeDeleted: boolean;
  isViewable: boolean;
  isWaiverOrderEdited: boolean;
  latestScoringPeriod: number;
  previousSeasons: number[];
  standingsUpdateDate: number;
  teamsJoined: number;
  transactionScoringPeriod: number;
  waiverLastExecutionDate: number;
  waiverProcessStatus: Record<string, number>;
}

export interface Transaction {
  bidAmount: number;
  executionType: string;
  id: string;
  isActingAsTeamOwner: boolean;
  isLeagueManager: boolean;
  isPending: boolean;
  items: TransactionItem[];
  memberId: string;
  proposedDate: number;
  rating: number;
  scoringPeriodId: number;
  skipTransactionCounters: boolean;
  status: string;
  subOrder: number;
  teamId: number;
  type: string;
}

export interface TransactionItem {
  fromLineupSlotId: number;
  fromTeamId: number;
  isKeeper: boolean;
  overallPickNumber: number;
  playerId: number;
  toLineupSlotId: number;
  toTeamId: number;
  type: string;
}

// Player types based on players.json structure
export interface PlayerData {
  player: PlayerInfo;
}

export interface PlayerInfo {
  defaultPositionId: number;
  droppable: boolean;
  eligibleSlots: number[];
  firstName: string;
  fullName: string;
  id: number;
  lastName: string;
  ownership: PlayerOwnership;
  proTeamId: number;
  universeId: number;
}

export interface PlayerOwnership {
  percentOwned: number;
}

// Position constants for better type safety
export enum PositionId {
  QB = 1,
  RB = 2,
  WR = 3,
  TE = 4,
  K = 5,
  DST = 16,
}

// Slot constants for eligible positions
export enum SlotId {
  QB = 0,
  RB = 2,
  WR = 3,
  TE = 4,
  K = 5,
  FLEX = 6,
  BENCH = 7,
  IR = 20,
  NA = 21,
  WR_RB_FLEX = 23,
  SUPER_FLEX = 25,
}

// Legacy types for backward compatibility (keeping the original structure)
export interface Member {
  displayName: string;
  firstName: string;
  id: string;
  lastName: string;
  notificationSettings: NotificationSetting[];
}

export interface NotificationSetting {
  enabled: boolean;
  id: string;
  type: string;
}

export interface Schedule {
  away: ScheduleTeam;
  home: ScheduleTeam;
  id: number;
  matchupPeriodId: number;
  scoringPeriodId: number;
  winner: string;
}

export interface ScheduleTeam {
  adjustment: number;
  rosterForCurrentScoringPeriod: Roster;
  teamId: number;
}

export interface Roster {
  appliedStatTotal: number;
  entries: RosterEntry[];
}

export interface RosterEntry {
  lineupSlotId: number;
  playerPoolEntry: PlayerPoolEntry;
}

export interface PlayerPoolEntry {
  player: Player;
}

export interface Player {
  stats: PlayerStats[];
}

export interface PlayerStats {
  appliedStats: Record<string, number>;
  appliedTotal: number;
  proTeamId: number;
  scoringPeriodId: number;
  seasonId: number;
  statSourceId: number;
  statSplitTypeId: number;
  stats: Record<string, number>;
  variance?: Record<string, number>;
}

export interface LeagueSettings {
  name: string;
  size: number;
  // Add other settings properties as needed
}

// Enhanced Team interface with roster property
export interface Team {
  abbrev: string;
  currentProjectedRank: number;
  divisionId: number;
  draftDayProjectedRank: number;
  id: number;
  isActive: boolean;
  logo: string;
  logoType: string;
  name: string;
  owners: string[];
  playoffSeed: number;
  points: number;
  pointsAdjusted: number;
  pointsDelta: number;
  primaryOwner: string;
  rankCalculatedFinal: number;
  rankFinal: number;
  record: TeamRecord;
  roster: TeamRoster; // Added roster property
  transactionCounter: TransactionCounter;
  valuesByStat: Record<string, number>;
  waiverRank: number;
  watchList?: number[];
}

// New comprehensive roster types for teams
export interface TeamRoster {
  appliedStatTotal: number;
  entries: TeamRosterEntry[];
}

export interface TeamRosterEntry {
  acquisitionDate: number;
  acquisitionType: string;
  injuryStatus: string;
  lineupSlotId: number;
  pendingTransactionIds: number[] | null;
  playerId: number;
  playerPoolEntry: TeamPlayerPoolEntry;
}

export interface TeamPlayerPoolEntry {
  appliedStatTotal: number;
  id: number;
  keeperValue: number;
  keeperValueFuture: number;
  lineupLocked: boolean;
  onTeamId: number;
  player: TeamPlayer;
}

export interface TeamPlayer {
  active: boolean;
  defaultPositionId: number;
  draftRanksByRankType: DraftRanksByRankType;
  droppable: boolean;
  eligibleSlots: number[];
  firstName: string;
  fullName: string;
  id: number;
  injured: boolean;
  injuryStatus: string;
  lastName: string;
  proTeamId: number;
  universeId: number;
  // Additional player properties that may exist
  stats?: PlayerStats[];
  ownership?: PlayerOwnership;
}

export interface DraftRanksByRankType {
  STANDARD?: DraftRank;
  PPR?: DraftRank;
  [key: string]: DraftRank | undefined;
}

export interface DraftRank {
  auctionValue: number;
  published: boolean;
  rank: number;
  rankSourceId: number;
  rankType: string;
  slotId: number;
}

export interface TeamRecord {
  away: RecordStats;
  division: RecordStats;
  home: RecordStats;
  overall: RecordStats;
}

export interface RecordStats {
  gamesBack: number;
  losses: number;
  percentage: number;
  pointsAgainst: number;
  pointsFor: number;
  streakLength: number;
  streakType: string;
  ties: number;
  wins: number;
}

export interface TransactionCounter {
  acquisitionBudgetSpent: number;
  acquisitions: number;
  drops: number;
  matchupAcquisitionTotals: Record<string, number>;
  misc: number;
  moveToActive: number;
  moveToIR: number;
  paid: number;
  teamCharges: number;
  trades: number;
}
