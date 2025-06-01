import { useQuery, QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiClient } from '@/lib/apiClient';

// Define optimized stale times (in milliseconds) based on data type
const STALE_TIMES = {
  // Player data changes infrequently
  PLAYERS: 1000 * 60 * 60, // 1 hour

  // Game details change infrequently once created
  GAMES: 1000 * 60 * 30, // 30 minutes

  // Game stats might change during active games
  GAME_STATS: 1000 * 60 * 5, // 5 minutes

  // Rosters are usually set once per game
  ROSTERS: 1000 * 60 * 15, // 15 minutes

  // Opponents data changes very infrequently
  OPPONENTS: 1000 * 60 * 60 * 24, // 24 hours

  // Default stale time for other data
  DEFAULT: 1000 * 60 * 10 // 10 minutes
};

/**
 * Get the appropriate stale time based on the API endpoint
 */
function getStaleTime(endpoint: string): number {
  if (endpoint.includes('/players')) {
    return STALE_TIMES.PLAYERS;
  } else if (endpoint.includes('/games') && endpoint.includes('/stats')) {
    return STALE_TIMES.GAME_STATS;
  } else if (endpoint.includes('/games') && endpoint.includes('/rosters')) {
    return STALE_TIMES.ROSTERS;
  } else if (endpoint.includes('/games')) {
    return STALE_TIMES.GAMES;
  } else if (endpoint.includes('/opponents')) {
    return STALE_TIMES.OPPONENTS;
  }

  return STALE_TIMES.DEFAULT;
}

/**
 * Optimized query hook that sets appropriate stale times based on data type
 */
export function useOptimizedQuery<TData = unknown>(
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, Error>({
    queryKey: [endpoint],
    queryFn: () => apiClient.get<TData>(endpoint),
    staleTime: getStaleTime(endpoint),
    retry: (failureCount, error) => {
      // Only retry network errors, not 4xx/5xx responses
      if (error instanceof Error && error.message.includes('API error')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options
  });
}

/**
 * Prefetch data and add it to the cache
 */
export async function prefetchData(endpoint: string) {
  await queryClient.prefetchQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API error (${response.status})`);
      }
      return response.json();
    },
    staleTime: getStaleTime(endpoint)
  });
}

/**
 * Invalidate queries by endpoint pattern
 */
export function invalidateQueries(pattern: string) {
  return queryClient.invalidateQueries({ 
    predicate: (query) => {
      const queryKey = query.queryKey[0];
      return typeof queryKey === 'string' && queryKey.includes(pattern);
    }
  });
}