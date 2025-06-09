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
import { calculateGameScores } from '@/lib/gameScores';
import { gameScoreService } from '@/lib/gameScoreService';

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
  const queryClient = useQueryClient();

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
    forceFresh ? 'fresh' : 'cached', 
    currentClub?.id || 'no-club'
  ], [stableGameIds, forceFresh, currentClub?.id]);

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
        return {};
      }
    },
    enabled: shouldFetch,
    staleTime: forceFresh ? 0 : 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    retry: 1, // Only retry once to avoid spam
    retryDelay: 5000, // Wait 5 seconds before retry
  });

  const { data: batchStats, isLoading, error } = batchStatsQuery;

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

  const { data: games = [] } = gamesQuery;

  // Create a separate query for scores that can handle async operations
  const scoresQuery = useQuery({
    queryKey: ['gameScoresWithOfficial', stableGameIds.join(','), currentClub?.id || 'no-club', forceFresh ? 'fresh' : 'cached'],
    queryFn: async () => {
      if (!shouldFetch || !batchStats || !games) {
        return {};
      }

      const newScoresMap: Record<number, any> = {};

      // Process games sequentially to handle async official score fetching
      for (const gameId of stableGameIds) {
        const game = games.find(g => g.id === gameId);
        const gameStats = batchStats[gameId] || [];

        if (game && gameStats) {
          try {
            // Use the unified gameScoreService which prioritizes official scores
            const scores = await gameScoreService.calculateGameScores(
              gameStats,
              game.status,
              { teamGoals: game.statusTeamGoals, opponentGoals: game.statusOpponentGoals },
              game.isInterClub,
              game.homeTeamId,
              game.awayTeamId,
              currentClub?.id, // This will be used as currentTeamId for perspective
              undefined, // officialScores - will be fetched internally
              gameId // Pass gameId so official scores can be fetched
            );

            // Convert to legacy format expected by GamesList
            const legacyScores = {
              finalScore: {
                for: scores.totalTeamScore,
                against: scores.totalOpponentScore
              },
              quarterScores: scores.quarterScores.reduce((acc, q) => {
                acc[q.quarter.toString()] = { for: q.teamScore, against: q.opponentScore };
                return acc;
              }, {} as any)
            };

            newScoresMap[gameId] = legacyScores;
          } catch (error) {
            console.error(`Error calculating scores for game ${gameId}:`, error);
          }
        }
      }

      return newScoresMap;
    },
    enabled: shouldFetch && !!batchStats && !!games,
    staleTime: forceFresh ? 0 : 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const scoresMap = scoresQuery.data || {};

  const invalidateGame = (gameId: number) => {
    queryClient.invalidateQueries({ queryKey: ['gameScores', gameId] });
    invalidateGameCache(gameId);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['gameScores'] });
    stableGameIds.forEach(gameId => clearGameCache(gameId));
  };

  // Always return the same object structure, regardless of the currentClub
  return {
    scoresMap,
    isLoading: shouldFetch ? isLoading : false,
    hasError: shouldFetch ? error !== undefined : false,
    invalidateGame,
    invalidateAll
  };
}