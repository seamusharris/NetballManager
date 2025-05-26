Updating the component to use the new standardized batch endpoint for game statistics.
```
```replit_final_file
import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '@/lib/statisticsService';
import { GameStat } from '@shared/schema';

/**
 * React Hook to efficiently fetch statistics for multiple games at once
 * using the batch endpoint instead of making separate requests
 * 
 * @param gameIds - Array of game IDs to fetch statistics for
 * @param forceFresh - Whether to force fresh data (bypass cache)
 */
export function useBatchGameStatistics(gameIds: number[], forceFresh: boolean = false) {
  // Sort gameIds for query key stability
  const sortedGameIds = [...gameIds].sort((a, b) => a - b);
  const gameIdsKey = sortedGameIds.join(',');

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
      console.log(`Batch fetching stats for ${gameIds.length} games via React Query`);
      try {
        const result = await statisticsService.getBatchGameStats(sortedGameIds);
        console.log(`Successfully batch fetched stats for ${Object.keys(result).length} games`);
        return result;
      } catch (error) {
        console.error('Batch statistics fetch failed:', error);
        throw error;
      }
    },
    enabled: gameIds.length > 0,
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