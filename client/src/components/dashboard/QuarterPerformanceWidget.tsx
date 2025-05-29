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
      contentClassName="px-4 py-6"
    >
        {/* Visual Quarter Performance Chart */}
        <div className="space-y-4">
          {/* Option 1: Quarter Comparison Bars */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Quarter Comparison</span>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(quarter => {
                const teamScore = quarterPerformance.avgTeamScoreByQuarter[quarter];
                const opponentScore = quarterPerformance.avgOpponentScoreByQuarter[quarter];
                const maxScore = Math.max(teamScore, opponentScore, 5);
                
                return (
                  <div key={quarter} className="flex items-center space-x-2">
                    <span className="text-xs w-4 text-gray-600">Q{quarter}</span>
                    <div className="flex-1 relative h-6 bg-gray-200 rounded-full overflow-hidden">
                      {/* Team bar */}
                      <div 
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-l-full"
                        style={{ width: `${(teamScore / maxScore) * 50}%` }}
                      />
                      {/* Opponent bar */}
                      <div 
                        className="absolute right-0 top-0 h-full bg-red-400 rounded-r-full"
                        style={{ width: `${(opponentScore / maxScore) * 50}%` }}
                      />
                      {/* Center line */}
                      <div className="absolute left-1/2 top-0 w-px h-full bg-gray-400 transform -translate-x-1/2" />
                    </div>
                    <span className="text-xs w-12 text-gray-600">{teamScore.toFixed(1)}-{opponentScore.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Option 2: Performance Flow Diagram */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Performance Flow</span>
            </div>
            <div className="flex justify-center">
              <svg width="200" height="60" viewBox="0 0 200 60">
                {/* Flow line */}
                <path
                  d={`M 20 30 Q 60 ${30 - (quarterPerformance.avgTeamScoreByQuarter[1] - quarterPerformance.avgOpponentScoreByQuarter[1]) * 5} 80 30 Q 120 ${30 - (quarterPerformance.avgTeamScoreByQuarter[2] - quarterPerformance.avgOpponentScoreByQuarter[2]) * 5} 140 30 Q 160 ${30 - (quarterPerformance.avgTeamScoreByQuarter[3] - quarterPerformance.avgOpponentScoreByQuarter[3]) * 5} 180 ${30 - (quarterPerformance.avgTeamScoreByQuarter[4] - quarterPerformance.avgOpponentScoreByQuarter[4]) * 5}`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Quarter markers */}
                {[1, 2, 3, 4].map((quarter, index) => {
                  const x = 20 + index * 53.33;
                  const diff = quarterPerformance.avgTeamScoreByQuarter[quarter] - quarterPerformance.avgOpponentScoreByQuarter[quarter];
                  const y = 30 - diff * 5;
                  
                  return (
                    <g key={quarter}>
                      <circle cx={x} cy={Math.max(10, Math.min(50, y))} r="4" fill="#3b82f6" />
                      <text x={x} y={Math.max(10, Math.min(50, y)) + 15} textAnchor="middle" className="text-xs fill-gray-600">
                        Q{quarter}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Option 3: Quarter Strength Radar */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Quarter Strength Radar</span>
            </div>
            <div className="flex justify-center">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* Radar grid */}
                <circle cx="60" cy="60" r="40" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                <circle cx="60" cy="60" r="25" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                <circle cx="60" cy="60" r="10" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                
                {/* Quarter lines */}
                <line x1="60" y1="20" x2="60" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="20" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Performance polygon */}
                {(() => {
                  const getRadius = (quarter: number) => {
                    const diff = quarterPerformance.avgTeamScoreByQuarter[quarter] - quarterPerformance.avgOpponentScoreByQuarter[quarter];
                    return Math.max(5, Math.min(35, 20 + diff * 3));
                  };
                  
                  const points = [
                    `60,${60 - getRadius(1)}`, // Q1 - top
                    `${60 + getRadius(2)},60`, // Q2 - right
                    `60,${60 + getRadius(3)}`, // Q3 - bottom
                    `${60 - getRadius(4)},60`  // Q4 - left
                  ];
                  
                  return (
                    <polygon
                      points={points.join(' ')}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      fill="#3b82f6"
                      fillOpacity="0.3"
                    />
                  );
                })()}
                
                {/* Quarter labels */}
                <text x="60" y="15" textAnchor="middle" className="text-xs fill-gray-600">Q1</text>
                <text x="105" y="65" textAnchor="middle" className="text-xs fill-gray-600">Q2</text>
                <text x="60" y="110" textAnchor="middle" className="text-xs fill-gray-600">Q3</text>
                <text x="15" y="65" textAnchor="middle" className="text-xs fill-gray-600">Q4</text>
              </svg>
            </div>
          </div>

          {/* Option 4: Performance Heatmap */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Performance Heatmap</span>
            </div>
            <div className="grid grid-cols-4 gap-1 max-w-48 mx-auto">
              {[1, 2, 3, 4].map(quarter => {
                const diff = quarterPerformance.avgTeamScoreByQuarter[quarter] - quarterPerformance.avgOpponentScoreByQuarter[quarter];
                const intensity = Math.max(0.2, Math.min(1, 0.5 + diff * 0.1));
                const bgColor = diff > 0 ? 'bg-green-500' : diff < 0 ? 'bg-red-500' : 'bg-yellow-400';
                
                return (
                  <div key={quarter} className="relative group">
                    <div 
                      className={`w-12 h-12 ${bgColor} rounded flex items-center justify-center text-white text-xs font-bold`}
                      style={{ opacity: intensity }}
                    >
                      Q{quarter}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {quarterPerformance.avgTeamScoreByQuarter[quarter].toFixed(1)} - {quarterPerformance.avgOpponentScoreByQuarter[quarter].toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Option 5: Momentum Indicators */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Quarter Momentum</span>
            </div>
            <div className="flex justify-center space-x-4">
              {[1, 2, 3, 4].map(quarter => {
                const currentDiff = quarterPerformance.avgTeamScoreByQuarter[quarter] - quarterPerformance.avgOpponentScoreByQuarter[quarter];
                const prevQuarter = quarter > 1 ? quarter - 1 : 4;
                const prevDiff = quarterPerformance.avgTeamScoreByQuarter[prevQuarter] - quarterPerformance.avgOpponentScoreByQuarter[prevQuarter];
                const momentum = currentDiff - prevDiff;
                
                return (
                  <div key={quarter} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Q{quarter}</div>
                    <div className="flex flex-col items-center">
                      {momentum > 0.5 ? (
                        <div className="text-green-600">↗</div>
                      ) : momentum < -0.5 ? (
                        <div className="text-red-600">↘</div>
                      ) : (
                        <div className="text-gray-400">→</div>
                      )}
                      <div className={`text-xs font-medium ${
                        momentum > 0.5 ? 'text-green-600' : 
                        momentum < -0.5 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {momentum > 0 ? '+' : ''}{momentum.toFixed(1)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

    </BaseWidget>
  );
}