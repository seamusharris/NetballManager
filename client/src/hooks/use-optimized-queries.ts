import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

/**
 * Optimized query hooks with smart caching and prefetching
 * Reduces unnecessary API calls and improves user experience
 */

// Cache time constants
const CACHE_TIMES = {
  SHORT: 2 * 60 * 1000,    // 2 minutes
  MEDIUM: 10 * 60 * 1000,  // 10 minutes
  LONG: 30 * 60 * 1000,    // 30 minutes
  STATIC: 60 * 60 * 1000,  // 1 hour
} as const;

/**
 * Optimized hook for fetching club data with smart caching
 */
export const useOptimizedClub = (clubId: number) => {
  return useQuery({
    queryKey: ['club', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}`),
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Optimized hook for fetching teams with prefetching
 */
export const useOptimizedTeams = (clubId: number) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['teams', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}/teams`),
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Prefetch team details when teams are loaded
  if (query.data && Array.isArray(query.data)) {
    query.data.forEach((team: { id: number }) => {
      queryClient.prefetchQuery({
        queryKey: ['team', team.id],
        queryFn: () => apiClient.get(`/api/teams/${team.id}`),
        staleTime: CACHE_TIMES.MEDIUM,
      });
    });
  }

  return query;
};

/**
 * Optimized hook for fetching games with batch loading
 */
export const useOptimizedGames = (clubId: number, seasonId?: number) => {
  const queryKey = seasonId ? ['games', clubId, seasonId] : ['games', clubId];
  
  return useQuery({
    queryKey,
    queryFn: () => apiClient.get(`/api/clubs/${clubId}/games${seasonId ? `?seasonId=${seasonId}` : ''}`),
    staleTime: CACHE_TIMES.SHORT,
    gcTime: CACHE_TIMES.MEDIUM,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Optimized hook for fetching team-specific games
 */
export const useOptimizedTeamGames = (clubId: number | null, teamId: number | null) => {
  return useQuery<any[]>({
    queryKey: ['team-games', clubId, teamId],
    queryFn: () => apiClient.get(`/api/teams/${teamId}/games`),
    staleTime: CACHE_TIMES.SHORT,
    gcTime: CACHE_TIMES.MEDIUM,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!clubId && !!teamId,
  });
};

/**
 * Optimized hook for fetching game statistics with smart invalidation
 */
export const useOptimizedGameStats = (gameId: number) => {
  return useQuery({
    queryKey: ['game-stats', gameId],
    queryFn: () => apiClient.get(`/api/games/${gameId}/stats`),
    staleTime: CACHE_TIMES.SHORT,
    gcTime: CACHE_TIMES.MEDIUM,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Optimized hook for fetching player data with minimal refetching
 */
export const useOptimizedPlayers = (clubId: number | null) => {
  return useQuery<any[]>({
    queryKey: ['players', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}/players`),
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!clubId,
  });
};

/**
 * Optimized hook for fetching seasons (static data)
 */
export const useOptimizedSeasons = () => {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: () => apiClient.get('/api/seasons'),
    staleTime: CACHE_TIMES.STATIC,
    gcTime: CACHE_TIMES.STATIC,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Optimized hook for fetching game statuses (static data)
 */
export const useOptimizedGameStatuses = () => {
  return useQuery({
    queryKey: ['game-statuses'],
    queryFn: () => apiClient.get('/api/game-statuses'),
    staleTime: CACHE_TIMES.STATIC,
    gcTime: CACHE_TIMES.STATIC,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Batch prefetching utility for dashboard data
 */
export const usePrefetchDashboardData = (clubId: number) => {
  const queryClient = useQueryClient();
  
  return {
    prefetchAll: async () => {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['club', clubId],
          queryFn: () => apiClient.get(`/api/clubs/${clubId}`),
          staleTime: CACHE_TIMES.MEDIUM,
        }),
        queryClient.prefetchQuery({
          queryKey: ['teams', clubId],
          queryFn: () => apiClient.get(`/api/clubs/${clubId}/teams`),
          staleTime: CACHE_TIMES.MEDIUM,
        }),
        queryClient.prefetchQuery({
          queryKey: ['games', clubId],
          queryFn: () => apiClient.get(`/api/clubs/${clubId}/games`),
          staleTime: CACHE_TIMES.SHORT,
        }),
        queryClient.prefetchQuery({
          queryKey: ['players', clubId],
          queryFn: () => apiClient.get(`/api/clubs/${clubId}/players`),
          staleTime: CACHE_TIMES.MEDIUM,
        }),
      ]);
    },
  };
};