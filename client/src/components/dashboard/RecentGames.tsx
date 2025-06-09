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
}

export default function RecentGames({ games, opponents, className, seasonFilter, activeSeason, centralizedStats, teams }: RecentGamesProps) {
  const { currentTeam } = useClub();

  // Filter for recent completed games using the new status system
  const recentGames = games
    .filter(game => {
      // Use the primary status field from the team-based system
      const isCompleted = game.statusIsCompleted === true;

      console.log(`Game ${game.id} completion check:`, {
        statusIsCompleted: game.statusIsCompleted,
        finalResult: isCompleted
      });

      return isCompleted;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RECENT_GAMES_COUNT);

  // For recent games, we'll fetch official scores and use the priority system
  const { data: officialScoresMap = {} } = useQuery({
    queryKey: ['official-scores-batch', recentGames.map(g => g.id)],
    queryFn: async () => {
      const scoresMap: Record<number, any> = {};
      
      // Fetch official scores for each game
      await Promise.all(
        recentGames.map(async (game) => {
          try {
            const officialScores = await apiClient.get(`/api/games/${game.id}/scores`);
            if (officialScores && Array.isArray(officialScores) && officialScores.length > 0) {
              scoresMap[game.id] = officialScores;
            }
          } catch (error) {
            // No official scores available, will fall back to live stats
          }
        })
      );
      
      return scoresMap;
    },
    enabled: recentGames.length > 0,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const isLoading = false;

  return (
    <BaseWidget 
      className={className} 
      title="Recent Games"
      contentClassName="px-4 py-6 pb-2"
    >
        <div className="space-y-4">
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
                officialScores={officialScoresMap[game.id]}
                useOfficialPriority={true}
                showDate={true}
                showRound={true}
                showScore={true}
                className="mb-2"
                currentTeamId={currentTeam?.id}
                clubTeams={teams || []}
              />
            ))
          )}
        </div>

        {games.filter(game => game.statusIsCompleted === true).length > RECENT_GAMES_COUNT ? (
          <ViewMoreButton href="/games?status=completed">
            View more →
          </ViewMoreButton>
        ) : (
          <div className="mb-4" />
        )}
    </BaseWidget>
  );
}