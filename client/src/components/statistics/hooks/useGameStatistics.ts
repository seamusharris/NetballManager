import { useQuery } from '@tanstack/react-query';
import { statisticsService, GameScores } from '@/lib/statisticsService';
import { GameStat } from '@shared/schema';

/**
 * Custom hook to fetch game statistics
 * @param gameId - The ID of the game to fetch statistics for
 * @param forceFresh - Whether to force fresh data every time (bypassing cache)
 */
export function useGameStatistics(gameId: number, forceFresh: boolean = false) {
  // Create a unique timestamp to force fresh data
  const timestamp = Date.now();
  const freshQueryKey = forceFresh ? `${timestamp}` : '';
  
  // Fetch raw statistics data
  const { 
    data: rawStats, 
    isLoading: isLoadingRawStats,
    error: rawStatsError
  } = useQuery({
    queryKey: ['gameStats', gameId, freshQueryKey],
    queryFn: () => statisticsService.getGameStats(gameId),
    enabled: !!gameId,
    staleTime: forceFresh ? 0 : 5 * 60 * 1000, // 0 for fresh, 5 minutes otherwise
  });
  
  // Calculate game scores
  const { 
    data: scores, 
    isLoading: isLoadingScores,
    error: scoresError
  } = useQuery({
    queryKey: ['gameScores', gameId, freshQueryKey],
    queryFn: () => statisticsService.calculateGameScores(gameId, forceFresh),
    enabled: !!gameId,
    staleTime: forceFresh ? 0 : 5 * 60 * 1000, // 0 for fresh, 5 minutes otherwise
  });
  
  // Get position-based statistics
  const { 
    data: positionStats, 
    isLoading: isLoadingPositionStats,
    error: positionStatsError
  } = useQuery({
    queryKey: ['positionStats', gameId, freshQueryKey],
    queryFn: () => statisticsService.getPositionStats(gameId, forceFresh),
    enabled: !!gameId,
    staleTime: forceFresh ? 0 : 5 * 60 * 1000, // 0 for fresh, 5 minutes otherwise
  });
  
  // Map stats to players using roster information
  const { 
    data: playerStats, 
    isLoading: isLoadingPlayerStats,
    error: playerStatsError
  } = useQuery({
    queryKey: ['playerStats', gameId, freshQueryKey],
    queryFn: () => statisticsService.mapStatsToPlayers(gameId, forceFresh),
    enabled: !!gameId,
    staleTime: forceFresh ? 0 : 5 * 60 * 1000, // 0 for fresh, 5 minutes otherwise
  });
  
  // Combine loading and error states
  const isLoading = isLoadingRawStats || isLoadingScores || isLoadingPositionStats || isLoadingPlayerStats;
  const error = rawStatsError || scoresError || positionStatsError || playerStatsError;
  
  return {
    rawStats,
    scores,
    positionStats,
    playerStats,
    isLoading,
    error
  };
}