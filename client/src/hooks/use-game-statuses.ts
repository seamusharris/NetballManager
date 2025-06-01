
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
  return useQuery<GameStatus[]>({
    queryKey: ['game-statuses'],
    queryFn: () => apiRequest('GET', '/api/game-statuses') as Promise<GameStatus[]>,
  });
}
