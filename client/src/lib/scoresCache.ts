/**
 * Enhanced global caching system for game scores
 * This provides a persistent, centralized cache for score calculation throughout the app
 * ensuring we don't recalculate scores unnecessarily when navigating between pages
 */

// Import only what we need to avoid circular dependencies
import { Position } from '@shared/schema';

// Define the types we need internally to avoid circular imports
interface GameStat {
  id: number;
  gameId: number;
  position: Position;
  quarter: number;
  goalsFor?: number;
  goalsAgainst?: number;
  missedGoals?: number;
  rebounds?: number;
  intercepts?: number;
  badPass?: number;
  handlingError?: number;
  pickUp?: number;
  infringement?: number;
  rating?: number | null;
}

interface GameScores {
  quarterScores: {
    '1': { for: number, against: number },
    '2': { for: number, against: number },
    '3': { for: number, against: number },
    '4': { for: number, against: number }
  };
  finalScore: {
    for: number,
    against: number
  };
}

interface CachedScoreEntry {
  scores: GameScores;             // The calculated scores
  timestamp: number;              // When this cache entry was created
  statsHash: string;              // Hash of the stats used to calculate these scores
  lastModified: number;           // When the underlying stats were last modified
}

// In-memory cache that persists across component renders and page navigation
const globalScoresCache: Record<number, CachedScoreEntry> = {};

import { CACHE_SETTINGS } from './constants';

// Cache expiration time from constants
const CACHE_EXPIRATION = CACHE_SETTINGS.SCORE_CACHE_EXPIRATION;

/**
 * Generate a simple hash from stats to detect changes
 * This helps us invalidate cache when stats actually change
 */
function generateStatsHash(stats: GameStat[]): string {
  if (!stats || !stats.length) return 'empty';

  // Sort stats to ensure consistent hash regardless of order
  const sortedStats = [...stats].sort((a, b) => {
    if (a.position !== b.position) return a.position.localeCompare(b.position);
    return a.quarter - b.quarter;
  });

  // Build a hash string that captures key stats values
  return sortedStats.map(stat => {
    const values = [
      stat.position,
      stat.quarter,
      stat.goalsFor || 0,
      stat.goalsAgainst || 0,
      stat.missedGoals || 0,
      stat.id
    ].join(':');
    return values;
  }).join('|');
}

/**
 * Check if a game has a forfeit status that requires special score handling
 */
function hasForfeitStatus(gameStatus: string | null): boolean {
  return gameStatus === 'forfeit-win' || gameStatus === 'forfeit-loss';
}

/**
 * Check if cached scores are still valid based on stats and time
 */
export function isCacheValid(gameId: number, stats?: GameStat[], gameStatus?: string | null): boolean {
  const cached = globalScoresCache[gameId];
  if (!cached) return false;

  // Special handling for forfeit games - cache remains valid
  if (gameStatus && hasForfeitStatus(gameStatus)) {
    return true;
  }

  const now = Date.now();

  // If stats are provided, check if they've changed
  if (stats && stats.length > 0) {
    const newHash = generateStatsHash(stats);
    if (newHash !== cached.statsHash) {
      return false;
    }
  }

  // Check if cache has expired
  return (now - cached.timestamp) < CACHE_EXPIRATION;
}

/**
 * Get scores from cache if available
 */
export function getCachedScores(
  gameId: number, 
  stats?: GameStat[], 
  gameStatus?: string | null
): GameScores | null {
  if (isCacheValid(gameId, stats, gameStatus)) {
    return globalScoresCache[gameId].scores;
  }
  return null;
}

/**
 * Store scores in cache with stats information
 */
export function cacheScores(
  gameId: number, 
  scores: GameScores, 
  stats?: GameStat[],
  gameStatus?: string | null
): void {
  const statsHash = stats ? generateStatsHash(stats) : 'no-stats';

  globalScoresCache[gameId] = {
    scores,
    timestamp: Date.now(),
    statsHash,
    lastModified: Date.now()
  };
}

/**
 * Force update of a game's cache next time scores are requested
 */
export function invalidateGameCache(gameId: number): void {
  if (globalScoresCache[gameId]) {
    // Keep the cached scores but mark for refresh
    globalScoresCache[gameId].timestamp = 0;
  }
}

/**
 * Clear specific game from cache (e.g., after stats updates)
 */
export function clearGameCache(gameId: number): void {
  delete globalScoresCache[gameId];
}

/**
 * Clear entire cache (use sparingly)
 */
export function clearAllCache(): void {
  Object.keys(globalScoresCache).forEach(key => {
    delete globalScoresCache[parseInt(key)];
  });
}

// Export the cache for advanced use cases and debugging
export const scoresCacheStore = globalScoresCache;