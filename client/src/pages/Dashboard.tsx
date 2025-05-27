import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import BatchScoreDisplay from '@/components/dashboard/BatchScoreDisplay';
import { TEAM_NAME } from '@/lib/settings';

export default function Dashboard() {
  const { data: players = [], isLoading: isLoadingPlayers, error: playersError } = useQuery<any[]>({
    queryKey: ['/api/players'],
  });

  const { data: games = [], isLoading: isLoadingGames, error: gamesError } = useQuery<any[]>({
    queryKey: ['/api/games'],
  });

  const { data: opponents = [], isLoading: isLoadingOpponents, error: opponentsError } = useQuery<any[]>({
    queryKey: ['/api/opponents'],
  });
  
  // Fetch all seasons
  const { data: seasons = [], isLoading: isLoadingSeasons, error: seasonsError } = useQuery<any[]>({
    queryKey: ['/api/seasons'],
  });
  
  // Fetch active season
  const { data: activeSeason, isLoading: isLoadingActiveSeason, error: activeSeasonError } = useQuery<any>({
    queryKey: ['/api/seasons/active'],
  });

  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingOpponents || isLoadingSeasons || isLoadingActiveSeason;

  // Debug logging
  console.log('Dashboard render:', {
    isLoading,
    playersCount: players?.length,
    gamesCount: games?.length,
    opponentsCount: opponents?.length,
    seasonsCount: seasons?.length,
    activeSeason,
    errors: { playersError, gamesError, opponentsError, seasonsError, activeSeasonError }
  });

  // Show error state if any query fails
  if (playersError || gamesError || opponentsError || seasonsError || activeSeasonError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
        <div className="space-y-2 text-red-500">
          {playersError && <p>Players error: {String(playersError)}</p>}
          {gamesError && <p>Games error: {String(gamesError)}</p>}
          {opponentsError && <p>Opponents error: {String(opponentsError)}</p>}
          {seasonsError && <p>Seasons error: {String(seasonsError)}</p>}
          {activeSeasonError && <p>Active season error: {String(activeSeasonError)}</p>}
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Loading Dashboard...</h1>
        <p>Please wait while we load your data...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | {TEAM_NAME} Stats Tracker</title>
        <meta name="description" content={`View ${TEAM_NAME} team's performance metrics, upcoming games, and player statistics`} />
      </Helmet>
      
      {/* BatchScoreDisplay doesn't render anything but efficiently loads and caches game scores */}
      {games && Array.isArray(games) && games.length > 0 && <BatchScoreDisplay games={games} />}
      
      <DashboardSummary 
        players={players || []} 
        games={games || []} 
        opponents={opponents || []} 
        seasons={seasons || []}
        activeSeason={activeSeason}
        isLoading={isLoading} 
      />
    </>
  );
}
