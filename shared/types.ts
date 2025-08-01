/**
 * Comprehensive TypeScript type definitions for NeballManager
 * 
 * This file contains all the core domain types, API response types,
 * form types, and utility types used throughout the application.
 */

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export interface Player {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  positionPreferences: Position[];
  active: boolean;
  avatarColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Club {
  id: number;
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  isActive: boolean;
  playersCount?: number;
  teamsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
  clubId: number;
  seasonId: number;
  divisionId?: number;
  isActive: boolean;
  clubName?: string;
  clubCode?: string;
  divisionName?: string;
  playerCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: number;
  date: string;
  time?: string;
  round?: string;
  seasonId: number;
  homeClubId: number;
  homeTeamId: number;
  awayClubId?: number;
  awayTeamId?: number;
  statusId: number;
  venue?: string;
  notes?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homeClubName?: string;
  awayClubName?: string;
  statusName?: string;
  statusDisplayName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameStats {
  id: number;
  gameId: number;
  teamId: number;
  playerId: number;
  statType: StatType;
  quarter: number;
  position: Position;
  createdAt: string;
}

export interface GameScore {
  id: number;
  gameId: number;
  homeScore: number;
  awayScore: number;
  isOfficial: boolean;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Roster {
  id: number;
  gameId: number;
  teamId: number;
  playerId: number;
  position: Position;
  jerseyNumber?: number;
  createdAt: string;
}

export interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Division {
  id: number;
  ageGroupId: number;
  sectionId?: number;
  seasonId: number;
  displayName: string;
  isActive: boolean;
  ageGroupName?: string;
  sectionName?: string;
  teamCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgeGroup {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  divisionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  divisionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameStatus {
  id: number;
  name: string;
  displayName: string;
  points: number;
  opponentPoints: number;
  homeTeamGoals?: number;
  awayTeamGoals?: number;
  isActive: boolean;
}

export interface PlayerAvailability {
  id: number;
  gameId: number;
  playerId: number;
  isAvailable: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENUMS AND UNIONS
// ============================================================================

export type Position = 
  | 'GS' | 'GA' | 'WA' | 'C' 
  | 'WD' | 'GD' | 'GK';

export type StatType = 
  | 'goal' | 'attempt' | 'turnover' 
  | 'intercept' | 'rebound' | 'penalty';

export type GameStatusType = 
  | 'scheduled' | 'in_progress' | 'completed' 
  | 'cancelled' | 'forfeit' | 'bye';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    count?: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: string[];
  code?: string;
}

// Specific API response types
export type ApiPlayersResponse = ApiResponse<Player[]>;
export type ApiPlayerResponse = ApiResponse<Player>;
export type ApiClubsResponse = ApiResponse<Club[]>;
export type ApiClubResponse = ApiResponse<Club>;
export type ApiTeamsResponse = ApiResponse<Team[]>;
export type ApiTeamResponse = ApiResponse<Team>;
export type ApiGamesResponse = ApiResponse<Game[]>;
export type ApiGameResponse = ApiResponse<Game>;
export type ApiSeasonsResponse = ApiResponse<Season[]>;
export type ApiSeasonResponse = ApiResponse<Season>;
export type ApiGameStatsResponse = ApiResponse<GameStats[]>;
export type ApiGameScoresResponse = ApiResponse<GameScore[]>;
export type ApiRostersResponse = ApiResponse<Roster[]>;

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface PlayerFormData {
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  positionPreferences: Position[];
  active: boolean;
  avatarColor?: string;
}

export interface ClubFormData {
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface TeamFormData {
  name: string;
  clubId: number;
  seasonId: number;
  divisionId?: number;
  isActive: boolean;
}

export interface GameFormData {
  date: string;
  time?: string;
  round?: string;
  seasonId: number;
  homeClubId: number;
  homeTeamId: number;
  awayClubId?: number;
  awayTeamId?: number;
  statusId: number;
  venue?: string;
  notes?: string;
}

export interface SeasonFormData {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface DivisionFormData {
  ageGroupId: number;
  sectionId?: number;
  seasonId: number;
  displayName: string;
  isActive: boolean;
}

export interface AgeGroupFormData {
  name: string;
  displayName: string;
  isActive: boolean;
}

export interface SectionFormData {
  name: string;
  displayName: string;
  isActive: boolean;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface FilterOptions {
  search?: string;
  clubId?: number;
  seasonId?: number;
  isActive?: boolean;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseMutationResult<T, V> {
  mutate: (variables: V) => void;
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

export interface UseStandardFormOptions<T> {
  schema: any; // Zod schema
  createEndpoint: string;
  updateEndpoint: (id: number) => string;
  defaultValues: Partial<T>;
  initialData?: any;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  timestamp: string;
}

export interface ValidationError extends AppError {
  field?: string;
  value?: unknown;
}

export interface NetworkError extends AppError {
  status?: number;
  url?: string;
}

export type ErrorHandler = (error: AppError) => void;

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type SelectHandler<T> = (value: T) => void;
export type FormSubmitHandler<T> = (data: T) => void;

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface ClubContextType {
  currentClub: Club | null;
  currentClubId: number | null;
  currentTeam: Team | null;
  currentTeamId: number | null;
  clubs: Club[];
  isLoading: boolean;
  setCurrentClubId: (clubId: number | null) => void;
  setCurrentTeamId: (teamId: number | null) => void;
  switchClub: (clubId: number) => void;
  refreshClubs: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ID = number | string;
export type Timestamp = string; // ISO 8601 timestamp

// Partial types for updates
export type PlayerUpdate = Partial<Omit<Player, 'id' | 'createdAt' | 'updatedAt'>>;
export type ClubUpdate = Partial<Omit<Club, 'id' | 'createdAt' | 'updatedAt'>>;
export type TeamUpdate = Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>;
export type GameUpdate = Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt'>>;

// ============================================================================
// BATCH OPERATION TYPES
// ============================================================================

export interface BatchGameStats {
  [gameId: string]: GameStats[];
}

export interface BatchGameScores {
  [gameId: string]: GameScore[];
}

export interface BatchRosters {
  [gameId: string]: Roster[];
}

// ============================================================================
// SEARCH AND FILTER TYPES
// ============================================================================

export interface SearchFilters {
  query?: string;
  clubId?: number;
  seasonId?: number;
  teamId?: number;
  position?: Position;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// PERFORMANCE TRACKING TYPES
// ============================================================================

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  apiCalls: number;
  errors: number;
  timestamp: string;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface PlayerStatsSummary {
  playerId: number;
  playerName: string;
  gamesPlayed: number;
  goals: number;
  attempts: number;
  successRate: number;
  turnovers: number;
  intercepts: number;
}

export interface TeamStatsSummary {
  teamId: number;
  teamName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface GameStatsSummary {
  gameId: number;
  homeTeamStats: TeamStatsSummary;
  awayTeamStats?: TeamStatsSummary;
  totalStats: number;
  quarters: {
    [quarter: number]: {
      homeGoals: number;
      awayGoals: number;
    };
  };
}