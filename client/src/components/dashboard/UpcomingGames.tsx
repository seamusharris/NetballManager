import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Game, Opponent } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';

interface UpcomingGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
}

export default function UpcomingGames({ games, opponents, className }: UpcomingGamesProps) {
  // Filter out completed games and take the 3 most immediate upcoming games
  const upcomingGames = games
    .filter(game => !game.completed)
    .slice(0, 3);
  
  const getOpponentName = (opponentId: number | null) => {
    if (!opponentId) return 'Unknown Opponent';
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Upcoming Games</h3>
          <Link href="/games" className="text-accent text-sm hover:underline">
            View all
          </Link>
        </div>
        
        {upcomingGames.length > 0 ? (
          <div className="space-y-8">
            {upcomingGames.map((game, index) => (
              <Link key={game.id} href={`/games/${game.id}`}>
                <div 
                  className={`flex justify-between items-center p-3 border-l-4 rounded cursor-pointer hover:bg-accent/10 transition-colors ${
                    index === 0 ? 'border-primary bg-primary/5' : 'border-accent bg-accent/5'
                  }`}
                >
                  <div>
                    <p className="font-semibold">vs. {getOpponentName(game.opponentId)}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{formatShortDate(game.date)} • {game.time}</p>
                      {game.round && (
                        <span className="text-xs px-1.5 py-0.5 bg-secondary/10 text-secondary rounded-full">
                          Round {game.round}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No upcoming games scheduled</p>
            <Link href="/games" className="text-accent hover:underline">
              Go to Games
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
