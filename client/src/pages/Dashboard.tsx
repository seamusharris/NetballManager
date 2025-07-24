import { useLocation, useParams } from "wouter";
import { useClub } from "@/contexts/ClubContext";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { TEAM_NAME } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import SimplifiedGamesList from "@/components/ui/simplified-games-list";
import { useSimplifiedGames } from "@/hooks/use-simplified-games";
import { DynamicBreadcrumbs } from "@/components/layout/DynamicBreadcrumbs";
import { CompactAttackDefenseWidget } from "@/components/ui/compact-attack-defense-widget";
import QuarterPerformanceAnalysisWidget from "@/components/ui/quarter-performance-analysis-widget";
import { SeasonStatsWidget } from "@/components/ui/season-stats-widget";
import { StatsDebugTable } from "@/components/ui/stats-debug-table";
import { useBatchGameStatistics } from "@/components/statistics/hooks/useBatchGameStatistics";
import { useNextGame } from '@/hooks/use-next-game';
import { processUnifiedGameData, calculateUnifiedQuarterByQuarterStats } from '@/lib/positionStatsCalculator';
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils";
import { apiClient } from '@/lib/apiClient';

export default function Dashboard() {
  const params = useParams<{ teamId?: string }>();
  const { currentClub, currentClubId, isLoading: clubLoading } = useClub();
  
  // Simple: get teamId directly from URL like GamePreparation page
  const teamIdFromUrl = params.teamId ? parseInt(params.teamId) : undefined;

  // Get all games for the current team using team API
  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['teams', teamIdFromUrl, 'games'],
    queryFn: () => apiClient.get(`/api/teams/${teamIdFromUrl}/games`),
    enabled: !!teamIdFromUrl,
  });

  // Get next upcoming game
  const { data: nextGame } = useNextGame();

  // Get upcoming opponent from next game
  const upcomingOpponent = useMemo(() => {
    if (!nextGame) return null;
    const isHomeTeam = teamIdFromUrl === nextGame.homeTeamId;
    return {
      id: isHomeTeam ? nextGame.awayTeamId : nextGame.homeTeamId
    };
  }, [nextGame, teamIdFromUrl]);

  // Debug the raw games data
  console.log('🔍 Raw games data debug:');
  console.log('🔍 teamIdFromUrl:', teamIdFromUrl);
  console.log('🔍 currentClub?.id:', currentClub?.id);
  console.log('🔍 isLoadingGames:', isLoadingGames);
  console.log('🔍 Total games fetched:', games.length);
  console.log('🔍 Sample game:', games[0]);
  console.log('🔍 All games:', games.map(g => ({ id: g.id, statusIsCompleted: g.statusIsCompleted, hasStats: g.hasStats, statusAllowsStatistics: g.statusAllowsStatistics })));
  
  // Debug the filtering
  console.log('🔍 Filtering debug:');
  console.log('🔍 Games with statusIsCompleted=true:', games.filter(g => g.statusIsCompleted === true).length);
  console.log('🔍 Games with statusAllowsStatistics=true:', games.filter(g => g.statusAllowsStatistics === true).length);
  console.log('🔍 Games with both conditions:', games.filter(g => g.statusIsCompleted === true && g.statusAllowsStatistics === true).length);

  // Filter to completed games that allow statistics (for quarter performance analysis)
  const completedGamesWithStatisticsEnabled = useMemo(() => {
    const filtered = games.filter(game => 
      game.statusIsCompleted === true && 
      game.statusAllowsStatistics === true
    ).map(game => ({
      ...game,
      status: 'completed' // Add the status field that the calculators expect
    }));
    console.log('🔍 Games filtering debug:');
    console.log('🔍 Total games:', games.length);
    console.log('🔍 Completed games:', games.filter(g => g.statusIsCompleted === true).length);
    console.log('🔍 Games with statistics enabled:', games.filter(g => g.statusAllowsStatistics === true).length);
    console.log('🔍 Completed games with statistics enabled:', filtered.length);
    console.log('🔍 Sample game:', games[0]);
    return filtered;
  }, [games]);

  // Filter to completed games with position statistics (for attack/defense analysis)
  const completedGamesWithPositionStats = useMemo(() => {
    const filtered = games.filter(game => 
      game.statusIsCompleted === true && 
      game.statusAllowsStatistics === true
    ).map(game => ({
      ...game,
      status: 'completed' // Add the status field that the calculators expect
    }));
    console.log('🔍 Games with position stats:', filtered.length);
    return filtered;
  }, [games]);

  // Transform team API games to SimpleGame format for SimplifiedGamesList
  const transformedGamesForDisplay = useMemo(() => {
    return games.map(game => ({
      id: game.id,
      date: game.date,
      round: game.round ? parseInt(game.round) : undefined,
      status: game.statusName || (game.statusIsCompleted ? 'completed' : 'scheduled') as 'completed' | 'scheduled' | 'upcoming' | 'forfeit-win' | 'forfeit-loss' | 'bye',
      homeTeam: { 
        id: game.homeTeamId, 
        name: game.homeTeamName 
      },
      awayTeam: game.awayTeamId ? { 
        id: game.awayTeamId, 
        name: game.awayTeamName 
      } : undefined,
      quarterScores: [], // Will be populated after batchScores is available
      hasStats: game.statusAllowsStatistics || false,
      statusAllowsStatistics: game.statusAllowsStatistics || false
    }));
  }, [games]);



  // Get all completed games with statistics enabled for quarter performance widget
  const allSeasonGamesWithStatistics = useMemo(() => {
    return completedGamesWithStatisticsEnabled
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedGamesWithStatisticsEnabled]);

  // Get all completed games with position stats for attack/defense widget
  const allSeasonGamesWithPositionStats = useMemo(() => {
    return completedGamesWithPositionStats
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedGamesWithPositionStats]);

  // Fetch batch statistics for all season games with position stats
  const { statsMap: batchStats, isLoading: isLoadingStats } = useBatchGameStatistics(
    allSeasonGamesWithPositionStats.map(game => game.id),
    false
  );



  // Fetch batch scores for all season games with statistics enabled
  const { data: batchScores = {}, isLoading: isLoadingScores } = useQuery<Record<number, any[]>>({
    queryKey: ['batch-scores', allSeasonGamesWithStatistics.map(game => game.id).join(',')],
    queryFn: async () => {
      console.log('🔍 BATCH SCORES QUERY RUNNING:');
      console.log('🔍 allSeasonGamesWithStatistics length:', allSeasonGamesWithStatistics.length);
      console.log('🔍 teamIdFromUrl:', teamIdFromUrl);
      
      if (allSeasonGamesWithStatistics.length === 0) {
        console.log('🔍 No games with statistics, returning empty object');
        return {} as Record<number, any[]>;
      }
      
      const gameIds = allSeasonGamesWithStatistics.map(game => game.id);
      console.log('🔍 Game IDs for batch scores:', gameIds);
      
      try {
        const result = await apiClient.post(`/api/clubs/${currentClub?.id}/games/scores/batch`, {
          gameIds: gameIds
        });
        console.log('🔍 Batch scores API result:', result);
        return result as Record<number, any[]>;
      } catch (error) {
        console.error('🔍 Error fetching batch scores:', error);
        return {} as Record<number, any[]>;
      }
    },
    enabled: allSeasonGamesWithStatistics.length > 0 && !!teamIdFromUrl,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add quarter scores to transformed games after batchScores is available
  const gamesWithQuarterScores = useMemo(() => {
    return transformedGamesForDisplay.map(game => {
      // Get quarter scores for this game from batchScores
      const gameScores = batchScores?.[game.id] || [];
      const quarterScores = [];
      
      // Group scores by quarter
      for (let quarter = 1; quarter <= 4; quarter++) {
        const homeScore = gameScores.find(s => s.quarter === quarter && s.teamId === game.homeTeam.id)?.score || 0;
        const awayScore = gameScores.find(s => s.quarter === quarter && s.teamId === game.awayTeam?.id)?.score || 0;
        quarterScores.push({ homeScore, awayScore });
      }
      
      return {
        ...game,
        quarterScores: quarterScores
      };
    });
  }, [transformedGamesForDisplay, batchScores]);

  // Debug upcoming games
  console.log('🔍 Upcoming Games Debug:');
  console.log('🔍 Total games:', games.length);
  console.log('🔍 Games with statusName:', games.filter(g => g.statusName).map(g => ({ id: g.id, statusName: g.statusName, date: g.date })));
  console.log('🔍 Scheduled games:', gamesWithQuarterScores.filter(g => g.status === 'scheduled'));
  console.log('🔍 All game statuses:', gamesWithQuarterScores.map(g => ({ id: g.id, status: g.status, date: g.date })));
  console.log('🔍 Next game from useNextGame:', nextGame);
  console.log('🔍 Games that are not completed:', games.filter(g => !g.statusIsCompleted).map(g => ({ id: g.id, statusIsCompleted: g.statusIsCompleted, date: g.date, isBye: g.isBye })));
  console.log('🔍 Current date:', new Date().toISOString());
  console.log('🔍 Games with future dates:', games.filter(g => new Date(g.date) > new Date()).map(g => ({ id: g.id, date: g.date, statusIsCompleted: g.statusIsCompleted, statusName: g.statusName })));

  // Get the 5 most recent completed games for the games list display (ALL completed games, including forfeits)
  const recentCompletedGames = useMemo(() => {
    return gamesWithQuarterScores
      .filter(game => game.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [gamesWithQuarterScores]);

  // Get recent games with statistics for widgets (last 5 games with stats)
  const recentGamesWithStatistics = useMemo(() => {
    return gamesWithQuarterScores
      .filter(game => game.status === 'completed' && game.statusAllowsStatistics)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(game => ({
        ...game,
        status: 'completed' // Add the status field that the calculators expect
      }));
  }, [gamesWithQuarterScores]);

  // Get recent games with position stats for attack/defense widget
  const recentGamesWithPositionStats = useMemo(() => {
    return gamesWithQuarterScores
      .filter(game => game.status === 'completed' && game.statusAllowsStatistics)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(game => ({
        ...game,
        status: 'completed' // Add the status field that the calculators expect
      }));
  }, [gamesWithQuarterScores]);

  // Get games against upcoming opponent
  const gamesAgainstOpponent = useMemo(() => {
    if (!upcomingOpponent) return [];
    return gamesWithQuarterScores
      .filter(game => {
        const isHomeTeam = teamIdFromUrl === game.homeTeam.id;
        const opponentId = isHomeTeam ? game.awayTeam?.id : game.homeTeam.id;
        return opponentId === upcomingOpponent.id && game.status === 'completed';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [gamesWithQuarterScores, upcomingOpponent, teamIdFromUrl]);

  // Get games against opponent with statistics for widgets
  const opponentGamesWithStatistics = useMemo(() => {
    return gamesAgainstOpponent
      .filter(game => game.statusAllowsStatistics)
      .map(game => ({
        ...game,
        status: 'completed' // Add the status field that the calculators expect
      }));
  }, [gamesAgainstOpponent]);

  // Get games against opponent with position stats for attack/defense widget
  const opponentGamesWithPositionStats = useMemo(() => {
    return gamesAgainstOpponent
      .filter(game => game.statusAllowsStatistics)
      .map(game => ({
        ...game,
        status: 'completed' // Add the status field that the calculators expect
      }));
  }, [gamesAgainstOpponent]);

  // Fetch batch statistics for recent games with position stats
  const { statsMap: recentBatchStats, isLoading: isLoadingRecentStats } = useBatchGameStatistics(
    recentGamesWithPositionStats.map(game => game.id),
    false
  );

  // Fetch batch statistics for opponent games with position stats
  const { statsMap: opponentBatchStats, isLoading: isLoadingOpponentStats } = useBatchGameStatistics(
    opponentGamesWithPositionStats.map(game => game.id),
    false
  );

  // Quick debug of data sources
  console.log('🔍 QUICK DEBUG - Data Sources:');
  console.log('🔍 batchScores keys:', Object.keys(batchScores || {}));
  console.log('🔍 batchStats keys:', Object.keys(batchStats || {}));
  console.log('🔍 Sample batchScores data:', batchScores && Object.keys(batchScores).length > 0 ? batchScores[Object.keys(batchScores)[0]] : 'No data');
  console.log('🔍 Sample batchStats data:', batchStats && Object.keys(batchStats).length > 0 ? batchStats[Object.keys(batchStats)[0]] : 'No data');

  // Process unified game data for attack/defense widget
  const { unifiedData, averages } = useMemo(() => {
    console.log('🔍 UNIFIED DATA PROCESSING DEBUG:');
    console.log('�� allSeasonGamesWithStatistics length:', allSeasonGamesWithStatistics.length);
    console.log('🔍 allSeasonGamesWithPositionStats length:', allSeasonGamesWithPositionStats.length);
    console.log('🔍 batchScores keys:', Object.keys(batchScores || {}));
    console.log('🔍 batchStats keys:', Object.keys(batchStats || {}));
    console.log('🔍 teamIdFromUrl:', teamIdFromUrl);
    
    if (!batchScores || Object.keys(batchScores).length === 0) {
      console.log('🔍 Early return - missing batchScores data');
      return { unifiedData: [], averages: null };
    }
    
    // Use allSeasonGamesWithStatistics instead of allSeasonGamesWithPositionStats
    // The unified approach can handle games without position stats
    const result = processUnifiedGameData(allSeasonGamesWithStatistics, batchScores, batchStats, teamIdFromUrl ?? 0);
    
    // Debug the main summary calculation
    console.log('🔍 Main Summary Calculation Debug:');
    console.log('🔍 Unified data length:', result.unifiedData.length);
    console.log('🔍 Games with official scores:', result.averages.gamesWithOfficialScores);
    console.log('🔍 Games with position stats:', result.averages.gamesWithPositionStats);
    console.log('🔍 GS Avg Goals For:', result.averages.gsAvgGoalsFor);
    console.log('🔍 GA Avg Goals For:', result.averages.gaAvgGoalsFor);
    console.log('🔍 GD Avg Goals Against:', result.averages.gdAvgGoalsAgainst);
    console.log('🔍 GK Avg Goals Against:', result.averages.gkAvgGoalsAgainst);
    console.log('🔍 Attack Total (GS + GA):', result.averages.attackingPositionsTotal);
    console.log('🔍 Defense Total (GD + GK):', result.averages.defendingPositionsTotal);
    
    return result;
  }, [allSeasonGamesWithStatistics, batchScores, batchStats, teamIdFromUrl]);

  // Calculate quarter data from unified data
  const quarterData = useMemo(() => {
    console.log('🔍 Quarter data calculation debug:');
    console.log('🔍 allSeasonGamesWithStatistics length:', allSeasonGamesWithStatistics?.length);
    console.log('🔍 batchScores keys:', Object.keys(batchScores || {}));
    console.log('🔍 batchStats keys:', Object.keys(batchStats || {}));
    console.log('🔍 teamIdFromUrl:', teamIdFromUrl);
    
    if (!allSeasonGamesWithStatistics || allSeasonGamesWithStatistics.length === 0) {
      console.log('🔍 No games with statistics available');
      return [];
    }
    
    if (!batchScores || Object.keys(batchScores).length === 0) {
      console.log('🔍 No batchScores available');
      return [];
    }
    
    const result = calculateUnifiedQuarterByQuarterStats(allSeasonGamesWithStatistics, batchScores, teamIdFromUrl ?? 0, batchStats);
    console.log('🔍 Quarter calculation result:', result);
    console.log('🔍 allSeasonGamesWithStatistics sample:', allSeasonGamesWithStatistics[0]);
    console.log('🔍 allSeasonGamesWithStatistics keys:', allSeasonGamesWithStatistics[0] ? Object.keys(allSeasonGamesWithStatistics[0]) : 'No games');
    return result;
  }, [allSeasonGamesWithStatistics, batchScores, batchStats, teamIdFromUrl]);

  // Debug comparison between Quarter Performance and Attack/Defense data sources
  const debugDataComparison = useMemo(() => {
    if (!allSeasonGamesWithStatistics.length || !allSeasonGamesWithPositionStats.length) return;

    console.log('🔍 DATA SOURCE COMPARISON DEBUG:');
    console.log('🔍 Games for Quarter Performance:', allSeasonGamesWithStatistics.length);
    console.log('🔍 Games for Attack/Defense:', allSeasonGamesWithPositionStats.length);

    // Compare game IDs
    const quarterGameIds = allSeasonGamesWithStatistics.map(g => g.id).sort();
    const attackDefenseGameIds = allSeasonGamesWithPositionStats.map(g => g.id).sort();
    console.log('🔍 Quarter Performance Game IDs:', quarterGameIds);
    console.log('🔍 Attack/Defense Game IDs:', attackDefenseGameIds);

    // Check for overlapping games
    const overlappingGames = quarterGameIds.filter(id => attackDefenseGameIds.includes(id));
    console.log('🔍 Overlapping Games:', overlappingGames.length);

    // Sample a few games to compare data
    const sampleGameId = overlappingGames[0];
    if (sampleGameId) {
      console.log('🔍 Sample Game Data Comparison:');
      console.log('🔍 Game ID:', sampleGameId);

      // Quarter Performance data (from batchScores)
      const quarterScores = batchScores?.[sampleGameId] || [];
      console.log('🔍 Quarter Performance Scores:', quarterScores);

      // Attack/Defense data (from batchStats)
      const attackDefenseStats = batchStats?.[sampleGameId] || [];
      console.log('🔍 Attack/Defense Stats:', attackDefenseStats);

      // Calculate totals for this game
      const quarterTotal = quarterScores.reduce((sum, score) => {
        if (score.teamId === teamIdFromUrl) {
          return sum + (score.score || 0);
        }
        return sum;
      }, 0);

      const attackDefenseTotal = attackDefenseStats.reduce((sum, stat) => {
        if (stat.team_id === teamIdFromUrl) { // Corrected property name
          return sum + (stat.goals_for || 0); // Corrected property name
        }
        return sum;
      }, 0);

      console.log('🔍 Quarter Performance Total for Game:', quarterTotal);
      console.log('🔍 Attack/Defense Total for Game:', attackDefenseTotal);
    }

    // Calculate Quarter Performance totals (like the component does)
    let totalQuarterGoalsFor = 0;
    let totalQuarterGoalsAgainst = 0;
    let gamesWithQuarterScores = 0;

    allSeasonGamesWithStatistics.forEach(game => {
      const gameScores = batchScores?.[game.id] || [];
      if (gameScores.length > 0) {
        gamesWithQuarterScores++;

        let gameGoalsFor = 0;
        let gameGoalsAgainst = 0;

        gameScores.forEach(score => {
          if (score.teamId === teamIdFromUrl) {
            gameGoalsFor += score.score || 0;
          } else {
            gameGoalsAgainst += score.score || 0;
          }
        });

        totalQuarterGoalsFor += gameGoalsFor;
        totalQuarterGoalsAgainst += gameGoalsAgainst;
      }
    });

    const avgQuarterGoalsFor = gamesWithQuarterScores > 0 ? totalQuarterGoalsFor / gamesWithQuarterScores : 0;
    const avgQuarterGoalsAgainst = gamesWithQuarterScores > 0 ? totalQuarterGoalsAgainst / gamesWithQuarterScores : 0;

    console.log('🔍 QUARTER PERFORMANCE TOTALS:');
    console.log('🔍 Games with quarter scores:', gamesWithQuarterScores);
    console.log('🔍 Average Goals For:', avgQuarterGoalsFor.toFixed(1));
    console.log('🔍 Average Goals Against:', avgQuarterGoalsAgainst.toFixed(1));
    console.log('🔍 Total Goals For (sum of all games):', totalQuarterGoalsFor);
    console.log('🔍 Total Goals Against (sum of all games):', totalQuarterGoalsAgainst);

    // Compare with Attack/Defense totals
    console.log('🔍 COMPARISON:');
    console.log('🔍 Quarter Performance Attack Total:', avgQuarterGoalsFor.toFixed(1));
    console.log('🔍 Attack/Defense Attack Total:', (quarterData.reduce((sum, q) => sum + q.gsGoalsFor + q.gaGoalsFor, 0)).toFixed(1));
    console.log('🔍 Quarter Performance Defense Total:', avgQuarterGoalsAgainst.toFixed(1));
    console.log('🔍 Attack/Defense Defense Total:', (quarterData.reduce((sum, q) => sum + q.gdGoalsAgainst + q.gkGoalsAgainst, 0)).toFixed(1));
  }, [allSeasonGamesWithStatistics, allSeasonGamesWithPositionStats, batchScores, batchStats, teamIdFromUrl, quarterData]);

  // Call the debug function
  debugDataComparison;

  // Simple loading state like GamePreparation page
  if (clubLoading || !currentClub) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
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
                    {currentClub?.name} Dashboard
                  </h1>
                  <p className="text-blue-100">Performance metrics and insights for your team</p>
                </div>
              </div>
            </CardContent>
          </Card>



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

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Two-column layout for Upcoming and Recent Games */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Games */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Upcoming Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimplifiedGamesList
                      games={gamesWithQuarterScores.filter(game => game.status === 'scheduled' || game.status === 'upcoming')}
                      currentTeamId={teamIdFromUrl ?? 0}
                      variant="upcoming"
                      maxGames={5}
                      compact={true}
                      showQuarterScores={false}
                      layout="medium"
                    />
                  </CardContent>
                </Card>

                {/* Recent Games */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Recent Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimplifiedGamesList
                      games={recentCompletedGames}
                      currentTeamId={teamIdFromUrl ?? 0}
                      variant="recent"
                      maxGames={5}
                      compact={true}
                      showQuarterScores={false}
                      layout="medium"
                      showViewMore={true}
                      viewMoreHref={`/team/${teamIdFromUrl}/games?status=completed`}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Quarter Performance Analysis Widget */}
              {(() => {
                console.log('🔍 Widget Debug:');
                console.log('🔍 allSeasonGamesWithStatistics length:', allSeasonGamesWithStatistics.length);
                console.log('🔍 allSeasonGamesWithPositionStats length:', allSeasonGamesWithPositionStats.length);
                console.log('🔍 positionAverages:', averages);
                console.log('🔍 quarterData length:', quarterData.length);
                console.log('🔍 batchScores keys:', Object.keys(batchScores || {}));
                console.log('🔍 batchStats keys:', Object.keys(batchStats || {}));
                
                return null;
              })()}
              
              {allSeasonGamesWithStatistics.length > 0 && (
                <SeasonStatsWidget
                  games={allSeasonGamesWithStatistics}
                  currentTeamId={teamIdFromUrl ?? 0}
                  batchScores={batchScores}
                  batchStats={batchStats}
                  className="w-full"
                />
              )}

              {allSeasonGamesWithStatistics.length > 0 && (
                <>
                  {/* Debug quarter scores */}
                  {(() => {
                    console.log('🔍 Quarter Performance Debug:');
                    console.log('🔍 All season games with statistics enabled:', allSeasonGamesWithStatistics.map(g => ({ id: g.id, status: g.status, statusAllowsStatistics: g.statusAllowsStatistics })));
                    console.log('🔍 Batch scores keys:', Object.keys(batchScores || {}));
                    console.log('🔍 Team ID:', teamIdFromUrl);
                    
                    // Debug sample game scores
                    const firstGameId = allSeasonGamesWithStatistics[0]?.id;
                    if (firstGameId && batchScores?.[firstGameId]) {
                      console.log('🔍 Sample game scores:', batchScores[firstGameId].slice(0, 3));
                    }
                    return null;
                  })()}
                  
                  <QuarterPerformanceAnalysisWidget
                    games={allSeasonGamesWithStatistics}
                    currentTeamId={teamIdFromUrl ?? 0}
                    batchScores={batchScores}
                    batchStats={batchStats}
                    excludeSpecialGames={true}
                    className="w-full"
                  />
                </>
              )}

              {/* Compact Attack Defense Widget */}
              {allSeasonGamesWithStatistics.length > 0 && averages && (
                <CompactAttackDefenseWidget
                  games={allSeasonGamesWithStatistics}
                  batchScores={batchScores}
                  batchStats={batchStats}
                  teamId={teamIdFromUrl ?? 0}
                  className="w-full"
                />
              )}

              {/* Stats Debug Table */}
              {allSeasonGamesWithStatistics.length > 0 && (
                <StatsDebugTable
                  games={allSeasonGamesWithStatistics}
                  batchScores={batchScores}
                  batchStats={batchStats}
                  teamId={teamIdFromUrl ?? 0}
                  className="w-full"
                />
              )}

              {/* Fallback: Show widgets even if no season data */}
              {allSeasonGamesWithStatistics.length === 0 && allSeasonGamesWithPositionStats.length === 0 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quarter Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-center py-8">
                        No completed games with statistics available for analysis.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Attack vs Defense Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-center py-8">
                        No completed games with position statistics available for analysis.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}


            </TabsContent>

            <TabsContent value="recent" className="space-y-8">
              {/* Recent Form Section - Simplified */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recent Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplifiedGamesList
                    games={recentCompletedGames}
                    currentTeamId={teamIdFromUrl ?? 0}
                    variant="recent"
                    maxGames={10}
                    compact={false}
                    showQuarterScores={true}
                    layout="wide"
                  />
                </CardContent>
              </Card>

              {/* Recent Season Statistics Debug Widget */}
              {recentGamesWithStatistics.length > 0 && (
                <SeasonStatsWidget
                  games={recentGamesWithStatistics}
                  currentTeamId={teamIdFromUrl ?? 0}
                  batchScores={batchScores}
                  batchStats={recentBatchStats}
                  className="w-full"
                />
              )}

              {/* Recent Quarter Performance Analysis Widget */}
              {recentGamesWithStatistics.length > 0 && (
                <QuarterPerformanceAnalysisWidget
                  games={recentGamesWithStatistics}
                  batchScores={batchScores}
                  batchStats={recentBatchStats}
                  currentTeamId={teamIdFromUrl ?? 0}
                  className="w-full"
                />
              )}

              {/* Recent Compact Attack Defense Widget */}
              {recentGamesWithPositionStats.length > 0 && (
                <CompactAttackDefenseWidget
                  games={recentGamesWithPositionStats}
                  batchScores={batchScores}
                  batchStats={recentBatchStats}
                  teamId={teamIdFromUrl ?? 0}
                  className="w-full"
                />
              )}

              {/* Fallback: Show message if no recent games with stats */}
              {recentGamesWithStatistics.length === 0 && recentGamesWithPositionStats.length === 0 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-center py-8">
                        No recent completed games with statistics available for analysis.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="opponent" className="space-y-8">
              {/* Opponent Form Section - Simplified */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>
                    {upcomingOpponent && gamesAgainstOpponent.length > 0
                      ? (() => {
                          const firstGame = gamesAgainstOpponent[0];
                          const isHomeTeam = teamIdFromUrl === firstGame.homeTeam.id;
                          const opponentName = isHomeTeam ? firstGame.awayTeam?.name : firstGame.homeTeam.name;
                          return `Games vs ${opponentName}`;
                        })()
                      : upcomingOpponent 
                        ? 'Games vs Opponent'
                        : 'Opponent Analysis'
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingOpponent ? (
                    <SimplifiedGamesList
                      games={gamesAgainstOpponent}
                      currentTeamId={teamIdFromUrl ?? 0}
                      variant="season"
                      compact={false}
                      showQuarterScores={true}
                      layout="wide"
                      showFilters={false}
                    />
                  ) : (
                    <p className="text-muted-foreground">No upcoming games found.</p>
                  )}
                </CardContent>
              </Card>

              {/* Opponent Season Statistics Debug Widget */}
              {opponentGamesWithStatistics.length > 0 && (
                <SeasonStatsWidget
                  games={opponentGamesWithStatistics}
                  currentTeamId={teamIdFromUrl ?? 0}
                  batchScores={batchScores}
                  batchStats={opponentBatchStats}
                  className="w-full"
                />
              )}

              {/* Opponent Quarter Performance Analysis Widget */}
              {opponentGamesWithStatistics.length > 0 && (
                <QuarterPerformanceAnalysisWidget
                  games={opponentGamesWithStatistics}
                  batchScores={batchScores}
                  batchStats={opponentBatchStats}
                  currentTeamId={teamIdFromUrl ?? 0}
                  className="w-full"
                />
              )}

              {/* Opponent Compact Attack Defense Widget */}
              {opponentGamesWithPositionStats.length > 0 && (
                <CompactAttackDefenseWidget
                  games={opponentGamesWithPositionStats}
                  batchScores={batchScores}
                  batchStats={opponentBatchStats}
                  teamId={teamIdFromUrl ?? 0}
                  className="w-full"
                />
              )}

              {/* Opponent Stats Debug Table */}
              {opponentGamesWithStatistics.length > 0 && (
                <StatsDebugTable
                  games={opponentGamesWithStatistics}
                  batchScores={batchScores}
                  batchStats={opponentBatchStats}
                  teamId={teamIdFromUrl ?? 0}
                  className="w-full"
                />
              )}

              {/* Fallback: Show message if no opponent games with stats */}
              {(!upcomingOpponent || (opponentGamesWithStatistics.length === 0 && opponentGamesWithPositionStats.length === 0)) && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Opponent Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-center py-8">
                        {!upcomingOpponent 
                          ? 'No upcoming games found to determine opponent.'
                          : 'No completed games with statistics available against this opponent.'
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="season" className="space-y-8">
              {/* Season Form Section - Simplified */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Season Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplifiedGamesList
                    games={gamesWithQuarterScores}
                    currentTeamId={teamIdFromUrl ?? 0}
                    variant="season"
                    compact={false}
                    showQuarterScores={true}
                    layout="wide"
                    showFilters={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
