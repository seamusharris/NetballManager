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
    refetch 
  } = useQuery({
    queryKey: ['batchGameStats', gameIdsKey, freshKey],
    queryFn: () => {
      console.log(`Batch fetching stats for ${gameIds.length} games via React Query`);
      return statisticsService.getBatchGameStats(sortedGameIds);
    },
    enabled: gameIds.length > 0,
    staleTime: forceFresh ? 0 : 5 * 60 * 1000, // 0 or 5 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });
  
  return {
    statsMap: statsMap || {},
    isLoading,
    error,
    refetch
  };
}