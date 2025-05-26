import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '@/lib/statisticsService';
import { GameStat } from '@shared/schema';
import { CACHE_SETTINGS } from '@/lib/constants';
import { useMemo } from 'react';

/**
 * React Hook to efficiently fetch statistics for multiple games at once
 * using the batch endpoint instead of making separate requests
 * 
 * @param gameIds - Array of game IDs to fetch statistics for
 * @param forceFresh - Whether to force fresh data (bypass cache)
 */
export function useBatchGameStatistics(gameIds: number[], forceFresh: boolean = false) {
  // DEBUG: Log exactly what we receive
  console.log('useBatchGameStatistics called with:', {
    gameIds,
    gameIdsType: typeof gameIds,
    gameIdsIsArray: Array.isArray(gameIds),
    gameIdsLength: gameIds?.length,
    forceFresh
  });

  // Filter and sort gameIds for query key stability
  const validGameIds = useMemo(() => {
    if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
      console.log('useBatchGameStatistics: Invalid gameIds, returning empty array');
      return [];
    }
    const filtered = gameIds.filter(id => id && typeof id === 'number' && id > 0 && !isNaN(id));
    console.log('useBatchGameStatistics: Filtered gameIds:', filtered);
    return filtered;
  }, [gameIds]);
  
  const sortedGameIds = useMemo(() => 
    [...validGameIds].sort((a, b) => a - b), 
    [validGameIds]
  );
  
  const gameIdsKey = useMemo(() => 
    sortedGameIds.join(','), 
    [sortedGameIds]
  );

  // Include timestamp in key to force refresh when needed
  const freshKey = forceFresh ? `fresh-${Date.now()}` : 'cached';

  // Fetch batch game statistics
  const { 
    data: statsMap, 
    isLoading, 
    error,
    refetch,
    isStale
  } = useQuery({
    queryKey: ['batchGameStats', gameIdsKey, freshKey],
    queryFn: async () => {
      if (!sortedGameIds || sortedGameIds.length === 0) {
        console.log('useBatchGameStatistics: No valid game IDs for batch fetch, returning empty object');
        return {};
      }

      console.log(`useBatchGameStatistics: Batch fetching stats for ${sortedGameIds.length} games: [${sortedGameIds.join(', ')}]`);
      
      const result = await statisticsService.getBatchGameStats(sortedGameIds);
      console.log(`useBatchGameStatistics: Successfully fetched stats for ${Object.keys(result).length} games`);
      return result;
    },
    enabled: sortedGameIds.length > 0,
    staleTime: forceFresh ? 0 : CACHE_SETTINGS.BATCH_QUERY_STALE_TIME,
    gcTime: CACHE_SETTINGS.QUERY_CACHE_TIME,
    retry: CACHE_SETTINGS.MAX_RETRIES,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    statsMap: statsMap || {},
    isLoading,
    error,
    refetch,
    isStale
  };
}