import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { CACHE_KEYS } from '@/lib/cacheKeys';

export function useBatchRosterData(gameIds: number[]) {
  const { data: rostersMap = {}, isLoading, error } = useQuery({
    queryKey: CACHE_KEYS.batchRosters(gameIds),
    queryFn: async () => {
      if (!gameIds.length) {
        console.log('useBatchRosterData: No game IDs provided');
        return {};
      }

      console.log('useBatchRosterData: Fetching rosters for games:', gameIds);
      const response = await apiClient.post('/api/games/rosters/batch', { gameIds });
      console.log('useBatchRosterData: Received response:', response);
      return response;
    },
    enabled: gameIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    rostersMap,
    isLoading,
    error
  };
}