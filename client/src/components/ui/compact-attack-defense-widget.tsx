import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Game, GameStats, GameScore } from '@shared/types';
import { calculateQuarterPositionBreakdowns, GameWithPositionStats, OfficialQuarterScore as BaseOfficialQuarterScore, getConsistentStatsBreakdown } from '@/lib/quarterBreakdownUtils';

interface CompactAttackDefenseWidgetProps {
  games: Game[];
  batchScores: Record<number, GameScore[]>;
  batchStats: Record<number, GameStats[]>;
  teamId: number;
  className?: string;
}

const QUARTERS = [1, 2, 3, 4];

export function CompactAttackDefenseWidget({ 
  games, 
  batchScores, 
  batchStats, 
  teamId, 
  className = "" 
}: CompactAttackDefenseWidgetProps) {
  const numGames = games.length || 1; // Avoid division by zero

  // Build gamesWithPositionStats from batchStats
  const gamesWithPositionStats: GameWithPositionStats[] = (games || []).map(g => {
    const stats = (batchStats && batchStats[g.id]) || [];
    const quarterStats: Record<string, { GS: number; GA: number; GK: number; GD: number }> = {};
    [1,2,3,4].forEach(qNum => {
      quarterStats[`Q${qNum}`] = { GS: 0, GA: 0, GK: 0, GD: 0 };
      stats.forEach(entry => {
        if (entry.teamId === teamId && entry.quarter === qNum) {
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
  const officialQuarterScores: BaseOfficialQuarterScore[] = [1,2,3,4].map(qNum => {
    let forSum = 0;
    let againstSum = 0;
    (games || []).forEach(g => {
      const gameId = g.id;
      const entries = batchScores && batchScores[gameId] ? batchScores[gameId] : [];
      entries.forEach(entry => {
        if (entry.quarter === qNum) {
          if (entry.teamId === teamId) {
            forSum += typeof entry.score === 'number' ? entry.score : 0;
          } else {
            againstSum += typeof entry.score === 'number' ? entry.score : 0;
          }
        }
      });
    });
    return { quarter: `Q${qNum}`, for: forSum, against: againstSum };
  });

  // Use centralized, sum-matched breakdowns for all displayed values
  const breakdown = getConsistentStatsBreakdown(gamesWithPositionStats, officialQuarterScores);

  // Data quality indicator
  const dataQuality = { gamesWithStats: games.length };

  return (
    <div className={cn('px-4 py-6 border-2 border-gray-200 rounded-lg bg-white', className)}>
      <div className="mb-2 text-xs text-gray-500 font-medium">
        Analysis based on {dataQuality.gamesWithStats} games with position breakdowns.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attack Column */}
        <div className="space-y-4">
          {/* Attack Summary Card */}
          <div className="space-y-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Attack</span>
              <span className="text-2xl font-bold text-green-600">{breakdown.totalFor.toFixed(1)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>GS: {breakdown.GS.toFixed(1)}</span>
                <span>GA: {breakdown.GA.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 flex">
                <div
                  className="bg-green-600 h-3 rounded-l-full"
                  style={{ width: breakdown.totalFor > 0 ? `${breakdown.GS / breakdown.totalFor * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-green-400 h-3 rounded-r-full"
                  style={{ width: breakdown.totalFor > 0 ? `${breakdown.GA / breakdown.totalFor * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Attack Quarters */}
          {breakdown.perQuarter.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {breakdown.perQuarter.map((q, i) => (
                <div key={`attack-Q${i+1}`} className="text-center p-2 rounded-lg border-2 bg-green-100 border-green-300 relative">
                  <div className="absolute -top-1 -left-1">
                    <div className="text-xs font-bold px-1 py-0.5 rounded-full bg-green-500 text-white text-[10px]">
                      Q{i+1}
                    </div>
                  </div>
                  <div className="space-y-1 mt-1">
                    <div className="text-base font-bold text-green-600">
                      {(breakdown.quarterFor[i] || 0).toFixed(1)}
                    </div>
                    <div className="text-xs text-green-700">Scored</div>
                    <div className="text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span>GS: {q.GS.toFixed(1)}</span>
                        <span>GA: {q.GA.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 flex">
                      <div 
                        className="h-1.5 rounded-l-full bg-green-600"
                        style={{ width: (breakdown.quarterFor[i] || 0) > 0 ? `${q.GS / breakdown.quarterFor[i] * 100}%` : '50%' }}
                      ></div>
                      <div 
                        className="h-1.5 rounded-r-full bg-green-400"
                        style={{ width: (breakdown.quarterFor[i] || 0) > 0 ? `${q.GA / breakdown.quarterFor[i] * 100}%` : '50%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Defense Column */}
        <div className="space-y-4">
          {/* Defense Summary Card */}
          <div className="space-y-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Defense</span>
              <span className="text-2xl font-bold text-red-600">{breakdown.totalAgainst.toFixed(1)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>GK: {breakdown.GK.toFixed(1)}</span>
                <span>GD: {breakdown.GD.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 flex">
                <div
                  className="bg-red-600 h-3 rounded-l-full"
                  style={{ width: breakdown.totalAgainst > 0 ? `${breakdown.GK / breakdown.totalAgainst * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-red-400 h-3 rounded-r-full"
                  style={{ width: breakdown.totalAgainst > 0 ? `${breakdown.GD / breakdown.totalAgainst * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Defense Quarters */}
          {breakdown.perQuarter.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {breakdown.perQuarter.map((q, i) => (
                <div key={`defense-Q${i+1}`} className="text-center p-2 rounded-lg border-2 bg-red-100 border-red-300 relative">
                  <div className="absolute -top-1 -left-1">
                    <div className="text-xs font-bold px-1 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                      Q{i+1}
                    </div>
                  </div>
                  <div className="space-y-1 mt-1">
                    <div className="text-base font-bold text-red-600">
                      {(breakdown.quarterAgainst[i] || 0).toFixed(1)}
                    </div>
                    <div className="text-xs text-red-700">Conceded</div>
                    <div className="text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span>GK: {q.GK.toFixed(1)}</span>
                        <span>GD: {q.GD.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 flex">
                      <div 
                        className="h-1.5 rounded-l-full bg-red-600"
                        style={{ width: (breakdown.quarterAgainst[i] || 0) > 0 ? `${q.GK / breakdown.quarterAgainst[i] * 100}%` : '50%' }}
                      ></div>
                      <div 
                        className="h-1.5 rounded-r-full bg-red-400"
                        style={{ width: (breakdown.quarterAgainst[i] || 0) > 0 ? `${q.GD / breakdown.quarterAgainst[i] * 100}%` : '50%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 