import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { useLocation } from 'wouter';
import { Game } from '@/shared/schema';
import { UnifiedGameWidget } from '@/components/ui/unified-game-widget';

interface RecentGamesProps {
  className?: string;
}

export default function RecentGames({ className = "" }: RecentGamesProps) {
  const { currentTeam, currentClub } = useClub();
  const [location] = useLocation();

  // Detect context: if we're on club dashboard, use club-wide data; otherwise use team data
  const isClubDashboard = location.includes('/club/') && location.includes('/dashboard');
  const useClubWideData = isClubDashboard || !currentTeam;

  // Choose the appropriate API endpoint based on context
  const apiEndpoint = useClubWideData 
    ? `/api/clubs/${currentClub?.id}/games`
    : `/api/teams/${currentTeam?.id}/games`;

  const queryKey = useClubWideData 
    ? ['club', currentClub?.id, 'games']
    : ['team', currentTeam?.id, 'games'];

  const enabled = useClubWideData ? !!currentClub?.id : !!currentTeam?.id;

  const { data: games = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error('Failed to fetch games');
      return response.json();
    },
    enabled,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Recent Games</h3>
        <p className="text-gray-500 text-center py-4">Loading recent games...</p>
      </div>
    );
  }

  // Configuration for the unified widget
  const title = useClubWideData ? "Recent Club Games" : "Recent Games";
  const viewMoreHref = useClubWideData 
    ? `/club/${currentClub?.id}/games?status=completed`
    : `/team/${currentTeam?.id}/games?status=completed`;

  return (
    <UnifiedGameWidget
      games={games}
      currentTeamId={currentTeam?.id}
      currentClubId={currentClub?.id}
      mode="recent-form"
      title={title}
      maxGames={5}
      compact={true}
      className={className}
      showViewMore={true}
      viewMoreHref={viewMoreHref}
      viewMoreText="View more →"
      emptyMessage="No recent games available"
      emptyDescription="Recent completed games will appear here"
    />
  );
}