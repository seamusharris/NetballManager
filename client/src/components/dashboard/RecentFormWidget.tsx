
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, Opponent } from '@shared/schema';
import { getWinLoseLabel } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
  // Get completed games sorted by date (most recent first)
  const completedGames = games
    .filter(game => game.completed && game.status !== 'forfeit')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5); // Last 5 games

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
    switch (result) {
      case 'Win':
        return <Badge variant="outline" className="bg-green-100 text-green-700 text-xs px-2 py-0">W</Badge>;
      case 'Loss':
        return <Badge variant="outline" className="bg-red-100 text-red-700 text-xs px-2 py-0">L</Badge>;
      case 'Draw':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2 py-0">D</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2 py-0">-</Badge>;
    }
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
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold text-neutral-dark">Recent Form</h3>
          </div>
          <div className="text-center text-gray-500">
            <p>No completed games yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Recent Form</h3>
          {getTrendIcon()}
        </div>

        {/* Form visualization */}
        <div className="flex justify-center space-x-2 mb-4">
          {formData.map((game, index) => (
            <div key={game.id} className="text-center">
              {getResultBadge(game.result)}
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center bg-primary/5 p-2 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Win Rate</p>
            <p className="text-lg font-bold text-primary">{winPercentage}%</p>
            <p className="text-xs text-gray-600">{wins}W {losses}L {draws > 0 ? `${draws}D` : ''}</p>
          </div>
          <div className="text-center bg-primary/5 p-2 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Recent</p>
            <p className="text-lg font-bold text-primary">{completedGames.length}</p>
            <p className="text-xs text-gray-600">Games</p>
          </div>
        </div>

        {/* Detailed game results */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Recent Results</p>
          {formData.slice(0, 3).map((game, index) => (
            <div key={game.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">{game.opponent}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{game.teamScore}-{game.opponentScore}</span>
                {getResultBadge(game.result)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
