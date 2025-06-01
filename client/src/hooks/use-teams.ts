import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Team {
  id: number;
  name: string;
  division?: string;
  clubId: number;
}

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => apiClient.get('/api/teams') as Promise<Team[]>,
  });
}

export function useTeamsByClub(clubId?: number) {
  return useQuery<Team[]>({
    queryKey: ['teams', 'club', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}/teams`) as Promise<Team[]>,
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeamsBySeason(seasonId?: number) {
  return useQuery<Team[]>({
    queryKey: ['teams', 'season', seasonId],
    queryFn: () => apiClient.get(`/api/teams?seasonId=${seasonId}`) as Promise<Team[]>,
    enabled: !!seasonId,
    staleTime: 5 * 60 * 1000,
  });
}