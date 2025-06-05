import { useQuery } from '@tanstack/react-query';
import { statisticsService, GameScores } from '@/lib/statisticsService';
import { GameStat } from '@shared/schema';
import { getCachedScores } from '@/lib/scoresCache';
import { apiRequest } from '@/lib/apiClient';

/**
 * Custom hook to fetch game statistics with enhanced caching
 * @param gameId - The ID of the game to fetch statistics for
 * @param forceFresh - Whether to force fresh data every time (bypassing cache)
 * @param preloadedStats - Optional preloaded stats to avoid API calls
 */
export function useGameStatistics(gameId: number, forceFresh: boolean = false, preloadedStats?: GameStat[]) {
  // Create a unique key for freshness tracking (only when forcing fresh data)
  const freshQueryKey = forceFresh ? `fresh-${Date.now()}` : 'cached';

  // Check if we have preloaded stats - must have actual data, not just an empty array
  const hasPreloadedStats = preloadedStats && Array.isArray(preloadedStats) && preloadedStats.length >= 0;

  // For detail view, we can skip the raw stats fetch when using the scores cache or preloaded data
  const hasCachedScores = !forceFresh && getCachedScores(gameId) !== undefined;

  // Optimized fetch of raw stats (skip when using cached scores or preloaded stats)
  const { 
    data: rawStats, 
    isLoading: isLoadingRawStats,
    error: rawStatsError
  } = useQuery({
    queryKey: [`/api/games/${gameId}/stats`],
    queryFn: () => apiRequest('GET', `/api/games/${gameId}/stats`),
    enabled: !!gameId && !hasPreloadedStats && (!hasCachedScores || forceFresh),
    staleTime: forceFresh ? 0 : 15 * 60 * 1000, // 0 for fresh, 15 minutes otherwise
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Enhanced calculation of game scores with global caching and preloaded stats
  const { 
    data: scores, 
    isLoading: isLoadingScores,
    error: scoresError
  } = useQuery({
    queryKey: ['gameScores', gameId, freshQueryKey, hasPreloadedStats ? 'preloaded' : 'api'],
    queryFn: () => {
      // Fast path: use preloaded stats if available
      if (hasPreloadedStats) {
        console.log(`useGameStatistics: Using preloaded stats for game ${gameId} (${preloadedStats.length} stats)`);
        return Promise.resolve(statisticsService.calculateScoresFromStats(preloadedStats, gameId));
      }

      // Fast path: check global cache first if we're not forcing fresh data
      if (!forceFresh) {
        const cached = getCachedScores(gameId);
        if (cached) {
          console.log(`useGameStatistics: Using cached scores for game ${gameId}`);
          return Promise.resolve(cached);
        }
      }
      // Otherwise calculate normally (which will also update the cache)
      return statisticsService.calculateGameScores(gameId, forceFresh);
    },
    enabled: !!gameId, // Always enable the query, let the queryFn handle preloaded stats
    staleTime: hasPreloadedStats ? Infinity : (forceFresh ? 0 : 15 * 60 * 1000), // Never expire preloaded stats
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Optimized position stats calculation with preloaded data
  const { 
    data: positionStats, 
    isLoading: isLoadingPositionStats,
    error: positionStatsError
  } = useQuery({
    queryKey: ['positionStats', gameId, freshQueryKey, hasPreloadedStats ? 'preloaded' : 'api'],
    queryFn: () => {
      if (hasPreloadedStats) {
        console.log(`useGameStatistics: Using preloaded stats for position stats game ${gameId}`);
        return Promise.resolve(statisticsService.calculatePositionStatsFromStats(preloadedStats, gameId));
      }
      return statisticsService.getPositionStats(gameId, forceFresh);
    },
    enabled: !!gameId,
    staleTime: hasPreloadedStats ? Infinity : (forceFresh ? 0 : 15 * 60 * 1000), // Never expire preloaded stats
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Optimized player stats mapping with preloaded data
  const { 
    data: playerStats, 
    isLoading: isLoadingPlayerStats,
    error: playerStatsError
  } = useQuery({
    queryKey: ['playerStats', gameId, freshQueryKey, hasPreloadedStats ? 'preloaded' : 'api'],
    queryFn: () => {
      if (hasPreloadedStats) {
        console.log(`useGameStatistics: Using preloaded stats for player mapping game ${gameId}`);
        return Promise.resolve(statisticsService.mapStatsToPlayersFromStats(preloadedStats, gameId));
      }
      return statisticsService.mapStatsToPlayers(gameId, forceFresh);
    },
    enabled: !!gameId,
    staleTime: hasPreloadedStats ? Infinity : (forceFresh ? 0 : 15 * 60 * 1000), // Never expire preloaded stats
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Combine loading and error states - be more forgiving with errors when we have preloaded data
  const isLoading = isLoadingScores || isLoadingPositionStats || isLoadingPlayerStats || 
                   (isLoadingRawStats && !hasCachedScores && !hasPreloadedStats);

  // Only report errors if we don't have any alternative data source
  const error = hasPreloadedStats ? null : (rawStatsError || scoresError || positionStatsError || playerStatsError);

  return {
    rawStats: hasPreloadedStats ? preloadedStats : rawStats,
    scores,
    positionStats,
    playerStats,
    isLoading,
    error
  };
}