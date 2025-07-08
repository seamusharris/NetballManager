import { useLocation, useParams } from 'wouter';
import { useClub } from '@/contexts/ClubContext';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import BatchScoreDisplay from '@/components/dashboard/BatchScoreDisplay';
import { TEAM_NAME } from '@/lib/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import PlayerCombinationAnalysis from '@/components/dashboard/PlayerCombinationAnalysis';
import TeamPositionAnalysis from '@/components/dashboard/TeamPositionAnalysis';
import UpcomingGameRecommendations from '@/components/dashboard/UpcomingGameRecommendations';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { useEffect, useState, useMemo } from 'react';
import { useRequestMonitor } from '@/hooks/use-request-monitor';
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RecentGames } from '@/components/dashboard/RecentGames';
import { UpcomingGames } from '@/components/dashboard/UpcomingGames';
import TopPlayersWidget from '@/components/dashboard/TopPlayersWidget';
import TeamPerformance from '@/components/dashboard/TeamPerformance';
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget';
import { OpponentAnalysisWidget } from '@/components/dashboard/OpponentAnalysisWidget';
import PreviousGamesDisplay from '@/components/ui/previous-games-display';
import RecentGamesWidget from '@/components/ui/recent-games-widget';
import UpcomingGamesWidget from '@/components/ui/upcoming-games-widget';
import RecentFormWidget from '@/components/dashboard/RecentFormWidget';
import { cn } from '@/lib/utils';
import { cacheKeys } from '@/lib/cacheKeys';
import { AttackDefenseDisplay } from '@/components/ui/attack-defense-display';
import SeasonGamesDisplay from '@/components/ui/season-games-display';

export default function Dashboard() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { 
    currentClub, 
    currentClubId, 
    currentTeamId, 
    currentTeam,
    clubTeams, 
    setCurrentTeamId,
    isLoading: clubLoading 
  } = useClub();

  // Monitor request performance
  const requestMetrics = useRequestMonitor('Dashboard');

  // Handle teamId from URL parameter - always required now
  useEffect(() => {
    const teamIdFromUrl = params.teamId;
    if (teamIdFromUrl && !isNaN(Number(teamIdFromUrl))) {
      const targetTeamId = Number(teamIdFromUrl);
      // Check if the team exists in the current club
      const teamExists = clubTeams?.some(team => team.id === targetTeamId);
      if (teamExists && currentTeamId !== targetTeamId) {
        console.log(`Dashboard: Setting team ${targetTeamId} from URL`);
        setCurrentTeamId(targetTeamId);
      } else if (!teamExists && clubTeams.length > 0) {
        console.log(`Dashboard: Team ${targetTeamId} not found, redirecting to teams page`);
        // Team doesn't exist, redirect to teams page
        setLocation('/teams');
        return;
      }
    } else if (!teamIdFromUrl) {
      console.log('Dashboard: No team ID in URL, redirecting to teams page');
      // No team ID provided, redirecting to teams page
      setLocation('/teams');
      return;
    }
  }, [params.teamId, clubTeams, setLocation, currentTeamId, setCurrentTeamId]);

  // Debug team switching
  useEffect(() => {
    console.log('Dashboard: Team context updated:', {
      currentTeamId,
      currentTeamName: currentTeam?.name,
      clubTeamsCount: clubTeams.length
    });
  }, [currentTeamId, currentTeam, clubTeams]);

  // Players data using REST endpoint - Stage 4
  const { data: players = [], isLoading: isLoadingPlayers, error: playersError } = useQuery<any[]>({
    queryKey: ['players', currentClubId, 'rest'],
    queryFn: () => apiClient.get(`/api/clubs/${currentClubId}/players`),
    enabled: !!currentClubId && !!currentTeamId,
    staleTime: 15 * 60 * 1000, // 15 minutes cache for players - increased for better team switching
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection - increased
  });

  // Fetch games with team context - use team-specific endpoint to completely avoid cache pollution
  const { data: games = [], isLoading: isLoadingGames, error: gamesError } = useQuery<any[]>({
    queryKey: [`team-games-${currentTeamId}`, currentClubId, currentTeamId, Date.now()], // Force cache invalidation
    queryFn: async () => {
      console.log(`Dashboard: Fetching games via team-specific endpoint for team ${currentTeamId}`);
      if (!currentTeamId) {
        throw new Error('No team ID available for games query');
      }
      // Use team-specific endpoint to completely bypass club-wide cache
      const result = await apiClient.get(`/api/teams/${currentTeamId}/games`);
      console.log(`Dashboard: Received ${result?.length || 0} games for team ${currentTeamId}`);
      return result;
    },
    enabled: !!currentClubId && !!currentTeamId,
    staleTime: 0, // No cache for debugging
    gcTime: 0, // No cache for debugging
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Filter season games from main games data (same approach as Team Preparation)
  const seasonGames = useMemo(() => {
    if (!currentTeamId || !games.length) return [];
    return games.filter(game => 
      (game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId) &&
      game.statusIsCompleted
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [games, currentTeamId]);

  // Opponents system has been completely removed

  const { data: seasons = [], isLoading: isLoadingSeasons, error: seasonsError } = useQuery<any[]>({
    queryKey: ['seasons', currentClubId],
    queryFn: () => apiClient.get('/api/seasons'),
    enabled: !!currentClubId,
    staleTime: 60 * 60 * 1000, // 1 hour cache for seasons (rarely change) - increased
    gcTime: 2 * 60 * 60 * 1000, // 2 hours garbage collection - increased
  });

  const { data: activeSeason, isLoading: isLoadingActiveSeason, error: activeSeasonError } = useQuery<any>({
    queryKey: ['seasons', 'active', currentClubId],
    queryFn: () => apiClient.get('/api/seasons/active'),
    enabled: !!currentClubId,
    staleTime: 60 * 60 * 1000, // 1 hour cache for active season - increased
    gcTime: 2 * 60 * 60 * 1000, // 2 hours garbage collection - increased
  });

  // Centralized roster fetching for all games - optimized for team switching
  const gameIdsArray = games?.map(g => g.id).sort() || [];
  const gameIds = gameIdsArray.join(',');

  // Use unified data fetcher with proper team switching
  const { data: batchData, isLoading: isLoadingBatchData, error: batchDataError } = useQuery({
    queryKey: ['batch-data', currentClubId, currentTeamId, gameIds],
    queryFn: async () => {
      if (gameIdsArray.length === 0) return { stats: {}, rosters: {}, scores: {} };

      console.log(`Dashboard fetching batch data for ${gameIdsArray.length} games with team ${currentTeamId}:`, gameIdsArray);

      try {
        const { dataFetcher } = await import('@/lib/unifiedDataFetcher');
        const result = await dataFetcher.batchFetchGameData({
          gameIds: gameIdsArray,
          clubId: currentClubId!,
          teamId: currentTeamId ?? undefined,
          includeStats: true,
          includeRosters: true,
          includeScores: true
        });

        console.log('Dashboard batch data result for team', currentTeamId, ':', result);
        return result;
      } catch (error) {
        console.error('Dashboard batch data fetch error:', error);
        throw error;
      }
    },
    enabled: !!currentClubId && !!currentTeamId && gameIdsArray.length > 0 && !isLoadingGames,
    staleTime: 30 * 60 * 1000, // 30 minutes - invalidation handles updates  
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount to use cached data when possible
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: false, // Don't retry failed requests to prevent cache thrashing
    notifyOnChangeProps: ['data', 'error'], // Only notify on data/error changes, not loading states
  });

  const gameStatsMap = batchData?.stats || {};
  const gameRostersMap = batchData?.rosters || {};
  const gameScoresMap = batchData?.scores || {};
  const isLoadingStats = isLoadingBatchData;

  // Debug batch data
  useEffect(() => {
    if (batchData) {
      console.log('Dashboard received batch data:', {
        statsGames: Object.keys(batchData.stats || {}),
        rostersGames: Object.keys(batchData.rosters || {}),
        scoresGames: Object.keys(batchData.scores || {}),
        totalGames: gameIdsArray.length
      });
    }
    if (batchDataError) {
      console.error('Dashboard batch data error:', batchDataError);
    }
  }, [batchData, batchDataError, gameIdsArray.length]);

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

  // Team ID is now required from URL - if we get here without one, we've already redirected

  // Improved loading state - wait for both core data AND batch data for better UX
  const hasBasicData = players.length > 0 && games.length > 0;
  const hasBatchData = batchData && (Object.keys(batchData.stats || {}).length > 0 || gameIdsArray.length === 0);
  const isLoading = (isLoadingPlayers || isLoadingGames || isLoadingSeasons || isLoadingActiveSeason || isLoadingBatchData) && (!hasBasicData || !hasBatchData);

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container py-8 mx-auto space-y-8">
          {/* Clean Header */}
          <Card className="border-0 shadow-lg text-white" style={{backgroundColor: '#1e3a8a'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                    {currentClub?.name} {currentTeam?.name} Dashboard
                  </h1>
                  <p className="text-blue-100">
                    Performance metrics and insights for your team
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BatchScoreDisplay doesn't render anything but efficiently loads and caches game scores */}
          {games && Array.isArray(games) && games.length > 0 && <BatchScoreDisplay games={games} />}

          {/* Enhanced Content Grid with Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Overview
              </TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Recent Form
              </TabsTrigger>
              <TabsTrigger value="season" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Season
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid gap-8 lg:gap-10">
                {/* Upcoming Games Section */}
                <UpcomingGamesWidget
                  games={games || []}
                  teamId={currentTeamId}
                  clubId={currentClubId}
                  limit={5}
                  title="Upcoming Games"
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                  centralizedScores={gameScoresMap}
                  gameStats={gameStatsMap}
                  clubTeams={clubTeams || []}
                  showDate={true}
                  showRound={true}
                  showScore={false}
                />

                {/* Team Performance Metrics Dashboard with Enhanced Container */}
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                  <DashboardSummary 
                    players={players || []} 
                    games={games || []} 
                    seasons={seasons || []}
                    activeSeason={activeSeason}
                    isLoading={isLoading}
                    centralizedRosters={gameRostersMap}
                    centralizedStats={gameStatsMap}
                    centralizedScores={gameScoresMap}
                    isBatchDataLoading={isLoadingBatchData}
                    teams={clubTeams}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-8">
              {/* Recent Form Section */}
              <RecentFormWidget 
                games={games || []}
                currentTeamId={currentTeamId}
                currentClubId={currentClubId}
                gameScoresMap={gameScoresMap}
                gameStatsMap={gameStatsMap}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
              />
            </TabsContent>

            <TabsContent value="season" className="space-y-8">
              {/* Season Games Display */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg">
                <SeasonGamesDisplay
                  seasonGames={seasonGames || []}
                  currentTeamId={currentTeamId}
                  batchScores={gameScoresMap}
                  batchStats={gameStatsMap}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}