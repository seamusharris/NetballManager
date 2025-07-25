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

import { NextGameDetailsWidget } from "@/components/ui/next-game-details-widget";
import { useBatchGameStatistics } from "@/components/statistics/hooks/useBatchGameStatistics";
import { useNextGame } from '@/hooks/use-next-game';
import { processUnifiedGameData, calculateUnifiedQuarterByQuarterStats } from '@/lib/positionStatsCalculator';
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils";
import { apiClient } from '@/lib/apiClient';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Flag, Trophy, Shield } from 'lucide-react';
import { ResultBadge } from "@/components/ui/result-badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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

  

  // Filter to completed games that allow statistics (for quarter performance analysis)
  const completedGamesWithStatisticsEnabled = useMemo(() => {
    const filtered = games.filter(game => 
      game.statusIsCompleted === true && 
      game.statusAllowsStatistics === true
    ).map(game => ({
      ...game,
      status: 'completed' // Add the status field that the calculators expect
    }));
    
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
    // Standardize: reverse chronological for completed games
    return completedGamesWithStatisticsEnabled
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedGamesWithStatisticsEnabled]);

  // Get all completed games with position stats for attack/defense widget
  const allSeasonGamesWithPositionStats = useMemo(() => {
    // Standardize: reverse chronological for completed games
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
      if (allSeasonGamesWithStatistics.length === 0) {
        return {} as Record<number, any[]>;
      }
      
      const gameIds = allSeasonGamesWithStatistics.map(game => game.id);
      
      try {
        const result = await apiClient.post(`/api/clubs/${currentClub?.id}/games/scores/batch`, {
          gameIds: gameIds
        });
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



  // Get the 5 most recent completed games for the games list display (ALL completed games, including forfeits)
  const recentCompletedGames = useMemo(() => {
    // Standardize: reverse chronological for recent games
    return gamesWithQuarterScores
      .filter(game => game.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [gamesWithQuarterScores]);

  // Get recent games with statistics for widgets (last 5 games with stats)
  const recentGamesWithStatistics = useMemo(() => {
    // Standardize: reverse chronological for recent games
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
    // Standardize: reverse chronological for recent games
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
    // Standardize: reverse chronological for completed games
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
    console.log('🔍 allSeasonGamesWithStatistics length:', allSeasonGamesWithStatistics.length);
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

    
    return result;
  }, [allSeasonGamesWithStatistics, batchScores, batchStats, teamIdFromUrl]);

  // Calculate quarter data from unified data
  const quarterData = useMemo(() => {
    if (!allSeasonGamesWithStatistics || allSeasonGamesWithStatistics.length === 0) {
      return [];
    }
    
    if (!batchScores || Object.keys(batchScores).length === 0) {
      return [];
    }
    
    const result = calculateUnifiedQuarterByQuarterStats(allSeasonGamesWithStatistics, batchScores, teamIdFromUrl ?? 0, batchStats);
    return result;
  }, [allSeasonGamesWithStatistics, batchScores, batchStats, teamIdFromUrl]);

  // Calculate season statistics from completed games
  const seasonStats = useMemo(() => {
    const completedGames = games.filter(game => game.statusIsCompleted === true);
    
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    
    completedGames.forEach(game => {
      const gameScores = batchScores?.[game.id] || [];
      if (gameScores.length === 0) return;
      
      const isHomeGame = teamIdFromUrl === game.homeTeamId;
      let homeScore = 0;
      let awayScore = 0;
      
      // Sum up all quarter scores for each team
      gameScores.forEach(score => {
        if (score.teamId === game.homeTeamId) {
          homeScore += score.score;
        } else if (score.teamId === game.awayTeamId) {
          awayScore += score.score;
        }
      });
      
      // Determine result
      if (homeScore > awayScore) {
        wins += isHomeGame ? 1 : 0;
        losses += isHomeGame ? 0 : 1;
      } else if (awayScore > homeScore) {
        wins += isHomeGame ? 0 : 1;
        losses += isHomeGame ? 1 : 0;
      } else {
        draws += 1;
      }
      
      // Add to goals totals
      if (isHomeGame) {
        goalsFor += homeScore;
        goalsAgainst += awayScore;
      } else {
        goalsFor += awayScore;
        goalsAgainst += homeScore;
      }
    });
    
    const gamesPlayed = wins + losses + draws;
    const points = (wins * 3) + draws;
    const goalDifference = goalsFor - goalsAgainst;
    const percentage = goalsAgainst > 0 ? ((goalsFor / goalsAgainst) * 100) : 0;
    
    return {
      wins,
      losses,
      draws,
      gamesPlayed,
      goalsFor,
      goalsAgainst,
      points,
      goalDifference,
      percentage: Math.round(percentage)
    };
  }, [games, batchScores, teamIdFromUrl]);


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
              {/* Top row: 4 plain cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Next Game Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      {nextGame ? (() => {
                        const fullGame = games.find(g => g.id === nextGame.id);
                        const home = fullGame?.homeTeamName || 'Home';
                        const away = fullGame?.awayTeamName || 'Away';
                        return `${home} vs ${away}`;
                      })() : ''}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nextGame ? (
                      <div className="space-y-2">
                        {/* No main heading here, title is above */}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="h-4 w-4" />
                          <span>{(() => {
                            const d = new Date(nextGame.date);
                            return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                          })()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="h-4 w-4" />
                          <span>{(() => {
                            // If nextGame.time is present, format as 12:00 PM
                            if (!nextGame.time) return '';
                            // Combine date and time for correct formatting
                            const dt = new Date(`${nextGame.date}T${nextGame.time}`);
                            return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                          })()}</span>
                        </div>
                        {/* Round (moved above address) */}
                        {(() => {
                          const fullGame = games.find(g => g.id === nextGame.id);
                          return fullGame?.round ? (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Flag className="h-4 w-4" />
                              <span>Round {fullGame.round}</span>
                            </div>
                          ) : null;
                        })()}
                        {/* Address (now below round, and cleaned up) */}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="h-4 w-4" />
                          <span>1-9 Anderson St, Templestowe</span>
                        </div>
                        {/* Action Buttons Row: Availability & Roster */}
                        <div className="flex justify-center pt-1">
                          <div className="flex gap-4">
                            <Button
                              onClick={() => nextGame && (window.location.href = `/team/${teamIdFromUrl}/game/${nextGame.id}/availability`)}
                              variant="outline"
                              className="bg-gray-50 border-gray-400 text-gray-700 hover:bg-gray-200 hover:text-gray-800 text-sm px-4 py-1"
                            >
                              Availability
                            </Button>
                            <Button
                              onClick={() => nextGame && (window.location.href = `/team/${teamIdFromUrl}/game/${nextGame.id}/roster`)}
                              variant="outline"
                              className="bg-gray-50 border-gray-400 text-gray-700 hover:bg-gray-200 hover:text-gray-800 text-sm px-4 py-1"
                            >
                              Roster
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No upcoming game</div>
                    )}
                  </CardContent>
                </Card>

                {/* Card 2: History vs Next Opponent */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      {nextGame ? (() => {
                        const fullGame = games.find(g => g.id === nextGame.id);
                        const isHome = teamIdFromUrl === nextGame.homeTeamId;
                        const opponentName = fullGame
                          ? (isHome ? fullGame.awayTeamName : fullGame.homeTeamName)
                          : 'Opponent';
                        return `Form vs ${opponentName}`;
                      })() : 'Form vs Opponent'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nextGame ? (() => {
                      const isHome = teamIdFromUrl === nextGame.homeTeamId;
                      const nextOpponentId = isHome ? nextGame.awayTeamId : nextGame.homeTeamId;
                      const gamesVsOpponent = games
                        .filter(g => {
                          const isHomeGame = teamIdFromUrl === g.homeTeamId;
                          const opponentId = isHomeGame ? g.awayTeamId : g.homeTeamId;
                          return opponentId === nextOpponentId && g.statusIsCompleted;
                        })
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // chronological order
                      if (gamesVsOpponent.length === 0) return <div className="text-muted-foreground">No history</div>;
                      // Helper to get result for each game
                      const getResult = (g) => {
                        const isHomeGame = teamIdFromUrl === g.homeTeamId;
                        
                        // Get scores from batchScores data
                        const gameScores = batchScores?.[g.id] || [];
                        if (gameScores.length === 0) {
                          console.log('🔍 No batch scores for game:', g.id);
                          return null;
                        }
                        
                        // Calculate total scores for each team
                        let homeScore = 0;
                        let awayScore = 0;
                        
                        gameScores.forEach(scoreEntry => {
                          if (scoreEntry.teamId === g.homeTeamId) {
                            homeScore += scoreEntry.score || 0;
                          } else if (scoreEntry.teamId === g.awayTeamId) {
                            awayScore += scoreEntry.score || 0;
                          }
                        });
                        
                        console.log('🔍 Calculated scores:', {
                          gameId: g.id,
                          isHomeGame,
                          homeScore,
                          awayScore,
                          homeTeamId: g.homeTeamId,
                          awayTeamId: g.awayTeamId,
                          gameScoresCount: gameScores.length
                        });
                        
                        // Determine our score vs opponent score
                        const teamScore = isHomeGame ? homeScore : awayScore;
                        const oppScore = isHomeGame ? awayScore : homeScore;
                        
                        if (typeof teamScore !== 'number' || typeof oppScore !== 'number') return null;
                        if (teamScore > oppScore) return 'Win';
                        if (teamScore < oppScore) return 'Loss';
                        return 'Draw';
                      };
                      return (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            {gamesVsOpponent
                              .map((g, idx) => {
                                const result = getResult(g);
                                if (!result) return null;
                                // Get scores for tooltip
                                const isHomeGame = teamIdFromUrl === g.homeTeamId;
                                const gameScores = batchScores?.[g.id] || [];
                                let homeScore = 0, awayScore = 0;
                                gameScores.forEach(scoreEntry => {
                                  if (scoreEntry.teamId === g.homeTeamId) homeScore += scoreEntry.score || 0;
                                  else if (scoreEntry.teamId === g.awayTeamId) awayScore += scoreEntry.score || 0;
                                });
                                const teamScore = isHomeGame ? homeScore : awayScore;
                                const oppScore = isHomeGame ? awayScore : homeScore;
                                const scoreString = `${teamScore}–${oppScore}`;
                                return (
                                  <Tooltip key={g.id}>
                                    <TooltipTrigger asChild>
                                      <span><ResultBadge result={result} size="md" /></span>
                                    </TooltipTrigger>
                                    <TooltipContent>{scoreString}</TooltipContent>
                                  </Tooltip>
                                );
                              })
                              .filter(Boolean)}
                          </div>
                          {/* Goals for/against row */}
                          {(() => {
                            let totalFor = 0, totalAgainst = 0;
                            gamesVsOpponent.forEach(g => {
                              const isHomeGame = teamIdFromUrl === g.homeTeamId;
                              const gameScores = batchScores?.[g.id] || [];
                              let homeScore = 0, awayScore = 0;
                              gameScores.forEach(scoreEntry => {
                                if (scoreEntry.teamId === g.homeTeamId) homeScore += scoreEntry.score || 0;
                                else if (scoreEntry.teamId === g.awayTeamId) awayScore += scoreEntry.score || 0;
                              });
                              if (isHomeGame) {
                                totalFor += homeScore;
                                totalAgainst += awayScore;
                              } else {
                                totalFor += awayScore;
                                totalAgainst += homeScore;
                              }
                            });
                            return (
                              <div className="flex flex-col gap-1 mt-1 text-sm text-gray-700">
                                <div className="flex justify-between">
                                  <span>Goals for:</span>
                                  <span className="font-bold">{totalFor}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Goals against:</span>
                                  <span className="font-bold">{totalAgainst}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Goal difference:</span>
                                  <span className="font-bold">{totalFor - totalAgainst > 0 ? '+' : ''}{totalFor - totalAgainst}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Percentage:</span>
                                  <span className="font-bold">{totalAgainst > 0 ? Math.round((totalFor / totalAgainst) * 100) : 0}%</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })() : <div className="text-muted-foreground">No upcoming game</div>}
                  </CardContent>
                </Card>

                {/* Recent Form Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Recent Form</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Get last 5 completed games for this team with actual scores
                      const recentGames = games
                        .filter(g => 
                          // Team is involved
                          (g.homeTeamId === teamIdFromUrl || g.awayTeamId === teamIdFromUrl) &&
                          // Game is completed
                          g.statusIsCompleted === true &&
                          // Not a bye game (has opponent)
                          g.awayTeamId !== null &&
                          // Has batch scores available
                          batchScores?.[g.id]?.length > 0
                        )
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5);

                      if (recentGames.length === 0) {
                        return <div className="text-sm text-muted-foreground">No recent games</div>;
                      }

                      // Helper to get result for each game
                      const getResult = (g) => {
                        const isHomeGame = teamIdFromUrl === g.homeTeamId;
                        
                        // Get scores from batchScores data
                        const gameScores = batchScores?.[g.id] || [];
                        if (gameScores.length === 0) {
                          return null;
                        }
                        
                        // Calculate total scores for each team
                        let homeScore = 0;
                        let awayScore = 0;
                        
                        gameScores.forEach(score => {
                          if (score.teamId === g.homeTeamId) {
                            homeScore += score.score;
                          } else if (score.teamId === g.awayTeamId) {
                            awayScore += score.score;
                          }
                        });
                        
                        const teamScore = isHomeGame ? homeScore : awayScore;
                        const oppScore = isHomeGame ? awayScore : homeScore;
                        
                        if (teamScore > oppScore) return 'Win';
                        if (teamScore < oppScore) return 'Loss';
                        return 'Draw';
                      };

                      // Calculate totals for recent games
                      let totalFor = 0;
                      let totalAgainst = 0;
                      
                      recentGames.forEach(g => {
                        const gameScores = batchScores?.[g.id] || [];
                        const isHomeGame = teamIdFromUrl === g.homeTeamId;
                        
                        let homeScore = 0;
                        let awayScore = 0;
                        
                        gameScores.forEach(score => {
                          if (score.teamId === g.homeTeamId) {
                            homeScore += score.score;
                          } else if (score.teamId === g.awayTeamId) {
                            awayScore += score.score;
                          }
                        });
                        
                        if (isHomeGame) {
                          totalFor += homeScore;
                          totalAgainst += awayScore;
                        } else {
                          totalFor += awayScore;
                          totalAgainst += homeScore;
                        }
                      });

                      return (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            {recentGames
                              .reverse()
                              .map((g, idx) => {
                                const result = getResult(g);
                                if (!result) return null;
                                // Get scores for tooltip
                                const isHomeGame = teamIdFromUrl === g.homeTeamId;
                                const gameScores = batchScores?.[g.id] || [];
                                let homeScore = 0;
                                let awayScore = 0;
                                gameScores.forEach(score => {
                                  if (score.teamId === g.homeTeamId) {
                                    homeScore += score.score;
                                  } else if (score.teamId === g.awayTeamId) {
                                    awayScore += score.score;
                                  }
                                });
                                const teamScore = isHomeGame ? homeScore : awayScore;
                                const oppScore = isHomeGame ? awayScore : homeScore;
                                
                                return (
                                  <Tooltip key={g.id}>
                                    <TooltipTrigger>
                                      <ResultBadge result={result} size="md" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{teamScore}–{oppScore}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })
                              .filter(Boolean)}
                          </div>
                          <div className="flex flex-col gap-1 mt-1 text-sm text-gray-700">
                            <div className="flex justify-between">
                              <span>Goals for:</span>
                              <span className="font-bold">{totalFor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Goals against:</span>
                              <span className="font-bold">{totalAgainst}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Goal difference:</span>
                              <span className="font-bold">{totalFor - totalAgainst > 0 ? '+' : ''}{totalFor - totalAgainst}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Percentage:</span>
                              <span className="font-bold">{totalAgainst > 0 ? Math.round((totalFor / totalAgainst) * 100) : 0}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Card 3: Season Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Season Form</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <div
                          className="inline-flex items-center justify-center rounded-full font-semibold text-white border border-white h-8 w-12 text-sm bg-green-500"
                          style={{
                            boxShadow: '0 0 0 1px #22c55e'
                          }}
                        >
                          {seasonStats?.wins || 0}W
                        </div>
                        <div
                          className="inline-flex items-center justify-center rounded-full font-semibold text-white border border-white h-8 w-12 text-sm bg-red-500"
                          style={{
                            boxShadow: '0 0 0 1px #ef4444'
                          }}
                        >
                          {seasonStats?.losses || 0}L
                        </div>
                        <div
                          className="inline-flex items-center justify-center rounded-full font-semibold text-white border border-white h-8 w-12 text-sm bg-yellow-500"
                          style={{
                            boxShadow: '0 0 0 1px #eab308'
                          }}
                        >
                          {seasonStats?.draws || 0}D
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 mt-1 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span>Goals for:</span>
                          <span className="font-bold">{seasonStats?.goalsFor || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Goals against:</span>
                          <span className="font-bold">{seasonStats?.goalsAgainst || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Goal difference:</span>
                          <span className="font-bold">{seasonStats?.goalDifference >= 0 ? '+' : ''}{seasonStats?.goalDifference || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Percentage:</span>
                          <span className="font-bold">{seasonStats?.percentage || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

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
