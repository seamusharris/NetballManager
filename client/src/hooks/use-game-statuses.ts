import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

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
    queryFn: async () => {
      try {
        const result = await apiClient.get('/api/game-statuses');
        console.log('Game statuses API response:', result);
        return result as GameStatus[];
      } catch (error) {
        console.error('Game statuses API error:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  console.log('useGameStatuses result:', {
    isLoading: query.isLoading,
    error: query.error,
    data: query.data,
    dataLength: query.data?.length || 0
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
}