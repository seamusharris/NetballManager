import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useMemo } from 'react';
import { statisticsService, GameScores, GameStat } from '@/lib/statisticsService';
import { 
  getCachedScores, 
  cacheScores,
  invalidateGameCache, 
  clearGameCache 
} from '@/lib/scoresCache';
import { useClub } from '@/contexts/ClubContext';
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
        return {};
      }

      try {

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

  const { data: batchStats, isLoading } = batchStatsQuery;
  const { data: games = [] } = gamesQuery;

  const scoresMap: Record<number, GameScores | undefined> = useMemo(() => {
    if (!shouldFetch || !batchStats || !games) {
      return {};
    }

    if (Object.keys(batchStats).length === 0) {
      console.warn('useGamesScores: No batch stats available.');
      return {};
    }

    if (games.length === 0) {
      console.warn('useGamesScores: No games available.');
      return {};
    }

    const newScoresMap: Record<number, GameScores | undefined> = {};

    stableGameIds.forEach(gameId => {
      const game = games.find(g => g.id === gameId);
      const stats = batchStats[gameId] || [];

      if (game) {
        if (!forceFresh) {
          const cached = getCachedScores(gameId, game.status);
          if (cached) {
            newScoresMap[gameId] = cached;
            return;
          }
        }

        let scores: GameScores;

        // Check if game has fixed scores from status (forfeit, etc.)
        if (game.statusTeamGoals !== null && game.statusTeamGoals !== undefined &&
            game.statusOpponentGoals !== null && game.statusOpponentGoals !== undefined) {
          const quarterScores = {
            '1': { for: game.statusTeamGoals, against: game.statusOpponentGoals },
            '2': { for: 0, against: 0 },
            '3': { for: 0, against: 0 },
            '4': { for: 0, against: 0 }
          };

          scores = {
            quarterScores,
            finalScore: {
              for: game.statusTeamGoals,
              against: game.statusOpponentGoals
            }
          };
        } else if (stats && stats.length > 0) {
          try {
            // Calculate scores from stats - don't pass empty official scores
            const gameScores = gameScoreService.calculateGameScoresSync(
              stats, 
              game.status, 
              { teamGoals: game.statusTeamGoals, opponentGoals: game.statusOpponentGoals },
              false, // isInterClub
              game.homeTeamId,
              game.awayTeamId,
              currentClub?.currentTeam?.id || currentClub?.teams?.[0]?.id // Use club context for team ID
              // No official scores parameter - let it calculate from stats
            );

            // Convert to legacy format
            const quarterScores: Record<string, { for: number; against: number }> = {};
            gameScores.quarterScores.forEach(q => {
              quarterScores[q.quarter.toString()] = { for: q.teamScore, against: q.awayScore };
            });

            scores = {
              quarterScores,
              finalScore: { for: gameScores.totalTeamScore, against: gameScores.totalOpponentScore }
            };
          } catch (error) {
            console.error(`Error calculating scores for game ${gameId}:`, error);
            // Don't return early - let the game show without scores rather than breaking
            scores = {
              quarterScores: {},
              finalScore: { for: 0, against: 0 }
            };
          }
        } else {
          console.warn(`No stats available for completed game ${gameId}`);
          return;
        }

        cacheScores(gameId, scores, game.status);
        newScoresMap[gameId] = scores;
      }
    });

    return newScoresMap;
  }, [batchStats, games, stableGameIds, forceFresh, shouldFetch]);

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
    hasError: shouldFetch ? batchStatsQuery.error !== undefined : false,
    invalidateGame,
    invalidateAll
  };
}

export function useGamesScores(
  games: any[],
  centralizedStats: Record<number, any[]> = {},
  useOfficialPriority: boolean = true,
  teamIdOverride?: number | null // null = no team filtering, undefined = use context
) {
  const { currentClub } = useClub();
  const contextTeamId = currentClub?.currentTeam?.id;
  const currentTeamId = teamIdOverride !== undefined ? teamIdOverride : contextTeamId;
}