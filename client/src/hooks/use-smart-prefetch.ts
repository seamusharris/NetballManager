
import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { dataFetcher } from '@/lib/unifiedDataFetcher';

interface PrefetchOptions {
  prefetchStats?: boolean;
  prefetchRosters?: boolean;
  prefetchScores?: boolean;
  delay?: number;
}

export function useSmartPrefetch(gameIds: number[], options: PrefetchOptions = {}) {
  const { currentClubId, currentTeamId } = useClub();
  const queryClient = useQueryClient();
  
  const {
    prefetchStats = true,
    prefetchRosters = true,
    prefetchScores = false,
    delay = 100
  } = options;

  const prefetchData = useCallback(async () => {
    if (!currentClubId || gameIds.length === 0) return;

    // Check if data is already cached
    const hasStats = gameIds.every(gameId => 
      queryClient.getQueryData(['game-stats', gameId])
    );
    
    const hasRosters = gameIds.every(gameId => 
      queryClient.getQueryData(['game-rosters', gameId])
    );

    // Only prefetch if we don't have the data
    if ((prefetchStats && !hasStats) || (prefetchRosters && !hasRosters)) {
      try {
        await dataFetcher.prefetchRelatedData(gameIds, currentClubId, currentTeamId);
      } catch (error) {
        console.warn('Smart prefetch failed:', error);
      }
    }
  }, [currentClubId, currentTeamId, gameIds, prefetchStats, prefetchRosters, queryClient]);

  useEffect(() => {
    const timer = setTimeout(prefetchData, delay);
    return () => clearTimeout(timer);
  }, [prefetchData, delay]);

  return { prefetchData };
}

// Hook for prefetching on hover/focus
export function usePrefetchOnInteraction() {
  const queryClient = useQueryClient();

  const prefetchOnHover = useCallback(async (gameId: number) => {
    // Prefetch game details when user hovers over game card
    queryClient.prefetchQuery({
      queryKey: ['games', gameId],
      queryFn: () => fetch(`/api/games/${gameId}`).then(res => res.json()),
      staleTime: 5 * 60 * 1000
    });
  }, [queryClient]);

  const prefetchOnFocus = useCallback(async (gameIds: number[]) => {
    // Prefetch batch data when user focuses on a section
    if (gameIds.length > 0) {
      const { dataFetcher } = await import('@/lib/unifiedDataFetcher');
      dataFetcher.prefetchRelatedData(gameIds, 0).catch(console.warn);
    }
  }, []);

  return { prefetchOnHover, prefetchOnFocus };
}
