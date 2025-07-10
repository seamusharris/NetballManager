import React from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useLocation } from 'wouter';
import { Game } from '@/shared/schema';
import GameResultCard from '@/components/ui/game-result-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewMoreButton } from '@/components/ui/view-more-button';

interface RecentGamesProps {
  className?: string;
  games?: any[]; // Accept games as prop
  centralizedScores?: any[]; // Accept scores data
  isLoading?: boolean; // Accept loading state as prop
}

export default function RecentGames({ 
  className = "", 
  games = [], 
  centralizedScores = [],
  isLoading = false 
}: RecentGamesProps) {
  const { currentTeam, currentClub } = useClub();
  const [location] = useLocation();

  // Detect context: if we're on club dashboard, use club-wide data; otherwise use team data
  const isClubDashboard = location.includes('/club/') && location.includes('/dashboard');
  const useClubWideData = isClubDashboard || !currentTeam;

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Games</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">Loading recent games...</p>
        </CardContent>
      </Card>
    );
  }

  // Filter to recent completed games
  const recentCompletedGames = games
    .filter(game => game.statusIsCompleted === true || game.statusName === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const title = useClubWideData ? "Recent Club Games" : "Recent Games";
  const viewMoreHref = useClubWideData 
    ? `/club/${currentClub?.id}/games?status=completed`
    : `/team/${currentTeam?.id}/games?status=completed`;

  if (recentCompletedGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No recent games found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentCompletedGames.map((game) => (
          <GameResultCard
            key={game.id}
            game={game}
            layout="medium"
            currentTeamId={useClubWideData ? undefined : currentTeam?.id}
            currentClubId={currentClub?.id}
            centralizedScores={centralizedScores}
            showDate={true}
            showRound={true}
            showScore={true}
            showQuarterScores={false}
            showLink={true}
          />
        ))}
        
        {games.length > 5 && (
          <div className="mt-3">
            <ViewMoreButton href={viewMoreHref}>
              View more →
            </ViewMoreButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}