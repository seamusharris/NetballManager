
/**
 * Global scores cache for official game scores
 * Provides persistent caching across component unmounts and page navigation
 */

import { OfficialScore } from '@shared/schema';

export interface GameScores {
  quarterScores: Record<string, { for: number; against: number }>;
  finalScore: { for: number; against: number };
}

// In-memory cache for game scores
const scoresCache = new Map<string, {
  scores: GameScores;
  timestamp: number;
  gameStatus?: string;
}>();

// Cache TTL in milliseconds (30 minutes - longer since official scores change less frequently)
const CACHE_TTL = 30 * 60 * 1000;

/**
 * Generate a cache key for a game
 */
function getCacheKey(gameId: number, gameStatus?: string): string {
  const statusKey = gameStatus || 'unknown';
  return `game-${gameId}-${statusKey}`;
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
  gameStatus?: string
): GameScores | null {
  const key = getCacheKey(gameId, gameStatus);
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
  gameStatus?: string
): void {
  const key = getCacheKey(gameId, gameStatus);

  scoresCache.set(key, {
    scores,
    timestamp: Date.now(),
    gameStatus
  });
}

/**
 * Convert official scores to GameScores format
 */
export function convertOfficialScoresToGameScores(
  officialScores: OfficialScore[],
  currentTeamId: number
): GameScores {
  const quarterScores: Record<string, { for: number; against: number }> = {};
  let totalTeamScore = 0;
  let totalOpponentScore = 0;

  // Group scores by quarter
  const scoresByQuarter: Record<number, { [teamId: number]: number }> = {};
  
  officialScores.forEach(score => {
    if (!scoresByQuarter[score.quarter]) {
      scoresByQuarter[score.quarter] = {};
    }
    scoresByQuarter[score.quarter][score.teamId] = score.score;
  });

  // Convert to quarter scores format
  Object.entries(scoresByQuarter).forEach(([quarter, teams]) => {
    const quarterNum = parseInt(quarter);
    const teamScore = teams[currentTeamId] || 0;
    const awayScore = Object.entries(teams)
      .filter(([teamId]) => parseInt(teamId) !== currentTeamId)
      .reduce((sum, [, score]) => sum + score, 0);

    quarterScores[quarter] = {
      for: teamScore,
      against: awayScore
    };

    totalTeamScore += teamScore;
    totalOpponentScore += awayScore;
  });

  return {
    quarterScores,
    finalScore: { for: totalTeamScore, against: totalOpponentScore }
  };
}

/**
 * Cache official scores for a game
 */
export function cacheOfficialScores(
  gameId: number,
  officialScores: OfficialScore[],
  currentTeamId: number,
  gameStatus?: string
): void {
  const gameScores = convertOfficialScoresToGameScores(officialScores, currentTeamId);
  cacheScores(gameId, gameScores, gameStatus);
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
