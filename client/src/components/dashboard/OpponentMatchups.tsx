import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Trophy, AlertTriangle, ChevronRight } from 'lucide-react';
import { Game, Opponent } from '@shared/schema';
import { getWinLoseLabel, getWinLoseClass } from '@/lib/utils';
import { GameResult } from '@/lib/resultUtils';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import { ResultBadge } from '@/components/ui/result-badge';
import { isGameValidForStatistics } from '@/lib/gameFilters';

interface OpponentMatchup {
  opponent: Opponent;
  games: Game[];
  wins: number;
  losses: number;
  draws: number;
  totalGamesPlayed: number;
  winRate: number;
  avgScoreFor: number;
  avgScoreAgainst: number;
  scoreDifferential: number;
  goalsPercentage: number;
  recentForm: string[]; // Last 3 games: 'W', 'L', 'D'
  trend: 'improving' | 'declining' | 'stable';
}

interface OpponentMatchupsProps {
  games: Game[];
  opponents: Opponent[];
  centralizedStats?: Record<number, any[]>;
  className?: string;
}

export default function OpponentMatchups({ 
  games, 
  opponents, 
  centralizedStats = {},
  className 
}: OpponentMatchupsProps) {
  const [matchups, setMatchups] = useState<OpponentMatchup[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    const calculateMatchups = () => {
      const opponentMatchups: OpponentMatchup[] = [];

      opponents.forEach(opponent => {
        const opponentGames = games.filter(game => 
          game.opponentId === opponent.id && isGameValidForStatistics(game)
        );

        if (opponentGames.length === 0) return;

        let wins = 0;
        let losses = 0;
        let draws = 0;
        let totalScoreFor = 0;
        let totalScoreAgainst = 0;
        const recentResults: string[] = [];

        // Sort games by date for recent form calculation
        const sortedGames = [...opponentGames].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        sortedGames.forEach((game, index) => {
          const gameStats = centralizedStats[game.id] || [];

          // Calculate team and opponent scores from stats
          const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
          const opponentScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

          totalScoreFor += teamScore;
          totalScoreAgainst += opponentScore;

          const result = getWinLoseLabel(teamScore, opponentScore);

          if (result === 'Win') wins++;
          else if (result === 'Loss') losses++;
          else draws++;

          // Track recent form (last 3 games)
          if (index < 3) {
            recentResults.push(result === 'Win' ? 'W' : result === 'Loss' ? 'L' : 'D');
          }
        });

        const totalGames = opponentGames.length;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
        const avgScoreFor = totalGames > 0 ? Math.round(totalScoreFor / totalGames) : 0;
        const avgScoreAgainst = totalGames > 0 ? Math.round(totalScoreAgainst / totalGames) : 0;
        const scoreDifferential = avgScoreFor - avgScoreAgainst;
        const goalsPercentage = totalScoreAgainst > 0 ? Math.round((totalScoreFor / totalScoreAgainst) * 100) : 0;

        // Determine trend based on recent form vs overall performance
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentResults.length >= 2) {
          const recentWins = recentResults.filter(r => r === 'W').length;
          const recentWinRate = (recentWins / recentResults.length) * 100;

          if (recentWinRate > winRate + 20) trend = 'improving';
          else if (recentWinRate < winRate - 20) trend = 'declining';
        }

        opponentMatchups.push({
          opponent,
          games: opponentGames,
          wins,
          losses,
          draws,
          totalGamesPlayed: totalGames,
          winRate,
          avgScoreFor,
          avgScoreAgainst,
          scoreDifferential,
          goalsPercentage,
          recentForm: recentResults,
          trend
        });
      });

      // Sort by win rate by default
      opponentMatchups.sort((a, b) => b.winRate - a.winRate);

      setMatchups(opponentMatchups);
    };

    calculateMatchups();
  }, [games, opponents, centralizedStats]);

  const bestMatchup = matchups.length > 0 ? matchups[0] : null;
  const worstMatchup = matchups.length > 0 ? matchups[matchups.length - 1] : null;
  const totalGames = matchups.reduce((sum, matchup) => sum + matchup.totalGamesPlayed, 0);
  const totalWins = matchups.reduce((sum, matchup) => sum + matchup.wins, 0);
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  const getFormDisplay = (form: string[]) => {
    return form.slice(0, 3).map((result, index) => {
      const gameResult: GameResult = result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw';
      return (
        <ResultBadge 
          key={index}
          result={gameResult}
          size="sm"
          className="mx-0.5"
        />
      );
    });
  };

  return (
    <Card className={className}>
      <CardContent className="p-6 pb-2">
        <div className="mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Opponent Matchups</h3>
        </div>
      
      
      <CardContent className="p-6 pb-2">
        <div className="mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Opponent Matchups</h3>
        </div>
      
      <CardContent className="p-6 pb-2">
        <div className="mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Opponent Matchups</h3>
        </div>
      
      
      <CardHeader className="pb-3">
        <CardTitle>
          Opponent Matchups
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pb-2">
        <div className="mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Opponent Matchups</h3>
        </div>
      
        {matchups.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No completed games against opponents yet
          </p>
        ) : (
          <div className="space-y-8">
            {/* Overall Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{overallWinRate}%</p>
                <p className="text-xs text-gray-600">Overall Win Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700">{matchups.length}</p>
                <p className="text-xs text-gray-600">Opponents Faced</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700">{totalGames}</p>
                <p className="text-xs text-gray-600">Total Games</p>
              </div>
            </div>

            {/* Best and Worst Matchups */}
            <div className="space-y-8">
              {bestMatchup && (
                <div className="flex items-center justify-between p-4 mb-4 mt-2 bg-green-50 border-l-4 border-t border-r border-b border-green-500 border-t-green-500 border-r-green-500 border-b-green-500 rounded">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Best</span>
                    </div>
                    <p className="font-semibold text-green-900">{bestMatchup.opponent.teamName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700 mb-1">{bestMatchup.winRate}%</p>
                    <div className="flex">{getFormDisplay(bestMatchup.recentForm)}</div>
                  </div>
                </div>
              )}

              {worstMatchup && worstMatchup !== bestMatchup && (
                <div className="flex items-center justify-between p-4 mb-4 mt-2 bg-red-50 border-l-4 border-t border-r border-b border-red-500 border-t-red-500 border-r-red-500 border-b-red-500 rounded">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Challenge</span>
                    </div>
                    <p className="font-semibold text-red-900">{worstMatchup.opponent.teamName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-700 mb-1">{worstMatchup.winRate}%</p>
                    <div className="flex">{getFormDisplay(worstMatchup.recentForm)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {matchups.length > 0 ? (
          <ViewMoreButton href="/opponent-analysis">
            View more →
          </ViewMoreButton>
        ) : (
          <div className="mb-4" />
        )}
      </CardContent>
    </Card>
  );
}