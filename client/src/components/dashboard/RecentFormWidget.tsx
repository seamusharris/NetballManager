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

  // Get completed games sorted by date (most recent first)
  const completedGames = games
    .filter(isGameValidForStatistics)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5); // Last 5 games

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
        <div className="text-center mb-4">
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
          <p className="text-xs text-gray-400">
            {recentTrend.length > 0 ? `${recentWins}/${recentTrend.length} recent wins` : 'Hover for details'}
          </p>
        </div>

        {/* Compact Statistics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-lg border border-primary/10">
            <p className="text-xs text-gray-500 mb-1">Win Rate</p>
            <p className="text-xl font-bold text-primary">{winPercentage}%</p>
          </div>
          <div className="text-center bg-gradient-to-br from-blue-50 to-blue-25 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">Played</p>
            <p className="text-xl font-bold text-blue-600">{completedGames.length}</p>
          </div>
          <div className="text-center bg-gradient-to-br from-gray-50 to-gray-25 p-3 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Record</p>
            <p className="text-xs font-medium text-gray-700">{wins}W-{losses}L{draws > 0 ? `-${draws}D` : ''}</p>
          </div>
        </div>

        {/* Goal Difference Trend (Enhanced Chart) */}
        {formData.length > 1 && (
          <div className="mt-2">
            <div className="pt-4 px-2 pb-1 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-center items-end space-x-2 h-20">
                {formData.slice(0, 5).reverse().map((game, index) => {
                  const margin = Math.abs(game.margin);
                  const height = Math.max(20, Math.min(80, margin * 10)); // Expanded scale for larger container
                  const isPositive = game.margin > 0;
                  const isDraw = game.margin === 0;

                  return (
                    <div key={game.id} className="flex flex-col items-center group relative">
                      <div 
                        className={`w-4 rounded-t-md transition-opacity hover:opacity-80 ${
                          isDraw ? 'bg-gray-400' : 
                          isPositive ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-xs text-gray-500 font-medium">{margin}</span>
                      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center max-w-16 truncate">
                        {game.opponent.split(' ')[0]}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <TooltipIcon 
                          content={`${game.opponent}: ${game.teamScore}-${game.opponentScore}`}
                          iconClassName="w-3 h-3 text-gray-400 hover:text-gray-600"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 text-center mt-1 mb-1">Goal margins (oldest → newest)</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}