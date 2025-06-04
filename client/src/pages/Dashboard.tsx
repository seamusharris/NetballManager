import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import BatchScoreDisplay from '@/components/dashboard/BatchScoreDisplay';
import { TEAM_NAME } from '@/lib/settings';
import { useClub } from '@/contexts/ClubContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function Dashboard() {
  const { currentClub, isLoading: clubLoading } = useClub();

  const currentClubId = currentClub?.id;

  // Call ALL hooks first, before any conditional returns
  const { data: players = [], isLoading: isLoadingPlayers, error: playersError } = useQuery<any[]>({
    queryKey: ['players', currentClubId],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClubId,
  });

  const { data: games = [], isLoading: isLoadingGames, error: gamesError } = useQuery<any[]>({
    queryKey: ['games', currentClubId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId,
  });

  // Opponents system has been archived/migrated to teams
  const opponents: any[] = [];
  const isLoadingOpponents = false;
  const opponentsError = null;

  const { data: seasons = [], isLoading: isLoadingSeasons, error: seasonsError } = useQuery<any[]>({
    queryKey: ['/api/seasons', currentClubId],
    queryFn: () => apiClient.get('/api/seasons'),
    enabled: !!currentClubId,
  });

  const { data: activeSeason, isLoading: isLoadingActiveSeason, error: activeSeasonError } = useQuery<any>({
    queryKey: ['/api/seasons/active', currentClubId],
    queryFn: () => apiClient.get('/api/seasons/active'),
    enabled: !!currentClubId,
  });

  // NOW we can do conditional returns after all hooks are called
  if (clubLoading || !currentClub || !currentClubId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
          {!currentClubId && <p className="text-xs text-muted-foreground">Initializing club context...</p>}
        </div>
      </div>
    );
  }

  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingOpponents || isLoadingSeasons || isLoadingActiveSeason;

  // Show error state if any query fails
  if (playersError || gamesError || seasonsError || activeSeasonError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
        <div className="space-y-2 text-red-500">
          {playersError && <p>Players error: {String(playersError)}</p>}
          {gamesError && <p>Games error: {String(gamesError)}</p>}
          {seasonsError && <p>Seasons error: {String(seasonsError)}</p>}
          {activeSeasonError && <p>Active season error: {String(activeSeasonError)}</p>}
        </div>
      </div>
    );
  }

  // Show loading state only if any query is still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we load your team data...</p>
        </div>
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