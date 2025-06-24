import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, GameStat, Opponent } from '@shared/schema';
import { useEffect, useState } from 'react';
import { getWinLoseLabel } from '@/lib/utils';
import { BaseWidget } from '@/components/ui/base-widget';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  BarChart3, 
  Zap, 
  Activity,
  Trophy,
  Timer,
  MapPin,
  Flame,
  Shield,
  Gauge
} from 'lucide-react';

interface AdvancedTeamAnalyticsProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
  activeSeason?: any;
  selectedSeason?: any;
  centralizedStats?: Record<number, GameStat[]>;
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
  consistencyIndex: {
    score: number;
    classification: 'Very Consistent' | 'Consistent' | 'Moderate' | 'Inconsistent' | 'Very Inconsistent';
    scoreVariance: number;
  };
  streakAnalysis: {
    currentStreak: { type: 'win' | 'loss' | 'draw'; count: number };
    longestWinStreak: number;
    longestLossStreak: number;
  };
  pressurePerformance: {
    leadingPerformance: { wins: number; total: number; percentage: number };
    trailingPerformance: { comebacks: number; total: number; percentage: number };
    closeGameRecord: { wins: number; total: number; percentage: number };
  };
  peakPerformanceWindows: {
    bestQuarter: { quarter: number; avgNetScore: number };
    worstQuarter: { quarter: number; avgNetScore: number };
    quarterTrends: Record<number, { avgFor: number; avgAgainst: number; netScore: number }>;
  };
  teamChemistry: {
    bestCombinations: Array<{ positions: string[]; winRate: number; gamesPlayed: number }>;
    substitutionImpact: { positive: number; negative: number; neutral: number };
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
  selectedSeason,
  centralizedStats 
}: AdvancedTeamAnalyticsProps) {

  const [analytics, setAnalytics] = useState<PerformanceMetrics>({
    momentum: { trend: 'stable', strength: 0, recentForm: [] },
    positionEfficiency: {},
    comebackPotential: { deficitRecoveries: 0, totalDeficits: 0, recoveryRate: 0, avgDeficitSize: 0 },
    consistencyIndex: { score: 0, classification: 'Moderate', scoreVariance: 0 },
    streakAnalysis: { 
      currentStreak: { type: 'win', count: 0 }, 
      longestWinStreak: 0, 
      longestLossStreak: 0 
    },
    pressurePerformance: {
      leadingPerformance: { wins: 0, total: 0, percentage: 0 },
      trailingPerformance: { comebacks: 0, total: 0, percentage: 0 },
      closeGameRecord: { wins: 0, total: 0, percentage: 0 }
    },
    peakPerformanceWindows: {
      bestQuarter: { quarter: 1, avgNetScore: 0 },
      worstQuarter: { quarter: 1, avgNetScore: 0 },
      quarterTrends: {}
    },
    teamChemistry: {
      bestCombinations: [],
      substitutionImpact: { positive: 0, negative: 0, neutral: 0 }
    },
    opponentStrengthMatrix: {
      vsStrong: { wins: 0, total: 0, avgScore: 0 },
      vsMedium: { wins: 0, total: 0, avgScore: 0 },
      vsWeak: { wins: 0, total: 0, avgScore: 0 }
    }
  });

  const completedGames = games.filter(game => 
    game.statusIsCompleted && game.statusAllowsStatistics
  );

  const gameStatsMap = centralizedStats || {};
  const isLoading = false;



  // Calculate all advanced analytics with stable dependencies
  useEffect(() => {
    if (!gameStatsMap || isLoading || Object.keys(gameStatsMap).length === 0) return;

    // Sort games chronologically for analysis
    const sortedGames = completedGames
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 1. Performance Momentum Analysis
    const recentGames = sortedGames.slice(-5);
    const recentResults = recentGames.map(game => {
      const gameStats = gameStatsMap[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const awayScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      return getWinLoseLabel(teamScore, awayScore);
    });
    const momentum = calculateMomentum(recentResults);

    // 2. Consistency Index Analysis
    const gameScores = sortedGames.map(game => {
      const gameStats = gameStatsMap[game.id] || [];
      return gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
    });
    const consistencyIndex = calculateConsistencyIndex(gameScores);

    // 3. Streak Analysis
    const allResults = sortedGames.map(game => {
      const gameStats = gameStatsMap[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const awayScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      return getWinLoseLabel(teamScore, awayScore);
    });
    const streakAnalysis = calculateStreakAnalysis(allResults);

    // 4. Position Efficiency Analysis
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
            const efficiency = (stat.goalsFor || 0) - (stat.goalsAgainst || 0);
            positionStats[stat.position][quarter] += efficiency;
            positionStats[stat.position][countKey]++;
          }
        }
      });
    });

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

    // 5. Comeback Potential Analysis
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

      for (let q = 0; q < 3; q++) {
        const teamRunning = quarterScores.team.slice(0, q + 1).reduce((a, b) => a + b, 0);
        const opponentRunning = quarterScores.opponent.slice(0, q + 1).reduce((a, b) => a + b, 0);

        if (teamRunning < opponentRunning) {
          totalDeficits++;
          totalDeficitSize += (opponentRunning - teamRunning);

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

    // 6. Pressure Performance Analysis
    const pressurePerformance = calculatePressurePerformance(sortedGames, gameStatsMap);

    // 7. Peak Performance Windows Analysis
    const peakPerformanceWindows = calculatePeakPerformanceWindows(sortedGames, gameStatsMap);

    // 8. Team Chemistry Analysis
    const teamChemistry = calculateTeamChemistry(sortedGames, gameStatsMap);

    // 9. Opponent Strength Matrix
    const opponentStrengthMatrix = calculateOpponentStrengthMatrix(sortedGames, gameStatsMap, opponents);

    setAnalytics({
      momentum,
      positionEfficiency,
      comebackPotential,
      consistencyIndex,
      streakAnalysis,
      pressurePerformance,
      peakPerformanceWindows,
      teamChemistry,
      opponentStrengthMatrix
    });

  }, [JSON.stringify(gameStatsMap), isLoading, completedGames.length, opponents.length]);

  // Helper functions
  const calculateMomentum = (results: string[]) => {
    if (results.length === 0) return { trend: 'stable' as const, strength: 0, recentForm: [] };

    const winWeight = 3;
    const drawWeight = 1;
    const lossWeight = -2;

    let momentum = 0;
    results.forEach((result, index) => {
      const weight = (index + 1) / results.length;
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

  const calculateConsistencyIndex = (scores: number[]) => {
    if (scores.length < 2) return { score: 100, classification: 'Moderate' as const, scoreVariance: 0 };

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Consistency score: lower variance = higher consistency
    const consistencyScore = Math.max(0, 100 - (stdDev * 10));

    let classification: 'Very Consistent' | 'Consistent' | 'Moderate' | 'Inconsistent' | 'Very Inconsistent';
    if (consistencyScore >= 80) classification = 'Very Consistent';
    else if (consistencyScore >= 65) classification = 'Consistent';
    else if (consistencyScore >= 45) classification = 'Moderate';
    else if (consistencyScore >= 25) classification = 'Inconsistent';
    else classification = 'Very Inconsistent';

    return {
      score: Math.round(consistencyScore),
      classification,
      scoreVariance: Math.round(variance * 10) / 10
    };
  };

  const calculateStreakAnalysis = (results: string[]) => {
    if (results.length === 0) {
      return {
        currentStreak: { type: 'win' as const, count: 0 },
        longestWinStreak: 0,
        longestLossStreak: 0
      };
    }

    // Current streak
    let currentStreak = { type: results[results.length - 1].toLowerCase() as 'win' | 'loss' | 'draw', count: 1 };
    for (let i = results.length - 2; i >= 0; i--) {
      if (results[i] === results[results.length - 1]) {
        currentStreak.count++;
      } else {
        break;
      }
    }

    // Longest streaks
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    results.forEach(result => {
      if (result === 'Win') {
        currentWinStreak++;
        currentLossStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else if (result === 'Loss') {
        currentLossStreak++;
        currentWinStreak = 0;
        longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
      } else {
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
    });

    return {
      currentStreak,
      longestWinStreak,
      longestLossStreak
    };
  };

  const calculatePressurePerformance = (games: Game[], statsMap: Record<number, GameStat[]>) => {
    let leadingWins = 0, leadingTotal = 0;
    let trailingComebacks = 0, trailingTotal = 0;
    let closeGameWins = 0, closeGameTotal = 0;

    games.forEach(game => {
      const gameStats = statsMap[game.id] || [];
      const finalTeamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const finalOpponentScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      const scoreDiff = Math.abs(finalTeamScore - finalOpponentScore);

      // Close game analysis (within 3 goals)
      if (scoreDiff <= 3) {
        closeGameTotal++;
        if (finalTeamScore > finalOpponentScore) closeGameWins++;
      }

      // Quarter-by-quarter analysis for leading/trailing
      const quarterScores = { team: [0, 0, 0, 0], opponent: [0, 0, 0, 0] };
      gameStats.forEach(stat => {
        if (stat.quarter >= 1 && stat.quarter <= 4) {
          quarterScores.team[stat.quarter - 1] += stat.goalsFor || 0;
          quarterScores.opponent[stat.quarter - 1] += stat.goalsAgainst || 0;
        }
      });

      // Check if leading at halftime
      const halfTimeTeam = quarterScores.team[0] + quarterScores.team[1];
      const halfTimeOpponent = quarterScores.opponent[0] + quarterScores.opponent[1];

      if (halfTimeTeam > halfTimeOpponent) {
        leadingTotal++;
        if (finalTeamScore > finalOpponentScore) leadingWins++;
      } else if (halfTimeTeam < halfTimeOpponent) {
        trailingTotal++;
        if (finalTeamScore > finalOpponentScore) trailingComebacks++;
      }
    });

    return {
      leadingPerformance: {
        wins: leadingWins,
        total: leadingTotal,
        percentage: leadingTotal > 0 ? (leadingWins / leadingTotal) * 100 : 0
      },
      trailingPerformance: {
        comebacks: trailingComebacks,
        total: trailingTotal,
        percentage: trailingTotal > 0 ? (trailingComebacks / trailingTotal) * 100 : 0
      },
      closeGameRecord: {
        wins: closeGameWins,
        total: closeGameTotal,
        percentage: closeGameTotal > 0 ? (closeGameWins / closeGameTotal) * 100 : 0
      }
    };
  };

  const calculatePeakPerformanceWindows = (games: Game[], statsMap: Record<number, GameStat[]>) => {
    const quarterTrends: Record<number, { totalFor: number; totalAgainst: number; games: number }> = {
      1: { totalFor: 0, totalAgainst: 0, games: 0 },
      2: { totalFor: 0, totalAgainst: 0, games: 0 },
      3: { totalFor: 0, totalAgainst: 0, games: 0 },
      4: { totalFor: 0, totalAgainst: 0, games: 0 }
    };

    games.forEach(game => {
      const gameStats = statsMap[game.id] || [];
      const quarterData: Record<number, { for: number; against: number }> = {};

      gameStats.forEach(stat => {
        if (!quarterData[stat.quarter]) {
          quarterData[stat.quarter] = { for: 0, against: 0 };
        }
        quarterData[stat.quarter].for += stat.goalsFor || 0;
        quarterData[stat.quarter].against += stat.goalsAgainst || 0;
      });

      [1, 2, 3, 4].forEach(quarter => {
        if (quarterData[quarter]) {
          quarterTrends[quarter].totalFor += quarterData[quarter].for;
          quarterTrends[quarter].totalAgainst += quarterData[quarter].against;
          quarterTrends[quarter].games++;
        }
      });
    });

    const avgQuarterPerformance = Object.entries(quarterTrends).map(([quarter, data]) => ({
      quarter: parseInt(quarter),
      avgFor: data.games > 0 ? data.totalFor / data.games : 0,
      avgAgainst: data.games > 0 ? data.totalAgainst / data.games : 0,
      netScore: data.games > 0 ? (data.totalFor - data.totalAgainst) / data.games : 0
    }));

    const bestQuarter = avgQuarterPerformance.reduce((best, current) => 
      current.netScore > best.netScore ? current : best
    );

    const worstQuarter = avgQuarterPerformance.reduce((worst, current) => 
      current.netScore < worst.netScore ? current : worst
    );

    const quarterTrendsFormatted = avgQuarterPerformance.reduce((acc, quarter) => {
      acc[quarter.quarter] = {
        avgFor: Math.round(quarter.avgFor * 10) / 10,
        avgAgainst: Math.round(quarter.avgAgainst * 10) / 10,
        netScore: Math.round(quarter.netScore * 10) / 10
      };
      return acc;
    }, {} as Record<number, { avgFor: number; avgAgainst: number; netScore: number }>);

    return {
      bestQuarter: {
        quarter: bestQuarter.quarter,
        avgNetScore: Math.round(bestQuarter.netScore * 10) / 10
      },
      worstQuarter: {
        quarter: worstQuarter.quarter,
        avgNetScore: Math.round(worstQuarter.netScore * 10) / 10
      },
      quarterTrends: quarterTrendsFormatted
    };
  };

  const calculateTeamChemistry = (games: Game[], statsMap: Record<number, GameStat[]>) => {
    // This is a simplified version - in reality you'd need roster data
    // For now, we'll analyze substitution patterns based on quarter performance
    let positiveSubImpact = 0;
    let negativeSubImpact = 0;
    let neutralSubImpact = 0;

    games.forEach(game => {
      const gameStats = statsMap[game.id] || [];
      const quarterPerformance = [1, 2, 3, 4].map(quarter => {
        const quarterStats = gameStats.filter(s => s.quarter === quarter);
        const quarterFor = quarterStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0);
        const quarterAgainst = quarterStats.reduce((sum, s) => sum + (s.goalsAgainst || 0), 0);
        return quarterFor - quarterAgainst;
      });

      // Simple analysis: if performance improves from quarter to quarter, credit substitutions
      for (let i = 1; i < quarterPerformance.length; i++) {
        const improvement = quarterPerformance[i] - quarterPerformance[i - 1];
        if (improvement > 1) positiveSubImpact++;
        else if (improvement < -1) negativeSubImpact++;
        else neutralSubImpact++;
      }
    });

    return {
      bestCombinations: [], // Would need roster data to calculate properly
      substitutionImpact: {
        positive: positiveSubImpact,
        negative: negativeSubImpact,
        neutral: neutralSubImpact
      }
    };
  };

  const calculateOpponentStrengthMatrix = (games: Game[], statsMap: Record<number, GameStat[]>, opponents: Opponent[]) => {
    // First, calculate win rate against each opponent
    const opponentPerformance: Record<string, { wins: number; total: number; winRate: number; totalScore: number }> = {};

    games.forEach(game => {
      // Get opponent name - this works regardless of home/away since we use game stats perspective
      const opponentName = game.awayTeamName || game.homeTeamName;

      if (!opponentName || opponentName === 'Bye') return;

      if (!opponentPerformance[opponentName]) {
        opponentPerformance[opponentName] = { wins: 0, total: 0, winRate: 0, totalScore: 0 };
      }

      const gameStats = statsMap[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const awayScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

      opponentPerformance[opponentName].total++;
      opponentPerformance[opponentName].totalScore += teamScore;

      if (getWinLoseLabel(teamScore, awayScore) === 'Win') {
        opponentPerformance[opponentName].wins++;
      }
    });

    // Calculate win rates
    Object.keys(opponentPerformance).forEach(opponentName => {
      const data = opponentPerformance[opponentName];
      data.winRate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
    });

    // Now categorize opponents based on our performance against them
    const opponentStrengthMatrix = {
      vsStrong: { wins: 0, total: 0, totalScore: 0 }, // Teams we perform well against (≥70% win rate)
      vsMedium: { wins: 0, total: 0, totalScore: 0 }, // Balanced matchups (30-69% win rate)
      vsWeak: { wins: 0, total: 0, totalScore: 0 }    // Teams that challenge us (<30% win rate)
    };

    games.forEach(game => {
      // Get opponent name using same logic as above
      const opponentName = game.awayTeamName || game.homeTeamName;

      if (!opponentName || opponentName === 'Bye') return;

      const performance = opponentPerformance[opponentName];
      if (!performance) return;

      // Categorize based on our win rate against this opponent
      let category: 'vsStrong' | 'vsMedium' | 'vsWeak' = 'vsMedium';
      if (performance.winRate >= 70) {
        category = 'vsStrong'; // We're strong against this opponent
      } else if (performance.winRate < 30) {
        category = 'vsWeak'; // This opponent challenges us
      }

      const gameStats = statsMap[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const awayScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

      opponentStrengthMatrix[category].total++;
      opponentStrengthMatrix[category].totalScore += teamScore;

      if (getWinLoseLabel(teamScore, awayScore) === 'Win') {
        opponentStrengthMatrix[category].wins++;
      }
    });

    return {
      vsStrong: {
        wins: opponentStrengthMatrix.vsStrong.wins,
        total: opponentStrengthMatrix.vsStrong.total,
        avgScore: opponentStrengthMatrix.vsStrong.total > 0 
          ? Math.round((opponentStrengthMatrix.vsStrong.totalScore / opponentStrengthMatrix.vsStrong.total) * 10) / 10
          : 0
      },
      vsMedium: {
        wins: opponentStrengthMatrix.vsMedium.wins,
        total: opponentStrengthMatrix.vsMedium.total,
        avgScore: opponentStrengthMatrix.vsMedium.total > 0 
          ? Math.round((opponentStrengthMatrix.vsMedium.totalScore / opponentStrengthMatrix.vsMedium.total) * 10) / 10
          : 0
      },
      vsWeak: {
        wins: opponentStrengthMatrix.vsWeak.wins,
        total: opponentStrengthMatrix.vsWeak.total,
        avgScore: opponentStrengthMatrix.vsWeak.total > 0 
          ? Math.round((opponentStrengthMatrix.vsWeak.totalScore / opponentStrengthMatrix.vsWeak.total) * 10) / 10
          : 0
      }
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

        {/* Consistency Index */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-5 w-5 text-teal-600" />
            <span className="font-semibold text-gray-700">Team Consistency</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-teal-700">
                {analytics.consistencyIndex.score}%
              </div>
              <div className="text-sm text-gray-600">
                {analytics.consistencyIndex.classification}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-700">
                ±{analytics.consistencyIndex.scoreVariance}
              </div>
              <div className="text-xs text-gray-600">Score Variance</div>
            </div>
          </div>
        </div>

        {/* Streak Analysis */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-gray-700">Streak Analysis</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                analytics.streakAnalysis.currentStreak.type === 'win' ? 'text-green-600' :
                analytics.streakAnalysis.currentStreak.type === 'loss' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {analytics.streakAnalysis.currentStreak.count}
              </div>
              <div className="text-xs text-gray-600">
                Current {analytics.streakAnalysis.currentStreak.type} streak
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.streakAnalysis.longestWinStreak}
              </div>
              <div className="text-xs text-gray-600">Longest Win Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics.streakAnalysis.longestLossStreak}
              </div>
              <div className="text-xs text-gray-600">Longest Loss Streak</div>
            </div>
          </div>
        </div>

        {/* Pressure Performance */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-rose-600" />
            <span className="font-semibold text-gray-700">Pressure Performance</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {analytics.pressurePerformance.leadingPerformance.percentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">
                Win Rate When Leading ({analytics.pressurePerformance.leadingPerformance.wins}/{analytics.pressurePerformance.leadingPerformance.total})
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {analytics.pressurePerformance.trailingPerformance.percentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">
                Comeback Rate ({analytics.pressurePerformance.trailingPerformance.comebacks}/{analytics.pressurePerformance.trailingPerformance.total})
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {analytics.pressurePerformance.closeGameRecord.percentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">
                Close Game Record ({analytics.pressurePerformance.closeGameRecord.wins}/{analytics.pressurePerformance.closeGameRecord.total})
              </div>
            </div>
          </div>
        </div>

        {/* Peak Performance Windows */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-gray-700">Peak Performance Windows</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <div className="text-lg font-bold text-green-700">
                Q{analytics.peakPerformanceWindows.bestQuarter.quarter}
              </div>
              <div className="text-sm text-gray-600">Best Quarter</div>
              <div className="text-xs text-gray-500">
                +{analytics.peakPerformanceWindows.bestQuarter.avgNetScore} avg
              </div>
            </div>
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <div className="text-lg font-bold text-red-700">
                Q{analytics.peakPerformanceWindows.worstQuarter.quarter}
              </div>
              <div className="text-sm text-gray-600">Needs Work</div>
              <div className="text-xs text-gray-500">
                {analytics.peakPerformanceWindows.worstQuarter.avgNetScore} avg
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(analytics.peakPerformanceWindows.quarterTrends).map(([quarter, data]) => (
              <div key={quarter} className="flex items-center justify-between">
                <span className="text-sm font-medium">Quarter {quarter}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600">{data.avgFor}</span>
                  <span className="text-xs text-gray-400">-</span>
                  <span className="text-xs text-red-600">{data.avgAgainst}</span>
                  <span className={`text-sm font-bold ml-2 ${
                    data.netScore > 0 ? 'text-green-600' : data.netScore < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {data.netScore > 0 ? '+' : ''}{data.netScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Chemistry */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-violet-600" />
            <span className="font-semibold text-gray-700">Team Chemistry & Substitutions</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {analytics.teamChemistry.substitutionImpact.positive}
              </div>
              <div className="text-xs text-gray-600">Positive Impact</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">
                {analytics.teamChemistry.substitutionImpact.neutral}
              </div>
              <div className="text-xs text-gray-600">Neutral Impact</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {analytics.teamChemistry.substitutionImpact.negative}
              </div>
              <div className="text-xs text-gray-600">Negative Impact</div>
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
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-700">Performance vs Opponent Strength</span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'vsStrong', label: 'Teams We Dominate', color: 'green' },
              { key: 'vsMedium', label: 'Balanced Matchups', color: 'yellow' },
              { key: 'vsWeak', label: 'Challenging Opponents', color: 'red' }
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