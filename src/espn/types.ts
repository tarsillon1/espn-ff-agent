// ESPN Fantasy Football API Response Types

export interface ESPNLeagueResponse {
  draftDetail: DraftDetail;
  gameId: number;
  id: number;
  members: Member[];
  scoringPeriodId: number;
  seasonId: number;
  segmentId: number;
  settings: LeagueSettings;
  status: LeagueStatus;
  teams: Team[];
  transactions: Transaction[];
  schedule?: Schedule[]; // Added for mMatchup view
  scheduleForScoringPeriod?: ScheduleForScoringPeriod[]; // Added for mMatchupScore view
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
  playoffTierType: string;
}

export interface ScheduleTeam {
  adjustment: number;
  cumulativeScore?: {
    losses: number;
    scoreByStat: Record<
      string,
      {
        ineligible: boolean;
        rank: number;
        result: any;
        score: number;
      }
    >;
    ties: number;
    wins: number;
  };
  pointsByScoringPeriod?: Record<string, number>;
  teamId: number;
  tiebreak: number;
  totalPoints: number;
  rosterForMatchupPeriod?: RosterForMatchupPeriod;
  rosterForScoringPeriod?: RosterForMatchupPeriod;
}

// Types for rosterForMatchupPeriod structure
export interface RosterForMatchupPeriod {
  appliedStatTotal: number;
  entries: RosterEntryForMatchupPeriod[];
}

export interface RosterEntryForMatchupPeriod {
  acquisitionDate: number | null;
  acquisitionType: string | null;
  injuryStatus: string;
  lineupSlotId: number;
  pendingTransactionIds: number[] | null;
  playerId: number;
  playerPoolEntry: PlayerPoolEntryForMatchupPeriod;
}

export interface PlayerPoolEntryForMatchupPeriod {
  appliedStatTotal: number;
  id: number;
  keeperValue: number;
  keeperValueFuture: number;
  lineupLocked: boolean;
  onTeamId: number;
  player: PlayerForMatchupPeriod;
}

export interface PlayerForMatchupPeriod {
  active: boolean;
  defaultPositionId: number;
  droppable: boolean;
  eligibleSlots: number[];
  firstName: string;
  fullName: string;
  id: number;
  injured: boolean;
  injuryStatus: string;
  lastName: string;
  proTeamId: number;
  stats: PlayerStats[];
}

// New types for mMatchupScore view
export interface ScheduleForScoringPeriod {
  away: ScheduleForScoringPeriodTeam;
  home: ScheduleForScoringPeriodTeam;
  id: number;
  matchupPeriodId: number;
  scoringPeriodId: number;
  winner: string;
}

export interface ScheduleForScoringPeriodTeam {
  adjustment: number;
  rosterForCurrentScoringPeriod: RosterForScoringPeriod;
  teamId: number;
}

export interface RosterForScoringPeriod {
  appliedStatTotal: number;
  entries: RosterEntryForScoringPeriod[];
}

export interface RosterEntryForScoringPeriod {
  lineupSlotId: number;
  playerPoolEntry: PlayerPoolEntryForScoringPeriod;
}

export interface PlayerPoolEntryForScoringPeriod {
  appliedStatTotal: number;
  id: number;
  keeperValue: number;
  keeperValueFuture: number;
  lineupLocked: boolean;
  onTeamId: number;
  player: PlayerForScoringPeriod;
}

export interface PlayerForScoringPeriod {
  active: boolean;
  defaultPositionId: number;
  droppable: boolean;
  eligibleSlots: number[];
  firstName: string;
  fullName: string;
  id: number;
  injured: boolean;
  lastName: string;
  proTeamId: number;
  universeId: number;
  stats: PlayerStats[];
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
  // Scoring settings
  scoringSettings?: ScoringSettings;
  // Roster settings
  rosterSettings?: RosterSettings;
  // Schedule settings
  scheduleSettings?: ScheduleSettings;
  // Trade settings
  tradeSettings?: TradeSettings;
  // Waiver settings
  waiverSettings?: WaiverSettings;
  // Acquisition settings
  acquisitionSettings?: AcquisitionSettings;
  // Other common settings
  [key: string]: any;
}

export interface ScoringSettings {
  scoringPeriods?: ScoringPeriod[];
  scoringRules?: ScoringRule[];
  [key: string]: any;
}

export interface ScoringPeriod {
  id: number;
  name: string;
  startDate: number;
  endDate: number;
}

export interface ScoringRule {
  statId: number;
  statName: string;
  value: number;
  [key: string]: any;
}

export interface RosterSettings {
  rosterPositions?: RosterPosition[];
  rosterLocktimeType?: number;
  lineupSlotCounts: Record<string, number>;
  [key: string]: any;
}

export interface RosterPosition {
  positionId: number;
  positionName: string;
  count: number;
  [key: string]: any;
}

export interface ScheduleSettings {
  playoffTeamCount: number;
}

export interface TradeSettings {
  allowTrades?: boolean;
  allowVeto?: boolean;
  vetoVotesRequired?: number;
  [key: string]: any;
}

export interface WaiverSettings {
  waiverType?: number;
  waiverDay?: number;
  waiverOrderType?: number;
  [key: string]: any;
}

export interface AcquisitionSettings {
  acquisitionType?: number;
  acquisitionBudget?: number;
  acquisitionBudgetSpent?: number;
  acquisitionBudgetRemaining?: number;
  acquisitionBudgetUsed?: number;
  [key: string]: any;
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

// League History Types
// The history.json file contains an array of league snapshots over time
export interface LeagueHistory extends Array<LeagueSnapshot> {}

export interface LeagueSnapshot {
  draftDetail: DraftDetail;
  gameId: number;
  id: number;
  schedule: HistorySchedule[];
  scoringPeriodId: number;
  seasonId: number;
  segmentId: number;
  settings: LeagueSettings;
  status: LeagueStatus;
  teams: HistoryTeam[];
}

// Enhanced Schedule interface for history data
export interface HistorySchedule {
  away: HistoryScheduleTeam;
  home: HistoryScheduleTeam;
  id: number;
  matchupPeriodId: number;
  scoringPeriodId: number;
  winner: string;
}

// Enhanced ScheduleTeam interface for history data
export interface HistoryScheduleTeam {
  gamesPlayed: number;
  pointsByScoringPeriod: Record<string, number>;
  teamId: number;
  totalPoints: number;
}

// Enhanced Team interface for history data with mTeam view
export interface HistoryTeam {
  id: number;
  abbrev: string;
  currentProjectedRank: number;
  divisionId: number;
  draftDayProjectedRank: number;
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
  record: HistoryTeamRecord;
  roster: HistoryTeamRoster;
  transactionCounter: HistoryTransactionCounter;
  valuesByStat: Record<string, number>;
  waiverRank: number;
  watchList?: number[];
}

// Enhanced TeamRoster interface for history data
export interface HistoryTeamRoster {
  appliedStatTotal: number;
  entries: HistoryRosterEntry[];
}

export interface HistoryRosterEntry {
  acquisitionDate: number | null;
  acquisitionType: string | null;
  injuryStatus: string;
  lineupSlotId: number;
  pendingTransactionIds: number[] | null;
  playerId: number;
  playerPoolEntry: HistoryPlayerPoolEntry;
  status: string;
}

export interface HistoryPlayerPoolEntry {
  appliedStatTotal: number;
  id: number;
  keeperValue: number;
  keeperValueFuture: number;
  lineupLocked: boolean;
  onTeamId: number;
  player: HistoryPlayer;
  rosterLocked: boolean;
  tradeLocked: boolean;
}

export interface HistoryPlayer {
  active: boolean;
  defaultPositionId: number;
  droppable: boolean;
  eligibleSlots: number[];
  firstName: string;
  fullName: string;
  id: number;
  injured: boolean;
  lastName: string;
  proTeamId: number;
  universeId: number;
}

// History-specific team record interface
export interface HistoryTeamRecord {
  away: RecordStats;
  division: RecordStats;
  home: RecordStats;
  overall: RecordStats;
}

// History-specific transaction counter interface
export interface HistoryTransactionCounter {
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

// Utility types for working with history data
export interface LeagueHistoryStats {
  totalSnapshots: number;
  dateRange: {
    earliest: Date;
    latest: Date;
  };
  teams: {
    [teamId: number]: {
      totalGames: number;
      totalWins: number;
      totalLosses: number;
      averagePoints: number;
    };
  };
}

export interface HistoryQueryOptions {
  startDate?: Date;
  endDate?: Date;
  teamId?: number;
  scoringPeriodId?: number;
  matchupPeriodId?: number;
}

// Type guards for history data
export function isLeagueHistory(data: any): data is LeagueHistory {
  return Array.isArray(data) && data.length > 0 && "draftDetail" in data[0];
}

export function isLeagueSnapshot(data: any): data is LeagueSnapshot {
  return (
    data &&
    typeof data === "object" &&
    "draftDetail" in data &&
    "teams" in data &&
    "schedule" in data
  );
}
