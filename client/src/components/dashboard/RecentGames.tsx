import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Game, Opponent, GameStat } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ScoreBadge } from '@/components/ui/score-badge';
import { GameBadge } from '@/components/ui/game-badge';
import { ViewMoreButton } from '@/components/ui/view-more-button';

interface RecentGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
  centralizedStats?: Record<number, any[]>;
}

export default function RecentGames({ games, opponents, className, seasonFilter, activeSeason, centralizedStats }: RecentGamesProps) {
  // Filter for recent completed games using gameStatus
  const recentGames = games
    .filter(game => {
      console.log(`RecentGames filtering game ${game.id}: isCompleted=${game.gameStatus?.isCompleted}, status=${game.gameStatus?.name}`);
      return game.gameStatus?.isCompleted === true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Use centralized stats if available, otherwise empty object
  const allGameStats = centralizedStats || {};
  const isLoading = !centralizedStats;

  const getOpponentName = (opponentId: number | null) => {
    if (!opponentId) return 'Unknown Opponent';
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };

  // Calculate scores from game stats
  const getScores = (game: Game): [number, number] => {
    const gameStatsList = allGameStats?.[game.id] || [];

    // If no stats found, return 0-0
    if (gameStatsList.length === 0) {
      return [0, 0];
    }

    // Use the same calculation method as in GamesList.tsx
    // First, calculate goals by quarter
    const quarterGoals: Record<number, { for: number, against: number }> = {
      1: { for: 0, against: 0 },
      2: { for: 0, against: 0 },
      3: { for: 0, against: 0 },
      4: { for: 0, against: 0 }
    };

    // Create a map of the latest stats for each position/quarter combination (or legacy stats)
    const latestPositionStats: Record<string, GameStat> = {};

    // Find the latest stat for each position/quarter combination
    gameStatsList.forEach(stat => {
      if (!stat || !stat.quarter) return;

      // For position-based stats (with valid position)
      if (stat.position) {
        const key = `${stat.position}-${stat.quarter}`;

        // Keep only the newest stat entry for each position/quarter
        if (!latestPositionStats[key] || stat.id > latestPositionStats[key].id) {
          latestPositionStats[key] = stat;
        }
      }
      // For legacy stats (with null position but valid data)
      else {
        // Only include legacy stats if they have valid goal data
        if (typeof stat.goalsFor === 'number' || typeof stat.goalsAgainst === 'number') {
          // Use a special key format for legacy stats
          const key = `legacy-${stat.id}-${stat.quarter}`;
          latestPositionStats[key] = stat;
        }
      }
    });

    // Use only the latest stats for calculating quarter goals
    Object.values(latestPositionStats).forEach(stat => {
      if (stat && stat.quarter >= 1 && stat.quarter <= 4) {
        quarterGoals[stat.quarter].for += (stat.goalsFor || 0);
        quarterGoals[stat.quarter].against += (stat.goalsAgainst || 0);
      }
    });

    // Calculate total goals
    const teamScore = Object.values(quarterGoals).reduce((sum, q) => sum + q.for, 0);
    const opponentScore = Object.values(quarterGoals).reduce((sum, q) => sum + q.against, 0);

    return [teamScore, opponentScore];
  };

  const getResultClass = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) {
      return 'border-green-500 bg-green-50';
    } else if (teamScore < opponentScore) {
      return 'border-red-500 bg-red-50';
    } else {
      return 'border-yellow-500 bg-yellow-50';
    }
  };

  const getResultText = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) return `W ${teamScore}-${opponentScore}`;
    if (teamScore < opponentScore) return `L ${teamScore}-${opponentScore}`;
    return `D ${teamScore}-${opponentScore}`;
  };

  const getResultTextClass = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) return 'text-success';
    if (teamScore < opponentScore) return 'text-error';
    return 'text-warning';
  };

  const getHoverClass = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) {
      return 'hover:bg-green-100';
    } else if (teamScore < opponentScore) {
      return 'hover:bg-red-100';
    } else {
      return 'hover:bg-yellow-100';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Games</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pb-2">
        <div className="space-y-8">
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading recent games...</p>
          ) : recentGames.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent games to display</p>
          ) : (
            recentGames.map(game => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <div 
                  className={`flex justify-between items-center p-4 mb-4 mt-2 border-l-4 border-t border-r border-b rounded ${getResultClass(game)} cursor-pointer ${getHoverClass(game)} transition-colors`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{getOpponentName(game.opponentId)}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-700">{formatShortDate(game.date)}</p>
                      {game.round && (
                        <GameBadge variant="round">
                          Round {game.round}
                        </GameBadge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <ScoreBadge 
                      teamScore={getScores(game)[0]} 
                      opponentScore={getScores(game)[1]} 
                      size="md"
                    />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {games.filter(game => game.gameStatus?.isCompleted === true).length > 3 ? (
          <ViewMoreButton href="/games?status=completed">
            View more →
          </ViewMoreButton>
        ) : (
          <div className="mb-4" />
        )}
      </CardContent>
    </Card>
  );
}