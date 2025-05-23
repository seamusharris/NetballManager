import { useQueries, useQueryClient } from '@tanstack/react-query';
import { statisticsService, GameScores } from '@/lib/statisticsService';
import { 
  getCachedScores, 
  cacheScores,
  invalidateGameCache, 
  clearGameCache 
} from '@/lib/scoresCache';
import { apiRequest } from '@/lib/queryClient';

/**
 * Custom hook to fetch multiple game scores efficiently with enhanced global caching
 * This hook uses a smart caching strategy to avoid redundant API calls and calculations,
 * with cache that persists across component unmounts and page navigation
 * 
 * @param gameIds - Array of game IDs to fetch scores for
 * @param forceFresh - Whether to force fresh data (bypass cache)
 */
export function useGamesScores(gameIds: number[], forceFresh: boolean = false) {
  const queryClient = useQueryClient();
  
  // Log how many games we're fetching scores for
  if (gameIds.length > 0) {
    console.log(`Batch fetching stats for ${gameIds.length} games via React Query`);
  }
  
  // Use TanStack Query's useQueries for parallel fetching with enhanced caching
  const results = useQueries({
    queries: gameIds.map(gameId => {
      return {
        queryKey: ['gameScores', gameId, forceFresh ? Date.now().toString() : 'cached'],
        queryFn: async () => {
          // First check if this is a forfeit game (special case)
          const game = await apiRequest(`/api/games/${gameId}`);
          
          // Step 1: Try to get from global memory cache first (fastest option)
          if (!forceFresh) {
            // For forfeit games, always include game status when checking cache
            if (game.status === 'forfeit-win' || game.status === 'forfeit-loss') {
              const cached = getCachedScores(gameId, undefined, game.status);
              if (cached) return cached;
            } else {
              const cached = getCachedScores(gameId);
              if (cached) return cached;
            }
          }
          
          // Step 2: Fetch stats and calculate fresh scores
          const stats = await statisticsService.getGameStats(gameId);
          
          // For forfeit games, use special handling
          if (game.status === 'forfeit-win' || game.status === 'forfeit-loss') {
            console.log(`Forfeit game detected (ID: ${gameId}, status: ${game.status}), returning appropriate forfeit score`);
            const forfeitScore = await statisticsService.calculateGameScores(gameId, forceFresh);
            // Cache the forfeit score with game status
            cacheScores(gameId, forfeitScore, stats, game.status);
            return forfeitScore;
          }
          
          // Regular game calculation
          const scores = await statisticsService.calculateGameScores(gameId, forceFresh);
          
          // Cache the calculated scores in global cache
          cacheScores(gameId, scores, stats);
          
          return scores;
        },
        staleTime: forceFresh ? 0 : 15 * 60 * 1000, // 0 for fresh, 15 minutes otherwise
        cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
        // Enable this query if the game ID is valid
        enabled: gameId > 0,
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