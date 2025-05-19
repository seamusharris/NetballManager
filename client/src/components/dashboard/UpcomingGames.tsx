import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Plus } from 'lucide-react';
import { Game, Opponent } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';

interface UpcomingGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
}

export default function UpcomingGames({ games, opponents, className }: UpcomingGamesProps) {
  // Take the 3 most immediate upcoming games
  const upcomingGames = games.slice(0, 3);
  
  const getOpponentName = (opponentId: number) => {
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Upcoming Games</h3>
          <Link href="/games/new">
            <Button variant="default" size="sm" className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-light">
              <Plus className="w-3 h-3 mr-1" /> Add Game
            </Button>
          </Link>
        </div>
        
        {upcomingGames.length > 0 ? (
          <>
            {/* Featured next game with image */}
            <div className="relative mb-4 h-32 rounded overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=200" 
                alt="Netball court with players" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                <div className="text-white">
                  <p className="font-bold">vs. {getOpponentName(upcomingGames[0].opponentId)}</p>
                  <p className="text-sm">{formatShortDate(upcomingGames[0].date)} • {upcomingGames[0].time}</p>
                </div>
              </div>
            </div>
            
            {/* Other upcoming games */}
            <div className="space-y-3">
              {upcomingGames.slice(1).map(game => (
                <div key={game.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">vs. {getOpponentName(game.opponentId)}</p>
                    <p className="text-xs text-gray-500">{formatShortDate(game.date)} • {game.time}</p>
                  </div>
                  <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs">Home</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No upcoming games scheduled</p>
            <Link href="/games/new">
              <Button variant="default" className="bg-primary text-white hover:bg-primary-light">
                Schedule a Game
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
