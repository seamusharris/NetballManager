import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function useBatchRosterData(gameIds: number[]) {
  const { data: rostersMap = {}, isLoading, error } = useQuery({
    queryKey: ['batch-rosters', gameIds.sort().join(',')],
    queryFn: async () => {
      if (!gameIds.length) return {};

      // Fetch rosters for all games in parallel
      const rosterPromises = gameIds.map(async (gameId) => {
        try {
          const rosters = await apiClient.get(`/api/games/${gameId}/rosters`);
          return { gameId, rosters };
        } catch (error) {
          console.error(`Error fetching rosters for game ${gameId}:`, error);
          return { gameId, rosters: [] };
        }
      });

      const results = await Promise.all(rosterPromises);

      // Create a map of gameId -> rosters[]
      const rostersMap = results.reduce((acc, result) => {
        acc[result.gameId] = result.rosters;
        return acc;
      }, {} as Record<number, any[]>);

      return rostersMap;
    },
    enabled: gameIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return { rostersMap, isLoading, error };
}