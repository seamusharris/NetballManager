
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, GameStat, Opponent } from '@shared/schema';
import { useEffect, useState } from 'react';
import { getWinLoseLabel } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BaseWidget } from '@/components/ui/base-widget';
import { TrendingUp, TrendingDown, Target, Users, BarChart3, Zap } from 'lucide-react';

interface AdvancedTeamAnalyticsProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
  activeSeason?: any;
  selectedSeason?: any;
}

interface PerformanceMetrics {
  momentum: {
    trend: 'up' | 'down' | 'stable';
    strength: number;
    recentForm: string[];
  };
  positionEfficiency: Record<string, {
    quarter1: number;
    quarter2: number;
    quarter3: number;
    quarter4: number;
    overall: number;
  }>;
  comebackPotential: {
    deficitRecoveries: number;
    totalDeficits: number;
    recoveryRate: number;
    avgDeficitSize: number;
  };
  opponentStrengthMatrix: {
    vsStrong: { wins: number; total: number; avgScore: number };
    vsMedium: { wins: number; total: number; avgScore: number };
    vsWeak: { wins: number; total: number; avgScore: number };
  };
}

export default function AdvancedTeamAnalytics({ 
  games, 
  opponents, 
  className, 
  activeSeason, 
  selectedSeason 
}: AdvancedTeamAnalyticsProps) {
  
  const [analytics, setAnalytics] = useState<PerformanceMetrics>({
    momentum: { trend: 'stable', strength: 0, recentForm: [] },
    positionEfficiency: {},
    comebackPotential: { deficitRecoveries: 0, totalDeficits: 0, recoveryRate: 0, avgDeficitSize: 0 },
    opponentStrengthMatrix: {
      vsStrong: { wins: 0, total: 0, avgScore: 0 },
      vsMedium: { wins: 0, total: 0, avgScore: 0 },
      vsWeak: { wins: 0, total: 0, avgScore: 0 }
    }
  });

  const completedGames = games.filter(game => game.gameStatus?.isCompleted === true);
  const gameIds = completedGames.map(game => game.id);

  // Fetch game stats
  const { data: gameStatsMap, isLoading } = useQuery({
    queryKey: ['advancedAnalytics', gameIds.join(',')],
    queryFn: async () => {
      if (gameIds.length === 0) return {};

      try {
        const batchStats = await apiRequest('GET', `/api/games/stats/batch`, { gameIds: gameIds.join(',') });
        if (batchStats && Object.keys(batchStats).length > 0) {
          return batchStats;
        }
      } catch (error) {
        console.warn("Batch endpoint failed, falling back to individual requests:", error);
      }

      const statsMap: Record<number, any[]> = {};
      for (const gameId of gameIds) {
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
    enabled: gameIds.length > 0,
    staleTime: 60 * 60 * 1000,
  });

  // Calculate advanced analytics
  useEffect(() => {
    if (!gameStatsMap || isLoading || Object.keys(gameStatsMap).length === 0) return;

    // 1. Performance Momentum Analysis
    const recentGames = completedGames
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-5); // Last 5 games

    const recentResults = recentGames.map(game => {
      const gameStats = gameStatsMap[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      return getWinLoseLabel(teamScore, opponentScore);
    });

    const momentum = calculateMomentum(recentResults);

    // 2. Position Efficiency Analysis
    const positionStats: Record<string, any> = {};
    const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];

    positions.forEach(position => {
      positionStats[position] = {
        quarter1: 0, quarter2: 0, quarter3: 0, quarter4: 0,
        quarter1Count: 0, quarter2Count: 0, quarter3Count: 0, quarter4Count: 0
      };
    });

    Object.values(gameStatsMap).forEach(gameStats => {
      gameStats.forEach(stat => {
        if (stat.position && positions.includes(stat.position)) {
          const quarter = `quarter${stat.quarter}`;
          const countKey = `${quarter}Count`;
          
          if (positionStats[stat.position][quarter] !== undefined) {
            // Calculate efficiency as goals scored minus goals conceded
            const efficiency = (stat.goalsFor || 0) - (stat.goalsAgainst || 0);
            positionStats[stat.position][quarter] += efficiency;
            positionStats[stat.position][countKey]++;
          }
        }
      });
    });

    // Calculate averages and overall efficiency
    const positionEfficiency: Record<string, any> = {};
    positions.forEach(position => {
      const stats = positionStats[position];
      positionEfficiency[position] = {
        quarter1: stats.quarter1Count > 0 ? stats.quarter1 / stats.quarter1Count : 0,
        quarter2: stats.quarter2Count > 0 ? stats.quarter2 / stats.quarter2Count : 0,
        quarter3: stats.quarter3Count > 0 ? stats.quarter3 / stats.quarter3Count : 0,
        quarter4: stats.quarter4Count > 0 ? stats.quarter4 / stats.quarter4Count : 0,
        overall: 0
      };
      
      const totalQuarters = [1, 2, 3, 4].filter(q => stats[`quarter${q}Count`] > 0).length;
      if (totalQuarters > 0) {
        positionEfficiency[position].overall = 
          (positionEfficiency[position].quarter1 + 
           positionEfficiency[position].quarter2 + 
           positionEfficiency[position].quarter3 + 
           positionEfficiency[position].quarter4) / totalQuarters;
      }
    });

    // 3. Comeback Potential Analysis
    let deficitRecoveries = 0;
    let totalDeficits = 0;
    let totalDeficitSize = 0;

    completedGames.forEach(game => {
      const gameStats = gameStatsMap[game.id] || [];
      const quarterScores = { team: [0, 0, 0, 0], opponent: [0, 0, 0, 0] };
      
      gameStats.forEach(stat => {
        if (stat.quarter >= 1 && stat.quarter <= 4) {
          quarterScores.team[stat.quarter - 1] += stat.goalsFor || 0;
          quarterScores.opponent[stat.quarter - 1] += stat.goalsAgainst || 0;
        }
      });

      // Check for deficit situations and recoveries
      for (let q = 0; q < 3; q++) {
        const teamRunning = quarterScores.team.slice(0, q + 1).reduce((a, b) => a + b, 0);
        const opponentRunning = quarterScores.opponent.slice(0, q + 1).reduce((a, b) => a + b, 0);
        
        if (teamRunning < opponentRunning) {
          totalDeficits++;
          totalDeficitSize += (opponentRunning - teamRunning);
          
          // Check if they recovered by game end
          const finalTeam = quarterScores.team.reduce((a, b) => a + b, 0);
          const finalOpponent = quarterScores.opponent.reduce((a, b) => a + b, 0);
          
          if (finalTeam >= finalOpponent) {
            deficitRecoveries++;
          }
        }
      }
    });

    const comebackPotential = {
      deficitRecoveries,
      totalDeficits,
      recoveryRate: totalDeficits > 0 ? (deficitRecoveries / totalDeficits) * 100 : 0,
      avgDeficitSize: totalDeficits > 0 ? totalDeficitSize / totalDeficits : 0
    };

    // 4. Opponent Strength Matrix
    const opponentStrengthMatrix = {
      vsStrong: { wins: 0, total: 0, totalScore: 0 },
      vsMedium: { wins: 0, total: 0, totalScore: 0 },
      vsWeak: { wins: 0, total: 0, totalScore: 0 }
    };

    completedGames.forEach(game => {
      const opponent = opponents.find(o => o.id === game.opponentId);
      const gameStats = gameStatsMap[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      
      // Categorize opponent strength (this could be enhanced with historical data)
      let category: 'vsStrong' | 'vsMedium' | 'vsWeak' = 'vsMedium';
      if (opponent) {
        // Simple categorization - could be improved with more data
        const opponentName = opponent.teamName.toLowerCase();
        if (opponentName.includes('emerald') || opponentName.includes('champion') || opponentName.includes('elite')) {
          category = 'vsStrong';
        } else if (opponentName.includes('junior') || opponentName.includes('development') || opponentName.includes('rookie')) {
          category = 'vsWeak';
        }
      }

      opponentStrengthMatrix[category].total++;
      opponentStrengthMatrix[category].totalScore += teamScore;
      
      if (getWinLoseLabel(teamScore, opponentScore) === 'Win') {
        opponentStrengthMatrix[category].wins++;
      }
    });

    // Calculate averages
    const finalOpponentMatrix = {
      vsStrong: {
        wins: opponentStrengthMatrix.vsStrong.wins,
        total: opponentStrengthMatrix.vsStrong.total,
        avgScore: opponentStrengthMatrix.vsStrong.total > 0 
          ? opponentStrengthMatrix.vsStrong.totalScore / opponentStrengthMatrix.vsStrong.total 
          : 0
      },
      vsMedium: {
        wins: opponentStrengthMatrix.vsMedium.wins,
        total: opponentStrengthMatrix.vsMedium.total,
        avgScore: opponentStrengthMatrix.vsMedium.total > 0 
          ? opponentStrengthMatrix.vsMedium.totalScore / opponentStrengthMatrix.vsMedium.total 
          : 0
      },
      vsWeak: {
        wins: opponentStrengthMatrix.vsWeak.wins,
        total: opponentStrengthMatrix.vsWeak.total,
        avgScore: opponentStrengthMatrix.vsWeak.total > 0 
          ? opponentStrengthMatrix.vsWeak.totalScore / opponentStrengthMatrix.vsWeak.total 
          : 0
      }
    };

    setAnalytics({
      momentum,
      positionEfficiency,
      comebackPotential,
      opponentStrengthMatrix: finalOpponentMatrix
    });

  }, [gameStatsMap, isLoading, completedGames, opponents]);

  // Helper function to calculate momentum
  const calculateMomentum = (results: string[]) => {
    if (results.length === 0) return { trend: 'stable' as const, strength: 0, recentForm: [] };

    const winWeight = 3;
    const drawWeight = 1;
    const lossWeight = -2;

    let momentum = 0;
    results.forEach((result, index) => {
      const weight = (index + 1) / results.length; // More recent games have higher weight
      if (result === 'Win') momentum += winWeight * weight;
      else if (result === 'Draw') momentum += drawWeight * weight;
      else momentum += lossWeight * weight;
    });

    const trend = momentum > 1 ? 'up' : momentum < -1 ? 'down' : 'stable';
    
    return {
      trend,
      strength: Math.abs(momentum),
      recentForm: results
    };
  };

  if (isLoading || completedGames.length === 0) {
    return (
      <BaseWidget title="Advanced Analytics" className={className}>
        <div className="p-6 text-center text-gray-500">
          Loading advanced analytics...
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget title="Advanced Team Analytics" className={className}>
      <div className="space-y-6 p-4">
        
        {/* Performance Momentum Tracker */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {analytics.momentum.trend === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : analytics.momentum.trend === 'down' ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <Zap className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-semibold text-gray-700">Performance Momentum</span>
            </div>
            <Badge variant={
              analytics.momentum.trend === 'up' ? 'default' : 
              analytics.momentum.trend === 'down' ? 'destructive' : 'secondary'
            }>
              {analytics.momentum.trend.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {analytics.momentum.recentForm.map((result, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    result === 'Win' ? 'bg-green-500' :
                    result === 'Draw' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                >
                  {result[0]}
                </div>
              ))}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-700">
                {analytics.momentum.strength.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">Momentum Score</div>
            </div>
          </div>
        </div>

        {/* Position Efficiency Heatmap */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-gray-700">Position Efficiency Heatmap</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div></div>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
              <div key={quarter} className="text-center text-xs font-medium text-gray-600">
                {quarter}
              </div>
            ))}
          </div>
          
          {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => (
            <div key={position} className="grid grid-cols-4 gap-2 mb-1">
              <div className="text-xs font-medium text-gray-700 flex items-center">
                {position}
              </div>
              {[1, 2, 3, 4].map(quarter => {
                const efficiency = analytics.positionEfficiency[position]?.[`quarter${quarter}`] || 0;
                const intensity = Math.min(1, Math.max(0.1, Math.abs(efficiency) / 2));
                const color = efficiency > 0 ? 'bg-green-500' : efficiency < 0 ? 'bg-red-500' : 'bg-gray-300';
                
                return (
                  <div
                    key={quarter}
                    className={`h-8 ${color} rounded flex items-center justify-center text-xs font-bold text-white`}
                    style={{ opacity: intensity }}
                  >
                    {efficiency > 0 ? '+' : ''}{efficiency.toFixed(1)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Comeback Potential */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-gray-700">Comeback Potential</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">
                {analytics.comebackPotential.recoveryRate.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Recovery Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">
                {analytics.comebackPotential.deficitRecoveries}
              </div>
              <div className="text-xs text-gray-600">Successful Comebacks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">
                {analytics.comebackPotential.avgDeficitSize.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">Avg Deficit Size</div>
            </div>
          </div>
        </div>

        {/* Opponent Strength Matrix */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-700">Performance vs Opponent Strength</span>
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'vsStrong', label: 'Strong Teams', color: 'red' },
              { key: 'vsMedium', label: 'Medium Teams', color: 'yellow' },
              { key: 'vsWeak', label: 'Weak Teams', color: 'green' }
            ].map(({ key, label, color }) => {
              const data = analytics.opponentStrengthMatrix[key as keyof typeof analytics.opponentStrengthMatrix];
              const winRate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 min-w-[100px]">
                    {label}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div 
                        className={`bg-${color}-500 h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${winRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-bold text-gray-700">
                      {data.wins}/{data.total} ({winRate.toFixed(0)}%)
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg: {data.avgScore.toFixed(1)}
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
