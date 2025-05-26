import { useQuery } from '@tanstack/react-query';
import { statisticsService, GameScores } from '@/lib/statisticsService';
import { GameStat } from '@shared/schema';
import { getCachedScores } from '@/lib/scoresCache';

/**
 * Custom hook to fetch game statistics with enhanced caching
 * @param gameId - The ID of the game to fetch statistics for
 * @param forceFresh - Whether to force fresh data every time (bypassing cache)
 */
export function useGameStatistics(gameId: number, forceFresh: boolean = false) {
  // Create a unique key for freshness tracking (only when forcing fresh data)
  const freshQueryKey = forceFresh ? `fresh-${Date.now()}` : 'cached';

  // For detail view, we can skip the raw stats fetch when using the scores cache
  const hasCachedScores = !forceFresh && getCachedScores(gameId) !== undefined;

  // Optimized fetch of raw stats (skip when using cached scores)
  const { 
    data: rawStats, 
    isLoading: isLoadingRawStats,
    error: rawStatsError
  } = useQuery({
    queryKey: [`/api/games/${gameId}/stats`],
    queryFn: () => apiRequest('GET', `/api/games/${gameId}/stats`),
    enabled: !!gameId && (!hasCachedScores || forceFresh),
    staleTime: forceFresh ? 0 : 15 * 60 * 1000, // 0 for fresh, 15 minutes otherwise
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Enhanced calculation of game scores with global caching
  const { 
    data: scores, 
    isLoading: isLoadingScores,
    error: scoresError
  } = useQuery({
    queryKey: ['gameScores', gameId, freshQueryKey],
    queryFn: () => {
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
    enabled: !!gameId,
    staleTime: forceFresh ? 0 : 15 * 60 * 1000, // 0 for fresh, 15 minutes otherwise
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Optimized position stats calculation
  const { 
    data: positionStats, 
    isLoading: isLoadingPositionStats,
    error: positionStatsError
  } = useQuery({
    queryKey: ['positionStats', gameId, freshQueryKey],
    queryFn: () => statisticsService.getPositionStats(gameId, forceFresh),
    enabled: !!gameId,
    staleTime: forceFresh ? 0 : 15 * 60 * 1000, // 0 for fresh, 15 minutes otherwise
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Optimized player stats mapping
  const { 
    data: playerStats, 
    isLoading: isLoadingPlayerStats,
    error: playerStatsError
  } = useQuery({
    queryKey: ['playerStats', gameId, freshQueryKey],
    queryFn: () => statisticsService.mapStatsToPlayers(gameId, forceFresh),
    enabled: !!gameId,
    staleTime: forceFresh ? 0 : 15 * 60 * 1000, // 0 for fresh, 15 minutes otherwise
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Combine loading and error states
  const isLoading = isLoadingScores || isLoadingPositionStats || isLoadingPlayerStats || 
                   (isLoadingRawStats && !hasCachedScores);
  const error = rawStatsError || scoresError || positionStatsError || playerStatsError;

  return {
    rawStats,
    scores,
    positionStats,
    playerStats,
    isLoading,
    error
  };
}