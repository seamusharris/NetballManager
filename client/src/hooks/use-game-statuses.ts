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
    queryFn: () => apiClient.get('/api/game-statuses') as Promise<GameStatus[]>,
  });
}

// Helper function to get status by name
export function useGameStatusByName(statusName: string) {
  const { data: statuses = [], ...query } = useGameStatuses();
  const status = statuses.find(s => s.name === statusName);
  return { status, ...query };
}

// Helper function to get all active status names
export function useActiveGameStatusNames() {
  const { data: statuses = [], ...query } = useGameStatuses();
  const statusNames = statuses.filter(s => s.isActive).map(s => s.name);
  return { statusNames, ...query };
}