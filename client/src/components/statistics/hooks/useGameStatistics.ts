import { useQuery } from '@tanstack/react-query';
import { statisticsService, GameScores } from '@/lib/statisticsService';
import { GameStat } from '@shared/schema';

/**
 * Custom hook to fetch game statistics
 */
export function useGameStatistics(gameId: number) {
  // Fetch raw statistics data
  const { 
    data: rawStats, 
    isLoading: isLoadingRawStats,
    error: rawStatsError
  } = useQuery({
    queryKey: ['gameStats', gameId],
    queryFn: () => statisticsService.getGameStats(gameId),
    enabled: !!gameId,
  });
  
  // Calculate game scores
  const { 
    data: scores, 
    isLoading: isLoadingScores,
    error: scoresError
  } = useQuery({
    queryKey: ['gameScores', gameId],
    queryFn: () => statisticsService.calculateGameScores(gameId),
    enabled: !!gameId,
  });
  
  // Get position-based statistics
  const { 
    data: positionStats, 
    isLoading: isLoadingPositionStats,
    error: positionStatsError
  } = useQuery({
    queryKey: ['positionStats', gameId],
    queryFn: () => statisticsService.getPositionStats(gameId),
    enabled: !!gameId,
  });
  
  // Map stats to players using roster information
  const { 
    data: playerStats, 
    isLoading: isLoadingPlayerStats,
    error: playerStatsError
  } = useQuery({
    queryKey: ['playerStats', gameId],
    queryFn: () => statisticsService.mapStatsToPlayers(gameId),
    enabled: !!gameId,
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