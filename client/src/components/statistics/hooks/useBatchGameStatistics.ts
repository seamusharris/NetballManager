import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '@/lib/statisticsService';
import { GameStat } from '@shared/schema';
import { CACHE_SETTINGS } from '@/lib/constants';
import { useMemo } from 'react';

/**
 * React Hook to efficiently fetch statistics for multiple games at once
 * using the batch endpoint instead of making separate requests
 * 
 * @param gameIds - Array of game IDs to fetch statistics for
 * @param forceFresh - Whether to force fresh data (bypass cache)
 */
export function useBatchGameStatistics(gameIds: number[], forceFresh: boolean = false) {
  // Filter and sort gameIds for query key stability
  const validGameIds = gameIds.filter(id => id && id > 0);
  const sortedGameIds = [...validGameIds].sort((a, b) => a - b);
  const gameIdsKey = sortedGameIds.join(',');

  // Include timestamp in key to force refresh when needed
  const freshKey = forceFresh ? `fresh-${Date.now()}` : 'cached';

  // Fetch batch game statistics
  const { 
    data: statsMap, 
    isLoading, 
    error,
    refetch,
    isStale
  } = useQuery({
    queryKey: ['batchGameStats', gameIdsKey, freshKey],
    queryFn: async () => {
      if (!sortedGameIds.length) {
        console.log('No valid game IDs for batch fetch, returning empty object');
        return {};
      }

      console.log(`Batch fetching stats for ${sortedGameIds.length} games via React Query`);
      try {
        const result = await statisticsService.getBatchGameStats(sortedGameIds);
        console.log(`Successfully batch fetched stats for ${Object.keys(result).length} games`);
        return result;
      } catch (error) {
        console.error('Batch statistics fetch failed:', error);
        throw error;
      }
    },
    enabled: sortedGameIds.length > 0,
    staleTime: forceFresh ? 0 : CACHE_SETTINGS.BATCH_QUERY_STALE_TIME,
    gcTime: CACHE_SETTINGS.QUERY_CACHE_TIME,
    retry: CACHE_SETTINGS.MAX_RETRIES,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    statsMap: statsMap || {},
    isLoading,
    error,
    refetch,
    isStale
  };
}

// Assume this is a component using the hook
function GameScoreComponent({ gameIds }: { gameIds: number[] }) {
  // Filter out invalid game IDs before making the batch request
  const validGameIds = useMemo(() => {
    return gameIds.filter(id => id && id > 0 && !isNaN(id));
  }, [gameIds]);

  // Use the batch hook to get stats for all games
  const { data: gameStatsMap = {}, isLoading, error } = useBatchGameStatistics(validGameIds);

  // Calculate scores for all games using the fetched stats
  const scoresData = useMemo(() => {
    if (!gameStatsMap || Object.keys(gameStatsMap).length === 0) {
      return {};
    }

    const scores: Record<number, any> = {};

    validGameIds.forEach(gameId => {
      const stats = gameStatsMap[gameId] || [];
      // Use the statistics service to calculate scores
      scores[gameId] = statisticsService.calculateScoresFromStats(stats, gameId);
    });

    return scores;
  }, [gameStatsMap, validGameIds]);

  return (
    <div>
      {isLoading && <p>Loading scores...</p>}
      {error && <p>Error: {error.message}</p>}
      {Object.keys(scoresData).length > 0 ? (
        <ul>
          {Object.entries(scoresData).map(([gameId, score]) => (
            <li key={gameId}>
              Game {gameId}: Score - {score}
            </li>
          ))}
        </ul>
      ) : (
        <p>No scores available.</p>
      )}
    </div>
  );
}