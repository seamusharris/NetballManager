import { useQuery } from '@tanstack/react-query';
import { SimplifiedGamesFetcher, type SimpleGame } from '@/lib/simplifiedGamesFetcher';

export function useSimplifiedGames(clubId: number, teamId?: number) {
  return useQuery<SimpleGame[]>({
    queryKey: ['simplified-games', clubId, teamId],
    queryFn: () => SimplifiedGamesFetcher.fetchGamesForClub(clubId, teamId),
    enabled: !!clubId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}