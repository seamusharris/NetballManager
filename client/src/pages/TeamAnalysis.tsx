
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { Loader2, TrendingUp, Target, Award, BarChart3, ArrowLeft } from 'lucide-react';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { getWinLoseLabel } from '@/lib/utils';

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

  // Get completed games for stats
  const completedGames = games.filter(game => game.statusIsCompleted && game.statusAllowsStatistics);
  const gameIds = completedGames.map(game => game.id);

  // Fetch batch statistics for all completed games
  const { statsMap: centralizedStats = {}, isLoading: isLoadingStats } = useBatchGameStatistics(gameIds);

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

  const isLoading = isLoadingGames || isLoadingStats || isLoadingTeams;

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
              Detailed performance analysis against all opposing teams
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
