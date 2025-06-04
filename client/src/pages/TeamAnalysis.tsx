import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { Loader2, TrendingUp, Target, Award, BarChart3, TrendingDown, Zap, Users, ArrowLeft } from 'lucide-react';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { getWinLoseLabel } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface OpponentTeamData {
  teamId: number;
  teamName: string;
  clubName: string;
  division: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgScoreFor: number;
  avgScoreAgainst: number;
  scoreDifferential: number;
  recentForm: string[];
}

interface PerformanceMetrics {
  momentum: {
    trend: 'up' | 'down' | 'stable';
    strength: number;
    recentForm: string[];
  };
  positionEfficiency: Record<string, {
    quarter1: number;
    quarter2: number;
    quarter3: number;
    quarter4: number;
    overall: number;
  }>;
  comebackPotential: {
    deficitRecoveries: number;
    totalDeficits: number;
    recoveryRate: number;
    avgDeficitSize: number;
  };
  teamPerformanceMatrix: Record<string, {
    wins: number;
    total: number;
    avgScore: number;
    winRate: number;
  }>;
}

interface DetailedStats {
  quarterAnalysis: {
    byQuarter: Record<number, {
      avgTeamScore: number;
      avgOpponentScore: number;
      gamesPlayed: number;
    }>;
    strongestQuarter: number;
    weakestQuarter: number;
  };
  scoringTrends: {
    homeAdvantage: number;
    awayRecord: { wins: number; total: number };
    homeRecord: { wins: number; total: number };
  };
}

const calculateQuarterAnalysis = (gameResults: any[]) => {
  const quarterData: Record<number, { teamScores: number[]; opponentScores: number[] }> = {
    1: { teamScores: [], opponentScores: [] },
    2: { teamScores: [], opponentScores: [] },
    3: { teamScores: [], opponentScores: [] },
    4: { teamScores: [], opponentScores: [] }
  };

  gameResults.forEach(result => {
    if (result.gameStats && result.gameStats.length > 0) {
      [1, 2, 3, 4].forEach(quarter => {
        const quarterStats = result.gameStats.filter((stat: any) => stat.quarter === quarter);
        const teamScore = quarterStats.reduce((sum: number, stat: any) => sum + (stat.goalsFor || 0), 0);
        const opponentScore = quarterStats.reduce((sum: number, stat: any) => sum + (stat.goalsAgainst || 0), 0);

        quarterData[quarter].teamScores.push(teamScore);
        quarterData[quarter].opponentScores.push(opponentScore);
      });
    }
  });

  const byQuarter: Record<number, any> = {};
  let strongestQuarter = 1;
  let weakestQuarter = 1;
  let bestDifferential = -Infinity;
  let worstDifferential = Infinity;

  [1, 2, 3, 4].forEach(quarter => {
    const data = quarterData[quarter];
    const avgTeamScore = data.teamScores.length > 0 
      ? data.teamScores.reduce((a, b) => a + b, 0) / data.teamScores.length 
      : 0;
    const avgOpponentScore = data.opponentScores.length > 0 
      ? data.opponentScores.reduce((a, b) => a + b, 0) / data.opponentScores.length 
      : 0;

    const differential = avgTeamScore - avgOpponentScore;

    if (differential > bestDifferential) {
      bestDifferential = differential;
      strongestQuarter = quarter;
    }

    if (differential < worstDifferential) {
      worstDifferential = differential;
      weakestQuarter = quarter;
    }

    byQuarter[quarter] = {
      avgTeamScore: Math.round(avgTeamScore * 10) / 10,
      avgOpponentScore: Math.round(avgOpponentScore * 10) / 10,
      gamesPlayed: data.teamScores.length
    };
  });

  return { byQuarter, strongestQuarter, weakestQuarter };
};

const calculateScoringTrends = (gameResults: any[], currentClubId: number) => {
  const homeGames = gameResults.filter(r => r.game.homeClubId === currentClubId);
  const awayGames = gameResults.filter(r => r.game.awayClubId === currentClubId);

  const homeWins = homeGames.filter(g => g.result === 'Win').length;
  const awayWins = awayGames.filter(g => g.result === 'Win').length;

  const homeAdvantage = homeGames.length > 0 ? (homeWins / homeGames.length) * 100 : 0;

  return {
    homeAdvantage: Math.round(homeAdvantage),
    homeRecord: { wins: homeWins, total: homeGames.length },
    awayRecord: { wins: awayWins, total: awayGames.length }
  };
};

export default function TeamAnalysis() {
  const { currentClub, currentClubId, isLoading: clubLoading } = useClub();
  const [, navigate] = useLocation();

  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['games', currentClubId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId,
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<any[]>({
    queryKey: ['teams-all', currentClubId],
    queryFn: () => apiClient.get('/api/teams/all'),
    enabled: !!currentClubId,
  });

  const { data: opponents = [], isLoading: isLoadingOpponents } = useQuery<any[]>({
    queryKey: ['opponents', currentClubId],
    queryFn: () => apiClient.get('/api/opponents'),
    enabled: !!currentClubId,
  });

  // Get completed games for stats
  const completedGames = games.filter(game => game.statusIsCompleted && game.statusAllowsStatistics);
  const gameIds = completedGames.map(game => game.id);

  // Fetch batch statistics for all completed games
  const { statsMap: centralizedStats = {}, isLoading: isLoadingStats } = useBatchGameStatistics(gameIds);

  const [analytics, setAnalytics] = useState<PerformanceMetrics>({
    momentum: { trend: 'stable', strength: 0, recentForm: [] },
    positionEfficiency: {},
    comebackPotential: { deficitRecoveries: 0, totalDeficits: 0, recoveryRate: 0, avgDeficitSize: 0 },
    teamPerformanceMatrix: {}
  });

  // Helper function to calculate momentum
  const calculateMomentum = (results: string[]) => {
    if (results.length === 0) return { trend: 'stable' as const, strength: 0, recentForm: [] };

    const winWeight = 3;
    const drawWeight = 1;
    const lossWeight = -2;

    let momentum = 0;
    results.forEach((result, index) => {
      const weight = (index + 1) / results.length; // More recent games have higher weight
      if (result === 'Win') momentum += winWeight * weight;
      else if (result === 'Draw') momentum += drawWeight * weight;
      else momentum += lossWeight * weight;
    });

    const trend = momentum > 1 ? 'up' : momentum < -1 ? 'down' : 'stable';

    return {
      trend,
      strength: Math.abs(momentum),
      recentForm: results
    };
  };

  // Calculate advanced analytics (moved above conditional returns)
  // useEffect moved above to fix hooks order
  useEffect(() => {
    if (!centralizedStats || Object.keys(centralizedStats).length === 0) return;

    // 1. Performance Momentum Analysis
    const recentGames = completedGames
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-5); // Last 5 games

    const recentResults = recentGames.map(game => {
      const gameStats = centralizedStats[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      return getWinLoseLabel(teamScore, opponentScore);
    });

    const momentum = calculateMomentum(recentResults);

    // 2. Position Efficiency Analysis
    const positionStats: Record<string, any> = {};
    const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];

    positions.forEach(position => {
      positionStats[position] = {
        quarter1: 0, quarter2: 0, quarter3: 0, quarter4: 0,
        quarter1Count: 0, quarter2Count: 0, quarter3Count: 0, quarter4Count: 0
      };
    });

    Object.values(centralizedStats).forEach(gameStats => {
      gameStats.forEach(stat => {
        if (stat.position && positions.includes(stat.position)) {
          const quarter = `quarter${stat.quarter}`;
          const countKey = `${quarter}Count`;

          if (positionStats[stat.position][quarter] !== undefined) {
            // Calculate efficiency as goals scored minus goals conceded
            const efficiency = (stat.goalsFor || 0) - (stat.goalsAgainst || 0);
            positionStats[stat.position][quarter] += efficiency;
            positionStats[stat.position][countKey]++;
          }
        }
      });
    });

    // Calculate averages and overall efficiency
    const positionEfficiency: Record<string, any> = {};
    positions.forEach(position => {
      const stats = positionStats[position];
      positionEfficiency[position] = {
        quarter1: stats.quarter1Count > 0 ? stats.quarter1 / stats.quarter1Count : 0,
        quarter2: stats.quarter2Count > 0 ? stats.quarter2 / stats.quarter2Count : 0,
        quarter3: stats.quarter3Count > 0 ? stats.quarter3 / stats.quarter3Count : 0,
        quarter4: stats.quarter4Count > 0 ? stats.quarter4 / stats.quarter4Count : 0,
        overall: 0
      };

      const totalQuarters = [1, 2, 3, 4].filter(q => stats[`quarter${q}Count`] > 0).length;
      if (totalQuarters > 0) {
        positionEfficiency[position].overall = 
          (positionEfficiency[position].quarter1 + 
           positionEfficiency[position].quarter2 + 
           positionEfficiency[position].quarter3 + 
           positionEfficiency[position].quarter4) / totalQuarters;
      }
    });

    // 3. Comeback Potential Analysis
    let deficitRecoveries = 0;
    let totalDeficits = 0;
    let totalDeficitSize = 0;

    completedGames.forEach(game => {
      const gameStats = centralizedStats[game.id] || [];
      const quarterScores = { team: [0, 0, 0, 0], opponent: [0, 0, 0, 0] };

      gameStats.forEach(stat => {
        if (stat.quarter >= 1 && stat.quarter <= 4) {
          quarterScores.team[stat.quarter - 1] += stat.goalsFor || 0;
          quarterScores.opponent[stat.quarter - 1] += stat.goalsAgainst || 0;
        }
      });

      // Check for deficit situations and recoveries
      for (let q = 0; q < 3; q++) {
        const teamRunning = quarterScores.team.slice(0, q + 1).reduce((a, b) => a + b, 0);
        const opponentRunning = quarterScores.opponent.slice(0, q + 1).reduce((a, b) => a + b, 0);

        if (teamRunning < opponentRunning) {
          totalDeficits++;
          totalDeficitSize += (opponentRunning - teamRunning);

          // Check if they recovered by game end
          const finalTeam = quarterScores.team.reduce((a, b) => a + b, 0);
          const finalOpponent = quarterScores.opponent.reduce((a, b) => a + b, 0);

          if (finalTeam >= finalOpponent) {
            deficitRecoveries++;
          }
        }
      }
    });

    const comebackPotential = {
      deficitRecoveries,
      totalDeficits,
      recoveryRate: totalDeficits > 0 ? (deficitRecoveries / totalDeficits) * 100 : 0,
      avgDeficitSize: totalDeficits > 0 ? totalDeficitSize / totalDeficits : 0
    };

    // 4. Team Performance Matrix (all teams, not categorized)
    const teamPerformanceMatrix: Record<string, any> = {};

    completedGames.forEach(game => {
      const opponent = opponents.find(o => o.id === game.opponentId);
      const gameStats = centralizedStats[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

      const opponentName = opponent ? opponent.teamName : (
        game.homeClubId === currentClubId ? game.awayTeamName : game.homeTeamName
      );

      if (!teamPerformanceMatrix[opponentName]) {
        teamPerformanceMatrix[opponentName] = {
          wins: 0,
          total: 0,
          totalScore: 0
        };
      }

      teamPerformanceMatrix[opponentName].total++;
      teamPerformanceMatrix[opponentName].totalScore += teamScore;

      if (getWinLoseLabel(teamScore, opponentScore) === 'Win') {
        teamPerformanceMatrix[opponentName].wins++;
      }
    });

    // Calculate averages and win rates
    const finalTeamMatrix: Record<string, any> = {};
    Object.keys(teamPerformanceMatrix).forEach(teamName => {
      const data = teamPerformanceMatrix[teamName];
      finalTeamMatrix[teamName] = {
        wins: data.wins,
        total: data.total,
        avgScore: data.total > 0 ? data.totalScore / data.total : 0,
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0
      };
    });

    setAnalytics({
      momentum,
      positionEfficiency,
      comebackPotential,
      teamPerformanceMatrix: finalTeamMatrix
    });

  }, [centralizedStats, completedGames, opponents, currentClubId]);

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

  const isLoading = isLoadingGames || isLoadingStats || isLoadingTeams || isLoadingOpponents;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Team Analysis</h2>
          <p className="text-muted-foreground">Analyzing matchups and performance data...</p>
        </div>
      </div>
    );
  }


  // Calculate opponent team data
  const opponentTeamsData: OpponentTeamData[] = [];
  const processedTeams = new Set<number>();

  completedGames.forEach(game => {
    // Determine which team is the opponent (not from our club)
    const isHomeGame = game.homeClubId === currentClubId;
    const opponentTeamId = isHomeGame ? game.awayTeamId : game.homeTeamId;
    const opponentTeamName = isHomeGame ? game.awayTeamName : game.homeTeamName;
    const opponentClubName = isHomeGame ? game.awayClubName : game.homeClubName;
    const opponentDivision = isHomeGame ? game.awayTeamDivision : game.homeTeamDivision;

    if (!processedTeams.has(opponentTeamId)) {
      processedTeams.add(opponentTeamId);

      // Get all games against this opponent
      const gamesVsOpponent = completedGames.filter(g => {
        const isHome = g.homeClubId === currentClubId;
        const oppId = isHome ? g.awayTeamId : g.homeTeamId;
        return oppId === opponentTeamId;
      });

      if (gamesVsOpponent.length > 0) {
        // Calculate stats using centralized statistics
        let wins = 0;
        let losses = 0;
        let draws = 0;
        let totalScoreFor = 0;
        let totalScoreAgainst = 0;
        const recentForm: string[] = [];

        const gameResults = gamesVsOpponent.map(g => {
          const isHome = g.homeClubId === currentClubId;
          const gameStats = centralizedStats[g.id] || [];

          // Calculate scores from game statistics
          let ourScore = 0;
          let theirScore = 0;

          if (gameStats.length > 0) {
            gameStats.forEach(stat => {
              ourScore += stat.goalsFor || 0;
              theirScore += stat.goalsAgainst || 0;
            });
          } else {
            // Fallback to game status scores if no stats available
            ourScore = isHome ? (g.statusTeamGoals || 0) : (g.statusOpponentGoals || 0);
            theirScore = isHome ? (g.statusOpponentGoals || 0) : (g.statusTeamGoals || 0);
          }

          totalScoreFor += ourScore;
          totalScoreAgainst += theirScore;

          const result = getWinLoseLabel(ourScore, theirScore);

          if (result === 'Win') {
            wins++;
            recentForm.push('W');
          } else if (result === 'Loss') {
            losses++;
            recentForm.push('L');
          } else {
            draws++;
            recentForm.push('D');
          }

          return {
            game: g,
            teamScore: ourScore,
            opponentScore: theirScore,
            result,
            margin: ourScore - theirScore,
            gameStats
          };
        });

        const totalGamesVsOpponent = gamesVsOpponent.length;

        opponentTeamsData.push({
          teamId: opponentTeamId,
          teamName: opponentTeamName,
          clubName: opponentClubName,
          division: opponentDivision || '',
          totalGames: totalGamesVsOpponent,
          wins,
          losses,
          draws,
          winRate: totalGamesVsOpponent > 0 ? (wins / totalGamesVsOpponent) * 100 : 0,
          avgScoreFor: totalGamesVsOpponent > 0 ? totalScoreFor / totalGamesVsOpponent : 0,
          avgScoreAgainst: totalGamesVsOpponent > 0 ? totalScoreAgainst / totalGamesVsOpponent : 0,
          scoreDifferential: totalGamesVsOpponent > 0 ? (totalScoreFor - totalScoreAgainst) / totalGamesVsOpponent : 0,
          recentForm: recentForm.slice(-5) // Last 5 games
        });
      }
    }
  });

  // Sort by total games played (most frequent opponents first)
  opponentTeamsData.sort((a, b) => b.totalGames - a.totalGames);

  // Calculate overall stats
  const totalGamesPlayed = completedGames.length;
  const totalWins = opponentTeamsData.reduce((sum, team) => sum + team.wins, 0);
  const totalLosses = opponentTeamsData.reduce((sum, team) => sum + team.losses, 0);
  const totalDraws = opponentTeamsData.reduce((sum, team) => sum + team.draws, 0);
  const overallWinRate = totalGamesPlayed > 0 ? (totalWins / totalGamesPlayed) * 100 : 0;

  // Calculate detailed analytics for the first opponent (most played against)
  const selectedOpponentData = opponentTeamsData[0];
  let detailedStats: DetailedStats | null = null;

  if (selectedOpponentData) {
    const opponentGames = completedGames.filter(g => {
      const isHome = g.homeClubId === currentClubId;
      const oppId = isHome ? g.awayTeamId : g.homeTeamId;
      return oppId === selectedOpponentData.teamId;
    });

    const gameResults = opponentGames.map(g => {
      const isHome = g.homeClubId === currentClubId;
      const gameStats = centralizedStats[g.id] || [];

      let ourScore = 0;
      let theirScore = 0;

      if (gameStats.length > 0) {
        gameStats.forEach(stat => {
          ourScore += stat.goalsFor || 0;
          theirScore += stat.goalsAgainst || 0;
        });
      } else {
        ourScore = isHome ? (g.statusTeamGoals || 0) : (g.statusOpponentGoals || 0);
        theirScore = isHome ? (g.statusOpponentGoals || 0) : (g.statusTeamGoals || 0);
      }

      return {
        game: g,
        teamScore: ourScore,
        opponentScore: theirScore,
        result: getWinLoseLabel(ourScore, theirScore),
        margin: ourScore - theirScore,
        gameStats
      };
    });

    const quarterAnalysis = calculateQuarterAnalysis(gameResults);
    const scoringTrends = calculateScoringTrends(gameResults, currentClubId);

    detailedStats = {
      quarterAnalysis,
      scoringTrends
    };
  }

  const getFormBadgeColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-500 text-white';
      case 'L': return 'bg-red-500 text-white';
      case 'D': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      <Helmet>
        <title>Team Analysis | {currentClub?.name} Stats Tracker</title>
        <meta name="description" content={`Detailed analysis of ${currentClub?.name} performance against opposing teams`} />
      </Helmet>

      <div className="container py-6 mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold text-neutral-dark">
              Team Analysis
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive performance analysis and advanced team metrics
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGamesPlayed}</div>
              <p className="text-xs text-muted-foreground">
                Completed matches analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallWinRate.toFixed(1)}%</div>
              <Progress value={overallWinRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {totalWins}W - {totalLosses}L - {totalDraws}D
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opponents Faced</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{opponentTeamsData.length}</div>
              <p className="text-xs text-muted-foreground">
                Different teams
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalGamesPlayed > 0 ? 
                  Math.round((opponentTeamsData.reduce((sum, team) => sum + (team.avgScoreFor * team.totalGames), 0) / totalGamesPlayed) * 10) / 10 : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Average goals per game
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Performance Momentum Tracker */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {analytics.momentum.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : analytics.momentum.trend === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <Zap className="h-5 w-5 text-yellow-600" />
                )}
                Performance Momentum
                <Badge variant={
                  analytics.momentum.trend === 'up' ? 'default' : 
                  analytics.momentum.trend === 'down' ? 'destructive' : 'secondary'
                }>
                  {analytics.momentum.trend.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {analytics.momentum.recentForm.map((result, index) => (
                    <div
                      key={index}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        result === 'Win' ? 'bg-green-500' :
                        result === 'Draw' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    >
                      {result[0]}
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-700">
                    {analytics.momentum.strength.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Momentum Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comeback Potential */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Comeback Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-700">
                    {analytics.comebackPotential.recoveryRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Recovery Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-700">
                    {analytics.comebackPotential.deficitRecoveries}
                  </div>
                  <div className="text-sm text-gray-600">Successful Comebacks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-700">
                    {analytics.comebackPotential.avgDeficitSize.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Deficit Size</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Position Efficiency Heatmap */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Position Efficiency Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 mb-2">
              <div></div>
              {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
                <div key={quarter} className="text-center text-sm font-medium text-gray-600">
                  {quarter}
                </div>
              ))}
            </div>

            {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => (
              <div key={position} className="grid grid-cols-5 gap-2 mb-2">
                <div className="text-sm font-medium text-gray-700 flex items-center">
                  {position}
                </div>
                {[1, 2, 3, 4].map(quarter => {
                  const efficiency = analytics.positionEfficiency[position]?.[`quarter${quarter}`] || 0;
                  const intensity = Math.min(1, Math.max(0.1, Math.abs(efficiency) / 2));
                  const color = efficiency > 0 ? 'bg-green-500' : efficiency < 0 ? 'bg-red-500' : 'bg-gray-300';

                  return (
                    <div
                      key={quarter}
                      className={`h-10 ${color} rounded flex items-center justify-center text-sm font-bold text-white`}
                      style={{ opacity: intensity }}
                    >
                      {efficiency > 0 ? '+' : ''}{efficiency.toFixed(1)}
                    </div>
                  );
                })}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Performance vs All Opponents */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Performance vs All Opponents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.keys(analytics.teamPerformanceMatrix).length === 0 ? (
                <p className="text-center text-gray-500 py-4">No opponent data available</p>
              ) : (
                Object.entries(analytics.teamPerformanceMatrix)
                  .sort(([,a], [,b]) => b.total - a.total)
                  .map(([teamName, data]) => (
                    <div key={teamName} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 min-w-[150px]">
                        {teamName}
                      </span>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${data.winRate}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <div className="text-sm font-bold text-gray-700">
                          {data.wins}/{data.total} ({data.winRate.toFixed(0)}%)
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg: {data.avgScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Played Opponent Analysis */}
        {selectedOpponentData && detailedStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Detailed Analysis vs {selectedOpponentData.teamName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quarter Performance Analysis */}
              <div>
                <h4 className="font-semibold mb-3">Quarter Performance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(quarter => {
                    const qData = detailedStats.quarterAnalysis.byQuarter[quarter];
                    const diff = qData.avgTeamScore - qData.avgOpponentScore;
                    const isStrongest = quarter === detailedStats.quarterAnalysis.strongestQuarter;
                    const isWeakest = quarter === detailedStats.quarterAnalysis.weakestQuarter;

                    return (
                      <div key={quarter} className={`p-3 rounded-lg border-2 ${isStrongest ? 'border-green-500 bg-green-50' : isWeakest ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600">Q{quarter}</div>
                          <div className="text-lg font-bold">
                            {qData.avgTeamScore} - {qData.avgOpponentScore}
                          </div>
                          <div className={`text-sm ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                          </div>
                          {isStrongest && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Strongest</Badge>}
                          {isWeakest && <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">Weakest</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Home vs Away Performance */}
              <div>
                <h4 className="font-semibold mb-3">Home vs Away Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{detailedStats.scoringTrends.homeRecord.wins}-{detailedStats.scoringTrends.homeRecord.total - detailedStats.scoringTrends.homeRecord.wins}</div>
                      <div className="text-sm text-blue-700">Home Record</div>
                      <div className="text-xs text-blue-600">
                        {detailedStats.scoringTrends.homeRecord.total > 0 ? 
                          Math.round((detailedStats.scoringTrends.homeRecord.wins / detailedStats.scoringTrends.homeRecord.total) * 100) : 0}% Win Rate
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{detailedStats.scoringTrends.awayRecord.wins}-{detailedStats.scoringTrends.awayRecord.total - detailedStats.scoringTrends.awayRecord.wins}</div>
                      <div className="text-sm text-orange-700">Away Record</div>
                      <div className="text-xs text-orange-600">
                        {detailedStats.scoringTrends.awayRecord.total > 0 ? 
                          Math.round((detailedStats.scoringTrends.awayRecord.wins / detailedStats.scoringTrends.awayRecord.total) * 100) : 0}% Win Rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Opponents Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Opponents Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {opponentTeamsData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No completed games found.</p>
                <p className="text-sm mt-2">Performance data will appear here after games are completed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {opponentTeamsData.map((opponent) => (
                  <div key={opponent.teamId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{opponent.teamName}</h3>
                        <p className="text-sm text-gray-600">{opponent.clubName}</p>
                        {opponent.division && <p className="text-xs text-gray-500">{opponent.division}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {opponent.wins}-{opponent.losses}
                          {opponent.draws > 0 && `-${opponent.draws}`}
                        </div>
                        <div className="text-sm text-gray-600">W-L{opponent.draws > 0 ? '-D' : ''} Record</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{opponent.totalGames}</div>
                        <div className="text-xs text-gray-600">Games</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{opponent.winRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{opponent.avgScoreFor.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Avg For</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{opponent.avgScoreAgainst.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Avg Against</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${opponent.scoreDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {opponent.scoreDifferential >= 0 ? '+' : ''}{opponent.scoreDifferential.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600">Score Diff</div>
                      </div>
                      <div className="text-center">
                        <Progress value={opponent.winRate} className="w-full" />
                        <div className="text-xs text-gray-600 mt-1">Performance</div>
                      </div>
                    </div>

                    {opponent.recentForm.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Recent Form:</span>
                        <div className="flex gap-1">
                          {opponent.recentForm.map((result, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className={`w-6 h-6 p-0 flex items-center justify-center text-xs ${getFormBadgeColor(result)}`}
                            >
                              {result}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-2">
                          (Last {opponent.recentForm.length} games)
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}