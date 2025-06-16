/**
 * Global scores cache for game statistics
 * Provides persistent caching across component unmounts and page navigation
 */

import { GameStat } from '@shared/schema';

export interface GameScores {
  quarterScores: Record<string, { for: number; against: number }>;
  finalScore: { for: number; against: number };
}

// In-memory cache for game scores
const scoresCache = new Map<string, {
  scores: GameScores;
  timestamp: number;
  statsHash: string;
  gameStatus?: string;
}>();

// Cache TTL in milliseconds (30 minutes - longer since official scores change less frequently)
const CACHE_TTL = 30 * 60 * 1000;

/**
 * Generate a cache key for a game
 */
function getCacheKey(gameId: number, stats?: GameStat[], gameStatus?: string): string {
  const statusKey = gameStatus || 'unknown';
  const statsHash = stats ? generateStatsHash(stats) : 'no-stats';
  const timestamp = Date.now();
  return `game-${gameId}-${statusKey}-${statsHash}-${timestamp}`;
}

/**
 * Generate a hash for stats array to detect changes
 */
function generateStatsHash(stats: GameStat[]): string {
  if (!stats || stats.length === 0) return 'empty';

  // Sort stats by id to ensure consistent hash
  const sortedStats = [...stats].sort((a, b) => a.id - b.id);

  // Create a simple hash from the stats data
  const dataString = sortedStats.map(stat => 
    `${stat.id}-${stat.quarter}-${stat.position}-${stat.goalsFor}-${stat.goalsAgainst}`
  ).join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Get cached scores for a game
 */
export function getCachedScores(
  gameId: number, 
  stats?: GameStat[], 
  gameStatus?: string
): GameScores | null {
  const key = getCacheKey(gameId, stats, gameStatus);
  const cached = scoresCache.get(key);

  if (!cached) {
    return null;
  }

  if (!isCacheValid(cached.timestamp)) {
    scoresCache.delete(key);
    return null;
  }

  return cached.scores;
}

/**
 * Cache scores for a game
 */
export function cacheScores(
  gameId: number, 
  scores: GameScores, 
  stats?: GameStat[], 
  gameStatus?: string
): void {
  const key = getCacheKey(gameId, stats, gameStatus);
  const statsHash = stats ? generateStatsHash(stats) : 'no-stats';

  scoresCache.set(key, {
    scores,
    timestamp: Date.now(),
    statsHash,
    gameStatus
  });
}

/**
 * Invalidate cache for a specific game
 */
export function invalidateGameCache(gameId: number): void {
  const keysToDelete: string[] = [];

  for (const key of scoresCache.keys()) {
    if (key.startsWith(`game-${gameId}-`)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => scoresCache.delete(key));
}

/**
 * Clear cache for a specific game (alias for invalidateGameCache)
 */
export function clearGameCache(gameId: number): void {
  invalidateGameCache(gameId);
}

/**
 * Clear all cached scores
 */
export function clearAllCache(): void {
  scoresCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ key: string; timestamp: number; age: number }>;
} {
  const entries = Array.from(scoresCache.entries()).map(([key, value]) => ({
    key,
    timestamp: value.timestamp,
    age: Date.now() - value.timestamp
  }));

  return {
    size: scoresCache.size,
    entries
  };
}