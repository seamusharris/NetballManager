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

      console.log(`Team Performance loading stats for season: ${seasonId}, games: ${gameIdsKey}`);

      // Try to use the batch endpoint first for better performance
      try {
        const batchStats = await apiRequest('GET', `/api/games/stats/batch`, { gameIds: gameIdsKey });
        if (batchStats && Object.keys(batchStats).length > 0) {
          return batchStats;
        }
      } catch (error) {
        console.warn("Batch endpoint failed, falling back to individual requests:", error);
      }

      // Fallback: fetch each game's stats individually if batch fails
      const statsMap: Record<number, any[]> = {};

      for (const gameId of completedGameIds) {
        try {
          // Use the most efficient approach with 304 NOT MODIFIED responses
          const stats = await apiRequest('GET', `/api/games/${gameId}/stats`);
          statsMap[gameId] = stats;
        } catch (error) {
          console.error(`Error fetching stats for game ${gameId}:`, error);
          statsMap[gameId] = []; // Use empty array for failed fetches
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
        {/* Key performance indicators - 3x2 grid for more statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Win Rate</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.teamWinRate}%</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Percentage</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.goalsPercentage}%</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Played</p>
            <p className="text-3xl font-bold text-primary">{completedGamesCount}</p>
          </div>

          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">For</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.avgTeamScore}</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Against</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.avgOpponentScore}</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Upcoming</p>
            <p className="text-3xl font-bold text-primary">{games.filter(game => game.gameStatus?.isCompleted !== true && !game.isBye).length}</p>
          </div>
        </div>
        {/* Enhanced Performance Analysis */}
        <div className="mt-4 space-y-4">
          {/* Option 1: Team Strength Gauge */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Team Strength Gauge</span>
            </div>
            <div className="flex justify-center">
              <svg width="160" height="90" viewBox="0 0 160 90">
                {/* Gauge background arc */}
                <path
                  d="M 20 70 A 60 60 0 0 1 140 70"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Gauge progress arc */}
                <path
                  d={`M 20 70 A 60 60 0 0 1 ${20 + (quarterPerformance.teamWinRate / 100) * 120} ${70 - Math.sin((quarterPerformance.teamWinRate / 100) * Math.PI) * 60}`}
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Gauge needle */}
                <line
                  x1="80"
                  y1="70"
                  x2={80 + Math.cos((Math.PI * quarterPerformance.teamWinRate / 100) - Math.PI) * 50}
                  y2={70 + Math.sin((Math.PI * quarterPerformance.teamWinRate / 100) - Math.PI) * 50}
                  stroke="#1f2937"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="80" cy="70" r="4" fill="#1f2937" />
                <text x="80" y="85" textAnchor="middle" className="text-xs font-bold fill-current">
                  {quarterPerformance.teamWinRate}%
                </text>
              </svg>
            </div>
          </div>

          {/* Option 2: Performance Trend Line */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Win Rate Trend</span>
            </div>
            <div className="flex justify-center">
              <svg width="200" height="60" viewBox="0 0 200 60">
                {/* Grid lines */}
                <line x1="20" y1="10" x2="180" y2="10" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="20" y1="30" x2="180" y2="30" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="20" y1="50" x2="180" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                
                {/* Trend line - simulate based on current performance */}
                <path
                  d={`M 20 ${50 - (quarterPerformance.teamWinRate * 0.4)} L 60 ${45 - (quarterPerformance.teamWinRate * 0.35)} L 100 ${40 - (quarterPerformance.teamWinRate * 0.3)} L 140 ${35 - (quarterPerformance.teamWinRate * 0.32)} L 180 ${50 - (quarterPerformance.teamWinRate * 0.4)}`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* Data points */}
                {[20, 60, 100, 140, 180].map((x, index) => (
                  <circle 
                    key={index} 
                    cx={x} 
                    cy={50 - (quarterPerformance.teamWinRate * 0.4) + (Math.random() - 0.5) * 10} 
                    r="3" 
                    fill="#3b82f6" 
                  />
                ))}
              </svg>
            </div>
          </div>

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

          {/* Option 6: Win Streak Indicator */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Current Form</span>
            </div>
            <div className="flex justify-center items-center space-x-3">
              {quarterPerformance.teamWinRate >= 70 ? (
                <>
                  <div className="text-2xl">🔥</div>
                  <span className="text-sm font-bold text-green-600">Hot Streak</span>
                </>
              ) : quarterPerformance.teamWinRate <= 30 ? (
                <>
                  <div className="text-2xl">❄️</div>
                  <span className="text-sm font-bold text-blue-600">Cold Spell</span>
                </>
              ) : (
                <>
                  <div className="text-2xl">⚡</div>
                  <span className="text-sm font-bold text-yellow-600">Building</span>
                </>
              )}
            </div>
          </div>

          {/* Option 7: Performance Comparison Radar */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Performance Radar</span>
            </div>
            <div className="flex justify-center">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* Radar grid */}
                <circle cx="60" cy="60" r="40" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                <circle cx="60" cy="60" r="25" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                <circle cx="60" cy="60" r="10" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                
                {/* Axis lines */}
                <line x1="60" y1="20" x2="60" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="20" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="31.8" y1="31.8" x2="88.2" y2="88.2" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="88.2" y1="31.8" x2="31.8" y2="88.2" stroke="#e5e7eb" strokeWidth="1" />
                
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
                    const radius = value * 30;
                    const x = 60 + radius * Math.cos(angle - Math.PI/2);
                    const y = 60 + radius * Math.sin(angle - Math.PI/2);
                    return `${x},${y}`;
                  }).join(' ');
                  
                  return (
                    <polygon
                      points={points}
                      fill="rgba(59, 130, 246, 0.3)"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                  );
                })()}
                
                {/* Labels */}
                <text x="60" y="15" textAnchor="middle" className="text-xs fill-current">Win%</text>
                <text x="105" y="65" textAnchor="middle" className="text-xs fill-current">Goals</text>
                <text x="60" y="110" textAnchor="middle" className="text-xs fill-current">Ratio</text>
                <text x="15" y="65" textAnchor="middle" className="text-xs fill-current">Games</text>
              </svg>
            </div>
          </div>

          {/* Option 8: Team Momentum Arrow */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Team Momentum</span>
            </div>
            <div className="flex justify-center">
              {quarterPerformance.teamWinRate >= 60 ? (
                <div className="flex flex-col items-center">
                  <div className="text-4xl text-green-600 transform rotate-45">➤</div>
                  <span className="text-xs text-green-600 font-bold mt-1">Rising</span>
                </div>
              ) : quarterPerformance.teamWinRate <= 40 ? (
                <div className="flex flex-col items-center">
                  <div className="text-4xl text-red-600 transform -rotate-45">➤</div>
                  <span className="text-xs text-red-600 font-bold mt-1">Declining</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-4xl text-gray-600">➤</div>
                  <span className="text-xs text-gray-600 font-bold mt-1">Stable</span>
                </div>
              )}
            </div>
          </div>

          {/* Option 9: Goal Scoring Rate Speedometer */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Scoring Rate</span>
            </div>
            <div className="flex justify-center">
              <svg width="140" height="80" viewBox="0 0 140 80">
                {/* Speedometer arc background */}
                <path
                  d="M 20 60 A 50 50 0 0 1 120 60"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                
                {/* Color zones */}
                <path
                  d="M 20 60 A 50 50 0 0 1 53.3 30"
                  stroke="#ef4444"
                  strokeWidth="8"
                  fill="none"
                />
                <path
                  d="M 53.3 30 A 50 50 0 0 1 86.7 30"
                  stroke="#eab308"
                  strokeWidth="8"
                  fill="none"
                />
                <path
                  d="M 86.7 30 A 50 50 0 0 1 120 60"
                  stroke="#22c55e"
                  strokeWidth="8"
                  fill="none"
                />
                
                {/* Needle */}
                {(() => {
                  const score = Math.min(20, quarterPerformance.avgTeamScore);
                  const angle = (score / 20) * Math.PI;
                  const needleX = 70 + Math.cos(Math.PI - angle) * 40;
                  const needleY = 60 + Math.sin(Math.PI - angle) * 40;
                  
                  return (
                    <>
                      <line
                        x1="70"
                        y1="60"
                        x2={needleX}
                        y2={needleY}
                        stroke="#1f2937"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="70" cy="60" r="4" fill="#1f2937" />
                    </>
                  );
                })()}
                
                <text x="70" y="75" textAnchor="middle" className="text-xs font-bold fill-current">
                  {quarterPerformance.avgTeamScore.toFixed(1)} goals/game
                </text>
              </svg>
            </div>
          </div>

          {/* Option 10: Performance Badge Collection */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Achievement Badges</span>
            </div>
            <div className="flex justify-center space-x-2 flex-wrap gap-2">
              {quarterPerformance.teamWinRate >= 80 && (
                <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center space-x-1">
                  <span>🏆</span><span>Elite</span>
                </div>
              )}
              {quarterPerformance.avgTeamScore >= 15 && (
                <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center space-x-1">
                  <span>⚽</span><span>Scorer</span>
                </div>
              )}
              {quarterPerformance.goalsPercentage >= 120 && (
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center space-x-1">
                  <span>🛡️</span><span>Dominant</span>
                </div>
              )}
              {completedGamesCount >= 10 && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center space-x-1">
                  <span>📊</span><span>Veteran</span>
                </div>
              )}
              {quarterPerformance.teamWinRate < 80 && quarterPerformance.avgTeamScore < 15 && quarterPerformance.goalsPercentage < 120 && completedGamesCount < 10 && (
                <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold flex items-center space-x-1">
                  <span>🌱</span><span>Building</span>
                </div>
              )}
            </div>
          </div>
        </div>
    </BaseWidget>
  );
}