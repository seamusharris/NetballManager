import { BaseWidget } from '@/components/ui/base-widget';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Game, Opponent } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';
import { GameBadge } from '@/components/ui/game-badge';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import { useClub } from '@/contexts/ClubContext';

interface UpcomingGamesProps {
  games: Game[];
  centralizedScoresMap?: { [gameId: number]: any[] };
  opponents: Opponent[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
  batchStats?: Record<number, any[]>;
}

function UpcomingGames({ games, centralizedScoresMap, opponents, className, seasonFilter, activeSeason, batchStats }: UpcomingGamesProps) {
  const { currentTeam } = useClub();
  // Filter for upcoming games using the new status system
  const upcomingGames = games
    .filter(game => {
      const isCompleted = game.statusIsCompleted === true || 
                         game.gameStatus?.isCompleted === true || 
                         game.completed === true;
      // Parse the game date and normalize to start of day
      const gameDate = new Date(game.date);
      if (isNaN(gameDate.getTime())) {
        console.warn('Invalid game date for game ' + game.id + ': ' + game.date);
        return false;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Normalize game date to start of day for comparison
      const gameDateNormalized = new Date(gameDate);
      gameDateNormalized.setHours(0, 0, 0, 0);

      // A game is upcoming if:
      // 1. It's not completed (regardless of status)
      // 2. The game date is today or in the future
      // 3. It's not a bye game
      const isUpcoming = !isCompleted && gameDateNormalized >= today && !game.isBye;

      return isUpcoming;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Limit to next 5 upcoming games

  // Always show home vs away format
  const getOpponentName = (game: any) => {
    // Handle BYE games
    if (game.awayTeamName === 'Bye' || game.awayTeamName === null) {
      return 'BYE';
    }

    // Always show "Home Team vs Away Team" format
    return `${game.homeTeamName || 'Unknown'} vs ${game.awayTeamName || 'Unknown'}`;
  };

  return (
    <BaseWidget 
      title="Upcoming Games" 
      className={className}
      contentClassName="px-4 py-6 pb-2"
    >

        {upcomingGames.length > 0 ? (
          <div className="space-y-6">
            {upcomingGames.map((game, index) => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <div className={`flex justify-between items-center p-4 mb-6 mt-2 border-l-4 border-t border-r border-b rounded cursor-pointer hover:bg-blue-100 transition-colors ${
                    index === 0 ? 'border-blue-500 bg-blue-50 border-t-blue-500 border-r-blue-500 border-b-blue-500' : 'border-blue-400 bg-blue-50 border-t-blue-400 border-r-blue-400 border-b-blue-400'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{getOpponentName(game)}</p>
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
                    {game.statusIsCompleted ? (
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
            <Link href={currentTeam ? `/games/${currentTeam.id}` : "/games"} className="text-accent hover:underline">
              Go to Games List
            </Link>
          </div>
        )}

        {games.filter(game => {
          const isCompleted = game.statusIsCompleted === true || 
                             game.gameStatus?.isCompleted === true || 
                             game.completed === true;
          return !isCompleted;
        }).length > 5 ? (
          <ViewMoreButton href={`/games/${currentTeam?.id}?status=upcoming`}>
            View more →
          </ViewMoreButton>
        ) : (
          <div className="mb-4" />
        )}
    </BaseWidget>
  );
}

// Export both as default and named export to handle different import styles
export default UpcomingGames;
export { UpcomingGames };