import { useQuery } from '@tanstack/react-query';
import { GameStat } from '@shared/schema';

export function useGameStats(gameId: number | undefined) {
  return useQuery<GameStat[]>({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: async () => {
      if (!gameId) return [];
      const response = await fetch(`/api/games/${gameId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch game stats');
      return response.json();
    },
    enabled: !!gameId,
  });
}

export function useBatchGameStats(gameIds: number[]) {
  // Filter and sort game IDs for consistency
  const validGameIds = gameIds.filter(id => id && id > 0);
  
  // Fetch stats for multiple games efficiently
  return useQuery<Record<number, GameStat[]>>({
    queryKey: ['/api/games/stats/batch', validGameIds.sort()],
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
        // Assuming apiRequest is defined elsewhere and handles the actual API call
        // e.g., const apiRequest = async (method, url) => { ... }
        const apiRequest = async (method: string, url: string) => {
          const response = await fetch(url, { method });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        };
        return await apiRequest('GET', `/api/games/stats/batch?gameIds=${gameIdsParam}`);
      } catch (error) {
        console.error('Batch fetch failed:', error);
        // Fallback to individual requests
        const statsMap: Record<number, GameStat[]> = {};
        const results = await Promise.allSettled(
          validGameIds.map(id => {
            const apiRequest = async (method: string, url: string) => {
              const response = await fetch(url, { method });
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            };
            return apiRequest('GET', `/api/games/${id}/stats`);
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
    enabled: validGameIds.length > 0,
  });
}