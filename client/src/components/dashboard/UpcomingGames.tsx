import { BaseWidget } from '@/components/ui/base-widget';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Game, Opponent } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';
import { GameBadge } from '@/components/ui/game-badge';
import { ViewMoreButton } from '@/components/ui/view-more-button';

interface UpcomingGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
}

export default function UpcomingGames({ games, opponents, className, seasonFilter, activeSeason }: UpcomingGamesProps) {
  // Filter for upcoming games using the isCompleted flag from game_statuses table
  const upcomingGames = games
    .filter(game => {
        const isCompleted = game.gameStatus?.isCompleted ?? game.completed;
        return !isCompleted;
      });

  const getOpponentName = (opponentId: number | null) => {
    if (!opponentId) return 'Unknown Opponent';
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };

  return (
    <BaseWidget 
      title="Upcoming Games" 
      className={className}
      contentClassName="px-4 py-6 pb-2"
    >

        {upcomingGames.length > 0 ? (
          <div className="space-y-8">
            {upcomingGames.map((game, index) => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <div className={`flex justify-between items-center p-4 mb-4 mt-2 border-l-4 border-t border-r border-b rounded cursor-pointer hover:bg-blue-100 transition-colors ${
                    index === 0 ? 'border-blue-500 bg-blue-50 border-t-blue-500 border-r-blue-500 border-b-blue-500' : 'border-blue-400 bg-blue-50 border-t-blue-400 border-r-blue-400 border-b-blue-400'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{getOpponentName(game.opponentId)}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-700">{formatShortDate(game.date)} • {game.time}</p>
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

        {upcomingGames.length > upcomingGames.slice(0, 5).length ? (
          <ViewMoreButton href="/games?status=upcoming">
            View more →
          </ViewMoreButton>
        ) : (
          <div className="mb-4" />
        )}
    </BaseWidget>
  );
}