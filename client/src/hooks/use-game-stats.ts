
import { useQuery } from '@tanstack/react-query';
import { GameStat } from '@shared/schema';

export function useGameStats(gameId: number | undefined) {
  return useQuery<GameStat[]>({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: async () => {
      if (!gameId) return [];
      const response = await fetch(`/api/games/${gameId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch game stats');
      return response.json();
    },
    enabled: !!gameId,
  });
}

export function useBatchGameStats(gameIds: number[]) {
  return useQuery<Record<number, GameStat[]>>({
    queryKey: ['/api/games/stats/batch', gameIds],
    queryFn: async () => {
      if (gameIds.length === 0) return {};
      const response = await fetch(`/api/games/stats/batch?gameIds=${gameIds.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch batch game stats');
      return response.json();
    },
    enabled: gameIds.length > 0,
  });
}
