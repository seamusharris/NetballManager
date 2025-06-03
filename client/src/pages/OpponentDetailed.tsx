import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResultBadge } from '@/components/ui/result-badge';
import { GameResult } from '@/lib/resultUtils';
import { BackButton } from '@/components/ui/back-button';
import { BarChart3, Calendar, Trophy, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Game, Opponent } from '@shared/schema';
import { formatDate, getWinLoseLabel } from '@/lib/utils';
import { apiRequest } from '@/lib/apiClient';

export default function OpponentDetailed() {
  const { opponentId } = useParams();
  const [, navigate] = useLocation();

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => apiRequest('GET', '/api/games')
  });

  const { data: opponents = [], isLoading: opponentsLoading } = useQuery({
    queryKey: ['opponents'],
    queryFn: async () => {
      try {
        const result = await apiRequest('GET', '/api/opponents');
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.warn('Opponents API not available (expected - system has been migrated to teams)');
        return [];
      }
    }
  });

  // Fetch centralized stats for all completed games that allow statistics
  const completedGameIds = games.filter((game: Game) => 
    game.gameStatus?.isCompleted && game.gameStatus?.allowsStatistics
  ).map((game: Game) => game.id);

  const { data: centralizedStats = {} } = useQuery({
    queryKey: ['dashboardStats', completedGameIds.join(',')],
    queryFn: async () => {
      if (completedGameIds.length === 0) return {};

      try {
        const response = await apiRequest('GET', `/api/games/stats/batch?gameIds=${completedGameIds.join(',')}`);
        return response;
      } catch (error) {
        console.error('Error fetching centralized stats:', error);
        return {};
      }
    },
    enabled: completedGameIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const selectedOpponentData = (opponents && Array.isArray(opponents)) 
    ? opponents.find((opp: Opponent) => opp.id === parseInt(opponentId || '0'))
    : null;

  // Calculate detailed stats for selected opponent
  const calculateDetailedStats = () => {
    if (!selectedOpponentData || !Array.isArray(games)) return null;

    const opponentGames = games.filter((game: Game) => 
      game.opponentId === selectedOpponentData.id
    );

    // Get completed games for win/loss calculation (excluding abandoned games)
    const allCompletedGames = opponentGames.filter((game: Game) => 
      game.gameStatus?.isCompleted && game.gameStatus?.name !== 'abandoned'
    );

    // Get only games with statistics for stat calculations (also excludes abandoned)
    const gamesWithStats = opponentGames.filter((game: Game) => 
      game.gameStatus?.isCompleted && game.gameStatus?.allowsStatistics && game.gameStatus?.name !== 'abandoned'
    );

    const gameResults = gamesWithStats.map((game: Game) => {
      const gameStats = centralizedStats[game.id] || [];
      const teamScore = gameStats.reduce((sum: number, stat: any) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = gameStats.reduce((sum: number, stat: any) => sum + (stat.goalsAgainst || 0), 0);

      return {
        game,
        teamScore,
        opponentScore,
        result: getWinLoseLabel(teamScore, opponentScore),
        margin: teamScore - opponentScore,
        gameStats
      };
    });

    const wins = gameResults.filter(r => r.result === 'Win').length;
    const losses = gameResults.filter(r => r.result === 'Loss').length;
    const draws = gameResults.filter(r => r.result === 'Draw').length;

    // Calculate quarter performance analysis
    const quarterAnalysis = calculateQuarterAnalysis(gameResults);

    // Calculate scoring trends
    const scoringTrends = calculateScoringTrends(gameResults);

    return {
      totalGames: allCompletedGames.length,
      wins,
      losses,
      draws,
      winRate: allCompletedGames.length > 0 ? Math.round((wins / allCompletedGames.length) * 100) : 0,
      avgMargin: gameResults.length > 0 ? Math.round(gameResults.reduce((sum, r) => sum + r.margin, 0) / gameResults.length) : 0,
      biggestWin: gameResults.filter(r => r.result === 'Win').reduce((max, r) => r.margin > max ? r.margin : max, 0),
      biggestLoss: Math.abs(gameResults.filter(r => r.result === 'Loss').reduce((min, r) => r.margin < min ? r.margin : min, 0)),
      gameResults: gameResults.sort((a, b) => new Date(b.game.date).getTime() - new Date(a.game.date).getTime()),
      quarterAnalysis,
      scoringTrends
    };
  };

  // Calculate quarter performance analysis
  const calculateQuarterAnalysis = (gameResults: any[]) => {
    if (gameResults.length === 0) return null;

    const quarterScores: Record<number, { team: number, opponent: number, count: number }> = {
      1: { team: 0, opponent: 0, count: 0 },
      2: { team: 0, opponent: 0, count: 0 },
      3: { team: 0, opponent: 0, count: 0 },
      4: { team: 0, opponent: 0, count: 0 }
    };

    gameResults.forEach(result => {
      const gameStats = result.gameStats || [];
      const gameQuarterScores: Record<number, { team: number, opponent: number }> = {
        1: { team: 0, opponent: 0 },
        2: { team: 0, opponent: 0 },
        3: { team: 0, opponent: 0 },
        4: { team: 0, opponent: 0 }
      };

      gameStats.forEach((stat: any) => {
        if (stat.quarter >= 1 && stat.quarter <= 4) {
          gameQuarterScores[stat.quarter].team += stat.goalsFor || 0;
          gameQuarterScores[stat.quarter].opponent += stat.goalsAgainst || 0;
        }
      });

      Object.keys(gameQuarterScores).forEach(quarterStr => {
        const quarter = parseInt(quarterStr);
        quarterScores[quarter].team += gameQuarterScores[quarter].team;
        quarterScores[quarter].opponent += gameQuarterScores[quarter].opponent;
        quarterScores[quarter].count += 1;
      });
    });

    const byQuarter: Record<number, { avgTeamScore: number, avgOpponentScore: number }> = {};
    Object.keys(quarterScores).forEach(quarterStr => {
      const quarter = parseInt(quarterStr);
      const count = quarterScores[quarter].count || 1;
      byQuarter[quarter] = {
        avgTeamScore: quarterScores[quarter].team / count,
        avgOpponentScore: quarterScores[quarter].opponent / count
      };
    });

    // Find strongest and weakest quarters
    const quarterDiffs = Object.keys(byQuarter).map(quarter => {
      const q = parseInt(quarter);
      const diff = byQuarter[q].avgTeamScore - byQuarter[q].avgOpponentScore;
      return { quarter: q, diff };
    });

    const strongestQuarter = quarterDiffs.reduce((max, current) => 
      current.diff > max.diff ? current : max
    ).quarter;

    const weakestQuarter = quarterDiffs.reduce((min, current) => 
      current.diff < min.diff ? current : min
    ).quarter;

    return {
      byQuarter,
      strongestQuarter,
      weakestQuarter
    };
  };

  // Calculate scoring trends
  const calculateScoringTrends = (gameResults: any[]) => {
    if (gameResults.length === 0) return null;

    const teamScores = gameResults.map(r => r.teamScore);
    const opponentScores = gameResults.map(r => r.opponentScore);

    const avgGoalsFor = teamScores.reduce((sum, score) => sum + score, 0) / teamScores.length;
    const avgGoalsAgainst = opponentScores.reduce((sum, score) => sum + score, 0) / opponentScores.length;

    const highestScoringGame = Math.max(...teamScores);
    const lowestScoringGame = Math.min(...teamScores);

    // Calculate variance
    const variance = teamScores.reduce((sum, score) => sum + Math.pow(score - avgGoalsFor, 2), 0) / teamScores.length;
    const goalsVariance = Math.sqrt(variance);

    // Determine recent trend (last 3 games vs overall average)
    let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (gameResults.length >= 3) {
      const recentGames = gameResults.slice(0, 3);
      const recentAvg = recentGames.reduce((sum, r) => sum + r.teamScore, 0) / recentGames.length;

      if (recentAvg > avgGoalsFor + 1) recentTrend = 'improving';
      else if (recentAvg < avgGoalsFor - 1) recentTrend = 'declining';
    }

    return {
      avgGoalsFor,
      avgGoalsAgainst,
      highestScoringGame,
      lowestScoringGame,
      goalsVariance,
      recentTrend
    };
  };

  const detailedStats = calculateDetailedStats();

  if (gamesLoading || opponentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading opponent analysis...</p>
      </div>
    );
  }

  if (!selectedOpponentData) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Opponent not found</h1>
        <Button onClick={() => navigate('/opponent-analysis')}>
          Back to Opponent Analysis
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton fallbackPath="/opponent-analysis" />
          <h1 className="text-3xl font-heading font-bold text-neutral-dark">
            {selectedOpponentData.teamName} - Detailed Analysis
          </h1>
        </div>
      </div>

      {detailedStats && (
        <div className="space-y-6">
          {/* Head-to-Head Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Head-to-Head Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{detailedStats.wins}</p>
                    <p className="text-sm text-gray-600">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">{detailedStats.losses}</p>
                    <p className="text-sm text-gray-600">Losses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">{detailedStats.draws}</p>
                    <p className="text-sm text-gray-600">Draws</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{detailedStats.winRate}%</p>
                    <p className="text-sm text-gray-600">Win Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Margin</span>
                    <span className={`font-semibold ${
                      detailedStats.avgMargin > 0 ? 'text-green-600' : 
                      detailedStats.avgMargin < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {detailedStats.avgMargin > 0 ? '+' : ''}{detailedStats.avgMargin}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Biggest Win</span>
                    <span className="font-semibold text-green-600">+{detailedStats.biggestWin}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Biggest Loss</span>
                    <span className="font-semibold text-red-600">-{detailedStats.biggestLoss}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Games</span>
                    <span className="font-semibold">{detailedStats.totalGames}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quarter Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quarter Performance vs {selectedOpponentData.teamName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detailedStats.quarterAnalysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map(quarter => {
                        const qData = detailedStats.quarterAnalysis.byQuarter[quarter];
                        const diff = qData.avgTeamScore - qData.avgOpponentScore;
                        const isStrongest = quarter === detailedStats.quarterAnalysis.strongestQuarter;
                        const isWeakest = quarter === detailedStats.quarterAnalysis.weakestQuarter;

                        return (
                          <div 
                            key={quarter} 
                            className={`p-3 rounded-lg border-2 ${
                              isStrongest ? 'bg-green-50 border-green-200' : 
                              isWeakest ? 'bg-red-50 border-red-200' : 
                              'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-600">Q{quarter}</span>
                              {isStrongest && <Badge variant="outline" className="text-xs px-1 py-0 bg-green-100 text-green-700">Best</Badge>}
                              {isWeakest && <Badge variant="outline" className="text-xs px-1 py-0 bg-red-100 text-red-700">Weak</Badge>}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-primary">{qData.avgTeamScore.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">vs</span>
                              <span className="text-lg font-bold text-gray-600">{qData.avgOpponentScore.toFixed(1)}</span>
                            </div>
                            <div className="text-center mt-1">
                              <span className={`text-xs font-medium ${
                                diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scoring Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Scoring Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detailedStats.scoringTrends && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Avg Goals For</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {detailedStats.scoringTrends.avgGoalsFor.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Avg Goals Against</p>
                        <p className="text-2xl font-bold text-red-600">
                          {detailedStats.scoringTrends.avgGoalsAgainst.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Recent Form Trend</span>
                        <div className="flex items-center gap-1">
                          {detailedStats.scoringTrends.recentTrend === 'improving' && (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">Improving</span>
                            </>
                          )}
                          {detailedStats.scoringTrends.recentTrend === 'declining' && (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <span className="text-red-600 font-medium">Declining</span>
                            </>
                          )}
                          {detailedStats.scoringTrends.recentTrend === 'stable' && (
                            <>
                              <Target className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-500 font-medium">Stable</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Highest Scoring Game</span>
                        <span className="font-semibold text-green-600">
                          {detailedStats.scoringTrends.highestScoringGame} goals
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Lowest Scoring Game</span>
                        <span className="font-semibold text-gray-600">
                          {detailedStats.scoringTrends.lowestScoringGame} goals
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Goals Variance</span>
                        <span className="font-semibold text-gray-600">
                          ±{detailedStats.scoringTrends.goalsVariance.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Game History vs {selectedOpponentData.teamName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {detailedStats.gameResults.map((result) => (
                  <div 
                    key={result.game.id} 
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/game/${result.game.id}`)}
                  >
                    <div>
                      <p className="font-medium">{formatDate(result.game.date)}</p>
                      <p className="text-sm text-gray-600">
                        {result.game.time} {result.game.round ? `• Round ${result.game.round}` : ''}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">
                        {result.teamScore} - {result.opponentScore}
                      </p>
                      <p className="text-sm text-gray-600">
                        {result.result === 'Win' ? '+' : result.result === 'Loss' ? '' : ''}{result.margin}
                      </p>
                    </div>
                    <ResultBadge 
                      result={result.result as GameResult}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Archive, ArrowLeft } from 'lucide-react';

export default function OpponentDetailed() {
  const [, navigate] = useLocation();

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-4">
          <Archive className="h-16 w-16 mx-auto text-gray-400" />
          <h1 className="text-3xl font-heading font-bold text-neutral-dark">
            Opponent Details - Archived
          </h1>
          <p className="text-lg text-gray-600">
            This detailed opponent analysis page has been archived.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Archived During Migration</CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-3">
            <p>This page provided detailed analysis of performance against specific opponents.</p>
            <p>It will be redesigned to show team-vs-team analysis in the new system.</p>
          </CardContent>
        </Card>

        <Button 
          onClick={() => navigate('/opponent-analysis')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Analysis
        </Button>
      </div>
    </div>
  );
}
