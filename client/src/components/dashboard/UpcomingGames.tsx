import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { CalendarDays } from 'lucide-react';
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
  
  const getOpponentName = (opponentId: number) => {
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Upcoming Games</h3>
          <Link href="/games">
            <a className="text-accent text-sm hover:underline">View all</a>
          </Link>
        </div>
        
        {upcomingGames.length > 0 ? (
          <div className="space-y-4">
            {upcomingGames.map((game, index) => (
              <div 
                key={game.id} 
                className={`flex justify-between items-center p-3 border-l-4 rounded ${
                  index === 0 ? 'border-primary bg-primary/5' : 'border-accent bg-accent/5'
                }`}
              >
                <div>
                  <p className="font-semibold">vs. {getOpponentName(game.opponentId)}</p>
                  <p className="text-xs text-gray-500">{formatShortDate(game.date)} • {game.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {index === 0 ? 'Next Game' : ''}
                  </p>
                  <p className="text-xs text-gray-500">Home</p>
                </div>
              </div>
            ))}
            
            {upcomingGames.length < 3 && upcomingGames.length > 0 && (
              <Link href="/games/new">
                <a className="flex items-center justify-center p-3 border border-dashed border-gray-300 rounded-md text-gray-500 hover:text-primary hover:border-primary transition-colors">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  <span>Schedule more games</span>
                </a>
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No upcoming games scheduled</p>
            <Link href="/games">
              <a className="text-accent hover:underline">Go to Games</a>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
