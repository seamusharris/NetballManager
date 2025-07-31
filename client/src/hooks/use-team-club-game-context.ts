import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function useTeamClubGameContext() {
  const [location] = useLocation();

  // Extract IDs from URL
  const teamMatch = location.match(/team\/(\d+)/);
  const gameMatch = location.match(/game\/(\d+)/);
  const teamId = teamMatch ? parseInt(teamMatch[1]) : null;
  const gameId = gameMatch ? parseInt(gameMatch[1]) : null;

  // Fetch team
  const { data: team, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamId ? apiClient.get(`/api/teams/${teamId}`) : null,
    enabled: !!teamId,
  });

  // Fetch club
  const { data: club, isLoading: isLoadingClub } = useQuery({
    queryKey: ['club', (team as any)?.clubId],
    queryFn: () => (team as any)?.clubId ? apiClient.get(`/api/clubs/${(team as any).clubId}`) : null,
    enabled: !!(team as any)?.clubId,
  });

  // Fetch game
  const { data: game, isLoading: isLoadingGame } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gameId ? apiClient.get(`/api/games/${gameId}`) : null,
    enabled: !!gameId,
  });

  return {
    team,
    club,
    game,
    isLoading: isLoadingTeam || isLoadingClub || isLoadingGame,
    teamId,
    gameId,
  };
} 