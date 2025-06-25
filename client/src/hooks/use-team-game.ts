
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useParams } from 'wouter';

interface TeamGameResult {
  id: number;
  date: string;
  time: string;
  homeTeamId: number;
  awayTeamId: number;
  teamPerspective: 'home' | 'away';
  ourTeamId: number;
  opponentTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  statusIsCompleted: boolean;
  isBye?: boolean;
}

export function useTeamGame(gameId: number) {
  

  return useQuery({
    queryKey: ['teams', currentTeamId, 'games', gameId],
    queryFn: async (): Promise<TeamGameResult | null> => {
      if (!currentTeamId || !gameId) return null;

      try {
        return await apiClient.get<TeamGameResult>(`/api/teams/${currentTeamId}/games/${gameId}`);
      } catch (error) {
        // Fallback to regular game endpoint if team-specific fails
        console.warn(`Team-specific game endpoint failed for team ${currentTeamId}, game ${gameId}:`, error);
        return await apiClient.get<TeamGameResult>(`/api/games/${gameId}`);
      }
    },
    enabled: !!currentTeamId && !!gameId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useTeamGames() {
  

  return useQuery({
    queryKey: ['teams', currentTeamId, 'games'],
    queryFn: async (): Promise<TeamGameResult[]> => {
      if (!currentTeamId) return [];

      return await apiClient.get<TeamGameResult[]>(`/api/teams/${currentTeamId}/games`);
    },
    enabled: !!currentTeamId,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });
}
