import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

interface StandardQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  dependencies?: (string | number)[];
  transform?: (data: any) => T;
}

export function useStandardQuery<T = any>({
  endpoint,
  dependencies = [],
  transform,
  ...queryOptions
}: StandardQueryOptions<T>) {
  return useQuery<T>({
    queryKey: [endpoint, ...dependencies],
    queryFn: async () => {
      const data = await apiClient.get<T>(endpoint);
      return transform ? transform(data) : data;
    },
    ...queryOptions
  });
}

// Specialized hooks for common patterns
export function useGameQuery(gameId: number) {
  return useStandardQuery({
    endpoint: `/api/games/${gameId}`,
    dependencies: [gameId],
    enabled: !!gameId
  });
}

export function useGameStatsQuery(gameId: number) {
  return useStandardQuery({
    endpoint: `/api/games/${gameId}/stats`,
    dependencies: [gameId],
    enabled: !!gameId
  });
}

export function useGameRosterQuery(gameId: number) {
  return useStandardQuery({
    endpoint: `/api/games/${gameId}/rosters`,
    dependencies: [gameId],
    enabled: !!gameId
  });
}

export function usePlayersQuery() {
  return useStandardQuery({
    endpoint: '/api/players'
  });
}

export function useOpponentsQuery() {
  return useStandardQuery({
    endpoint: '/api/opponents'
  });
}

export function useGamesQuery() {
  return useStandardQuery({
    endpoint: '/api/games'
  });
}