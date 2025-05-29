
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { Team } from '@shared/schema';

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => apiRequest('GET', '/api/teams') as Promise<Team[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTeamsByClub(clubId?: number) {
  return useQuery<Team[]>({
    queryKey: ['teams', 'club', clubId],
    queryFn: () => apiRequest('GET', `/api/clubs/${clubId}/teams`) as Promise<Team[]>,
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeamsBySeason(seasonId?: number) {
  return useQuery<Team[]>({
    queryKey: ['teams', 'season', seasonId],
    queryFn: () => apiRequest('GET', `/api/teams?seasonId=${seasonId}`) as Promise<Team[]>,
    enabled: !!seasonId,
    staleTime: 5 * 60 * 1000,
  });
}
