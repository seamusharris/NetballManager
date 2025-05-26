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
  // Filter and sort gameIds for query key stability
  const validGameIds = useMemo(() => {
    if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
      return [];
    }
    return gameIds.filter(id => id && typeof id === 'number' && id > 0 && !isNaN(id));
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
      if (!sortedGameIds.length) {
        console.log('No valid game IDs for batch fetch, returning empty object');
        return {};
      }

      console.log(`Batch fetching stats for ${sortedGameIds.length} games via React Query`);
      try {
        const result = await statisticsService.getBatchGameStats(sortedGameIds);
        console.log(`Successfully batch fetched stats for ${Object.keys(result).length} games`);
        return result;
      } catch (error) {
        console.error('Batch statistics fetch failed:', error);
        throw error;
      }
    },
    enabled: validGameIds.length > 0 && 
             sortedGameIds.length > 0 && 
             gameIdsKey.length > 0 && 
             gameIdsKey !== '' &&
             sortedGameIds.every(id => id && id > 0 && !isNaN(id)) &&
             // Prevent empty requests during component initialization
             gameIds !== undefined && 
             gameIds !== null &&
             Array.isArray(gameIds) && 
             gameIds.length > 0,
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