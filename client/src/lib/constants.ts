
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
  SCORE_CACHE_EXPIRATION: 30 * 60 * 1000, // 30 minutes
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  QUERY_CACHE_TIME: 10 * 60 * 1000 // 10 minutes
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

// Export/Import constants
export const EXPORT_SETTINGS = {
  FILE_PREFIX: 'netball-team-data',
  DATE_FORMAT: 'YYYY-MM-DD-HHmm',
  SUPPORTED_FORMATS: ['.json']
};
