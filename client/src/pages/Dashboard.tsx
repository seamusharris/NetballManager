import { useLocation, useParams } from "wouter";
import { useClub } from "@/contexts/ClubContext";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import BatchScoreDisplay from "@/components/dashboard/BatchScoreDisplay";
import { TEAM_NAME } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import PlayerCombinationAnalysis from "@/components/dashboard/PlayerCombinationAnalysis";
import TeamPositionAnalysis from "@/components/dashboard/TeamPositionAnalysis";
import UpcomingGameRecommendations from "@/components/dashboard/UpcomingGameRecommendations";
import { TeamSwitcher } from "@/components/layout/TeamSwitcher";
import { useEffect, useState, useMemo } from "react";
import { useRequestMonitor } from "@/hooks/use-request-monitor";
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor";
import { useOptimizedTeams, useOptimizedTeamGames, useOptimizedPlayers, useOptimizedSeasons } from "@/hooks/use-optimized-queries";
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import TeamPerformance from "@/components/dashboard/TeamPerformance";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { OpponentAnalysisWidget } from "@/components/dashboard/OpponentAnalysisWidget";
import UnifiedGamesList from "@/components/ui/unified-games-list";
import QuarterPerformanceWidget from "@/components/dashboard/QuarterPerformanceWidget";
import AttackDefenseDisplay from "@/components/ui/attack-defense-display";
import { calculatePositionAverages } from "@/lib/positionStatsCalculator";
import { cn } from "@/lib/utils";
import { DynamicBreadcrumbs } from "@/components/layout/DynamicBreadcrumbs";

export default function Dashboard() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { currentClub, currentClubId, currentTeamId, currentTeam, clubTeams, setCurrentTeamId, isLoading: clubLoading } = useClub();

  // Performance monitoring
  const performanceMetrics = usePerformanceMonitor("Dashboard", {
    trackApiCalls: true,
    trackRenderTime: true,
    logToConsole: true,
  });

  // Monitor request performance
  const requestMetrics = useRequestMonitor("Dashboard");

  // Handle teamId from URL parameter - always required now
  useEffect(() => {
    const teamIdFromUrl = params.teamId;
    if (teamIdFromUrl && !isNaN(Number(teamIdFromUrl))) {
      const targetTeamId = Number(teamIdFromUrl);
      // Check if the team exists in the current club
      const teamExists = clubTeams?.some((team) => team.id === targetTeamId);
      if (teamExists && currentTeamId !== targetTeamId) {
        console.log(`Dashboard: Setting team ${targetTeamId} from URL`);
        setCurrentTeamId(targetTeamId);
      } else if (!teamExists && clubTeams.length > 0) {
        console.log(`Dashboard: Team ${targetTeamId} not found, redirecting to teams page`);
        // Team doesn't exist, redirect to teams page
        setLocation("/teams");
        return;
      }
    } else if (!teamIdFromUrl) {
      console.log("Dashboard: No team ID in URL, redirecting to teams page");
      // No team ID provided, redirecting to teams page
      setLocation("/teams");
      return;
    }
  }, [params.teamId, clubTeams, setLocation, currentTeamId, setCurrentTeamId]);

  // Debug team switching
  useEffect(() => {
    console.log("Dashboard: Team context updated:", {
      currentTeamId,
      currentTeamName: currentTeam?.name,
      clubTeamsCount: clubTeams.length,
    });
  }, [currentTeamId, currentTeam, clubTeams]);

  // Players data using optimized hook
  const { data: players = [], isLoading: isLoadingPlayers, error: playersError } = useOptimizedPlayers(currentClubId);

  // Fetch games with team context using optimized hook
  const { data: games = [], isLoading: isLoadingGames, error: gamesError } = useOptimizedTeamGames(currentClubId, currentTeamId);

  // Filter season games from main games data (same approach as Team Preparation)
  const seasonGames = useMemo(() => {
    if (!currentTeamId || !Array.isArray(games) || games.length === 0) return [];
    return (games as any[]).filter((game) => (game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId) && game.statusIsCompleted).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [games, currentTeamId]);

  // Opponents system has been completely removed

  // Seasons data using optimized hook
  const { data: seasons = [], isLoading: isLoadingSeasons, error: seasonsError } = useOptimizedSeasons();

  // Active season - keep this as a separate query since it's specific
  const {
    data: activeSeason,
    isLoading: isLoadingActiveSeason,
    error: activeSeasonError,
  } = useQuery<any>({
    queryKey: ["seasons", "active"],
    queryFn: () => apiClient.get("/api/seasons/active"),
    staleTime: 60 * 60 * 1000, // 1 hour cache for active season
    gcTime: 2 * 60 * 60 * 1000, // 2 hours garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Centralized roster fetching for all games - optimized for team switching
  const EMPTY_ARRAY = useMemo(() => [] as any[], []);
  const EMPTY_OBJECT = useMemo(() => ({}), []);
  const gameIdsArray = useMemo(() => games?.map((g) => g.id).sort() || EMPTY_ARRAY, [games]);
  const gameIds = gameIdsArray.join(",");

  // Use unified data fetcher with proper team switching
  const {
    data: batchData,
    isLoading: isLoadingBatchData,
    error: batchDataError,
  } = useQuery({
    queryKey: ["batch-data", currentClubId, currentTeamId, gameIds],
    queryFn: async () => {
      if (gameIdsArray.length === 0) return { stats: {}, rosters: {}, scores: {} };

      console.log(`Dashboard fetching batch data for ${gameIdsArray.length} games with team ${currentTeamId}:`, gameIdsArray);

      try {
        const { dataFetcher } = await import("@/lib/unifiedDataFetcher");
        const result = await dataFetcher.batchFetchGameData({
          gameIds: gameIdsArray,
          clubId: currentClubId!,
          teamId: currentTeamId ?? undefined,
          includeStats: true,
          includeRosters: true,
          includeScores: true,
        });

        console.log("Dashboard batch data result for team", currentTeamId, ":", result);
        return result;
      } catch (error) {
        console.error("Dashboard batch data fetch error:", error);
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
    notifyOnChangeProps: ["data", "error"], // Only notify on data/error changes, not loading states
  });

  // Use stable empty objects to prevent unnecessary re-renders - FIX THE || {} PATTERNS
  const gameStatsMap = useMemo(() => {
    if (!batchData) return EMPTY_OBJECT;
    return batchData.stats || EMPTY_OBJECT; // Use stable EMPTY_OBJECT instead of {}
  }, [batchData, EMPTY_OBJECT]);
  
  const gameRostersMap = useMemo(() => {
    if (!batchData) return EMPTY_OBJECT;
    return batchData.rosters || EMPTY_OBJECT; // Use stable EMPTY_OBJECT instead of {}
  }, [batchData, EMPTY_OBJECT]);
  
  const gameScoresMap = useMemo(() => {
    if (!batchData) return EMPTY_OBJECT;
    return batchData.scores || EMPTY_OBJECT; // Use stable EMPTY_OBJECT instead of {}
  }, [batchData, EMPTY_OBJECT]);
  
  const isLoadingStats = isLoadingBatchData;

  // Debug batch data
  useEffect(() => {
    if (gameStatsMap) {
      console.log("Dashboard received batch stats:", {
        statsGames: Object.keys(gameStatsMap),
        totalGames: gameIdsArray.length,
      });
    }
  }, [gameStatsMap, gameIdsArray.length]);

  // NOW we can do conditional returns after all hooks are called
  if (clubLoading || !currentClubId) {
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
  const hasBatchData = gameStatsMap && (Object.keys(gameStatsMap).length > 0 || gameIdsArray.length === 0);
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
          {/* Breadcrumbs */}
          <DynamicBreadcrumbs />

          {/* Clean Header */}
          <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: "#1e3a8a" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                    {currentClub?.name} {currentTeam?.name} Dashboard
                  </h1>
                  <p className="text-blue-100">Performance metrics and insights for your team</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BatchScoreDisplay doesn't render anything but efficiently loads and caches game scores */}
          {games && Array.isArray(games) && games.length > 0 && <BatchScoreDisplay games={games} />}

          {/* Enhanced Content Grid with Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Overview
              </TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Recent Form
              </TabsTrigger>
              <TabsTrigger value="opponent" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Opponent Form
              </TabsTrigger>
              <TabsTrigger value="season" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Season Form
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid gap-8 lg:gap-10">
                {/* Two-column layout for Upcoming and Recent Games */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Games - Left Column */}
                  <PreviousGamesDisplay
                    historicalGames={games?.filter(game => !game.statusIsCompleted).slice(0, 5) || []}
                    currentTeamId={currentTeamId ?? 0}
                    currentClubId={currentClubId ?? 0}
                    batchScores={gameScoresMap}
                    batchStats={gameStatsMap}
                    title="Upcoming Games"
                    maxGames={5}
                    compact={true}
                    showAnalytics={false}
                    showQuarterScores={false}
                    className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                  />

                  {/* Recent Games - Right Column */}
                  <PreviousGamesDisplay
                    historicalGames={games?.filter(game => game.statusIsCompleted).slice(0, 5) || []}
                    currentTeamId={currentTeamId ?? 0}
                    currentClubId={currentClubId ?? 0}
                    batchScores={gameScoresMap}
                    batchStats={gameStatsMap}
                    title="Recent Games"
                    maxGames={5}
                    compact={true}
                    showAnalytics={false}
                    showQuarterScores={false}
                    showViewMore={true}
                    viewMoreHref={`/team/${currentTeamId}/games?status=completed`}
                    className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {/* Team Performance Metrics Dashboard with Enhanced Container */}
                <DashboardSummary players={players} games={games} seasons={seasons} activeSeason={activeSeason} isLoading={isLoading} centralizedRosters={gameRostersMap} centralizedStats={gameStatsMap} centralizedScores={gameScoresMap} isBatchDataLoading={isLoadingBatchData} teams={clubTeams} />
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-8">
              {/* Recent Form Section */}
              <div className="space-y-6">
                <PreviousGamesDisplay
                  historicalGames={games?.filter(game => game.statusIsCompleted).slice(0, 10) || []}
                  currentTeamId={currentTeamId ?? 0}
                  currentClubId={currentClubId ?? 0}
                  batchScores={gameScoresMap}
                  batchStats={gameStatsMap}
                  title="Recent Form"
                  maxGames={10}
                  compact={false}
                  showAnalytics={false}
                  showQuarterScores={true}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                />
                
                {/* Add stabilizing analytics like GamePreparation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <QuarterPerformanceWidget
                    games={games?.filter(game => game.statusIsCompleted).slice(0, 10) || []}
                    currentTeamId={currentTeamId}
                    gameStatsMap={gameStatsMap}
                    gameScoresMap={gameScoresMap}
                    title="Recent Quarter Performance"
                  />
                  {(() => {
                    const recentGames = games?.filter(game => game.statusIsCompleted).slice(0, 10) || [];
                    const positionAverages = calculatePositionAverages(recentGames, gameStatsMap, currentTeamId);
                    return (
                      <AttackDefenseDisplay
                        averages={positionAverages}
                        label="Recent Attack vs Defense"
                      />
                    );
                  })()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="opponent" className="space-y-8">
              {/* Opponent Form Section */}
              <div className="space-y-6">
                <PreviousGamesDisplay
                  historicalGames={games?.filter(game => game.statusIsCompleted).slice(0, 10) || []}
                  currentTeamId={currentTeamId ?? 0}
                  currentClubId={currentClubId ?? 0}
                  batchScores={gameScoresMap}
                  batchStats={gameStatsMap}
                  title="Opponent Form"
                  maxGames={10}
                  compact={false}
                  showAnalytics={false}
                  showQuarterScores={true}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                />
                
                {/* Add stabilizing analytics like GamePreparation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <QuarterPerformanceWidget
                    games={games?.filter(game => game.statusIsCompleted).slice(0, 10) || []}
                    currentTeamId={currentTeamId}
                    gameStatsMap={gameStatsMap}
                    gameScoresMap={gameScoresMap}
                    title="Opponent Quarter Performance"
                  />
                  {(() => {
                    const opponentGames = games?.filter(game => game.statusIsCompleted).slice(0, 10) || [];
                    const positionAverages = calculatePositionAverages(opponentGames, gameStatsMap, currentTeamId);
                    return (
                      <AttackDefenseDisplay
                        averages={positionAverages}
                        label="Opponent Attack vs Defense"
                      />
                    );
                  })()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="season" className="space-y-8">
              {/* Season Games Display */}
              <div className="space-y-6">
                <PreviousGamesDisplay
                  historicalGames={seasonGames || []}
                  currentTeamId={currentTeamId ?? 0}
                  currentClubId={currentClubId ?? 0}
                  batchScores={gameScoresMap}
                  batchStats={gameStatsMap}
                  title={`Season Form - ${activeSeason?.name || "Current Season"}`}
                  compact={false}
                  showAnalytics={false}
                  showQuarterScores={true}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                />
                
                {/* Add stabilizing analytics like GamePreparation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <QuarterPerformanceWidget
                    games={seasonGames || []}
                    currentTeamId={currentTeamId}
                    gameStatsMap={gameStatsMap}
                    gameScoresMap={gameScoresMap}
                    title="Season Quarter Performance"
                  />
                  {(() => {
                    const positionAverages = calculatePositionAverages(seasonGames || [], gameStatsMap, currentTeamId);
                    return (
                      <AttackDefenseDisplay
                        averages={positionAverages}
                        label="Season Attack vs Defense"
                      />
                    );
                  })()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
