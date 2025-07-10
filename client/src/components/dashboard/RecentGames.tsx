import { BaseWidget } from '@/components/ui/base-widget';
import { Game } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import GameAnalysisWidget from '@/components/ui/game-analysis-widget';
import { RECENT_GAMES_COUNT } from '@/lib/constants';
import { useClub } from '@/contexts/ClubContext';

interface RecentGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
  centralizedStats?: Record<number, any[]>;
  teams?: any[];
  centralizedScores?: Record<number, any[]>;
  clubWide?: boolean; // When true, don't filter by current team
}

function RecentGames({ games, opponents, className, seasonFilter, activeSeason, centralizedStats, teams, centralizedScores, clubWide }: RecentGamesProps) {
  const { currentTeam, currentClub } = useClub();

  // Filter for recent completed games using the new status system
  const recentGames = (games || [])
    .filter(game => {
      const isCompleted = game.statusIsCompleted === true;

      console.log(`Game ${game.id} completion check:`, {
        statusIsCompleted: game.statusIsCompleted,
        finalResult: isCompleted
      });

      return isCompleted;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RECENT_GAMES_COUNT);

  // Debug centralized scores with more detail
  console.log('RecentGames: Received centralizedScores (batch format):', centralizedScores);
  console.log('RecentGames: Recent games count:', recentGames.length);
  console.log('RecentGames: Recent games IDs:', recentGames.map(g => g.id));
  console.log('RecentGames: Games involved teams:', recentGames.map(g => `${g.id}: ${g.homeTeamId} vs ${g.awayTeamId}`));

  if (recentGames.length === 0) {
    return (
      <BaseWidget 
        className={className} 
        title="Recent Games"
        contentClassName="px-4 py-6 pb-2"
      >
        <p className="text-gray-500 text-center py-4">No recent games to display</p>
      </BaseWidget>
    );
  }

  // Use GameAnalysisWidget for consistent display
  return (
    <GameAnalysisWidget
      historicalGames={recentGames}
      currentTeamId={clubWide ? 0 : currentTeam?.id || 0}
      currentClubId={currentClub?.id || 0}
      batchScores={centralizedScores || {}}
      batchStats={centralizedStats || {}}
      title="Recent Games"
      className={className}
      showAnalytics={false} // Don't show analytics for recent games widget
      showQuarterScores={true}
      maxGames={RECENT_GAMES_COUNT}
      compact={true}
      showViewMore={games.filter(game => game.statusIsCompleted === true).length > RECENT_GAMES_COUNT}
      viewMoreHref={`/team/${currentTeam?.id}/games?status=completed`}
      viewMoreText="View more →"
    />
  );
}

// Export both as default and named export to handle different import styles
export default RecentGames;
export { RecentGames };