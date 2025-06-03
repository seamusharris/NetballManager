import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';

export interface GameStatus {
  id: number;
  name: string;
  displayName: string;
  points: number;
  opponentPoints: number;
  isCompleted: boolean;
  allowsStatistics: boolean;
  requiresOpponent: boolean;
  colorClass: string;
  sortOrder: number;
  isActive: boolean;
}

export function useGameStatuses() {
  const query = useQuery({
    queryKey: ['gameStatuses'],
    queryFn: () => apiRequest('GET', '/api/game-statuses') as Promise<GameStatus[]>,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  console.log('useGameStatuses result:', {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
}