import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, GameStat } from '@shared/schema';
import { useEffect, useState } from 'react';
import { getWinLoseLabel } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BaseWidget } from '@/components/ui/base-widget';

interface TeamPerformanceProps {
  games: Game[];
  className?: string;
  activeSeason?: any; // The current active season
  selectedSeason?: any; // The season selected in the dropdown
}

export default function TeamPerformance({ games, className, activeSeason, selectedSeason }: TeamPerformanceProps) {
  const [quarterPerformance, setQuarterPerformance] = useState<{
    avgTeamScoreByQuarter: Record<number, number>;
    avgOpponentScoreByQuarter: Record<number, number>;
    teamWinRate: number;
    avgTeamScore: number;
    avgOpponentScore: number;
    goalsPercentage: number;
  }>({
    avgTeamScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    avgOpponentScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    teamWinRate: 0,
    avgTeamScore: 0,
    avgOpponentScore: 0,
    goalsPercentage: 0
  });

  // Calculate basic performance metrics
  const totalGames = games.length;
  const completedGamesArray = games.filter(game => game.gameStatus?.isCompleted === true);
  const completedGamesCount = completedGamesArray.length;

  // Add a key to force refresh when seasons change
  const [statsKey, setStatsKey] = useState(0);

  // Force refresh when selectedSeason or activeSeason changes
  useEffect(() => {
    // Reset component state
    setQuarterPerformance({
      avgTeamScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
      avgOpponentScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
      teamWinRate: 0,
      avgTeamScore: 0,
      avgOpponentScore: 0,
      goalsPercentage: 0
    });

    // Use a timestamp to ensure uniqueness
    const newKey = Date.now();
    setStatsKey(newKey);
    console.log(`TeamPerformance refreshed with key ${newKey} for season: ${selectedSeason?.name || 'current'}`);
  }, [selectedSeason, activeSeason]);

  // Get game IDs for completed games to fetch their stats
  const completedGameIds = completedGamesArray.map(game => game.id);
  const enableQuery = completedGameIds.length > 0;

  // Create a static cache key that doesn't change with the statsKey
  // This ensures we use the same cached data across season changes
  const seasonId = selectedSeason?.id || 'current';
  const gameIdsKey = completedGameIds.join(',');

  // Fetch stats for all completed games individually since batch endpoint is unreliable
  const { data: gameStatsMap, isLoading } = useQuery({
    queryKey: ['teamPerformanceStats', gameIdsKey, seasonId],
    queryFn: async () => {
      if (completedGameIds.length === 0) {
        return {};
      }

      // Filter out any game IDs that are not valid numbers
      const validGameIds = completedGameIds.filter(gameId => typeof gameId === 'number');

      console.log(`Team Performance loading stats for season: ${seasonId}, games: ${gameIdsKey}`);

      try {
        // Use direct fetch with proper URL construction that matches the working individual calls
        const gameIdsParam = validGameIds.join(',');
        const url = `/api/games/stats/batch?gameIds=${gameIdsParam}`;

        console.log(`TeamPerformance: Fetching batch stats from ${url}`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch batch game stats: ${response.statusText}`);
        }

        const batchStats = await response.json();
        console.log('TeamPerformance: Received batch stats:', batchStats);

        // Check if we got valid data - the batch endpoint returns an object where keys are game IDs
        if (batchStats && typeof batchStats === 'object') {
          const gameIds = Object.keys(batchStats);
          if (gameIds.length > 0) {
            console.log(`TeamPerformance: Successfully processed batch stats for ${gameIds.length} games`);
            return batchStats;
          }
        }
        
        console.warn('TeamPerformance: Batch endpoint returned empty data, using fallback');
      } catch (error) {
        console.warn("TeamPerformance: Batch endpoint failed, falling back to individual requests:", error);
      }

      // Fallback to individual requests using fetch (same as working calls)
      console.log('TeamPerformance: Using fallback individual requests');
      const statsMap: Record<number, any[]> = {};
      for (const gameId of validGameIds) {
        try {
          const response = await fetch(`/api/games/${gameId}/stats`);
          if (response.ok) {
            const stats = await response.json();
            statsMap[gameId] = stats;
            console.log(`TeamPerformance: Individual request for game ${gameId} returned ${stats.length} stats`);
          } else {
            statsMap[gameId] = [];
            console.warn(`TeamPerformance: Individual request for game ${gameId} failed with status ${response.status}`);
          }
        } catch (error) {
          console.error(`TeamPerformance: Error fetching stats for game ${gameId}:`, error);
          statsMap[gameId] = [];
        }
      }

      return statsMap;
    },
    enabled: enableQuery,
    staleTime: 60 * 60 * 1000, // 60 minutes - very aggressive caching
    gcTime: 24 * 60 * 60 * 1000   // 24 hours cache time for better performance
  });

  // Calculate team performance metrics from game stats
  useEffect(() => {
    if (!gameStatsMap || isLoading || completedGameIds.length === 0) return;

    // Initialize counters
    const quarterScores: Record<number, { team: number, opponent: number, count: number }> = {
      1: { team: 0, opponent: 0, count: 0 },
      2: { team: 0, opponent: 0, count: 0 },
      3: { team: 0, opponent: 0, count: 0 },
      4: { team: 0, opponent: 0, count: 0 }
    };

    let totalTeamScore = 0;
    let totalOpponentScore = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;

    // Process each completed game
    let actualGamesWithStats = 0; // Count only games that have statistics

    completedGameIds.forEach(gameId => {
      const gameStats = gameStatsMap[gameId];
      if (!gameStats || gameStats.length === 0) return;

      // Increment counter for games with actual stats
      actualGamesWithStats++;

      // Calculate scores by quarter
      const gameQuarterScores: Record<number, { team: number, opponent: number }> = {
        1: { team: 0, opponent: 0 },
        2: { team: 0, opponent: 0 },
        3: { team: 0, opponent: 0 },
        4: { team: 0, opponent: 0 }
      };

      // Sum goals for each quarter
      gameStats.forEach(stat => {
        if (stat.quarter < 1 || stat.quarter > 4) return;

        const quarter = stat.quarter;
        gameQuarterScores[quarter].team += stat.goalsFor || 0;
        gameQuarterScores[quarter].opponent += stat.goalsAgainst || 0;
      });

      // Add this game's quarter scores to the overall totals
      Object.keys(gameQuarterScores).forEach(quarterStr => {
        const quarter = parseInt(quarterStr);
        const quarterScore = gameQuarterScores[quarter];

        quarterScores[quarter].team += quarterScore.team;
        quarterScores[quarter].opponent += quarterScore.opponent;
        quarterScores[quarter].count += 1;
      });

      // Calculate total score for this game
      const gameTeamScore = Object.values(gameQuarterScores).reduce((sum, q) => sum + q.team, 0);
      const gameOpponentScore = Object.values(gameQuarterScores).reduce((sum, q) => sum + q.opponent, 0);

      totalTeamScore += gameTeamScore;
      totalOpponentScore += gameOpponentScore;

      // Determine outcome
      const result = getWinLoseLabel(gameTeamScore, gameOpponentScore);
      if (result === 'Win') wins++;
      else if (result === 'Loss') losses++;
      else draws++;
    });

    // Calculate averages
    const avgTeamScoreByQuarter: Record<number, number> = {};
    const avgOpponentScoreByQuarter: Record<number, number> = {};

    Object.keys(quarterScores).forEach(quarterStr => {
      const quarter = parseInt(quarterStr);
      const count = quarterScores[quarter].count || 1; // Avoid division by zero

      avgTeamScoreByQuarter[quarter] = Math.round((quarterScores[quarter].team / count) * 10) / 10;
      avgOpponentScoreByQuarter[quarter] = Math.round((quarterScores[quarter].opponent / count) * 10) / 10;
    });

    // Calculate overall metrics using only games that have actual statistics
    const winRate = actualGamesWithStats > 0 ? Math.round((wins / actualGamesWithStats) * 100) : 0;

    // Calculate dynamic average team score from actual game data
    const avgTeamScore = actualGamesWithStats > 0 
      ? Math.round((totalTeamScore / actualGamesWithStats) * 10) / 10 
      : 0;

    // Calculate average opponent score
    const avgOpponentScore = actualGamesWithStats > 0
      ? Math.round((totalOpponentScore / actualGamesWithStats) * 10) / 10
      : 0;

    // Calculate performance percentage as (goals for / goals against) * 100
    const goalsPercentage = totalOpponentScore > 0
      ? Math.round((totalTeamScore / totalOpponentScore) * 100)
      : 0;

    console.log(`Team Performance: ${actualGamesWithStats} games with stats, ${totalTeamScore} total goals for, ${totalOpponentScore} total goals against`);

    setQuarterPerformance({
      avgTeamScoreByQuarter,
      avgOpponentScoreByQuarter,
      teamWinRate: winRate,
      avgTeamScore,
      avgOpponentScore,
      goalsPercentage
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatsMap, isLoading]);

  return (
    <BaseWidget 
      title="Team Performance" 
      className={className}
      contentClassName="px-4 py-6 pb-2"
    >
        {/* Transformed Key Performance Indicators */}
        <div className="space-y-4 mb-6">
          {/* Win Rate - Circular Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-green-700">{quarterPerformance.teamWinRate}%</p>
              </div>
              <div className="relative">
                <svg width="60" height="60" className="transform -rotate-90">
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    stroke="#22c55e"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(quarterPerformance.teamWinRate / 100) * 157} 157`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-700">
                    {quarterPerformance.teamWinRate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Performance - Horizontal Bars */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
            <p className="text-gray-600 text-sm font-medium mb-3">Goals Performance</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 min-w-[50px]">For</span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (quarterPerformance.avgTeamScore / 20) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600 min-w-[40px] text-right">
                  {quarterPerformance.avgTeamScore}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 min-w-[50px]">Against</span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (quarterPerformance.avgOpponentScore / 20) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-red-600 min-w-[40px] text-right">
                  {quarterPerformance.avgOpponentScore}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                <span className="text-sm text-gray-600">Goal Ratio</span>
                <span className="text-lg font-bold text-orange-600">
                  {quarterPerformance.goalsPercentage}%
                </span>
              </div>
            </div>
          </div>


        </div>
        {/* Enhanced Performance Analysis */}
        <div className="mt-4 space-y-4">


          {/* Option 3: Goals Distribution Chart */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Goals Distribution</span>
            </div>
            <div className="flex justify-center">
              <svg width="100" height="100" viewBox="0 0 100 100">
                {(() => {
                  const totalGoals = quarterPerformance.avgTeamScore + quarterPerformance.avgOpponentScore;
                  const teamPercent = totalGoals > 0 ? (quarterPerformance.avgTeamScore / totalGoals) : 0.5;
                  const teamAngle = teamPercent * 360;

                  const teamPath = `M 50 50 L 50 20 A 30 30 0 ${teamAngle > 180 ? 1 : 0} 1 ${50 + 30 * Math.sin((teamAngle * Math.PI) / 180)} ${50 - 30 * Math.cos((teamAngle * Math.PI) / 180)} Z`;
                  const opponentPath = `M 50 50 L ${50 + 30 * Math.sin((teamAngle * Math.PI) / 180)} ${50 - 30 * Math.cos((teamAngle * Math.PI) / 180)} A 30 30 0 ${teamAngle < 180 ? 1 : 0} 1 50 20 Z`;

                  return (
                    <>
                      <path d={teamPath} fill="#3b82f6" />
                      <path d={opponentPath} fill="#ef4444" />
                      <circle cx="50" cy="50" r="15" fill="white" />
                      <text x="50" y="55" textAnchor="middle" className="text-xs font-bold fill-current">
                        {Math.round(teamPercent * 100)}%
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-600">For</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">Against</span>
              </div>
            </div>
          </div>

          {/* Option 4: Performance Heatmap Grid */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Performance Metrics Heatmap</span>
            </div>
            <div className="grid grid-cols-3 gap-1 max-w-32 mx-auto">
              {[
                { label: 'Win%', value: quarterPerformance.teamWinRate, max: 100 },
                { label: 'For', value: quarterPerformance.avgTeamScore, max: 20 },
                { label: 'vs', value: quarterPerformance.goalsPercentage, max: 200 },
              ].map((metric, index) => {
                const intensity = Math.max(0.2, Math.min(1, metric.value / metric.max));
                const bgColor = metric.value > (metric.max * 0.6) ? 'bg-green-500' : 
                               metric.value > (metric.max * 0.4) ? 'bg-yellow-500' : 'bg-red-500';

                return (
                  <div key={index} className="relative group">
                    <div 
                      className={`w-10 h-10 ${bgColor} rounded flex items-center justify-center text-white text-xs font-bold`}
                      style={{ opacity: intensity }}
                    >
                      {metric.value.toFixed(0)}
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-xs text-gray-500">{metric.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Option 5: Season Progress Bar */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Season Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Games Played</span>
                <span>{completedGamesCount} / {totalGames}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${totalGames > 0 ? (completedGamesCount / totalGames) * 100 : 0}%` }}
                >
                  <span className="text-xs text-white font-bold">
                    {totalGames > 0 ? Math.round((completedGamesCount / totalGames) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Comparison Radar */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <span className="text-sm text-gray-500 font-medium">Performance Radar</span>
            </div>
            <div className="flex justify-center">
              <svg width="240" height="240" viewBox="0 0 240 240">
                {/* Radar grid */}
                <circle cx="120" cy="120" r="80" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                <circle cx="120" cy="120" r="60" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                <circle cx="120" cy="120" r="40" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                <circle cx="120" cy="120" r="20" stroke="#e5e7eb" strokeWidth="1" fill="none" />

                {/* Axis lines */}
                <line x1="120" y1="40" x2="120" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="40" y1="120" x2="200" y2="120" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="63.4" y1="63.4" x2="176.6" y2="176.6" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="176.6" y1="63.4" x2="63.4" y2="176.6" stroke="#e5e7eb" strokeWidth="1" />

                {/* Performance polygon */}
                {(() => {
                  const metrics = [
                    quarterPerformance.teamWinRate / 100,
                    quarterPerformance.avgTeamScore / 20,
                    Math.min(1, quarterPerformance.goalsPercentage / 150),
                    Math.min(1, completedGamesCount / 15)
                  ];

                  const points = metrics.map((value, index) => {
                    const angle = (index * 2 * Math.PI) / 4;
                    const radius = value * 70;
                    const x = 120 + radius * Math.cos(angle - Math.PI/2);
                    const y = 120 + radius * Math.sin(angle - Math.PI/2);
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <polygon
                      points={points}
                      fill="rgba(59, 130, 246, 0.3)"
                      stroke="#3b82f6"
                      strokeWidth="3"
                    />
                  );
                })()}

                {/* Labels with better positioning */}
                <text x="120" y="25" textAnchor="middle" className="text-sm font-medium fill-current">Win%</text>
                <text x="220" y="125" textAnchor="middle" className="text-sm font-medium fill-current">Goals</text>
                <text x="120" y="230" textAnchor="middle" className="text-sm font-medium fill-current">Ratio</text>
                <text x="20" y="125" textAnchor="middle" className="text-sm font-medium fill-current">Games</text>
              </svg>
            </div>
          </div>
        </div>
    </BaseWidget>
  );
}