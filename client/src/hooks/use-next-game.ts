import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useTeamContext } from './use-team-context';

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
  // Use standardized team context utility
  const { teamId } = useTeamContext();

  return useQuery({
    queryKey: ['next-game', teamId],
    queryFn: async (): Promise<Game | null> => {
      if (!teamId) return null;

      // Use team-specific endpoint for better filtering and perspective
      const games = await apiClient.get<Game[]>(`/api/teams/${teamId}/games`);

      // Filter for upcoming games (games endpoint already filters for team)
      const upcomingGames = games
        .filter(game => {
          const isCompleted = game.statusIsCompleted === true;
          const gameDate = new Date(game.date);

          // Include games that are not completed and are today or in the future
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset to start of day for comparison
          
          const isUpcoming = !isCompleted && !game.isBye && gameDate >= today;
          

          
          return isUpcoming;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


      return upcomingGames[0] || null;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}