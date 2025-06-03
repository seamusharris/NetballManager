Standardizing filtering logic across dashboard widgets to use the correct completion check and a shared filtering function.
```
```replit_final_file
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultBadge } from '@/components/ui/result-badge';
import { GameResult } from '@/lib/resultUtils';
import { getWinLoseLabel } from '@/lib/utils';
import { isGameValidForStatistics } from '@/lib/gameFilters';
import { RECENT_GAMES_COUNT } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { TooltipIcon } from '@/components/ui/tooltip-icon';
import { Game, Opponent } from '@shared/schema';
import { BaseWidget } from '@/components/ui/base-widget';
import { getCompletedGamesForStats } from '@/lib/gameFilters';


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
    .slice(-RECENT_GAMES_COUNT); // Last 5 games in chronological order

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
    <BaseWidget 
      title="Recent Form" 
      contentClassName="px-4 py-6"
    >
      {/* Option 1: Progress Ring/Circle */}
      <div className="text-center mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-center items-center space-x-2 mb-3">
          <span className="text-xs text-gray-500 font-medium">Win Rate Progress</span>
          {getTrendIcon()}
        </div>
        <div className="flex justify-center mb-2">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-300"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={winPercentage >= 60 ? "text-green-500" : winPercentage >= 40 ? "text-yellow-500" : "text-red-500"}
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${winPercentage}, 100`}
                strokeLinecap="round"
                fill="transparent"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">{winPercentage}%</span>
            </div>
          </div>
        </div>
      </div>



      {/* Option 3: Trend Line with Dots */}
      <div className="text-center mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-center items-center space-x-2 mb-3">
          <span className="text-xs text-gray-500 font-medium">Performance Trend</span>
          {getTrendIcon()}
        </div>
        <div className="flex justify-center">
          <svg width="120" height="40" viewBox="0 0 120 40">
            {/* Draw trend line */}
            {formData.slice(0, 5).map((game, index) => {
              if (index === formData.length - 1) return null;
              const x1 = 10 + (index * 25);
              const y1 = game.result === 'Win' ? 10 : game.result === 'Draw' ? 20 : 30;
              const nextGame = formData[index + 1];
              const x2 = 10 + ((index + 1) * 25);
              const y2 = nextGame?.result === 'Win' ? 10 : nextGame?.result === 'Draw' ? 20 : 30;

              return (
                <line
                  key={`line-${index}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#6b7280"
                  strokeWidth="2"
                />
              );
            })}
            {/* Draw dots */}
            {formData.slice(0, 5).map((game, index) => {
              const x = 10 + (index * 25);
              const y = game.result === 'Win' ? 10 : game.result === 'Draw' ? 20 : 30;
              const color = game.result === 'Win' ? '#10b981' : 
                           game.result === 'Draw' ? '#f59e0b' : '#ef4444';

              return (
                <circle
                  key={`dot-${index}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  className="transition-all hover:r-4"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Option 4: Performance Gauge/Meter */}
      <div className="text-center mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-center items-center space-x-2 mb-3">
          <span className="text-xs text-gray-500 font-medium">Form Strength</span>
          {getTrendIcon()}
        </div>
        <div className="flex justify-center">
          <svg width="80" height="50" viewBox="0 0 80 50">
            {/* Background gauge arc */}
            <path
              d="M 15 40 A 25 25 0 0 1 65 40"
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="none"
            />
            {/* Performance gauge arc */}
            <path
              d="M 15 40 A 25 25 0 0 1 65 40"
              stroke={winPercentage >= 60 ? '#10b981' : winPercentage >= 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth="4"
              fill="none"
              strokeDasharray="78.5"
              strokeDashoffset={78.5 - (winPercentage / 100) * 78.5}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            {/* Needle */}
            <line
              x1="40"
              y1="40"
              x2={40 + 20 * Math.cos((Math.PI * winPercentage / 100) - Math.PI)}
              y2={40 + 20 * Math.sin((Math.PI * winPercentage / 100) - Math.PI)}
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Center dot */}
            <circle cx="40" cy="40" r="2" fill="#374151" />
          </svg>
        </div>
        <p className="text-xs text-gray-600 mt-1">{winPercentage}% Win Rate</p>
      </div>





      {/* Goals Breakdown - Full Width Row */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-500 text-center mb-3 font-medium">Goals breakdown</p>
        <div className="space-y-2">
          {formData.slice(0, 5).reverse().map((game, index) => (
            <div key={game.id} className="flex items-center">
              <div className="w-20 text-xs text-gray-600 truncate">{game.opponent}</div>
              <div className="flex-1 mx-3 relative h-6 bg-gray-200 rounded-full overflow-hidden">
                {/* Goals For (left side) */}
                <div 
                  className="absolute left-0 top-0 h-full bg-blue-500 flex items-center justify-start pl-2"
                  style={{ 
                    width: `${Math.max(15, (game.teamScore / Math.max(game.teamScore + game.opponentScore, 1)) * 100)}%` 
                  }}
                >
                  <span className="text-xs text-white font-medium">{game.teamScore}</span>
                </div>
                {/* Goals Against (right side) */}
                <div 
                  className="absolute right-0 top-0 h-full bg-red-400 flex items-center justify-end pr-2"
                  style={{ 
                    width: `${Math.max(15, (game.opponentScore / Math.max(game.teamScore + game.opponentScore, 1)) * 100)}%` 
                  }}
                >
                  <span className="text-xs text-white font-medium">{game.opponentScore}</span>
                </div>
              </div>
              <div className="w-12 text-xs text-center">
                <ResultBadge result={game.result as GameResult} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Margins and Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
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
    </BaseWidget>
  );
}