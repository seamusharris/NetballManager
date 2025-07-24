import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { calculateQuarterPositionBreakdowns, GameWithPositionStats, OfficialQuarterScore as BaseOfficialQuarterScore } from '@/lib/quarterBreakdownUtils';
import { adjustValuesToTotal } from '@/lib/roundingUtils';

interface CompactAttackDefenseWidgetProps {
  games: any[];
  batchScores: Record<number, any[]>;
  batchStats: Record<number, any[]>;
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
  // Debug logging for input props
  console.log('[CompactAttackDefenseWidget] games:', games);
  console.log('[CompactAttackDefenseWidget] batchScores:', batchScores);
  console.log('[CompactAttackDefenseWidget] batchStats:', batchStats);

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

  // Debug logging for mapped data
  console.log('[CompactAttackDefenseWidget] gamesWithPositionStats:', gamesWithPositionStats);
  console.log('[CompactAttackDefenseWidget] officialQuarterScores:', officialQuarterScores);

  // Calculate per-quarter and per-position averages (full precision)
  let totalGS = 0, totalGA = 0, totalGK = 0, totalGD = 0;
  let rawQuarterAverages: { quarter: string; GS: number; GA: number; GK: number; GD: number; attackTotal: number; defenseTotal: number }[] = [];
  [1,2,3,4].forEach(qNum => {
    let sumGS = 0, sumGA = 0, sumGK = 0, sumGD = 0;
    gamesWithPositionStats.forEach(g => {
      const qStats = g.quarterStats[`Q${qNum}`] || { GS: 0, GA: 0, GK: 0, GD: 0 };
      sumGS += qStats.GS;
      sumGA += qStats.GA;
      sumGK += qStats.GK;
      sumGD += qStats.GD;
    });
    totalGS += sumGS;
    totalGA += sumGA;
    totalGK += sumGK;
    totalGD += sumGD;
    rawQuarterAverages.push({
      quarter: `Q${qNum}`,
      GS: sumGS / numGames,
      GA: sumGA / numGames,
      GK: sumGK / numGames,
      GD: sumGD / numGames,
      attackTotal: (sumGS + sumGA) / numGames,
      defenseTotal: (sumGK + sumGD) / numGames
    });
  });

  // Calculate attack/defense averages per game (full precision)
  const avgAttack = (totalGS + totalGA) / numGames;
  const avgDefense = (totalGK + totalGD) / numGames;

  // Use shared adjustValuesToTotal for all breakdowns
  const attackQuarters = adjustValuesToTotal(rawQuarterAverages.map(q => q.attackTotal), Math.round(avgAttack * 10) / 10);
  const defenseQuarters = adjustValuesToTotal(rawQuarterAverages.map(q => q.defenseTotal), Math.round(avgDefense * 10) / 10);
  const gsQuarters = adjustValuesToTotal(rawQuarterAverages.map(q => q.GS), Math.round((totalGS / numGames) * 10) / 10);
  const gaQuarters = adjustValuesToTotal(rawQuarterAverages.map(q => q.GA), Math.round((totalGA / numGames) * 10) / 10);
  const gkQuarters = adjustValuesToTotal(rawQuarterAverages.map(q => q.GK), Math.round((totalGK / numGames) * 10) / 10);
  const gdQuarters = adjustValuesToTotal(rawQuarterAverages.map(q => q.GD), Math.round((totalGD / numGames) * 10) / 10);

  // Adjust GS+GA and GK+GD in summary cards to match the displayed total
  const [displayGS, displayGA] = adjustValuesToTotal([
    totalGS / numGames,
    totalGA / numGames
  ], Math.round(avgAttack * 10) / 10);
  const [displayGK, displayGD] = adjustValuesToTotal([
    totalGK / numGames,
    totalGD / numGames
  ], Math.round(avgDefense * 10) / 10);

  // Data quality indicator
  const dataQuality = { gamesWithStats: numGames };

  return (
    <div className={cn('px-4 py-6 border-2 border-gray-200 rounded-lg bg-white', className)}>
      <div className="mb-2 text-xs text-gray-500 font-medium">
        Analysis based on {dataQuality.gamesWithStats} number of games with position breakdowns.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attack Column */}
        <div className="space-y-4">
          {/* Attack Summary Card */}
          <div className="space-y-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Attack</span>
              <span className="text-2xl font-bold text-green-600">{(Math.round(avgAttack * 10) / 10).toFixed(1)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>GS: {displayGS.toFixed(1)}</span>
                <span>GA: {displayGA.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 flex">
                <div
                  className="bg-green-600 h-3 rounded-l-full"
                  style={{ width: avgAttack > 0 ? `${displayGS / avgAttack * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-green-400 h-3 rounded-r-full"
                  style={{ width: avgAttack > 0 ? `${displayGA / avgAttack * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Goals scored breakdown for all quarters.
            </div>
          </div>

          {/* Attack Quarters */}
          {rawQuarterAverages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {rawQuarterAverages.map((q, i) => {
                return (
                  <div key={`attack-${q.quarter}`} className="text-center p-2 rounded-lg border-2 bg-green-100 border-green-300 relative">
                    <div className="absolute -top-1 -left-1">
                      <div className="text-xs font-bold px-1 py-0.5 rounded-full bg-green-500 text-white text-[10px]">
                        {q.quarter}
                      </div>
                    </div>
                    <div className="space-y-1 mt-1">
                      <div className="text-base font-bold text-green-600">
                        {attackQuarters[i].toFixed(1)}
                      </div>
                      <div className="text-xs text-green-700">Scored</div>
                      <div className="text-[10px] space-y-0.5">
                        <div className="flex justify-between">
                          <span>GS: {gsQuarters[i].toFixed(1)}</span>
                          <span>GA: {gaQuarters[i].toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 flex">
                        <div 
                          className="h-1.5 rounded-l-full bg-green-600"
                          style={{ width: attackQuarters[i] > 0 ? `${(gsQuarters[i] / attackQuarters[i]) * 100}%` : '50%' }}
                        ></div>
                        <div 
                          className="h-1.5 rounded-r-full bg-green-400"
                          style={{ width: attackQuarters[i] > 0 ? `${(gaQuarters[i] / attackQuarters[i]) * 100}%` : '50%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Defense Column */}
        <div className="space-y-4">
          {/* Defense Summary Card */}
          <div className="space-y-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Defense</span>
              <span className="text-2xl font-bold text-red-600">{(Math.round(avgDefense * 10) / 10).toFixed(1)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>GK: {displayGK.toFixed(1)}</span>
                <span>GD: {displayGD.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 flex">
                <div
                  className="bg-red-600 h-3 rounded-l-full"
                  style={{ width: avgDefense > 0 ? `${displayGK / avgDefense * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-red-400 h-3 rounded-r-full"
                  style={{ width: avgDefense > 0 ? `${displayGD / avgDefense * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Goals conceded breakdown for all quarters.
            </div>
          </div>

          {/* Defense Quarters */}
          {rawQuarterAverages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {rawQuarterAverages.map((q, i) => {
                return (
                  <div key={`defense-${q.quarter}`} className="text-center p-2 rounded-lg border-2 bg-red-100 border-red-300 relative">
                    <div className="absolute -top-1 -left-1">
                      <div className="text-xs font-bold px-1 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                        {q.quarter}
                      </div>
                    </div>
                    <div className="space-y-1 mt-1">
                      <div className="text-base font-bold text-red-600">
                        {defenseQuarters[i].toFixed(1)}
                      </div>
                      <div className="text-xs text-red-700">Conceded</div>
                      <div className="text-[10px] space-y-0.5">
                        <div className="flex justify-between">
                          <span>GK: {gkQuarters[i].toFixed(1)}</span>
                          <span>GD: {gdQuarters[i].toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 flex">
                        <div 
                          className="h-1.5 rounded-l-full bg-red-600"
                          style={{ width: defenseQuarters[i] > 0 ? `${(gkQuarters[i] / defenseQuarters[i]) * 100}%` : '50%' }}
                        ></div>
                        <div 
                          className="h-1.5 rounded-r-full bg-red-400"
                          style={{ width: defenseQuarters[i] > 0 ? `${(gdQuarters[i] / defenseQuarters[i]) * 100}%` : '50%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 