import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Game, Opponent } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';
import { GameBadge } from '@/components/ui/game-badge';

interface UpcomingGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
}

export default function UpcomingGames({ games, opponents, className, seasonFilter, activeSeason }: UpcomingGamesProps) {
  // Filter for upcoming games using the isCompleted flag from game_statuses table
  const upcomingGames = games.filter(game => {
    console.log(`UpcomingGames filtering game ${game.id}: isCompleted=${game.gameStatus?.isCompleted}, status=${game.gameStatus?.name}`);
    return game.gameStatus?.isCompleted !== true;
  });

  const getOpponentName = (opponentId: number | null) => {
    if (!opponentId) return 'Unknown Opponent';
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };

  return (
    <Card className={className}>
      <CardContent className="p-6 pb-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Upcoming Games</h3>
          <Link href="/games?status=upcoming" className="text-accent text-sm hover:underline">
            View all
          </Link>
        </div>

        {upcomingGames.length > 0 ? (
          <div className="space-y-8">
            {upcomingGames.map((game, index) => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <div className={`flex justify-between items-center p-4 mb-4 mt-2 border-l-4 rounded cursor-pointer hover:bg-blue-100 transition-colors ${
                    index === 0 ? 'border-blue-500 bg-blue-50' : 'border-blue-400 bg-blue-50'
                  }`}
                >
                  <div>
                    <p className="font-semibold">vs. {getOpponentName(game.opponentId)}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{formatShortDate(game.date)} • {game.time}</p>
                      {game.round && (
                        <GameBadge variant="round">
                          Round {game.round}
                        </GameBadge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {game.completed ? (
                      <GameScoreDisplay gameId={game.id} compact={true} fallback="—" />
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No upcoming games scheduled</p>
            <Link href="/games" className="text-accent hover:underline">
              Go to Games List
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}