import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useParams } from 'wouter';

interface Game {
  id: number;
  date: string;
  time: string;
  homeTeamId: number;
  awayTeamId: number;
  statusIsCompleted: boolean;
  isBye?: boolean;
}

export function useNextGame() {
  const params = useParams<{ clubId?: string; teamId?: string }>();
  const clubId = params.clubId ? Number(params.clubId) : null;
  const currentTeamId = params.teamId ? Number(params.teamId) : null;

  return useQuery({
    queryKey: ['next-game', currentTeamId],
    queryFn: async (): Promise<Game | null> => {
      if (!currentTeamId) return null;

      // Use team-specific endpoint for better filtering and perspective
      const games = await apiClient.get<Game[]>(`/api/teams/${currentTeamId}/games`);

      // Filter for upcoming games (games endpoint already filters for team)
      const upcomingGames = games
        .filter(game => {
          const isCompleted = game.statusIsCompleted === true;
          const gameDate = new Date(game.date);
          const now = new Date();

          // Include games that are not completed and are today or in the future
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset to start of day for comparison
          return !isCompleted && !game.isBye && gameDate >= today;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log('Next game hook - filtered upcoming games:', upcomingGames.map(g => `${g.id}: ${g.date} ${g.homeTeamName} vs ${g.awayTeamName}`));
      return upcomingGames[0] || null;
    },
    enabled: !!currentTeamId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}