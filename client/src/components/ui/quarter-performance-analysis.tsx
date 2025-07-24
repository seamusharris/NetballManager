
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { calculateConsistentQuarterPerformance } from '@/lib/positionStatsCalculator';

interface QuarterPerformanceAnalysisProps {
  games: any[];
  currentTeamId: number;
  batchScores?: Record<number, any[]>;
  batchStats?: Record<number, any[]>;
  className?: string;
  excludeSpecialGames?: boolean; // Skip BYE and forfeit games
}

export default function QuarterPerformanceAnalysis({
  games,
  currentTeamId,
  batchScores,
  batchStats,
  className = "",
  excludeSpecialGames = true
}: QuarterPerformanceAnalysisProps) {
  // Debug input data
  console.log('🔍 QuarterPerformanceAnalysis INPUT DATA:');
  console.log('🔍 games length:', games?.length);
  console.log('🔍 currentTeamId:', currentTeamId);
  console.log('🔍 batchScores keys:', Object.keys(batchScores || {}));
  console.log('🔍 batchStats keys:', Object.keys(batchStats || {}));
  console.log('🔍 Sample game:', games?.[0]);
  console.log('🔍 Sample batchScores:', batchScores && Object.keys(batchScores).length > 0 ? batchScores[Object.keys(batchScores)[0]] : 'No data');

  // Use consistent calculation method across all widgets
  const { seasonAverages, quarterAverages, quarterData, positionTotals } = calculateConsistentQuarterPerformance(
    games,
    batchScores || {},
    batchStats, // Now passing actual batchStats instead of undefined
    currentTeamId
  );

  // Use quarterData instead of quarterAverages to match CompactAttackDefenseWidget
  const quarterPerformanceData = quarterData.map(({ quarter, gsGoalsFor, gaGoalsFor, gkGoalsAgainst, gdGoalsAgainst }) => ({
    quarter,
    avgTeamScore: gsGoalsFor + gaGoalsFor, // Total goals scored (attack)
    avgOpponentScore: gkGoalsAgainst + gdGoalsAgainst, // Total goals conceded (defense)
    gamesWithData: 0 // Not used for display
  }));

  // Debug: Compare raw quarter averages vs distributed season averages
  console.log('🔍 QUARTER CALCULATION COMPARISON:');
  console.log('🔍 Season averages:', seasonAverages);
  console.log('🔍 Using quarterData (should match CompactAttackDefenseWidget):');
  quarterPerformanceData.forEach(({ quarter, avgTeamScore, avgOpponentScore }) => {
    console.log(`🔍 Q${quarter}: ${avgTeamScore.toFixed(1)}-${avgOpponentScore.toFixed(1)}`);
  });

  // Debug: Show what the CompactAttackDefenseWidget would calculate
  console.log('🔍 COMPACT WIDGET COMPARISON:');
  console.log('🔍 This widget should show the SAME quarter values as CompactAttackDefenseWidget');

  // Debug logging to verify calculations
  console.log('🔍 QuarterPerformanceAnalysis - UPDATED CALCULATIONS:');
  quarterPerformanceData.forEach(({ quarter, avgTeamScore, avgOpponentScore }) => {
    const diff = avgTeamScore - avgOpponentScore;
    console.log(`🔍 Q${quarter}: ${avgTeamScore.toFixed(1)}-${avgOpponentScore.toFixed(1)} = ${diff > 0 ? '+' : ''}${diff.toFixed(1)}`);
  });

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>
      {quarterPerformanceData.map(({ quarter, avgTeamScore, avgOpponentScore, gamesWithData }) => {

        const isWinning = avgTeamScore > avgOpponentScore;
        const isLosing = avgTeamScore < avgOpponentScore;
        const isDraw = Math.abs(avgTeamScore - avgOpponentScore) < 0.1;

        const getBackgroundClass = () => {
          if (isDraw) return 'bg-amber-100 border-amber-300';
          if (isWinning) return 'bg-green-100 border-green-300';
          return 'bg-red-100 border-red-300';
        };

        const getDiffTextColorClass = () => {
          if (isDraw) return 'text-amber-600 font-bold';
          return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
        };

        return (
          <div key={quarter} className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
            {/* Quarter badge in top-left corner */}
            <div className="absolute -top-2 -left-2">
              <Badge 
                className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                  isDraw ? 'bg-amber-500 text-white border-amber-600' :
                  isWinning ? 'bg-green-500 text-white border-green-600' : 
                  'bg-red-500 text-white border-red-600'
                }`}
              >
                Q{quarter}
              </Badge>
            </div>

            <div className="space-y-1 mt-1">
              <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                {avgTeamScore.toFixed(1)}–{avgOpponentScore.toFixed(1)}
              </div>
              <div className={`text-base ${getDiffTextColorClass()}`}>
                {(() => {
                  const diff = avgTeamScore - avgOpponentScore;
                  return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
                })()}
              </div>

              <div 
                className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                title="Our share of total quarter scoring"
              >
                <div 
                  className={`h-2 rounded-full ${
                    isWinning ? 'bg-green-500' : 
                    isLosing ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.max(0, (avgTeamScore / (avgTeamScore + avgOpponentScore)) * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Goal Difference Box - styled like quarter boxes */}
      {(() => {
        // Calculate overall goal difference using consistent method
        const { seasonAverages } = calculateConsistentQuarterPerformance(
          games,
          batchScores || {},
          batchStats, // Now passing actual batchStats instead of undefined
          currentTeamId
        );

        const avgGoalsFor = seasonAverages.avgGoalsFor;
        const avgGoalsAgainst = seasonAverages.avgGoalsAgainst;
        const goalDifference = avgGoalsFor - avgGoalsAgainst;

        const isWinning = goalDifference > 0;
        const isLosing = goalDifference < 0;
        const isDraw = Math.abs(goalDifference) < 0.1;

        const getBackgroundClass = () => {
          if (isDraw) return 'bg-amber-100 border-amber-300';
          if (isWinning) return 'bg-green-100 border-green-300';
          return 'bg-red-100 border-red-300';
        };

        const getDiffTextColorClass = () => {
          if (isDraw) return 'text-amber-600 font-bold';
          return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
        };

        return (
          <div className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
            {/* Goal difference badge in top-left corner */}
            <div className="absolute -top-2 -left-2">
              <Badge 
                className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                  isDraw ? 'bg-amber-500 text-white border-amber-600' :
                  isWinning ? 'bg-green-500 text-white border-green-600' : 
                  'bg-red-500 text-white border-red-600'
                }`}
              >
                AVG
              </Badge>
            </div>

            <div className="space-y-1 mt-1">
              <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                {avgGoalsFor.toFixed(1)}–{avgGoalsAgainst.toFixed(1)}
              </div>
              <div className={`text-base ${getDiffTextColorClass()}`}>
                {(() => {
                  const diff = avgGoalsFor - avgGoalsAgainst;
                  return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
                })()}
              </div>

              <div 
                className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                title="Our share of total game scoring"
              >
                <div 
                  className={`h-2 rounded-full ${
                    isWinning ? 'bg-green-500' : 
                    isLosing ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.max(0, (avgGoalsFor / (avgGoalsFor + avgGoalsAgainst)) * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
