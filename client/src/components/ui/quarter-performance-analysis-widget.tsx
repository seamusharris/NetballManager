import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { calculateQuarterPositionBreakdowns, GameWithPositionStats, OfficialQuarterScore as BaseOfficialQuarterScore } from '@/lib/quarterBreakdownUtils';

export interface QuarterPerformanceAnalysisWidgetProps {
  games: any[];
  currentTeamId: number;
  batchScores?: Record<number, any[]>;
  batchStats?: Record<number, any[]>;
  className?: string;
  excludeSpecialGames?: boolean;
}

const QUARTERS = [1, 2, 3, 4];

// Locally extend the type to include gamesWithData for averaging
interface OfficialQuarterScore extends BaseOfficialQuarterScore {
  gamesWithData: number;
}

const QuarterPerformanceAnalysisWidget: React.FC<QuarterPerformanceAnalysisWidgetProps> = ({
  games,
  currentTeamId,
  batchScores,
  batchStats,
  className,
  excludeSpecialGames = true
}) => {
  // Debug logging for input props
  console.log('[QuarterPerformanceAnalysisWidget] games:', games);
  console.log('[QuarterPerformanceAnalysisWidget] batchScores:', batchScores);
  console.log('[QuarterPerformanceAnalysisWidget] batchStats:', batchStats);

  const numGames = games.length || 1;

  // Build gamesWithPositionStats from batchStats
  const gamesWithPositionStats: GameWithPositionStats[] = (games || []).map(g => {
    const stats = (batchStats && batchStats[g.id]) || [];
    const quarterStats: Record<string, { GS: number; GA: number; GK: number; GD: number }> = {};
    [1,2,3,4].forEach(qNum => {
      quarterStats[`Q${qNum}`] = { GS: 0, GA: 0, GK: 0, GD: 0 };
      stats.forEach(entry => {
        if (entry.teamId === currentTeamId && entry.quarter === qNum) {
          if (entry.position === 'GS' && typeof entry.goalsFor === 'number') quarterStats[`Q${qNum}`].GS += entry.goalsFor;
          if (entry.position === 'GA' && typeof entry.goalsFor === 'number') quarterStats[`Q${qNum}`].GA += entry.goalsFor;
          if (entry.position === 'GK' && typeof entry.goalsAgainst === 'number') quarterStats[`Q${qNum}`].GK += entry.goalsAgainst;
          if (entry.position === 'GD' && typeof entry.goalsAgainst === 'number') quarterStats[`Q${qNum}`].GD += entry.goalsAgainst;
        }
      });
    });
    return { id: g.id, quarterStats };
  });

  // Aggregate official quarter scores across all games using batchScores
  const officialQuarterScores: OfficialQuarterScore[] = [1,2,3,4].map(qNum => {
    let forSum = 0;
    let againstSum = 0;
    let gamesWithData = 0;
    (games || []).forEach(g => {
      const gameId = g.id;
      const entries = batchScores && batchScores[gameId] ? batchScores[gameId] : [];
      let foundFor = false, foundAgainst = false;
      entries.forEach(entry => {
        if (entry.quarter === qNum) {
          if (entry.teamId === currentTeamId) {
            forSum += typeof entry.score === 'number' ? entry.score : 0;
            foundFor = true;
          } else {
            againstSum += typeof entry.score === 'number' ? entry.score : 0;
            foundAgainst = true;
          }
        }
      });
      if (foundFor || foundAgainst) gamesWithData++;
    });
    return { quarter: `Q${qNum}`, for: forSum, against: againstSum, gamesWithData };
  });

  // Debug logging for mapped data
  console.log('[QuarterPerformanceAnalysisWidget] gamesWithPositionStats:', gamesWithPositionStats);
  console.log('[QuarterPerformanceAnalysisWidget] officialQuarterScores:', officialQuarterScores);

  // Calculate per-quarter averages, always including every game (treat missing as zero)
  const quarterAverages = [1,2,3,4].map(qNum => {
    let sumFor = 0, sumAgainst = 0;
    gamesWithPositionStats.forEach(g => {
      const qStats = g.quarterStats[`Q${qNum}`] || { GS: 0, GA: 0, GK: 0, GD: 0 };
      sumFor += (qStats.GS || 0) + (qStats.GA || 0);
      sumAgainst += (qStats.GK || 0) + (qStats.GD || 0);
    });
    return {
      quarter: `Q${qNum}`,
      avgFor: sumFor / numGames,
      avgAgainst: sumAgainst / numGames
    };
  });

  // Calculate AVG card values (sum of quarter averages)
  const avgCard = quarterAverages.reduce(
    (acc, q) => {
      acc.avgFor += q.avgFor;
      acc.avgAgainst += q.avgAgainst;
      return acc;
    },
    { avgFor: 0, avgAgainst: 0 }
  );

  // Strip gamesWithData before passing to the utility
  const officialQuarterScoresForUtility = officialQuarterScores.map(q => ({ quarter: q.quarter, for: q.for, against: q.against }));

  const { breakdowns, dataQuality } = calculateQuarterPositionBreakdowns(
    gamesWithPositionStats,
    officialQuarterScoresForUtility
  );

  // Debug logging for utility output
  console.log('[QuarterPerformanceAnalysisWidget] breakdowns:', breakdowns);
  console.log('[QuarterPerformanceAnalysisWidget] dataQuality:', dataQuality);

  return (
    <div className={cn('px-4 py-6 border-2 border-gray-200 rounded-lg bg-white', className)}>
      <div className="mb-2 text-xs text-gray-500 font-medium">
        Analysis based on {dataQuality.gamesWithStats} number of games with position breakdowns.
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Quarter cards */}
        {quarterAverages.map(({ quarter, avgFor, avgAgainst }, idx) => {
          const isWinning = avgFor > avgAgainst;
          const isLosing = avgFor < avgAgainst;
          const isDraw = Math.abs(avgFor - avgAgainst) < 0.1;
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
                  {quarter}
                </Badge>
              </div>
              <div className="space-y-1 mt-1">
                <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                  {avgFor.toFixed(1)}–{avgAgainst.toFixed(1)}
                </div>
                <div className={`text-base ${getDiffTextColorClass()}`}>
                  {(() => {
                    const diff = avgFor - avgAgainst;
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
                      width: `${Math.min(100, Math.max(0, (avgFor / (avgFor + avgAgainst)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {/* AVG card */}
        <div className={`text-center p-2 rounded-lg border-2 bg-green-100 border-green-300 transition-colors relative`}>
          {/* AVG badge in top-left corner */}
          <div className="absolute -top-2 -left-2">
            <Badge className="text-xs font-bold px-2 py-1 rounded-full shadow-sm border bg-green-500 text-white border-green-600">AVG</Badge>
          </div>
          <div className="space-y-1 mt-1">
            <div className="text-lg font-bold text-green-700">
              {avgCard.avgFor.toFixed(1)}–{avgCard.avgAgainst.toFixed(1)}
            </div>
            <div className="text-base text-green-700 font-bold">
              {(() => {
                const diff = avgCard.avgFor - avgCard.avgAgainst;
                return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
              })()}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" title="Sum of quarter averages">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.min(100, Math.max(0, (avgCard.avgFor / (avgCard.avgFor + avgCard.avgAgainst)) * 100))}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterPerformanceAnalysisWidget; 