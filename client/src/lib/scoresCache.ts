/**
 * Advanced caching system for game scores
 * This module serves as a central cache to avoid redundant game score calculations
 */

import { GameScores } from './statisticsService';

// In-memory cache for game scores
const scoresCache: Record<number, {
  scores: GameScores;
  timestamp: number;
}> = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Check if a cached score is still valid
 */
export function isCacheValid(gameId: number): boolean {
  const cached = scoresCache[gameId];
  if (!cached) return false;
  
  const now = Date.now();
  return (now - cached.timestamp) < CACHE_EXPIRATION;
}

/**
 * Get scores from cache if available
 */
export function getCachedScores(gameId: number): GameScores | null {
  if (isCacheValid(gameId)) {
    return scoresCache[gameId].scores;
  }
  return null;
}

/**
 * Store scores in cache
 */
export function cacheScores(gameId: number, scores: GameScores): void {
  scoresCache[gameId] = {
    scores,
    timestamp: Date.now()
  };
}

/**
 * Clear specific game from cache (e.g., after updates)
 */
export function clearGameCache(gameId: number): void {
  delete scoresCache[gameId];
}

/**
 * Clear entire cache
 */
export function clearAllCache(): void {
  Object.keys(scoresCache).forEach(key => {
    delete scoresCache[parseInt(key)];
  });
}

// Export the cache for advanced use cases
export const scoresCacheStore = scoresCache;