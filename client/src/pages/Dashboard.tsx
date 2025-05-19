import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import DashboardSummary from '@/components/dashboard/DashboardSummary';

export default function Dashboard() {
  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['/api/players'],
  });

  const { data: games, isLoading: isLoadingGames } = useQuery({
    queryKey: ['/api/games'],
  });

  const { data: opponents, isLoading: isLoadingOpponents } = useQuery({
    queryKey: ['/api/opponents'],
  });

  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingOpponents;

  return (
    <>
      <Helmet>
        <title>Dashboard | NetballManager</title>
        <meta name="description" content="View your netball team's performance metrics, upcoming games, and player statistics" />
      </Helmet>
      
      <DashboardSummary 
        players={players || []} 
        games={games || []} 
        opponents={opponents || []} 
        isLoading={isLoading} 
      />
    </>
  );
}
