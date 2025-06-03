import { useQueries, useQueryClient, useQuery } from '@tanstack/react-query';
import { statisticsService, GameScores, GameStat } from '@/lib/statisticsService';
import { 
  getCachedScores, 
  cacheScores,
  invalidateGameCache, 
  clearGameCache 
} from '@/lib/scoresCache';
import { apiRequest } from '@/lib/apiClient';
import { apiClient } from '@/lib/apiClient'; // Ensure apiClient is imported
import { Game } from '@/components/GameCard'; // Ensure Game is imported

/**
 * Custom hook to fetch multiple game scores efficiently with enhanced global caching
 * This hook uses a smart caching strategy to avoid redundant API calls and calculations,
 * with cache that persists across component unmounts and page navigation
 * 
 * @param gameIds - Array of game IDs to fetch scores for
 * @param forceFresh - Whether to force fresh data (bypass cache)
 */
export function useGamesScores(gameIds: number[], forceFresh = false) {
  // Generate a fresh query key if we're forcing fresh data
  const freshQueryKey = forceFresh ? Date.now() : 'cached';

  // Use a single query to fetch batch stats for all games
  const { data: batchStats, isLoading, error } = useQuery({
    queryKey: ['batchGameStats', gameIds.sort().join(','), freshQueryKey],
    queryFn: async () => {
      if (!gameIds.length) return {};

      // Use the batch endpoint to get stats for all games at once
      const response = await fetch(`/api/games/stats/batch?gameIds=${gameIds.join(',')}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch batch stats: ${response.statusText}`);
      }
      const data = await response.json();
      return data || {};
    },
    enabled: gameIds.length > 0,
    staleTime: forceFresh ? 0 : 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Get games data to handle forfeit games properly
  const { data: games = [] } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const response = await fetch('/api/games');
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Calculate scores for each game using the batch stats
  const scoresMap: Record<number, GameScores | undefined> = {};

  if (batchStats && games.length > 0) {
    gameIds.forEach(gameId => {
      const game = games.find(g => g.id === gameId);
      const stats = batchStats[gameId] || [];

      if (game) {
        // Check cache first if not forcing fresh
        if (!forceFresh) {
          const cached = getCachedScores(gameId, stats, game.status);
          if (cached) {
            scoresMap[gameId] = cached;
            return;
          }
        }

        // Calculate scores based on game status
        let scores: GameScores;

        if (game.status === 'forfeit-win' || game.status === 'forfeit-loss') {
          // Handle forfeit games with 10-0 or 0-10 scores
          const isWin = game.status === 'forfeit-win';
          const quarterScores = {
            '1': { for: isWin ? 10 : 0, against: isWin ? 0 : 10 },
            '2': { for: 0, against: 0 },
            '3': { for: 0, against: 0 },
            '4': { for: 0, against: 0 }
          };

          scores = {
            quarterScores,
            finalScore: {
              for: isWin ? 10 : 0,
              against: isWin ? 0 : 10
            }
          };
        } else {
          // Calculate regular game scores
          scores = statisticsService.calculateScoresFromStats(stats, gameId);
        }

        // Cache the calculated scores
        cacheScores(gameId, scores, stats, game.status);
        scoresMap[gameId] = scores;
      }
    });
  }
  const queryClient = useQueryClient();

  return {
    scoresMap,
    isLoading,
    hasError: error !== undefined,
    // Provide a way to invalidate a specific game's score in both React Query and global cache
    invalidateGame: (gameId: number) => {
      // Invalidate React Query cache
      queryClient.invalidateQueries({queryKey: ['gameScores', gameId]});
      // Also invalidate our global persistent cache
      invalidateGameCache(gameId);
    },
    // Provide a way to invalidate all scores
    invalidateAll: () => {
      // Invalidate all game scores in React Query cache
      queryClient.invalidateQueries({queryKey: ['gameScores']});
      // Also clear our global persistent cache for all games
      gameIds.forEach(gameId => clearGameCache(gameId));
    }
  };
}