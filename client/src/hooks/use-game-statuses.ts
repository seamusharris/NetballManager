
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
  colorClass: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useGameStatuses() {
  return useQuery({
    queryKey: ['game-statuses'],
    queryFn: () => apiRequest('GET', '/api/game-statuses') as Promise<GameStatus[]>,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes since statuses don't change often
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
