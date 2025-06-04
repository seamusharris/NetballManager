import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { GameStat } from '@shared/schema';
import { apiClient } from '@shared/apiClient';
import { useCurrentClub } from '@shared/hooks/useCurrentClub'; // Assuming this hook exists

export function useGameStats(gameId: number | undefined) {
  const { currentClub } = useCurrentClub();
  return useQuery<GameStat[]>({
    queryKey: ['/api/games', gameId, 'stats', currentClub?.id],
    queryFn: async () => {
      if (!gameId) return [];
      return await apiClient.get(`/api/games/${gameId}/stats`, {
        headers: {
          'x-current-club-id': currentClub?.id?.toString() || ''
        }
      });
    },
    enabled: !!gameId && !!currentClub?.id,
  });
}

export function useBatchGameStats(gameIds: number[]) {
  const { currentClub } = useCurrentClub();
  // Filter and sort game IDs for consistency - be more strict
  const validGameIds = useMemo(() => {
    if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
      return [];
    }
    const filtered = gameIds.filter(id => id && typeof id === 'number' && id > 0 && !isNaN(id));
    return filtered.length > 0 ? filtered : [];
  }, [gameIds]);

  // Fetch stats for multiple games efficiently
  return useQuery<Record<number, GameStat[]>>({
    queryKey: ['/api/games/stats/batch', validGameIds.sort(), currentClub?.id],
    queryFn: async () => {
      if (!validGameIds || validGameIds.length === 0) {
        console.log('No valid game IDs provided for batch request, returning empty object');
        return {};
      }

      const gameIdsParam = validGameIds.join(',');
      console.log(`Fetching batch stats for games: ${gameIdsParam}`);

      if (!gameIdsParam || gameIdsParam === '') {
        console.log('Empty game IDs parameter, returning empty object');
        return {};
      }

      try {
        const url = '/api/games/stats/batch';
        console.log(`Making batch request to: ${url} with gameIds:`, validGameIds);

        return await apiClient.post(url, { gameIds: validGameIds }, {
          headers: {
            'x-current-club-id': currentClub?.id?.toString() || ''
          }
        });
      } catch (error) {
        console.error('Batch fetch failed:', error);
        // Fallback to individual requests
        const statsMap: Record<number, GameStat[]> = {};
        const results = await Promise.allSettled(
          validGameIds.map(async (id) => {
            return await apiClient.get(`/api/games/${id}/stats`, {
              headers: {
                'x-current-club-id': currentClub?.id?.toString() || ''
              }
            });
          })
        );

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            statsMap[validGameIds[index]] = result.value;
          } else {
            statsMap[validGameIds[index]] = [];
          }
        });

        return statsMap;
      }
    },
    enabled: validGameIds.length > 0 && 
             validGameIds.every(id => id && id > 0 && !isNaN(id)) &&
             // Prevent empty requests during component initialization
             gameIds !== undefined && 
             gameIds !== null &&
             Array.isArray(gameIds) && 
             gameIds.length > 0 &&
             validGameIds.join(',').length > 0 &&
             !!currentClub?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}