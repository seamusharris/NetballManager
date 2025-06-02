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
  return useQuery<GameStatus[]>({
    queryKey: ['game-statuses'],
    queryFn: async () => {
      return await apiClient.get<GameStatus[]>('/api/game-statuses');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}