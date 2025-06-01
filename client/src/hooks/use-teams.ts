import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';

export interface Team {
  id: number;
  name: string;
  division?: string;
  clubId: number;
}

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => apiRequest('GET', '/api/teams') as Promise<Team[]>,
    staleTime: 5 * 60 * 1000,
  });
}