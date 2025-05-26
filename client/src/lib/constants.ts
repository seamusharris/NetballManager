import { Position, GameStatus } from '@shared/schema';

// Position constants
export const POSITIONS: Position[] = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];

export const POSITION_NAMES: Record<Position, string> = {
  'GS': 'Goal Shooter',
  'GA': 'Goal Attack', 
  'WA': 'Wing Attack',
  'C': 'Centre',
  'WD': 'Wing Defence',
  'GD': 'Goal Defence',
  'GK': 'Goal Keeper'
};

export const POSITION_GROUPS = {
  attackers: ['GS', 'GA'] as Position[],
  midcourt: ['WA', 'C', 'WD'] as Position[],
  defenders: ['GD', 'GK'] as Position[]
};

// Game status constants
export const GAME_STATUSES: GameStatus[] = ["upcoming", "in-progress", "completed", "forfeit-win", "forfeit-loss"];

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  'upcoming': 'Upcoming',
  'in-progress': 'In Progress',
  'completed': 'Completed', 
  'forfeit-win': 'Forfeit Win',
  'forfeit-loss': 'Forfeit Loss'
};

// UI constants
export const QUARTERS = [1, 2, 3, 4] as const;

export const AVATAR_COLORS = [
  'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-red-600',
  'bg-orange-600', 'bg-yellow-600', 'bg-pink-600', 'bg-teal-600',
  'bg-indigo-600', 'bg-cyan-600', 'bg-amber-600', 'bg-lime-600',
  'bg-emerald-600', 'bg-sky-600', 'bg-violet-600', 'bg-fuchsia-600',
  'bg-rose-600', 'bg-blue-700', 'bg-purple-700', 'bg-green-700',
  'bg-red-700', 'bg-orange-700', 'bg-yellow-700', 'bg-pink-700'
];

// Cache settings
export const CACHE_SETTINGS = {
  // Cache expiration times (in milliseconds)
  SCORE_CACHE_EXPIRATION: 10 * 60 * 1000, // 10 minutes for calculated scores
  STATS_CACHE_EXPIRATION: 5 * 60 * 1000,  // 5 minutes for raw stats
  ROSTER_CACHE_EXPIRATION: 15 * 60 * 1000, // 15 minutes for rosters

  // Query stale times for React Query (more aggressive caching)
  QUERY_STALE_TIME: 2 * 60 * 1000,      // 2 minutes
  QUERY_CACHE_TIME: 10 * 60 * 1000,     // 10 minutes
  BATCH_QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutes for batch requests

  // Batch processing
  BATCH_SIZE: 20,   // Larger batch size for efficiency
  BATCH_DELAY: 50,  // Shorter delay
  MAX_RETRIES: 3,   // Retry failed requests
};

// Validation constants
export const VALIDATION = {
  MIN_RATING: 1,
  MAX_RATING: 10,
  MIN_QUARTER: 1,
  MAX_QUARTER: 4,
  MIN_STAT_VALUE: 0,
  MAX_STAT_VALUE: 999
};

// Stat category labels
export const STAT_LABELS: Record<string, string> = {
  'goals': 'Goals',
  'goalsFor': 'Goal',
  'missedGoals': 'Missed Goals',
  'goalsAgainst': 'Goals Against',
  'rebounds': 'Rebounds',
  'intercepts': 'Intercepts',
  'pickUp': 'Pick Ups',
  'badPass': 'Bad Passes',
  'handlingError': 'Handling Errors',
  'infringement': 'Infringements'
};

// Stat colors for UI components
export const STAT_COLORS: Record<string, string> = {
  goals: 'bg-green-100 hover:bg-green-200 text-green-700',
  goalsFor: 'bg-green-100 hover:bg-green-200 text-green-700',
  missedGoals: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
  goalsAgainst: 'bg-red-100 hover:bg-red-200 text-red-700',
  rebounds: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
  intercepts: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700',
  pickUp: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
  badPass: 'bg-amber-100 hover:bg-amber-200 text-amber-700',
  handlingError: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
  infringement: 'bg-rose-100 hover:bg-rose-200 text-rose-700'
};

// Statistics Types and Categories
export type StatType = 
  | 'goalsFor' 
  | 'goalsAgainst' 
  | 'missedGoals' 
  | 'rebounds' 
  | 'intercepts' 
  | 'badPass' 
  | 'handlingError' 
  | 'pickUp' 
  | 'infringement';

export type StatCategory = 
  | 'goals' 
  | 'missedGoals' 
  | 'rebounds' 
  | 'intercepts' 
  | 'pickUp' 
  | 'badPass' 
  | 'handlingError' 
  | 'infringement';

// Unified Statistics Configuration
export const STATISTICS_CONFIG = {
  // Cache settings
  CACHE_DURATIONS: {
    GAME_STATS: 5 * 60 * 1000,      // 5 minutes
    PLAYER_PERFORMANCE: 10 * 60 * 1000, // 10 minutes
    BATCH_OPERATIONS: 5 * 60 * 1000,    // 5 minutes
  },

  // Batch operation limits
  BATCH_LIMITS: {
    MAX_GAMES_PER_BATCH: 50,
    MAX_CONCURRENT_REQUESTS: 10,
  },

  // Statistical thresholds
  PERFORMANCE_THRESHOLDS: {
    EXCELLENT_RATING: 8,
    GOOD_RATING: 6,
    AVERAGE_RATING: 4,
  }
} as const;

// Common stats that appear for all positions
export const COMMON_STATS: StatCategory[] = [
  'intercepts',
  'pickUp', 
  'badPass',
  'handlingError',
  'infringement'
];

// Default empty stats structure
export const EMPTY_POSITION_STATS = {
  goalsFor: 0,
  goalsAgainst: 0,
  missedGoals: 0,
  rebounds: 0,
  intercepts: 0,
  badPass: 0,
  handlingError: 0,
  pickUp: 0,
  infringement: 0
};

// Full mapping of which stats are available for each position
export const POSITION_STATS: Record<Position, StatCategory[]> = {
  // Attack positions
  'GS': ['goals', 'missedGoals', 'rebounds', 'intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'GA': ['goals', 'missedGoals', 'rebounds', 'intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],

  // Mid-court positions
  'WA': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'C': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'WD': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],

  // Defense positions
  'GD': ['goalsAgainst', 'rebounds', 'intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'GK': ['goalsAgainst', 'rebounds', 'intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
};

// Primary stats to emphasize for each position (what they're most responsible for)
export const PRIMARY_POSITION_STATS: Record<Position, StatCategory[]> = {
  'GS': ['goals', 'missedGoals', 'rebounds'],
  'GA': ['goals', 'missedGoals', 'rebounds'],
  'WA': ['intercepts', 'pickUp', 'badPass'],
  'C': ['intercepts', 'pickUp', 'badPass'],
  'WD': ['intercepts', 'pickUp', 'badPass'],
  'GD': ['goalsAgainst', 'rebounds', 'intercepts'],
  'GK': ['goalsAgainst', 'rebounds', 'intercepts'],
};

// Secondary stats that are still tracked but less emphasized
export const SECONDARY_POSITION_STATS: Record<Position, StatCategory[]> = {
  'GS': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'GA': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'WA': ['handlingError', 'infringement'],
  'C': ['handlingError', 'infringement'],
  'WD': ['handlingError', 'infringement'],
  'GD': ['pickUp', 'badPass', 'handlingError', 'infringement'],
  'GK': ['pickUp', 'badPass', 'handlingError', 'infringement'],
};

// Export/Import constants
export const EXPORT_SETTINGS = {
  FILE_PREFIX: 'netball-team-data',
  DATE_FORMAT: 'YYYY-MM-DD-HHmm',
  SUPPORTED_FORMATS: ['.json']
};