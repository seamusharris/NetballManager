import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import BatchScoreDisplay from '@/components/dashboard/BatchScoreDisplay';
import { TEAM_NAME } from '@/lib/settings';

export default function Dashboard() {
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<any[]>({
    queryKey: ['/api/players'],
  });

  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['/api/games'],
  });

  const { data: opponents = [], isLoading: isLoadingOpponents } = useQuery<any[]>({
    queryKey: ['/api/opponents'],
  });

  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingOpponents;

  return (
    <>
      <Helmet>
        <title>Dashboard | {TEAM_NAME} Stats Tracker</title>
        <meta name="description" content={`View ${TEAM_NAME} team's performance metrics, upcoming games, and player statistics`} />
      </Helmet>
      
      {/* BatchScoreDisplay doesn't render anything but efficiently loads and caches game scores */}
      {games && games.length > 0 && <BatchScoreDisplay games={games} />}
      
      <DashboardSummary 
        players={players || []} 
        games={games || []} 
        opponents={opponents || []} 
        isLoading={isLoading} 
      />
    </>
  );
}
