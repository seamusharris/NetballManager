import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Game, Opponent } from '@shared/schema';
import { formatShortDate, getWinLoseClass } from '@/lib/utils';

interface RecentGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
}

export default function RecentGames({ games, opponents, className }: RecentGamesProps) {
  // Take the 3 most recent completed games
  const recentGames = games
    .filter(game => game.completed)
    .slice(0, 3);
  
  const getOpponentName = (opponentId: number) => {
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };
  
  // These would normally come from actual stats, using placeholders for now
  const getScores = (game: Game): [number, number] => {
    // In a real implementation, this would calculate from actual game stats
    // For now, generate placeholder scores
    const hashCode = (game.id * 7 + game.opponentId * 13) % 100;
    const teamScore = 30 + (hashCode % 20);
    const opponentScore = 25 + ((hashCode + 7) % 25);
    
    return [teamScore, opponentScore];
  };
  
  const getResultClass = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) return 'border-success bg-success/5';
    if (teamScore < opponentScore) return 'border-error bg-error/5';
    return 'border-warning bg-warning/5';
  };
  
  const getResultText = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) return `W ${teamScore}-${opponentScore}`;
    if (teamScore < opponentScore) return `L ${teamScore}-${opponentScore}`;
    return `D ${teamScore}-${opponentScore}`;
  };
  
  const getResultTextClass = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) return 'text-success';
    if (teamScore < opponentScore) return 'text-error';
    return 'text-warning';
  };
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Recent Games</h3>
          <Link href="/games">
            <a className="text-accent text-sm hover:underline">View all</a>
          </Link>
        </div>
        <div className="space-y-4">
          {recentGames.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent games to display</p>
          ) : (
            recentGames.map(game => (
              <div 
                key={game.id} 
                className={`flex justify-between items-center p-3 border-l-4 rounded ${getResultClass(game)}`}
              >
                <div>
                  <p className="font-semibold">vs. {getOpponentName(game.opponentId)}</p>
                  <p className="text-xs text-gray-500">{formatShortDate(game.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getResultTextClass(game)}`}>{getResultText(game)}</p>
                  <p className="text-xs text-gray-500">Home</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
