import React from 'react';
import { PositionAverages } from '@/lib/positionStatsCalculator';
import QuarterPerformanceAnalysis from '@/components/ui/quarter-performance-analysis';
import { cn } from '@/lib/utils';

export interface QuarterPerformanceAnalysisWidgetProps {
  games: any[];
  currentTeamId: number;
  batchScores?: Record<number, any[]>;
  className?: string;
  excludeSpecialGames?: boolean;
}

const QuarterPerformanceAnalysisWidget: React.FC<QuarterPerformanceAnalysisWidgetProps> = ({
  games,
  currentTeamId,
  batchScores,
  className,
  excludeSpecialGames = true
}) => {
  return (
    <div className={cn("px-4 py-6 border-2 border-gray-200 rounded-lg bg-gray-50", className)}>
      <QuarterPerformanceAnalysis
        games={games}
        currentTeamId={currentTeamId}
        batchScores={batchScores}
        excludeSpecialGames={excludeSpecialGames}
      />
    </div>
  );
};

export default QuarterPerformanceAnalysisWidget; 