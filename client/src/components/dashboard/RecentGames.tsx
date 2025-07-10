import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClubContext } from '@/contexts/ClubContext';
import { Game } from '@/shared/schema';
import { getCompletedGamesForStats } from '@/lib/gameFilters';
import GameAnalysisWidget from '@/components/ui/game-analysis-widget';

const RECENT_GAMES_COUNT = 5;

interface RecentGamesProps {
  className?: string;
}

export default function RecentGames({ className = "" }: RecentGamesProps) {
  const { currentTeam, currentClub } = useClubContext();

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['team', currentTeam?.id, 'games'],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${currentTeam?.id}/games`);
      if (!response.ok) throw new Error('Failed to fetch games');
      return response.json();
    },
    enabled: !!currentTeam?.id,
  });

  // Filter for completed games that allow statistics
  const completedGames = getCompletedGamesForStats(games);
  const recentGames = completedGames.slice(0, RECENT_GAMES_COUNT);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Recent Games</h3>
        <p className="text-gray-500 text-center py-4">Loading recent games...</p>
      </div>
    );
  }

  if (recentGames.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Recent Games</h3>
        <p className="text-gray-500 text-center py-4">No recent games available</p>
      </div>
    );
  }

  return (
    <GameAnalysisWidget
      historicalGames={recentGames}
      currentTeamId={currentTeam?.id || 0}
      currentClubId={currentClub?.id || 0}
      opponentName="Recent Form"
      title="Recent Games"
      className={className}
      showAnalytics={false}
      showQuarterScores={false}
      maxGames={RECENT_GAMES_COUNT}
      compact={true}
      showViewMore={completedGames.length > RECENT_GAMES_COUNT}
      viewMoreHref={`/team/${currentTeam?.id}/games?status=completed`}
      viewMoreText="View more →"
    />
  );
}