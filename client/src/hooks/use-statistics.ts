import { useQuery, useQueries } from '@tanstack/react-query';
import { unifiedStatsService, GameScores, PositionStat, PlayerPerformance } from '@/lib/statisticsService';
import { GameStat } from '@shared/schema';

/**
 * Unified hook for all statistics operations
 */
export function useStatistics() {
  return {
    // Get stats for a single game
    useGameStats: (gameId: number) => 
      useQuery({
        queryKey: ['game-stats', gameId],
        queryFn: () => unifiedStatsService.getBatchGameStats([gameId]).then(map => map[gameId] || []),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }),

    // Get stats for multiple games
    useBatchGameStats: (gameIds: number[]) =>
      useQuery({
        queryKey: ['batch-game-stats', gameIds.sort()],
        queryFn: () => unifiedStatsService.getBatchGameStats(gameIds),
        enabled: gameIds.length > 0,
        staleTime: 5 * 60 * 1000,
      }),

    // Get scores for multiple games
    useBatchGameScores: (gameIds: number[]) =>
      useQuery({
        queryKey: ['batch-game-scores', gameIds.sort()],
        queryFn: () => unifiedStatsService.calculateBatchGameScores(gameIds),
        enabled: gameIds.length > 0,
        staleTime: 5 * 60 * 1000,
      }),

    // Get position stats for a game
    usePositionStats: (gameId: number) =>
      useQuery({
        queryKey: ['position-stats', gameId],
        queryFn: () => unifiedStatsService.getPositionStats(gameId),
        staleTime: 5 * 60 * 1000,
      }),

    // Map stats to players
    usePlayerStatsMapping: (gameId: number) =>
      useQuery({
        queryKey: ['player-stats-mapping', gameId],
        queryFn: () => unifiedStatsService.mapStatsToPlayers(gameId),
        staleTime: 5 * 60 * 1000,
      }),

    // Player performance across games
    usePlayerPerformance: (playerId: number, gameIds?: number[]) =>
      useQuery({
        queryKey: ['player-performance', playerId, gameIds?.sort()],
        queryFn: () => unifiedStatsService.calculatePlayerPerformance(playerId, gameIds),
        enabled: playerId > 0,
        staleTime: 10 * 60 * 1000, // 10 minutes for performance data
      }),
  };
}

// Convenience hooks for common use cases
export function useGameStats(gameId: number) {
  return useStatistics().useGameStats(gameId);
}

export function useBatchGameStats(gameIds: number[]) {
  return useStatistics().useBatchGameStats(gameIds);
}

export function useBatchGameScores(gameIds: number[]) {
  return useStatistics().useBatchGameScores(gameIds);
}

export function usePositionStats(gameId: number) {
  return useStatistics().usePositionStats(gameId);
}

export function usePlayerStatsMapping(gameId: number) {
  return useStatistics().usePlayerStatsMapping(gameId);
}

export function usePlayerPerformance(playerId: number, gameIds?: number[]) {
  return useStatistics().usePlayerPerformance(playerId, gameIds);
}