import React from 'react';
import { Badge } from '@/components/ui/badge';
import { calculateConsistentQuarterPerformance } from '@/lib/positionStatsCalculator';
import { cn } from '@/lib/utils';

export interface QuarterPerformanceAnalysisWidgetProps {
  games: any[];
  currentTeamId: number;
  batchScores?: Record<number, any[]>;
  batchStats?: Record<number, any[]>;
  className?: string;
  excludeSpecialGames?: boolean;
}

const QuarterPerformanceAnalysisWidget: React.FC<QuarterPerformanceAnalysisWidgetProps> = ({
  games,
  currentTeamId,
  batchScores,
  batchStats,
  className,
  excludeSpecialGames = true
}) => {
  // Use consistent calculation method across all widgets
  const { seasonAverages, quarterAverages, quarterData, positionTotals } = calculateConsistentQuarterPerformance(
    games,
    batchScores || {},
    batchStats,
    currentTeamId
  );

  // Use quarterData instead of quarterAverages to match CompactAttackDefenseWidget
  const quarterPerformanceData = quarterData.map(({ quarter, gsGoalsFor, gaGoalsFor, gkGoalsAgainst, gdGoalsAgainst }) => ({
    quarter,
    avgTeamScore: gsGoalsFor + gaGoalsFor, // Total goals scored (attack)
    avgOpponentScore: gkGoalsAgainst + gdGoalsAgainst, // Total goals conceded (defense)
    gamesWithData: 0 // Not used for display
  }));

  // Debug logging to verify calculations
  console.log('🔍 QuarterPerformanceAnalysisWidget - UPDATED CALCULATIONS:');
  quarterPerformanceData.forEach(({ quarter, avgTeamScore, avgOpponentScore }) => {
    const diff = avgTeamScore - avgOpponentScore;
    console.log(`🔍 Q${quarter}: ${avgTeamScore.toFixed(1)}-${avgOpponentScore.toFixed(1)} = ${diff > 0 ? '+' : ''}${diff.toFixed(1)}`);
  });

  return (
    <div className={cn("px-4 py-6 border-2 border-gray-200 rounded-lg bg-gray-50", className)}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* AVG Card */}
        {(() => {
          const avgGoalsFor = seasonAverages.avgGoalsFor;
          const avgGoalsAgainst = seasonAverages.avgGoalsAgainst;
          const isWinning = avgGoalsFor > avgGoalsAgainst;
          const isLosing = avgGoalsFor < avgGoalsAgainst;
          const isDraw = Math.abs(avgGoalsFor - avgGoalsAgainst) < 0.1;

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
              {/* AVG badge in top-left corner */}
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
                  title="Our share of total season scoring"
                >
                  <div 
                    className={`h-2 rounded-full ${
                      isWinning ? 'bg-green-500' : 
                      isLosing ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, (avgGoalsFor / (avgGoalsFor + avgGoalsAgainst)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default QuarterPerformanceAnalysisWidget; 