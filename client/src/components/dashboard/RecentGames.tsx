import { useState, useEffect } from 'react';
import { BaseWidget } from '@/components/ui/base-widget';
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
      const isCompleted = game.gameStatus?.isCompleted ?? game.completed;
      return isCompleted;
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

  // Calculate win/loss streaks
  const calculateStreaks = () => {
    const sortedCompleted = games
      .filter(game => game.gameStatus?.isCompleted === true)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStreak = 0;
    let streakType = '';
    
    for (const game of sortedCompleted) {
      const [teamScore, opponentScore] = getScores(game);
      const result = teamScore > opponentScore ? 'W' : teamScore < opponentScore ? 'L' : 'D';
      
      if (currentStreak === 0) {
        currentStreak = 1;
        streakType = result;
      } else if (result === streakType) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { streak: currentStreak, type: streakType };
  };

  // Calculate performance trends
  const calculateTrend = () => {
    if (recentGames.length < 3) return 'stable';
    
    const recent3 = recentGames.slice(-3);
    const wins = recent3.filter(game => {
      const [teamScore, opponentScore] = getScores(game);
      return teamScore > opponentScore;
    }).length;
    
    if (wins >= 2) return 'improving';
    if (wins === 0) return 'declining';
    return 'stable';
  };

  // Calculate average score margin
  const calculateAvgMargin = () => {
    if (recentGames.length === 0) return 0;
    
    const totalMargin = recentGames.reduce((sum, game) => {
      const [teamScore, opponentScore] = getScores(game);
      return sum + (teamScore - opponentScore);
    }, 0);
    
    return Math.round(totalMargin / recentGames.length * 10) / 10;
  };

  // Get time since last game
  const getTimeSinceLastGame = () => {
    if (recentGames.length === 0) return '';
    
    const lastGame = recentGames[0];
    const gameDate = new Date(lastGame.date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const { streak, type: streakType } = calculateStreaks();
  const trend = calculateTrend();
  const avgMargin = calculateAvgMargin();
  const timeSinceLastGame = getTimeSinceLastGame();

  return (
    <BaseWidget 
      className={className} 
      title="Recent Games"
      contentClassName="px-4 py-6 pb-2"
    >
        {/* Enhanced Stats Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Win/Loss Streak */}
          <div className="text-center">
            <div className={`text-lg font-bold ${
              streakType === 'W' ? 'text-green-600' : 
              streakType === 'L' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {streak > 0 ? `${streak}${streakType}` : '—'}
            </div>
            <div className="text-xs text-gray-500">Current Streak</div>
          </div>
          
          {/* Performance Trend */}
          <div className="text-center">
            <div className={`text-lg font-bold ${
              trend === 'improving' ? 'text-green-600' : 
              trend === 'declining' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'improving' ? '↗' : trend === 'declining' ? '↘' : '→'}
            </div>
            <div className="text-xs text-gray-500">Trend</div>
          </div>
          
          {/* Average Margin */}
          <div className="text-center">
            <div className={`text-lg font-bold ${
              avgMargin > 0 ? 'text-green-600' : 
              avgMargin < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {avgMargin > 0 ? '+' : ''}{avgMargin}
            </div>
            <div className="text-xs text-gray-500">Avg Margin</div>
          </div>
        </div>

        {/* Time Since Last Game */}
        {timeSinceLastGame && (
          <div className="text-center mb-4 p-2 bg-blue-50 rounded border border-blue-200">
            <span className="text-sm text-blue-700">Last game: {timeSinceLastGame}</span>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading recent games...</p>
          ) : recentGames.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent games to display</p>
          ) : (
            recentGames.map(game => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <div 
                  className={`flex justify-between items-center p-4 border-l-4 border-t border-r border-b rounded ${getResultClass(game)} cursor-pointer ${getHoverClass(game)} transition-colors`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{getOpponentName(game.opponentId)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-700">{formatShortDate(game.date)}</p>
                      {game.round && (
                        <GameBadge variant="round">
                          Round {game.round}
                        </GameBadge>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div className={`text-xs font-semibold ${getResultTextClass(game)}`}>
                      {getResultText(game)}
                    </div>
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
    </BaseWidget>
  );
}