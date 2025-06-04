import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { statisticsService, GameScores, GameStat } from '@/lib/statisticsService';
import { 
  getCachedScores, 
  cacheScores,
  invalidateGameCache, 
  clearGameCache 
} from '@/lib/scoresCache';
import { useClub } from '@/contexts/ClubContext';

/**
 * Custom hook to fetch multiple game scores efficiently with enhanced global caching
 * This hook uses a smart caching strategy to avoid redundant API calls and calculations,
 * with cache that persists across component unmounts and page navigation
 * 
 * @param gameIds - Array of game IDs to fetch scores for
 * @param forceFresh - Whether to force fresh data (bypass cache)
 */
export function useGamesScores(gameIds: number[], forceFresh = false) {
  const { currentClub } = useClub();

  // Early return if club context is not ready - prevents all hook execution
  if (!currentClub?.id) {
    return {
      scoresMap: {},
      isLoading: false,
      hasError: false,
      invalidateGame: () => {},
      invalidateAll: () => {}
    };
  }

  // Stabilize gameIds to prevent unnecessary re-renders
  const stableGameIds = useMemo(() => {
    if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
      return [];
    }
    return [...gameIds].filter(id => typeof id === 'number' && id > 0).sort((a, b) => a - b);
  }, [gameIds]);

  // Only proceed if we have both club and valid game IDs
  const shouldFetch = currentClub?.id && stableGameIds.length > 0;

  // Create a stable query key that won't change unnecessarily
  const queryKey = useMemo(() => [
    'batchGameStats', 
    stableGameIds.join(','), 
    freshQueryKey, 
    currentClub?.id || 'no-club'
  ], [stableGameIds, freshQueryKey, currentClub?.id]);

  // Use a single query to fetch batch stats for all games
  const batchStatsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      if (!shouldFetch) {
        console.log('useGamesScores: Skipping fetch - missing requirements');
        return {};
      }

      try {
        console.log(`useGamesScores: Fetching batch stats for ${stableGameIds.length} games:`, stableGameIds);

        // Use the batch endpoint to get stats for all games at once
        const response = await fetch('/api/games/stats/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-current-club-id': currentClub.id.toString(),
          },
          body: JSON.stringify({ gameIds: stableGameIds }),
        });

        if (!response.ok) {
          console.error(`Batch stats API error: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch batch stats: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`useGamesScores: Fetched batch stats for games ${stableGameIds.join(',')}:`, data);
        return data || {};
      } catch (error) {
        console.error('useGamesScores: Error fetching batch stats:', error);
        // Return empty object instead of throwing to prevent error loops
        return {};
      }
    },
    enabled: shouldFetch,
    staleTime: forceFresh ? 0 : 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Only retry once to avoid spam
    retryDelay: 5000, // Wait 5 seconds before retry
  });

  const { data: batchStats, isLoading, error } = batchStatsQuery || {};

  // Get games data to handle forfeit games properly
  const gamesQuery = useQuery({
    queryKey: ['games', currentClub?.id || 'no-club'],
    queryFn: async () => {
      if (!currentClub?.id) {
        console.log('useGamesScores: No club ID, returning empty games array');
        return [];
      }

      try {
        const response = await fetch('/api/games', {
          headers: {
            'x-current-club-id': currentClub.id.toString(),
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch games: ${response.statusText}`);
        }
        const gamesData = await response.json();
        console.log(`useGamesScores: Fetched ${gamesData.length} games for club ${currentClub.id}`);
        return gamesData;
      } catch (error) {
        console.error('useGamesScores: Error fetching games:', error);
        return [];
      }
    },
    enabled: !!currentClub?.id && shouldFetch,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 5000,
  });

  const { data: games = [] } = gamesQuery || {};

  // Calculate scores for each game using the batch stats
  const scoresMap: Record<number, GameScores | undefined> = useMemo(() => {
    // Early return if we don't have the necessary data
    if (!shouldFetch || !batchStats || !games || games.length === 0 || stableGameIds.length === 0) {
      return {};
    }

    const newScoresMap: Record<number, GameScores | undefined> = {};

    stableGameIds.forEach(gameId => {
      const game = games.find(g => g.id === gameId);
      const stats = batchStats[gameId] || [];

      if (game) {
        // Check cache first if not forcing fresh
        if (!forceFresh) {
          const cached = getCachedScores(gameId, stats, game.status);
          if (cached) {
            newScoresMap[gameId] = cached;
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
        } else if (stats && stats.length > 0) {
          // Calculate regular game scores using the same method as dashboard
          try {
            scores = statisticsService.calculateScoresFromStats(stats, gameId);
          } catch (error) {
            console.error(`Error calculating scores for game ${gameId}:`, error);
            return; // Skip this game if calculation fails
          }
        } else {
          // No stats available for this completed game
          console.warn(`No stats available for completed game ${gameId}`);
          return;
        }

        // Cache the calculated scores
        cacheScores(gameId, scores, stats, game.status);
        newScoresMap[gameId] = scores;
      }
    });

    return newScoresMap;
  }, [batchStats, games, stableGameIds, forceFresh]);
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