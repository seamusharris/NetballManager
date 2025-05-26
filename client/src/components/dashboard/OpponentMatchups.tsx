
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Trophy, AlertTriangle } from 'lucide-react';
import { Game, Opponent } from '@shared/schema';
import { getWinLoseLabel, getWinLoseClass } from '@/lib/utils';

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
  const [sortBy, setSortBy] = useState<'winRate' | 'games' | 'differential'>('winRate');

  useEffect(() => {
    const calculateMatchups = () => {
      const opponentMatchups: OpponentMatchup[] = [];

      opponents.forEach(opponent => {
        const opponentGames = games.filter(game => 
          game.opponentId === opponent.id && game.completed
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

      // Sort matchups
      opponentMatchups.sort((a, b) => {
        switch (sortBy) {
          case 'winRate':
            return b.winRate - a.winRate;
          case 'games':
            return b.totalGamesPlayed - a.totalGamesPlayed;
          case 'differential':
            return b.scoreDifferential - a.scoreDifferential;
          default:
            return b.winRate - a.winRate;
        }
      });

      setMatchups(opponentMatchups);
    };

    calculateMatchups();
  }, [games, opponents, centralizedStats, sortBy]);

  const bestMatchup = matchups.length > 0 ? matchups[0] : null;
  const worstMatchup = matchups.length > 0 ? matchups[matchups.length - 1] : null;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFormDisplay = (form: string[]) => {
    return form.map((result, index) => (
      <span 
        key={index}
        className={`inline-block w-6 h-6 rounded-full text-xs font-bold text-white text-center leading-6 mx-0.5 ${
          result === 'W' ? 'bg-green-500' : 
          result === 'L' ? 'bg-red-500' : 'bg-yellow-500'
        }`}
      >
        {result}
      </span>
    ));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Opponent Matchups
        </CardTitle>
        <div className="flex gap-2 text-sm">
          <button 
            onClick={() => setSortBy('winRate')}
            className={`px-2 py-1 rounded ${sortBy === 'winRate' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
          >
            Win Rate
          </button>
          <button 
            onClick={() => setSortBy('games')}
            className={`px-2 py-1 rounded ${sortBy === 'games' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
          >
            Games Played
          </button>
          <button 
            onClick={() => setSortBy('differential')}
            className={`px-2 py-1 rounded ${sortBy === 'differential' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
          >
            Score Diff
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {matchups.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No completed games against opponents yet
          </p>
        ) : (
          <>
            {/* Best/Worst Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {bestMatchup && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Best Matchup</span>
                  </div>
                  <p className="font-semibold text-green-900">{bestMatchup.opponent.teamName}</p>
                  <p className="text-sm text-green-700">
                    {bestMatchup.winRate}% win rate ({bestMatchup.wins}-{bestMatchup.losses}-{bestMatchup.draws})
                  </p>
                </div>
              )}
              
              {worstMatchup && worstMatchup !== bestMatchup && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Challenging Matchup</span>
                  </div>
                  <p className="font-semibold text-red-900">{worstMatchup.opponent.teamName}</p>
                  <p className="text-sm text-red-700">
                    {worstMatchup.winRate}% win rate ({worstMatchup.wins}-{worstMatchup.losses}-{worstMatchup.draws})
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Matchups */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {matchups.map((matchup) => (
                <div key={matchup.opponent.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{matchup.opponent.teamName}</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(matchup.trend)}
                      <Badge variant="outline" className="text-xs">
                        {matchup.totalGamesPlayed} games
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Record</p>
                      <p className="font-medium">{matchup.wins}-{matchup.losses}-{matchup.draws}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Win Rate</p>
                      <p className={`font-medium ${
                        matchup.winRate >= 70 ? 'text-green-600' : 
                        matchup.winRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {matchup.winRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Score</p>
                      <p className="font-medium">{matchup.avgScoreFor}-{matchup.avgScoreAgainst}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Recent Form</p>
                      <div className="flex">{getFormDisplay(matchup.recentForm)}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                    <span>
                      Score Diff: {matchup.scoreDifferential > 0 ? '+' : ''}{matchup.scoreDifferential}
                    </span>
                    <span>
                      Goals %: {matchup.goalsPercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
