import { useQuery } from '@tanstack/react-query';
import { statisticsService, PlayerPerformance } from '@/lib/statisticsService';

/**
 * Custom hook to fetch player performance statistics
 */
export function usePlayerPerformance(playerId: number, gameIds?: number[]) {
  // Calculate player performance across games
  const { 
    data: performance, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['playerPerformance', playerId, gameIds],
    queryFn: () => statisticsService.calculatePlayerPerformance(playerId, gameIds),
    enabled: !!playerId,
  });
  
  return {
    performance,
    isLoading,
    error
  };
}