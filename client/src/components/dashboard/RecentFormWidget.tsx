import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TooltipIcon } from '@/components/ui/tooltip-icon';
import { Game, Opponent, GameResult } from '@shared/schema';
import { getWinLoseLabel } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResultBadge } from '@/components/ui/result-badge';
import { isGameValidForStatistics } from '@/lib/gameFilters';


interface RecentFormWidgetProps {
  games: Game[];
  opponents: Opponent[];
  centralizedStats?: Record<number, any[]>;
  className?: string;
}

export default function RecentFormWidget({ 
  games, 
  opponents, 
  centralizedStats, 
  className 
}: RecentFormWidgetProps) {
  // Debug: Log all games being processed
  console.log('RecentFormWidget - All games:', games.map(g => ({id: g.id, status: g.gameStatus?.name, isCompleted: g.gameStatus?.isCompleted, allowsStats: g.gameStatus?.allowsStatistics})));

  // Get completed games sorted by date (oldest first for consistency)
  const completedGames = games
    .filter(isGameValidForStatistics)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-5); // Last 5 games in chronological order

  console.log('RecentFormWidget - Filtered completed games:', completedGames.map(g => ({id: g.id, status: g.gameStatus?.name})));

  // Calculate form data
  const formData = completedGames.map(game => {
    const stats = centralizedStats?.[game.id] || [];

    // Calculate scores from stats
    let teamScore = 0;
    let opponentScore = 0;

    stats.forEach(stat => {
      teamScore += stat.goalsFor || 0;
      opponentScore += stat.goalsAgainst || 0;
    });

    const result = getWinLoseLabel(teamScore, opponentScore);
    const opponent = opponents.find(o => o.id === game.opponentId);

    return {
      id: game.id,
      date: game.date,
      opponent: opponent?.teamName || opponent?.name || 'Unknown Opponent',
      result,
      teamScore,
      opponentScore,
      margin: teamScore - opponentScore
    };
  });

  // Calculate statistics
  const wins = formData.filter(game => game.result === 'Win').length;
  const losses = formData.filter(game => game.result === 'Loss').length;
  const draws = formData.filter(game => game.result === 'Draw').length;
  const winPercentage = completedGames.length > 0 ? Math.round((wins / completedGames.length) * 100) : 0;

  // Determine trend
  const recentTrend = formData.slice(0, 3); // Last 3 games
  const recentWins = recentTrend.filter(game => game.result === 'Win').length;
  const trend = recentWins >= 2 ? 'up' : recentWins === 1 ? 'neutral' : 'down';

  const getResultBadge = (result: string) => {
    return <ResultBadge result={result as GameResult} size="sm" />;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (completedGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-0">
          <div className="mb-6 pb-3 border-b border-gray-100">
            <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">Recent Form</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>No completed games yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Form</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Enhanced Form Display with Trend */}
        <div className="text-center mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <span className="text-xs text-gray-500 font-medium">Last 5 Games</span>
            {getTrendIcon()}
          </div>
          <div className="flex justify-center space-x-1 mb-2">
            {formData.slice(0, 5).map((game, index) => (
              <div key={game.id} className="relative group">
                <ResultBadge result={game.result as GameResult} size="md" />
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {game.opponent}: {game.teamScore}-{game.opponentScore}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Margins and Stats */}
        {formData.length > 1 && (
          <div className="mt-8">
            <div className="grid grid-cols-3 gap-4">
              {/* Goal Difference Trend Chart - 2/3 width */}
              <div className="col-span-2 p-3 pb-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-1 font-medium">Goal margins</p>
                <div className="flex justify-center items-end space-x-2 h-32">
                  {formData.slice(0, 5).map((game, index) => {
                    const margin = Math.abs(game.margin);
                    const height = Math.max(20, Math.min(80, margin * 10)); // Expanded scale for larger container
                    const isPositive = game.margin > 0;
                    const isDraw = game.margin === 0;

                    return (
                      <div key={game.id} className="relative group">
                        <div 
                          className={`w-4 rounded-t-md transition-opacity hover:opacity-80 ${
                            isDraw ? 'bg-gray-400' : 
                            isPositive ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ height: `${height}px` }}
                        />
                        <span className="text-xs text-gray-500 font-medium text-center block mt-1">{margin}</span>
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          {game.opponent}: {game.teamScore}-{game.opponentScore}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats Column - 1/3 width */}
              <div className="space-y-3">
                <div className="text-center bg-gray-100 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                  <p className="text-xl font-bold text-gray-700">{winPercentage}%</p>
                </div>
                <div className="text-center bg-gray-100 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Played</p>
                  <p className="text-xl font-bold text-gray-700">{completedGames.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}