import { useQueries, useQueryClient } from '@tanstack/react-query';
import { statisticsService, GameScores } from '@/lib/statisticsService';
import { getCachedScores, cacheScores } from '@/lib/scoresCache';

/**
 * Custom hook to fetch multiple game scores efficiently
 * This hook handles batching and smart caching to prevent redundant API calls
 * 
 * @param gameIds - Array of game IDs to fetch scores for
 * @param forceFresh - Whether to force fresh data (bypass cache)
 */
export function useGamesScores(gameIds: number[], forceFresh: boolean = false) {
  const queryClient = useQueryClient();
  
  // Use TanStack Query's useQueries for parallel fetching
  const results = useQueries({
    queries: gameIds.map(gameId => {
      return {
        queryKey: ['gameScores', gameId, forceFresh ? Date.now().toString() : ''],
        queryFn: async () => {
          // Try to get from memory cache first (fastest option)
          if (!forceFresh) {
            const cached = getCachedScores(gameId);
            if (cached) return cached;
          }
          
          // Fetch from API and store in cache
          const scores = await statisticsService.calculateGameScores(gameId, forceFresh);
          cacheScores(gameId, scores);
          return scores;
        },
        staleTime: forceFresh ? 0 : 5 * 60 * 1000, // 0 for fresh, 5 minutes otherwise
        cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      };
    }),
  });
  
  // Extract all scores and map to game IDs
  const scoresMap: Record<number, GameScores | undefined> = {};
  results.forEach((result, index) => {
    const gameId = gameIds[index];
    scoresMap[gameId] = result.data;
  });
  
  // Check if any query is loading
  const isLoading = results.some(result => result.isLoading);
  
  // Check if any query has an error
  const hasError = results.some(result => result.error);
  
  return {
    scoresMap,
    isLoading,
    hasError,
    // Provide a way to invalidate a specific game's score
    invalidateGame: (gameId: number) => {
      queryClient.invalidateQueries({queryKey: ['gameScores', gameId]});
    },
    // Provide a way to invalidate all scores
    invalidateAll: () => {
      queryClient.invalidateQueries({queryKey: ['gameScores']});
    }
  };
}