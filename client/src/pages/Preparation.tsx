
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Target, TrendingUp, FileText, Users, Clock, MapPin, Calendar, Trophy, BarChart3, Zap, AlertTriangle, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { useBatchRosterData } from '@/components/statistics/hooks/useBatchRosterData';
import { getWinLoseLabel, formatShortDate } from '@/lib/utils';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { ResultBadge } from '@/components/ui/result-badge';

interface UpcomingGame {
  id: number;
  date: string;
  time: string;
  opponent: string;
  opponentId: number;
  venue: string | null;
  round: string;
  isNextGame: boolean;
}

interface OpponentAnalysis {
  teamId: number;
  teamName: string;
  clubName: string;
  division: string;
  gamesPlayed: number;
  ourRecord: {
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  };
  avgScores: {
    ourAvg: number;
    theirAvg: number;
    margin: number;
  };
  recentForm: string[];
  lastPlayed: string;
  quarterPerformance: Record<number, {
    ourAvg: number;
    theirAvg: number;
    margin: number;
  }>;
  keyInsights: string[];
  tacticalNotes: string[];
}

interface PlayerRecommendation {
  playerId: number;
  playerName: string;
  position: string;
  avgPerformance: number;
  gamesAgainstOpponent: number;
  successRate: number;
  keyStrengths: string[];
  recommendation: 'strongly-recommended' | 'recommended' | 'consider' | 'caution';
}

interface LineupRecommendation {
  id: string;
  positions: Record<string, {
    playerId: number;
    playerName: string;
    confidence: number;
  }>;
  overallStrength: number;
  reasoning: string[];
  vsOpponentSuccess: number;
  riskFactors: string[];
}

export default function Preparation() {
  const { currentClub, currentClubId, currentTeamId, isLoading: clubLoading } = useClub();
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'next-game' | 'all-opponents'>('next-game');
  const [selectedAnalysis, setSelectedAnalysis] = useState<OpponentAnalysis | null>(null);
  const [upcomingGames, setUpcomingGames] = useState<UpcomingGame[]>([]);
  const [playerRecommendations, setPlayerRecommendations] = useState<PlayerRecommendation[]>([]);
  const [lineupRecommendations, setLineupRecommendations] = useState<LineupRecommendation[]>([]);

  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['games', currentClubId, currentTeamId],
    queryFn: () => {
      const headers: Record<string, string> = {};
      if (currentTeamId) {
        headers['x-current-team-id'] = currentTeamId.toString();
      }
      return apiClient.get('/api/games', { headers });
    },
    enabled: !!currentClubId,
  });

  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<any[]>({
    queryKey: ['players', currentClubId],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClubId,
  });

  // Get completed and upcoming games
  const completedGames = games.filter(game => game.statusIsCompleted && game.statusAllowsStatistics);
  const upcomingGamesList = games.filter(game => !game.statusIsCompleted);
  const gameIds = completedGames.map(game => game.id);

  // Fetch batch statistics and rosters
  const { statsMap: centralizedStats = {}, isLoading: isLoadingStats } = useBatchGameStatistics(gameIds);
  const { rostersMap: centralizedRosters = {}, isLoading: isLoadingRosters } = useBatchRosterData(gameIds);

  // Process upcoming games and identify next opponent
  useEffect(() => {
    if (upcomingGamesList.length === 0) return;

    const processedUpcoming = upcomingGamesList
      .map(game => {
        const isHomeGame = game.homeClubId === currentClubId;
        const isAwayGame = game.awayClubId === currentClubId;
        
        if (isHomeGame && isAwayGame) return null; // Skip intra-club games
        
        let opponent = '';
        let opponentId = 0;
        
        if (isHomeGame && !isAwayGame && game.awayTeamName !== 'Bye') {
          opponent = game.awayTeamName;
          opponentId = game.awayTeamId;
        } else if (isAwayGame && !isHomeGame && game.homeTeamName !== 'Bye') {
          opponent = game.homeTeamName;
          opponentId = game.homeTeamId;
        }
        
        if (!opponent) return null;

        return {
          id: game.id,
          date: game.date,
          time: game.time,
          opponent,
          opponentId,
          venue: game.venue,
          round: game.round,
          isNextGame: false
        } as UpcomingGame;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime()) as UpcomingGame[];

    // Mark the next game
    if (processedUpcoming.length > 0) {
      processedUpcoming[0].isNextGame = true;
      if (filterMode === 'next-game') {
        setSelectedOpponent(processedUpcoming[0].opponentId.toString());
      }
    }

    setUpcomingGames(processedUpcoming);
  }, [upcomingGamesList, currentClubId, filterMode]);

  // Analyze selected opponent
  useEffect(() => {
    if (!selectedOpponent || !centralizedStats || Object.keys(centralizedStats).length === 0) return;

    const opponentId = parseInt(selectedOpponent);
    const opponentGames = completedGames.filter(game => {
      const isHomeGame = game.homeClubId === currentClubId;
      const isAwayGame = game.awayClubId === currentClubId;
      
      if (isHomeGame && isAwayGame) return false;
      
      const oppId = isHomeGame ? game.awayTeamId : game.homeTeamId;
      return oppId === opponentId;
    });

    if (opponentGames.length === 0) return;

    // Calculate detailed analysis
    const gameResults = opponentGames.map(game => {
      const gameStats = centralizedStats[game.id] || [];
      const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      return {
        game,
        ourScore,
        theirScore,
        result: getWinLoseLabel(ourScore, theirScore),
        margin: ourScore - theirScore,
        gameStats
      };
    });

    const wins = gameResults.filter(r => r.result === 'Win').length;
    const losses = gameResults.filter(r => r.result === 'Loss').length;
    const draws = gameResults.filter(r => r.result === 'Draw').length;
    const winRate = opponentGames.length > 0 ? (wins / opponentGames.length) * 100 : 0;

    const totalOurScore = gameResults.reduce((sum, r) => sum + r.ourScore, 0);
    const totalTheirScore = gameResults.reduce((sum, r) => sum + r.theirScore, 0);
    const ourAvg = opponentGames.length > 0 ? totalOurScore / opponentGames.length : 0;
    const theirAvg = opponentGames.length > 0 ? totalTheirScore / opponentGames.length : 0;

    // Quarter performance analysis
    const quarterPerformance: Record<number, any> = {};
    [1, 2, 3, 4].forEach(quarter => {
      const quarterData = gameResults.map(result => {
        const quarterStats = result.gameStats.filter(stat => stat.quarter === quarter);
        const ourQ = quarterStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const theirQ = quarterStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
        return { ourQ, theirQ };
      });

      const ourQAvg = quarterData.length > 0 ? quarterData.reduce((sum, d) => sum + d.ourQ, 0) / quarterData.length : 0;
      const theirQAvg = quarterData.length > 0 ? quarterData.reduce((sum, d) => sum + d.theirQ, 0) / quarterData.length : 0;

      quarterPerformance[quarter] = {
        ourAvg: ourQAvg,
        theirAvg: theirQAvg,
        margin: ourQAvg - theirQAvg
      };
    });

    // Generate insights
    const keyInsights: string[] = [];
    const tacticalNotes: string[] = [];

    if (winRate >= 70) {
      keyInsights.push("Strong historical performance - high confidence matchup");
    } else if (winRate <= 30) {
      keyInsights.push("Challenging opponent - requires strategic preparation");
    } else {
      keyInsights.push("Balanced matchup - execution will be key");
    }

    const bestQuarter = Object.entries(quarterPerformance).reduce((best, [q, data]) => 
      data.margin > best.margin ? { quarter: parseInt(q), margin: data.margin } : best
    , { quarter: 1, margin: -Infinity });

    const worstQuarter = Object.entries(quarterPerformance).reduce((worst, [q, data]) => 
      data.margin < worst.margin ? { quarter: parseInt(q), margin: data.margin } : worst
    , { quarter: 1, margin: Infinity });

    keyInsights.push(`Strongest in Q${bestQuarter.quarter} (+${bestQuarter.margin.toFixed(1)} avg margin)`);
    if (worstQuarter.margin < 0) {
      keyInsights.push(`Q${worstQuarter.quarter} needs focus (${worstQuarter.margin.toFixed(1)} avg margin)`);
    }

    tacticalNotes.push(`Average scoring: ${ourAvg.toFixed(1)} vs ${theirAvg.toFixed(1)}`);
    tacticalNotes.push(`${opponentGames.length} previous encounters analyzed`);

    const recentForm = gameResults
      .sort((a, b) => new Date(b.game.date).getTime() - new Date(a.game.date).getTime())
      .slice(0, 5)
      .map(r => r.result === 'Win' ? 'W' : r.result === 'Loss' ? 'L' : 'D');

    const lastGame = gameResults.sort((a, b) => new Date(b.game.date).getTime() - new Date(a.game.date).getTime())[0];

    const analysis: OpponentAnalysis = {
      teamId: opponentId,
      teamName: opponentGames[0].homeClubId === currentClubId ? opponentGames[0].awayTeamName : opponentGames[0].homeTeamName,
      clubName: opponentGames[0].homeClubId === currentClubId ? opponentGames[0].awayClubName : opponentGames[0].homeClubName,
      division: opponentGames[0].homeClubId === currentClubId ? opponentGames[0].awayTeamDivision : opponentGames[0].homeTeamDivision,
      gamesPlayed: opponentGames.length,
      ourRecord: { wins, losses, draws, winRate },
      avgScores: { ourAvg, theirAvg, margin: ourAvg - theirAvg },
      recentForm,
      lastPlayed: lastGame.game.date,
      quarterPerformance,
      keyInsights,
      tacticalNotes
    };

    setSelectedAnalysis(analysis);

    // Generate player recommendations
    generatePlayerRecommendations(opponentGames, opponentId);
    generateLineupRecommendations(opponentGames, opponentId);

  }, [selectedOpponent, centralizedStats, completedGames, currentClubId]);

  const generatePlayerRecommendations = (opponentGames: any[], opponentId: number) => {
    const playerPerformanceMap = new Map();

    opponentGames.forEach(game => {
      const gameStats = centralizedStats[game.id] || [];
      const gameRosters = centralizedRosters[game.id] || [];

      gameStats.forEach(stat => {
        const player = players.find(p => p.id === stat.playerId);
        if (!player) return;

        const key = `${stat.playerId}-${stat.position}`;
        if (!playerPerformanceMap.has(key)) {
          playerPerformanceMap.set(key, {
            playerId: stat.playerId,
            playerName: player.displayName,
            position: stat.position,
            games: [],
            totalPerformance: 0,
            gamesCount: 0
          });
        }

        const data = playerPerformanceMap.get(key);
        const performance = (stat.goalsFor || 0) - (stat.goalsAgainst || 0) + (stat.rating || 3);
        data.totalPerformance += performance;
        data.gamesCount++;
        data.games.push({ gameId: game.id, performance, stat });
      });
    });

    const recommendations: PlayerRecommendation[] = [];
    playerPerformanceMap.forEach(data => {
      const avgPerformance = data.gamesCount > 0 ? data.totalPerformance / data.gamesCount : 0;
      const successRate = data.games.filter((g: any) => g.performance > 3).length / data.gamesCount * 100;
      
      let recommendation: PlayerRecommendation['recommendation'] = 'consider';
      const keyStrengths: string[] = [];

      if (avgPerformance >= 5 && successRate >= 70) {
        recommendation = 'strongly-recommended';
        keyStrengths.push('Consistent high performer vs this opponent');
      } else if (avgPerformance >= 4 && successRate >= 50) {
        recommendation = 'recommended';
        keyStrengths.push('Solid track record');
      } else if (avgPerformance < 3 || successRate < 30) {
        recommendation = 'caution';
        keyStrengths.push('Has struggled against this opponent');
      }

      if (data.gamesCount >= 3) {
        keyStrengths.push('Extensive experience vs opponent');
      }

      recommendations.push({
        playerId: data.playerId,
        playerName: data.playerName,
        position: data.position,
        avgPerformance,
        gamesAgainstOpponent: data.gamesCount,
        successRate,
        keyStrengths,
        recommendation
      });
    });

    setPlayerRecommendations(recommendations.sort((a, b) => b.avgPerformance - a.avgPerformance));
  };

  const generateLineupRecommendations = (opponentGames: any[], opponentId: number) => {
    // Analyze successful lineups from previous games
    const successfulLineups: LineupRecommendation[] = [];

    opponentGames.forEach(game => {
      const gameStats = centralizedStats[game.id] || [];
      const gameRosters = centralizedRosters[game.id] || [];
      
      const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      const wasSuccessful = getWinLoseLabel(ourScore, theirScore) === 'Win';

      if (wasSuccessful && gameRosters.length > 0) {
        // Group rosters by quarter to find consistent lineups
        const quarterLineups = new Map();
        gameRosters.forEach(roster => {
          if (!quarterLineups.has(roster.quarter)) {
            quarterLineups.set(roster.quarter, {});
          }
          const player = players.find(p => p.id === roster.playerId);
          if (player) {
            quarterLineups.get(roster.quarter)[roster.position] = {
              playerId: roster.playerId,
              playerName: player.displayName,
              confidence: 85 // High confidence for successful lineups
            };
          }
        });

        quarterLineups.forEach((lineup, quarter) => {
          const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];
          const isCompleteLineup = positions.every(pos => lineup[pos]);
          
          if (isCompleteLineup) {
            successfulLineups.push({
              id: `game-${game.id}-q${quarter}`,
              positions: lineup,
              overallStrength: 85,
              reasoning: [
                `Successful lineup from ${formatShortDate(game.date)}`,
                `Won by ${ourScore - theirScore} goals`,
                `Proven combination vs this opponent`
              ],
              vsOpponentSuccess: 100,
              riskFactors: []
            });
          }
        });
      }
    });

    // Generate optimized recommendations based on player performance
    const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];
    const bestByPosition = new Map();

    positions.forEach(position => {
      const positionPlayers = playerRecommendations
        .filter(p => p.position === position)
        .sort((a, b) => b.avgPerformance - a.avgPerformance);
      
      if (positionPlayers.length > 0) {
        bestByPosition.set(position, positionPlayers[0]);
      }
    });

    if (bestByPosition.size === 7) {
      const optimizedLineup: LineupRecommendation = {
        id: 'optimized-recommendation',
        positions: {},
        overallStrength: 0,
        reasoning: [
          'Data-driven optimal lineup',
          'Based on historical performance vs this opponent',
          'Highest success probability'
        ],
        vsOpponentSuccess: 0,
        riskFactors: []
      };

      let totalStrength = 0;
      let totalSuccess = 0;

      positions.forEach(position => {
        const player = bestByPosition.get(position);
        if (player) {
          optimizedLineup.positions[position] = {
            playerId: player.playerId,
            playerName: player.playerName,
            confidence: Math.round(player.successRate)
          };
          totalStrength += player.avgPerformance;
          totalSuccess += player.successRate;
        }
      });

      optimizedLineup.overallStrength = Math.round(totalStrength / 7 * 20); // Scale to 100
      optimizedLineup.vsOpponentSuccess = Math.round(totalSuccess / 7);

      // Add risk factors
      const lowConfidencePlayers = Object.values(optimizedLineup.positions).filter(p => p.confidence < 50);
      if (lowConfidencePlayers.length > 0) {
        optimizedLineup.riskFactors.push(`${lowConfidencePlayers.length} players with limited success vs this opponent`);
      }

      successfulLineups.unshift(optimizedLineup);
    }

    setLineupRecommendations(successfulLineups.slice(0, 3)); // Top 3 recommendations
  };

  if (clubLoading || !currentClubId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingGames || isLoadingStats || isLoadingRosters || isLoadingPlayers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Preparation Analysis</h2>
          <p className="text-muted-foreground">Analyzing game data and generating recommendations...</p>
        </div>
      </div>
    );
  }

  const nextGame = upcomingGames.find(g => g.isNextGame);

  return (
    <>
      <Helmet>
        <title>Game Preparation | {currentClub?.name} Stats Tracker</title>
        <meta name="description" content={`Comprehensive game preparation and tactical analysis`} />
      </Helmet>

      <div className="container py-6 mx-auto space-y-6">
        {/* Header with Next Game Highlight */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold text-neutral-dark">
              Game Preparation
            </h1>
            <p className="text-lg text-gray-600">
              Tactical analysis and team recommendations
              {currentTeamId && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {currentClub?.name} - Selected Team
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TeamSwitcher mode="required" />
          </div>
        </div>

        {/* Next Game Alert */}
        {nextGame && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Next Game</h3>
                      <p className="text-sm text-blue-700">
                        vs {nextGame.opponent} • {formatShortDate(nextGame.date)} at {nextGame.time}
                      </p>
                    </div>
                  </div>
                  {selectedAnalysis && (
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedAnalysis.ourRecord.winRate >= 60 ? "default" : selectedAnalysis.ourRecord.winRate >= 40 ? "secondary" : "destructive"}>
                        {selectedAnalysis.ourRecord.winRate.toFixed(0)}% Win Rate
                      </Badge>
                      <div className="flex gap-1">
                        {selectedAnalysis.recentForm.slice(0, 3).map((result, index) => (
                          <ResultBadge key={index} result={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'} size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFilterMode('next-game');
                    if (nextGame) setSelectedOpponent(nextGame.opponentId.toString());
                  }}
                >
                  Focus on Next Game
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opponent Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Select Opponent for Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Select value={filterMode} onValueChange={(value: 'next-game' | 'all-opponents') => setFilterMode(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next-game">Next Game Focus</SelectItem>
                  <SelectItem value="all-opponents">All Opponents</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select opponent to analyze..." />
                </SelectTrigger>
                <SelectContent>
                  {filterMode === 'next-game' ? (
                    upcomingGames.map(game => (
                      <SelectItem key={game.opponentId} value={game.opponentId.toString()}>
                        {game.opponent} - {formatShortDate(game.date)} {game.isNextGame && '(Next Game)'}
                      </SelectItem>
                    ))
                  ) : (
                    // Show all opponents from completed games
                    Array.from(new Set(completedGames.map(game => {
                      const isHome = game.homeClubId === currentClubId;
                      const isAway = game.awayClubId === currentClubId;
                      if (isHome && isAway) return null;
                      return isHome ? game.awayTeamId : game.homeTeamId;
                    }).filter(Boolean))).map(opponentId => {
                      const game = completedGames.find(g => {
                        const isHome = g.homeClubId === currentClubId;
                        const oppId = isHome ? g.awayTeamId : g.homeTeamId;
                        return oppId === opponentId;
                      });
                      const opponentName = game ? (game.homeClubId === currentClubId ? game.awayTeamName : game.homeTeamName) : `Team ${opponentId}`;
                      
                      return (
                        <SelectItem key={opponentId} value={opponentId.toString()}>
                          {opponentName}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Content */}
        {selectedAnalysis && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tactical">Tactical Analysis</TabsTrigger>
              <TabsTrigger value="players">Player Recommendations</TabsTrigger>
              <TabsTrigger value="lineups">Lineup Suggestions</TabsTrigger>
              <TabsTrigger value="preparation">Game Plan</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Head-to-Head Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>vs {selectedAnalysis.teamName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-2xl font-bold">
                          {selectedAnalysis.ourRecord.wins}-{selectedAnalysis.ourRecord.losses}
                          {selectedAnalysis.ourRecord.draws > 0 && `-${selectedAnalysis.ourRecord.draws}`}
                        </div>
                        <p className="text-sm text-gray-600">Historical Record</p>
                      </div>
                      
                      <div>
                        <Progress value={selectedAnalysis.ourRecord.winRate} className="h-2" />
                        <p className="text-sm mt-1">{selectedAnalysis.ourRecord.winRate.toFixed(1)}% Win Rate</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm">Recent Form:</span>
                        <div className="flex gap-1">
                          {selectedAnalysis.recentForm.map((result, index) => (
                            <ResultBadge key={index} result={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'} size="sm" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scoring Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scoring Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Our Average:</span>
                        <span className="font-bold">{selectedAnalysis.avgScores.ourAvg.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Their Average:</span>
                        <span className="font-bold">{selectedAnalysis.avgScores.theirAvg.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Average Margin:</span>
                        <span className={`font-bold ${selectedAnalysis.avgScores.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedAnalysis.avgScores.margin >= 0 ? '+' : ''}{selectedAnalysis.avgScores.margin.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedAnalysis.keyInsights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tactical Analysis Tab */}
            <TabsContent value="tactical" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quarter Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quarter Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(selectedAnalysis.quarterPerformance).map(([quarter, data]) => (
                        <div key={quarter} className="p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Quarter {quarter}</span>
                            <span className={`font-bold ${data.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.margin >= 0 ? '+' : ''}{data.margin.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {data.ourAvg.toFixed(1)} - {data.theirAvg.toFixed(1)} (avg scores)
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tactical Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Tactical Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedAnalysis.tacticalNotes.map((note, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Player Recommendations Tab */}
            <TabsContent value="players" className="space-y-6">
              <div className="grid gap-4">
                {['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'].map(position => {
                  const positionPlayers = playerRecommendations.filter(p => p.position === position);
                  
                  return (
                    <Card key={position}>
                      <CardHeader>
                        <CardTitle className="text-lg">{position} Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {positionPlayers.length === 0 ? (
                          <p className="text-gray-500 text-sm">No data available for this position</p>
                        ) : (
                          <div className="space-y-3">
                            {positionPlayers.slice(0, 3).map(player => (
                              <div key={`${player.playerId}-${position}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <h4 className="font-medium">{player.playerName}</h4>
                                    <p className="text-sm text-gray-600">{player.gamesAgainstOpponent} games vs opponent</p>
                                  </div>
                                  <Badge variant={
                                    player.recommendation === 'strongly-recommended' ? 'default' :
                                    player.recommendation === 'recommended' ? 'secondary' :
                                    player.recommendation === 'consider' ? 'outline' : 'destructive'
                                  }>
                                    {player.recommendation === 'strongly-recommended' ? 'Highly Recommended' :
                                     player.recommendation === 'recommended' ? 'Recommended' :
                                     player.recommendation === 'consider' ? 'Consider' : 'Caution'}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{player.successRate.toFixed(0)}%</div>
                                  <div className="text-sm text-gray-600">Success Rate</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Lineup Suggestions Tab */}
            <TabsContent value="lineups" className="space-y-6">
              <div className="grid gap-6">
                {lineupRecommendations.map((lineup, index) => (
                  <Card key={lineup.id} className={index === 0 ? 'border-l-4 border-l-green-500' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {index === 0 && <Star className="h-5 w-5 text-green-600" />}
                          Lineup Recommendation {index + 1}
                          {index === 0 && <Badge>Recommended</Badge>}
                        </CardTitle>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{lineup.overallStrength}%</div>
                          <div className="text-sm text-gray-600">Confidence</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Court Layout */}
                        <div>
                          <h4 className="font-medium mb-3">Suggested Lineup</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                              const player = lineup.positions[position];
                              return (
                                <div key={position} className="flex items-center justify-between p-2 rounded bg-gray-50">
                                  <span className="font-medium w-8">{position}</span>
                                  <span className="flex-1 text-center">{player?.playerName || 'TBD'}</span>
                                  <span className="text-sm text-gray-600 w-12 text-right">
                                    {player ? `${player.confidence}%` : ''}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Reasoning and Risk Factors */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Reasoning</h4>
                            <ul className="space-y-1">
                              {lineup.reasoning.map((reason, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {lineup.riskFactors.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Risk Factors</h4>
                              <ul className="space-y-1">
                                {lineup.riskFactors.map((risk, i) => (
                                  <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    {risk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Game Plan Tab */}
            <TabsContent value="preparation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Game Plan Summary vs {selectedAnalysis.teamName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Strategic Focus Areas</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>Historical win rate: {selectedAnalysis.ourRecord.winRate.toFixed(0)}% - {
                            selectedAnalysis.ourRecord.winRate >= 60 ? 'confident approach' :
                            selectedAnalysis.ourRecord.winRate >= 40 ? 'balanced strategy needed' :
                            'defensive preparation required'
                          }</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>Average margin: {selectedAnalysis.avgScores.margin >= 0 ? '+' : ''}{selectedAnalysis.avgScores.margin.toFixed(1)} - {
                            Math.abs(selectedAnalysis.avgScores.margin) > 5 ? 'expect significant margin' : 'close game likely'
                          }</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>Last played: {formatShortDate(selectedAnalysis.lastPlayed)} - review game notes</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Pre-Game Checklist</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Review recommended lineup and substitution options</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Brief players on opponent strengths and weaknesses</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Plan quarter-specific strategies based on historical performance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Prepare for tactical adjustments during timeouts</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* No Selection State */}
        {!selectedAnalysis && (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select an Opponent to Begin Analysis</h3>
              <p className="text-gray-600">
                Choose an opponent from the dropdown above to see detailed analysis, player recommendations, and tactical insights.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
