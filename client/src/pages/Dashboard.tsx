import { useLocation, useParams } from 'wouter';
import { useClub } from '@/contexts/ClubContext';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import BatchScoreDisplay from '@/components/dashboard/BatchScoreDisplay';
import { TEAM_NAME } from '@/lib/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { PlayerCombinationAnalysis } from '@/components/dashboard/PlayerCombinationAnalysis';
import { TeamPositionAnalysis } from '@/components/dashboard/TeamPositionAnalysis';
import { UpcomingGameRecommendations } from '@/components/dashboard/UpcomingGameRecommendations';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { useEffect } from 'react';

export default function Dashboard() {
  const params = useParams();
  const { 
    currentClub, 
    currentClubId, 
    currentTeamId, 
    clubTeams, 
    setCurrentTeamId,
    isLoading: clubLoading 
  } = useClub();

  // Handle teamId from URL parameter
  useEffect(() => {
    const teamIdFromUrl = params.teamId;
    if (teamIdFromUrl && !isNaN(Number(teamIdFromUrl))) {
      const targetTeamId = Number(teamIdFromUrl);
      // Check if the team exists in the current club
      const teamExists = clubTeams?.some(team => team.id === targetTeamId);
      if (teamExists && currentTeamId !== targetTeamId) {
        setCurrentTeamId(targetTeamId);
      }
    }
  }, [params.teamId, currentTeamId, setCurrentTeamId, clubTeams]);

  // Call ALL hooks first, before any conditional returns
  const { data: players = [], isLoading: isLoadingPlayers, error: playersError } = useQuery<any[]>({
    queryKey: ['players', currentClubId, currentTeamId],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClubId,
  });

  const { data: games = [], isLoading: isLoadingGames, error: gamesError } = useQuery<any[]>({
    queryKey: ['games', currentClubId, currentTeamId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId,
  });

  // Opponents system has been completely removed

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

  // Centralized roster fetching for all games
  const { data: centralizedRosters = {}, isLoading: isLoadingRosters } = useQuery({
    queryKey: ['centralizedRosters', currentClubId, games?.map(g => g.id).join(',')],
    queryFn: async () => {
      if (!games || games.length === 0) return {};

      console.log(`Dashboard centralizing roster fetch for ${games.length} games`);
      const rostersMap: Record<number, any[]> = {};

      // Fetch rosters for all games
      for (const game of games) {
        try {
          const roster = await apiClient.get(`/api/games/${game.id}/rosters`);
          rostersMap[game.id] = roster || [];
        } catch (error) {
          console.error(`Error fetching roster for game ${game.id}:`, error);
          rostersMap[game.id] = [];
        }
      }

      console.log(`Dashboard centralized roster fetch completed for ${Object.keys(rostersMap).length} games`);
      return rostersMap;
    },
    enabled: !!currentClubId && !!games && games.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

  // Centralized stats fetching for completed games only
  const completedGameIds = games?.filter(game => 
    game.statusIsCompleted && game.statusAllowsStatistics
  ).map(game => game.id) || [];

  const { data: centralizedStats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ['centralizedStats', currentClubId, completedGameIds.join(',')],
    queryFn: async () => {
      if (completedGameIds.length === 0) return {};

      console.log(`Dashboard centralizing stats fetch for ${completedGameIds.length} completed games`);
      const statsMap: Record<number, any[]> = {};

      // Fetch stats for completed games only
      for (const gameId of completedGameIds) {
        try {
          const stats = await apiClient.get(`/api/games/${gameId}/stats`);
          statsMap[gameId] = stats || [];
        } catch (error) {
          console.error(`Error fetching stats for game ${gameId}:`, error);
          statsMap[gameId] = [];
        }
      }

      console.log(`Dashboard centralized stats fetch completed for ${Object.keys(statsMap).length} games`);
      return statsMap;
    },
    enabled: !!currentClubId && completedGameIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

  // NOW we can do conditional returns after all hooks are called
  if (clubLoading || !currentClubId) {
    console.log('Dashboard waiting for club context:', { clubLoading, hasCurrentClub: !!currentClub, currentClubId });
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

  // For Team Dashboard, require team selection - show prompt if no team selected
  if (!currentTeamId && clubTeams.length > 1) {
    return (
      <>
        <Helmet>
          <title>Team Dashboard | {TEAM_NAME} Stats Tracker</title>
          <meta name="description" content={`View ${TEAM_NAME} team's performance metrics, upcoming games, and player statistics`} />
        </Helmet>

        <div className="container py-8 mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Team Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Performance metrics and insights for your team
              </p>
            </div>
            <div className="flex items-center gap-4">
              <TeamSwitcher mode="required" />
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Select a Team</h2>
              <p className="text-muted-foreground">Please select a team from the dropdown above to view the dashboard.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingSeasons || isLoadingActiveSeason || isLoadingRosters || isLoadingStats;

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
        <title>Team Dashboard | {TEAM_NAME} Stats Tracker</title>
        <meta name="description" content={`View ${TEAM_NAME} team's performance metrics, upcoming games, and player statistics`} />
      </Helmet>

      <div className="container py-8 mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Team Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Performance metrics and insights for your team
              {currentTeamId && clubTeams && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {clubTeams.find(team => team.id === currentTeamId)?.name || 'Selected Team'}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TeamSwitcher mode="required" />
          </div>
        </div>

      {/* BatchScoreDisplay doesn't render anything but efficiently loads and caches game scores */}
      {games && Array.isArray(games) && games.length > 0 && <BatchScoreDisplay games={games} />}

      <DashboardSummary 
          players={players || []} 
          games={games || []} 
          seasons={seasons || []}
          activeSeason={activeSeason}
          isLoading={isLoading}
          centralizedRosters={centralizedRosters}
          centralizedStats={centralizedStats}
        />
      </div>
    </>
  );
}