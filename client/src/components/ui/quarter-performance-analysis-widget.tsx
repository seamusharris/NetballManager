import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Game, GameStats, GameScore } from '@shared/types';
import { calculateQuarterPositionBreakdowns, GameWithPositionStats, OfficialQuarterScore as BaseOfficialQuarterScore, getConsistentStatsBreakdown } from '@/lib/quarterBreakdownUtils';

export interface QuarterPerformanceAnalysisWidgetProps {
  games: Game[];
  currentTeamId: number;
  batchScores?: Record<number, GameScore[]>;
  batchStats?: Record<number, GameStats[]>;
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

  // Use centralized, sum-matched breakdowns for all displayed values
  const breakdown = getConsistentStatsBreakdown(gamesWithPositionStats, officialQuarterScores);

  // Data quality indicator
  const dataQuality = { gamesWithStats: games.length };

  return (
    <div className={cn('px-4 py-6 border-2 border-gray-200 rounded-lg bg-white', className)}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Quarter cards */}
        {breakdown.quarterFor.map((forVal, idx) => {
          const againstVal = breakdown.quarterAgainst[idx];
          const isWinning = forVal > againstVal;
          const isLosing = forVal < againstVal;
          const isDraw = Math.abs(forVal - againstVal) < 0.1;
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
            <div key={`Q${idx+1}`} className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
              {/* Quarter badge in top-left corner */}
              <div className="absolute -top-2 -left-2">
                <Badge 
                  className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                    isDraw ? 'bg-amber-500 text-white border-amber-600' :
                    isWinning ? 'bg-green-500 text-white border-green-600' : 
                    'bg-red-500 text-white border-red-600'
                  }`}
                >
                  Q{idx+1}
                </Badge>
              </div>
              <div className="space-y-1 mt-1">
                <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                  {forVal.toFixed(1)}–{againstVal.toFixed(1)}
                </div>
                <div className={`text-base ${getDiffTextColorClass()}`}>
                  {(() => {
                    const diff = forVal - againstVal;
                    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
                  })()}
                </div>
                <div 
                  className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4"
                >
                  <div 
                    className={`h-2 rounded-full ${
                      isWinning ? 'bg-green-500' : 
                      isLosing ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, (forVal / (forVal + againstVal)) * 100))}%`
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
              {breakdown.totalFor.toFixed(1)}–{breakdown.totalAgainst.toFixed(1)}
            </div>
            <div className="text-base text-green-700 font-bold">
              {(() => {
                const diff = breakdown.totalFor - breakdown.totalAgainst;
                return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
              })()}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.min(100, Math.max(0, (breakdown.totalFor / (breakdown.totalFor + breakdown.totalAgainst)) * 100))}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterPerformanceAnalysisWidget; 