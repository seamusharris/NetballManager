import { useState, useEffect } from 'react';
import { BaseWidget } from '@/components/ui/base-widget';
import { Link } from 'wouter';
import { Game, GameStat } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import GameResultCard from '@/components/ui/game-result-card';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import { RECENT_GAMES_COUNT } from '@/lib/constants';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { statisticsService } from '@/lib/statisticsService';

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
  const { currentTeam } = useClub();

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

  // Transform and validate batch scores for each game
  const transformedScores = {};
  recentGames.forEach(game => {
    const gameScores = centralizedScores?.[game.id];
    console.log(`RecentGames: Game ${game.id} (${game.awayTeamName} vs ${game.homeTeamName}) batch scores:`, gameScores);

    if (gameScores && Array.isArray(gameScores) && gameScores.length > 0) {
      // Transform the batch format to the format expected by GameResultCard
      try {
        transformedScores[game.id] = gameScores.map(score => ({
          id: score.id,
          gameId: score.gameId,
          teamId: score.teamId,
          quarter: score.quarter,
          score: score.score,
          enteredBy: score.enteredBy,
          enteredAt: score.enteredAt,
          updatedAt: score.updatedAt,
          notes: score.notes
        }));
        console.log(`RecentGames: Game ${game.id} transformed scores:`, transformedScores[game.id].map(s => `Q${s.quarter}: T${s.teamId}=${s.score}`));
      } catch (error) {
        console.error(`RecentGames: Error transforming scores for game ${game.id}:`, error);
        transformedScores[game.id] = [];
      }
    } else {
      transformedScores[game.id] = [];
      console.log(`RecentGames: Game ${game.id} has no scores in batch data - setting empty array`);
    }
  });

  console.log('RecentGames: Final transformed scores object:', transformedScores);

  // Use centralized stats for game data
  const isLoading = false;

  return (
    <BaseWidget 
      className={className} 
      title="Recent Games"
      contentClassName="px-4 py-6 pb-2"
    >
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading recent games...</p>
          ) : recentGames.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent games to display</p>
          ) : (
            recentGames.map(game => (
              <Link key={game.id} href={`/team/${currentTeam?.id}/game/${game.id}`}>
                <GameResultCard
                  key={game.id}
                  game={game}
                  layout="medium"
                  gameStats={centralizedStats?.[game.id] || []}
                  centralizedScores={transformedScores[game.id] || []}
                  useOfficialPriority={true}
                  showDate={true}
                  showRound={true}
                  showScore={true}
                  className="mb-4"
                  currentTeamId={clubWide ? null : currentTeam?.id}
                  clubTeams={teams || []}
                  showLink={false}
                />
              </Link>
            ))
          )}
        </div>

        {games.filter(game => game.statusIsCompleted === true).length > RECENT_GAMES_COUNT ? (
          <ViewMoreButton href={`/games/${currentTeam?.id}?status=completed`}>
            View more →
          </ViewMoreButton>
        ) : (
          <div className="mb-4" />
        )}
    </BaseWidget>
  );
}

// Export both as default and named export to handle different import styles
export default RecentGames;
export { RecentGames };