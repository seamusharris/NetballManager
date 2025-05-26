
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, ChevronLeft, Trophy, TrendingUp, TrendingDown, Target } from 'lucide-react';
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
    queryFn: () => apiRequest('GET', '/api/opponents')
  });

  // Fetch centralized stats for all completed games
  const completedGameIds = games.filter((game: Game) => game.completed).map((game: Game) => game.id);
  
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

  const selectedOpponentData = opponents.find((opp: Opponent) => opp.id === parseInt(opponentId || '0'));

  // Calculate detailed stats for selected opponent
  const calculateDetailedStats = () => {
    if (!selectedOpponentData) return null;

    const opponentGames = games.filter((game: Game) => 
      game.opponentId === selectedOpponentData.id && game.completed
    );

    const gameResults = opponentGames.map((game: Game) => {
      const gameStats = centralizedStats[game.id] || [];
      const teamScore = gameStats.reduce((sum: number, stat: any) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = gameStats.reduce((sum: number, stat: any) => sum + (stat.goalsAgainst || 0), 0);
      
      return {
        game,
        teamScore,
        opponentScore,
        result: getWinLoseLabel(teamScore, opponentScore),
        margin: teamScore - opponentScore
      };
    });

    const wins = gameResults.filter(r => r.result === 'Win').length;
    const losses = gameResults.filter(r => r.result === 'Loss').length;
    const draws = gameResults.filter(r => r.result === 'Draw').length;

    return {
      totalGames: opponentGames.length,
      wins,
      losses,
      draws,
      winRate: opponentGames.length > 0 ? Math.round((wins / opponentGames.length) * 100) : 0,
      avgMargin: gameResults.length > 0 ? Math.round(gameResults.reduce((sum, r) => sum + r.margin, 0) / gameResults.length) : 0,
      biggestWin: gameResults.filter(r => r.result === 'Win').reduce((max, r) => r.margin > max ? r.margin : max, 0),
      biggestLoss: Math.abs(gameResults.filter(r => r.result === 'Loss').reduce((min, r) => r.margin < min ? r.margin : min, 0)),
      gameResults: gameResults.sort((a, b) => new Date(b.game.date).getTime() - new Date(a.game.date).getTime())
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/opponent-analysis')}
            className="mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Analysis
          </Button>
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
                  <div key={result.game.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{formatDate(result.game.date)}</p>
                      <p className="text-sm text-gray-600">{result.game.time}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">
                        {result.teamScore} - {result.opponentScore}
                      </p>
                      <p className="text-sm text-gray-600">
                        {result.result === 'Win' ? '+' : result.result === 'Loss' ? '' : ''}{result.margin}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        result.result === 'Win' ? 'bg-green-50 text-green-700 border-green-200' :
                        result.result === 'Loss' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }
                    >
                      {result.result}
                    </Badge>
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
