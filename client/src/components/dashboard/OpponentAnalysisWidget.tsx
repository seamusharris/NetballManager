
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/ui/loading-state';
import { apiClient } from '@/lib/apiClient';
import { TrendingUp, Trophy, Target, ArrowRight } from 'lucide-react';
import { getWinLoseLabel } from '@/lib/utils';

interface OpponentAnalysisWidgetProps {
  className?: string;
}

export function OpponentAnalysisWidget({ className }: OpponentAnalysisWidgetProps) {
  const { clubId, currentTeamId } = // 
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState<number | null>(null);

  // Fetch games
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['games', clubId, currentTeamId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!clubId && !!currentTeamId,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch stats for opponent games
  const { data: gameStats, isLoading: statsLoading } = useQuery({
    queryKey: ['opponent-analysis-stats', selectedOpponentTeamId, currentTeamId],
    queryFn: async () => {
      if (!selectedOpponentTeamId || !currentTeamId) return {};

      const opponentGames = games.filter(game => 
        game.statusIsCompleted &&
        ((game.homeTeamId === currentTeamId && game.awayTeamId === selectedOpponentTeamId) ||
         (game.awayTeamId === currentTeamId && game.homeTeamId === selectedOpponentTeamId))
      );

      if (opponentGames.length === 0) return {};

      const gameIds = opponentGames.map(g => g.id);
      return apiClient.post('/api/games/stats/batch', { gameIds });
    },
    enabled: !!selectedOpponentTeamId && !!currentTeamId && !!games.length,
    staleTime: 5 * 60 * 1000,
  });

  // Get unique opponents from completed games
  const opponents = useMemo(() => {
    if (!games || !currentTeamId) return [];

    const opponentMap = new Map();

    games.forEach(game => {
      if (!game.statusIsCompleted) return;

      if (game.homeTeamId === currentTeamId && game.awayTeamId) {
        opponentMap.set(game.awayTeamId, {
          teamId: game.awayTeamId,
          teamName: game.awayTeamName,
          clubName: game.awayClubName
        });
      } else if (game.awayTeamId === currentTeamId && game.homeTeamId) {
        opponentMap.set(game.homeTeamId, {
          teamId: game.homeTeamId,
          teamName: game.homeTeamName,
          clubName: game.homeClubName
        });
      }
    });

    return Array.from(opponentMap.values());
  }, [games, currentTeamId]);

  // Generate opponent analysis
  const opponentAnalysis = useMemo(() => {
    if (!games || !gameStats || !selectedOpponentTeamId || !currentTeamId) return null;

    const opponentGames = games.filter(game => 
      game.statusIsCompleted &&
      ((game.homeTeamId === currentTeamId && game.awayTeamId === selectedOpponentTeamId) ||
       (game.awayTeamId === currentTeamId && game.homeTeamId === selectedOpponentTeamId))
    );

    if (opponentGames.length === 0) return null;

    let wins = 0;
    let totalOurScore = 0;
    let totalTheirScore = 0;
    const quarterPerformance = { 1: { for: 0, against: 0 }, 2: { for: 0, against: 0 }, 3: { for: 0, against: 0 }, 4: { for: 0, against: 0 } };
    const recentForm: string[] = [];

    opponentGames
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(game => {
        const stats = gameStats[game.id] || [];
        const ourStats = stats.filter(s => s.teamId === currentTeamId);
        const theirStats = stats.filter(s => s.teamId === selectedOpponentTeamId);
        
        const ourScore = ourStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const theirScore = theirStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const result = getWinLoseLabel(ourScore, theirScore);

        if (result === 'Win') {
          wins++;
          recentForm.push('W');
        } else if (result === 'Loss') {
          recentForm.push('L');
        } else {
          recentForm.push('D');
        }

        totalOurScore += ourScore;
        totalTheirScore += theirScore;

        // Quarter analysis
        [1, 2, 3, 4].forEach(quarter => {
          const ourQuarterStats = ourStats.filter(s => s.quarter === quarter);
          const theirQuarterStats = theirStats.filter(s => s.quarter === quarter);
          
          const quarterFor = ourQuarterStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0);
          const quarterAgainst = theirQuarterStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0);
          
          quarterPerformance[quarter].for += quarterFor;
          quarterPerformance[quarter].against += quarterAgainst;
        });
      });

    const winRate = (wins / opponentGames.length) * 100;
    const avgOurScore = totalOurScore / opponentGames.length;
    const avgTheirScore = totalTheirScore / opponentGames.length;

    return {
      gamesPlayed: opponentGames.length,
      winRate,
      avgOurScore: Math.round(avgOurScore * 10) / 10,
      avgTheirScore: Math.round(avgTheirScore * 10) / 10,
      quarterPerformance,
      recentForm: recentForm.slice(0, 5),
      confidence: opponentGames.length >= 3 ? 'high' : opponentGames.length >= 1 ? 'medium' : 'low',
      lastPlayed: opponentGames[0]?.date || null
    };
  }, [games, gameStats, selectedOpponentTeamId, currentTeamId]);

  if (!currentTeamId) {
    return null;
  }

  const selectedOpponent = opponents.find(opp => opp.teamId === selectedOpponentTeamId);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Opponent Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Opponent Selection */}
          <Select 
            value={selectedOpponentTeamId?.toString() || ""} 
            onValueChange={(value) => setSelectedOpponentTeamId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an opponent to analyze..." />
            </SelectTrigger>
            <SelectContent>
              {opponents.map(opponent => (
                <SelectItem key={opponent.teamId} value={opponent.teamId.toString()}>
                  {opponent.teamName} ({opponent.clubName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Analysis Results */}
          {selectedOpponent && (
            <>
              {statsLoading ? (
                <LoadingState message="Analyzing opponent data..." />
              ) : opponentAnalysis ? (
                <div className="space-y-4">
                  {/* Head-to-Head Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(opponentAnalysis.gamesPlayed * opponentAnalysis.winRate / 100)}-
                        {opponentAnalysis.gamesPlayed - Math.round(opponentAnalysis.gamesPlayed * opponentAnalysis.winRate / 100)}
                      </div>
                      <div className="text-sm text-gray-600">Win-Loss Record</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {opponentAnalysis.winRate.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Win Rate</div>
                    </div>
                  </div>

                  {/* Recent Form */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Recent Form:</span>
                      <div className="flex gap-1">
                        {opponentAnalysis.recentForm.map((result, index) => (
                          <Badge 
                            key={index}
                            variant={result === 'W' ? 'default' : result === 'L' ? 'destructive' : 'secondary'}
                            className="text-xs w-6 h-6 p-0 flex items-center justify-center"
                          >
                            {result}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Average Score */}
                  <div>
                    <div className="text-sm font-medium mb-2">Average Score</div>
                    <div className="text-lg font-bold">
                      {opponentAnalysis.avgOurScore} - {opponentAnalysis.avgTheirScore}
                    </div>
                  </div>

                  {/* Quarter Performance */}
                  <div>
                    <div className="text-sm font-medium mb-2">Quarter Performance</div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(quarter => {
                        const qData = opponentAnalysis.quarterPerformance[quarter];
                        const avgFor = qData.for / opponentAnalysis.gamesPlayed;
                        const avgAgainst = qData.against / opponentAnalysis.gamesPlayed;
                        const margin = avgFor - avgAgainst;
                        
                        return (
                          <div key={quarter} className="flex items-center justify-between text-sm">
                            <span>Q{quarter}</span>
                            <span>{avgFor.toFixed(1)} - {avgAgainst.toFixed(1)}</span>
                            <span className={`font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {margin >= 0 ? '+' : ''}{margin.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Data Confidence */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Quality:</span>
                    <Badge variant={
                      opponentAnalysis.confidence === 'high' ? 'default' : 
                      opponentAnalysis.confidence === 'medium' ? 'secondary' : 'outline'
                    }>
                      {opponentAnalysis.confidence}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No historical data available for this opponent</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
