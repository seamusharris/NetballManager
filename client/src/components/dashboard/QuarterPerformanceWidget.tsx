import { BaseWidget } from '@/components/ui/base-widget';
import { Badge } from '@/components/ui/badge';
import { Game } from '@shared/schema';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { isGameValidForStatistics } from '@/lib/gameFilters';

interface QuarterPerformanceWidgetProps {
  games: Game[];
  className?: string;
  activeSeason?: any;
  selectedSeason?: any;
}

export default function QuarterPerformanceWidget({ 
  games, 
  className, 
  activeSeason, 
  selectedSeason 
}: QuarterPerformanceWidgetProps) {
  const [quarterPerformance, setQuarterPerformance] = useState<{
    avgTeamScoreByQuarter: Record<number, number>;
    avgOpponentScoreByQuarter: Record<number, number>;
  }>({
    avgTeamScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    avgOpponentScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 }
  });

  // Get games valid for statistics - memoize to prevent infinite re-renders
  const validGameIds = useMemo(() => {
    const validGames = games.filter(game => {
      // Must have a game status
      if (!game.gameStatus) return false;

      // Must be completed
      if (!game.gameStatus.isCompleted) return false;

      // Must allow statistics (this covers forfeit games, BYE games, etc.)
      if (!game.gameStatus.allowsStatistics) return false;

      // Exclude abandoned games from statistics
      if (game.gameStatus.name === 'abandoned') return false;

      return true;
    });

    console.log('QuarterPerformanceWidget valid games:', validGames.length, 'out of', games.length);
    return validGames.map(game => game.id);
  }, [games]);

  const enableQuery = validGameIds.length > 0;

  const seasonId = selectedSeason?.id || 'current';
  const gameIdsKey = validGameIds.join(',');

  // Fetch stats for all valid games
  const { data: gameStatsMap, isLoading } = useQuery({
    queryKey: ['quarterPerformanceStats', gameIdsKey, seasonId],
    queryFn: async () => {
      if (validGameIds.length === 0) {
        return {};
      }

      try {
        const batchStats = await apiRequest('GET', `/api/games/stats/batch`, { gameIds: gameIdsKey });
        if (batchStats && Object.keys(batchStats).length > 0) {
          return batchStats;
        }
      } catch (error) {
        console.warn("Batch endpoint failed, falling back to individual requests:", error);
      }

      const statsMap: Record<number, any[]> = {};
      for (const gameId of validGameIds) {
        try {
          const stats = await apiRequest('GET', `/api/games/${gameId}/stats`);
          statsMap[gameId] = stats;
        } catch (error) {
          console.error(`Error fetching stats for game ${gameId}:`, error);
          statsMap[gameId] = [];
        }
      }
      return statsMap;
    },
    enabled: enableQuery,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000
  });

  // Calculate quarter performance metrics
  useEffect(() => {
    if (!gameStatsMap || isLoading || validGameIds.length === 0) return;

    const quarterScores: Record<number, { team: number, opponent: number, count: number }> = {
      1: { team: 0, opponent: 0, count: 0 },
      2: { team: 0, opponent: 0, count: 0 },
      3: { team: 0, opponent: 0, count: 0 },
      4: { team: 0, opponent: 0, count: 0 }
    };

    validGameIds.forEach(gameId => {
      const gameStats = gameStatsMap[gameId];
      console.log(`Processing game ${gameId}:`, gameStats ? gameStats.length + ' stats' : 'no stats');
      if (!gameStats || gameStats.length === 0) return;

      const gameQuarterScores: Record<number, { team: number, opponent: number }> = {
        1: { team: 0, opponent: 0 },
        2: { team: 0, opponent: 0 },
        3: { team: 0, opponent: 0 },
        4: { team: 0, opponent: 0 }
      };

      gameStats.forEach(stat => {
        if (stat.quarter < 1 || stat.quarter > 4) return;
        const quarter = stat.quarter;
        gameQuarterScores[quarter].team += stat.goalsFor || 0;
        gameQuarterScores[quarter].opponent += stat.goalsAgainst || 0;
      });

      Object.keys(gameQuarterScores).forEach(quarterStr => {
        const quarter = parseInt(quarterStr);
        const quarterScore = gameQuarterScores[quarter];
        quarterScores[quarter].team += quarterScore.team;
        quarterScores[quarter].opponent += quarterScore.opponent;
        quarterScores[quarter].count += 1;
      });
    });

    const avgTeamScoreByQuarter: Record<number, number> = {};
    const avgOpponentScoreByQuarter: Record<number, number> = {};

    Object.keys(quarterScores).forEach(quarterStr => {
      const quarter = parseInt(quarterStr);
      const count = quarterScores[quarter].count || 1;
      avgTeamScoreByQuarter[quarter] = Math.round((quarterScores[quarter].team / count) * 10) / 10;
      avgOpponentScoreByQuarter[quarter] = Math.round((quarterScores[quarter].opponent / count) * 10) / 10;
    });

    setQuarterPerformance({
      avgTeamScoreByQuarter,
      avgOpponentScoreByQuarter
    });
  }, [gameStatsMap, isLoading, validGameIds]);

  // Calculate which quarter is strongest/weakest
  const quarterDiffs = Object.keys(quarterPerformance.avgTeamScoreByQuarter).map(quarter => {
    const q = parseInt(quarter);
    const teamScore = quarterPerformance.avgTeamScoreByQuarter[q];
    const opponentScore = quarterPerformance.avgOpponentScoreByQuarter[q];
    return {
      quarter: q,
      diff: teamScore - opponentScore,
      teamScore,
      opponentScore
    };
  });

  const strongestQuarter = quarterDiffs.reduce((max, current) => 
    current.diff > max.diff ? current : max
  );

  const weakestQuarter = quarterDiffs.reduce((min, current) => 
    current.diff < min.diff ? current : min
  );

  return (
    <BaseWidget 
      title="Quarter Performance" 
      className={className}
      contentClassName="p-6"
    >
        {/* Quarter breakdown grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2, 3, 4].map(quarter => {
            const teamScore = quarterPerformance.avgTeamScoreByQuarter[quarter];
            const opponentScore = quarterPerformance.avgOpponentScoreByQuarter[quarter];
            const diff = teamScore - opponentScore;
            const isStrongest = quarter === strongestQuarter.quarter;
            const isWeakest = quarter === weakestQuarter.quarter;

            return (
              <div 
                key={quarter} 
                className={`p-3 rounded-lg border-2 ${
                  isStrongest ? 'bg-green-50 border-green-200' : 
                  isWeakest ? 'bg-red-50 border-red-200' : 
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-600">Q{quarter}</span>
                  {isStrongest && <Badge variant="outline" className="text-xs px-1 py-0 bg-green-100 text-green-700">Best</Badge>}
                  {isWeakest && <Badge variant="outline" className="text-xs px-1 py-0 bg-red-100 text-red-700">Weak</Badge>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">{teamScore.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">vs</span>
                  <span className="text-lg font-bold text-gray-600">{opponentScore.toFixed(1)}</span>
                </div>
                <div className="text-center mt-1">
                  <span className={`text-xs font-medium ${
                    diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-4" />

    </BaseWidget>
  );
}