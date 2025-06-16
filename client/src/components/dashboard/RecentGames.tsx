import { useState, useEffect } from 'react';
import { BaseWidget } from '@/components/ui/base-widget';
import { Link } from 'wouter';
import { Game, Opponent, GameStat } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GameResultCard } from '@/components/ui/game-result-card';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import { RECENT_GAMES_COUNT } from '@/lib/constants';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';

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

export default function RecentGames({ games, opponents, className, seasonFilter, activeSeason, centralizedStats, teams, centralizedScores, clubWide }: RecentGamesProps) {
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
  console.log('RecentGames received centralizedScores (batch format):', centralizedScores);
  console.log('RecentGames recentGames count:', recentGames.length);
  
  // Transform and validate batch scores for each game
  recentGames.forEach(game => {
    const gameScores = centralizedScores?.[game.id];
    console.log(`Game ${game.id} (${game.awayTeamName} vs ${game.homeTeamName}) extracting scores from batch:`, gameScores);
    if (gameScores && gameScores.length > 0) {
      console.log(`Game ${game.id} transformed score details:`, gameScores.map(s => `Q${s.quarter}: T${s.teamId}=${s.score}`));
    } else {
      console.log(`Game ${game.id} has no scores in batch data`);
    }
  });

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
              <GameResultCard
                key={game.id}
                game={game}
                layout="medium"
                gameStats={centralizedStats?.[game.id] || []}
                centralizedScores={centralizedScores?.[game.id] || []}
                useOfficialPriority={true}
                showDate={true}
                showRound={true}
                showScore={true}
                className="mb-4"
                currentTeamId={clubWide ? null : currentTeam?.id}
                clubTeams={teams || []}
              /></old_str>
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