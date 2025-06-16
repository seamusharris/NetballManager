import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, GameStat } from '@shared/schema';
import { useEffect, useState } from 'react';
import { getWinLoseLabel } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { BaseWidget } from '@/components/ui/base-widget';
import { gameScoreService } from '@/lib/gameScoreService';
import { useClub } from '@/contexts/ClubContext';

interface TeamPerformanceProps {
  games: Game[];
  className?: string;
  activeSeason?: any; // The current active season
  selectedSeason?: any; // The season selected in the dropdown
  centralizedStats?: Record<number, GameStat[]>; // Centralized game stats
  centralizedScores?: Record<number, any[]>; // Centralized official scores
}

// Team Performance Component
const TeamPerformance = ({ games, className, activeSeason, selectedSeason, centralizedStats, centralizedScores }: TeamPerformanceProps) => {
  const { currentTeamId } = useClub();
  const [quarterPerformance, setQuarterPerformance] = useState<{
    avgTeamScoreByQuarter: Record<number, number>;
    avgOpponentScoreByQuarter: Record<number, number>;
    teamWinRate: number;
    avgTeamScore: number;
    avgOpponentScore: number;
    totalTeamScore: number;
    totalOpponentScore: number;
    goalsPercentage: number;
  }>({
    avgTeamScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    avgOpponentScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    teamWinRate: 0,
    avgTeamScore: 0,
    avgOpponentScore: 0,
    totalTeamScore: 0,
    totalOpponentScore: 0,
    goalsPercentage: 0
  });

  // Calculate basic performance metrics
  const totalGames = games.length;
  const completedGamesArray = games.filter(game => 
    game.statusIsCompleted && game.statusAllowsStatistics
  );
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
      totalTeamScore: 0,
      totalOpponentScore: 0,
      goalsPercentage: 0
    });

    // Use a timestamp to ensure uniqueness
    const newKey = Date.now();
    setStatsKey(newKey);
    console.log(`TeamPerformance refreshed with key ${newKey} for season: ${selectedSeason?.name || 'current'}`);
  }, [selectedSeason, activeSeason]);

  // Get game IDs for completed games 
  const completedGameIds = completedGamesArray.map(game => game.id);

  // Use centralized stats if available, otherwise fall back to empty object
  const gameStatsMap = centralizedStats || {};
  const isLoading = false; // We don't need loading state when using centralized stats

  // Calculate team performance metrics using official scores first, then fallback to stats
  useEffect(() => {
    const calculatePerformance = async () => {
      if (completedGameIds.length === 0) return;

      console.log('TeamPerformance: Calculating performance for team', currentTeamId, 'with', completedGameIds.length, 'completed games');

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
      let actualGamesWithStats = 0;

      // Process each completed game
      for (const gameId of completedGameIds) {
        try {
          const game = games.find(g => g.id === gameId);
          if (!game) continue;

          // Skip bye games for scoring calculations
          if (game.statusName === 'bye') continue;

          console.log(`TeamPerformance: Processing game ${gameId} - ${game.homeTeamName} vs ${game.awayTeamName}`);

          // Get official scores from centralized data
          const officialScores = centralizedScores?.[gameId];
          let teamScore = 0;
          let opponentScore = 0;
          let hasValidScores = false;

          if (officialScores && officialScores.length > 0) {
            console.log(`TeamPerformance: Using official scores for game ${gameId}:`, officialScores);

            // Calculate totals from official scores
            const teamScoresByQuarter: Record<number, number> = {};
            const opponentScoresByQuarter: Record<number, number> = {};

            // Find the opponent team ID for this game
            const isHomeGame = game.homeTeamId === currentTeamId;
            const opponentTeamId = isHomeGame ? game.awayTeamId : game.homeTeamId;

            officialScores.forEach((score: any) => {
              if (score.teamId === currentTeamId) {
                teamScoresByQuarter[score.quarter] = (teamScoresByQuarter[score.quarter] || 0) + score.score;
              } else if (score.teamId === opponentTeamId) {
                opponentScoresByQuarter[score.quarter] = (opponentScoresByQuarter[score.quarter] || 0) + score.score;
              }
            });

            // Sum up all quarters for team and opponent
            teamScore = Object.values(teamScoresByQuarter).reduce((sum, score) => sum + score, 0);
            opponentScore = Object.values(opponentScoresByQuarter).reduce((sum, score) => sum + score, 0);

            // Add quarter-by-quarter data
            for (let quarter = 1; quarter <= 4; quarter++) {
              const teamQuarterScore = teamScoresByQuarter[quarter] || 0;
              const opponentQuarterScore = opponentScoresByQuarter[quarter] || 0;

              if (teamQuarterScore > 0 || opponentQuarterScore > 0) {
                quarterScores[quarter].team += teamQuarterScore;
                quarterScores[quarter].opponent += opponentQuarterScore;
                quarterScores[quarter].count += 1;
              }
            }

            hasValidScores = true;
            console.log(`TeamPerformance: Game ${gameId} official scores - Team: ${teamScore}, Opponent: ${opponentScore}`);
          } else {
            // Fallback to calculated stats only if no official scores exist
            const gameStats = gameStatsMap[gameId] || [];
            const teamStats = gameStats.filter(stat => stat.teamId === currentTeamId);

            if (teamStats.length > 0) {
              console.log(`TeamPerformance: Using calculated stats for game ${gameId}`);
              teamScore = teamStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
              opponentScore = teamStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

              // Add quarter scores from stats
              const quarterStatsMap: Record<number, { team: number, opponent: number }> = {};
              teamStats.forEach(stat => {
                if (!quarterStatsMap[stat.quarter]) {
                  quarterStatsMap[stat.quarter] = { team: 0, opponent: 0 };
                }
                quarterStatsMap[stat.quarter].team += stat.goalsFor || 0;
                quarterStatsMap[stat.quarter].opponent += stat.goalsAgainst || 0;
              });

              Object.entries(quarterStatsMap).forEach(([quarter, scores]) => {
                const q = parseInt(quarter);
                quarterScores[q].team += scores.team;
                quarterScores[q].opponent += scores.opponent;
                quarterScores[q].count += 1;
              });

              hasValidScores = true;
            } else {
              console.warn(`TeamPerformance: No scores found for game ${gameId}`);
              continue;
            }
          }

          // Only count games where we have valid scores
          if (hasValidScores) {
            actualGamesWithStats++;
            totalTeamScore += teamScore;
            totalOpponentScore += opponentScore;

            // Determine outcome
            const result = getWinLoseLabel(teamScore, opponentScore);
            if (result === 'Win') wins++;
            else if (result === 'Loss') losses++;
            else draws++;

            console.log(`TeamPerformance: Game ${gameId} result - Team: ${teamScore}, Opponent: ${opponentScore}, Result: ${result}`);
          }
        } catch (error) {
          console.error(`TeamPerformance: Error processing game ${gameId}:`, error);
        }
      }

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

      // Performance calculation completed

      setQuarterPerformance({
        avgTeamScoreByQuarter,
        avgOpponentScoreByQuarter,
        teamWinRate: winRate,
        avgTeamScore,
        avgOpponentScore,
        totalTeamScore,
        totalOpponentScore,
        goalsPercentage
      });
    };

    calculatePerformance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatsMap, games, completedGameIds]);

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
            <p className="text-gray-600 text-sm font-medium mb-3">Goals Performance (Average)</p>
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

          {/* Total Goals Performance */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
            <p className="text-gray-600 text-sm font-medium mb-3">Total Goals This Season</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {quarterPerformance.totalTeamScore}
                </div>
                <div className="text-sm text-gray-600">Goals For</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {quarterPerformance.totalOpponentScore}
                </div>
                <div className="text-sm text-gray-600">Goals Against</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-blue-200 mt-3">
              <span className="text-sm text-gray-600">Goal Difference</span>
              <span className={`text-lg font-bold ${quarterPerformance.totalTeamScore >= quarterPerformance.totalOpponentScore ? 'text-green-600' : 'text-red-600'}`}>
                {quarterPerformance.totalTeamScore >= quarterPerformance.totalOpponentScore ? '+' : ''}{quarterPerformance.totalTeamScore - quarterPerformance.totalOpponentScore}
              </span>
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
};

export default TeamPerformance;
export { TeamPerformance };