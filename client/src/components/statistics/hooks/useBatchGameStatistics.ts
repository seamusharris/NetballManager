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

  // Create a stable query key that doesn't change on every render
  const freshKey = forceFresh ? 'fresh' : 'cached-v4-opponent';

  // Fetch batch game statistics
  const { 
    data: statsMap, 
    isLoading, 
    error,
    refetch,
    isStale
  } = useQuery({
    queryKey: ['batchGameStats-v4-opponent-force', gameIdsKey, freshKey],
    queryFn: async () => {
      console.log('🎯 BATCH HOOK CALLING statisticsService.getBatchGameStats with:', sortedGameIds);
      if (!sortedGameIds || sortedGameIds.length === 0) {
        return {};
      }

      const result = await statisticsService.getBatchGameStats(sortedGameIds);
      console.log('🎯 BATCH HOOK RECEIVED RESULT:', result);
      return result;
    },
    enabled: sortedGameIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - reasonable cache time
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