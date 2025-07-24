import React from 'react';
import { processUnifiedGameData, calculateQuarterAverages } from '@/lib/positionStatsCalculator';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { calculateConsistentQuarterPerformance } from '../../lib/positionStatsCalculator';

interface CompactAttackDefenseWidgetProps {
  games: any[];
  batchScores: Record<number, any[]>;
  batchStats: Record<number, any[]>;
  teamId: number;
  className?: string;
}

export function CompactAttackDefenseWidget({ 
  games, 
  batchScores, 
  batchStats, 
  teamId, 
  className = "" 
}: CompactAttackDefenseWidgetProps) {
  // Use utility function for consistent calculations across all widgets
  const { seasonAverages, quarterAverages, quarterData, positionTotals } = calculateConsistentQuarterPerformance(
    games,
    batchScores,
    batchStats,
    teamId
  );

  // Debug logging removed for cleaner output


  // Use the calculated position averages
  const roundedGsAvg = Math.round(positionTotals.gsAvgGoalsFor * 10) / 10;
  const roundedGaAvg = Math.round(positionTotals.gaAvgGoalsFor * 10) / 10;
  const roundedGkAvg = Math.round(positionTotals.gkAvgGoalsAgainst * 10) / 10;
  const roundedGdAvg = Math.round(positionTotals.gdAvgGoalsAgainst * 10) / 10;

  // Use season averages for display (consistent across all widgets)
  const displayAttackTotal = seasonAverages.avgGoalsFor;  // Season average per game
  const displayDefenseTotal = seasonAverages.avgGoalsAgainst;  // Season average per game
  
  // Debug logging removed for cleaner output

  return (
    <div className={cn("px-4 py-6 border-2 border-gray-200 rounded-lg bg-white", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attack Column */}
        <div className="space-y-4">
          {/* Attack Summary Card */}
          <div className="space-y-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Attack</span>
              <span className="text-2xl font-bold text-green-600">{displayAttackTotal.toFixed(1)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>GS: {roundedGsAvg.toFixed(1)}</span>
                <span>GA: {roundedGaAvg.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 flex">
                <div
                  className="bg-green-600 h-3 rounded-l-full"
                  style={{ width: positionTotals.attackingPositionsTotal > 0 ? `${(positionTotals.gsAvgGoalsFor / positionTotals.attackingPositionsTotal) * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-green-400 h-3 rounded-r-full"
                  style={{ width: positionTotals.attackingPositionsTotal > 0 ? `${(positionTotals.gaAvgGoalsFor / positionTotals.attackingPositionsTotal) * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Goals scored based on {seasonAverages.gamesWithStats} games with official scores recorded.
            </div>
          </div>

          {/* Attack Quarters */}
          {quarterData.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {quarterData.map((quarterPositionData) => {
                const gsGoalsFor = quarterPositionData.gsGoalsFor;
                const gaGoalsFor = quarterPositionData.gaGoalsFor;
                const attackTotal = gsGoalsFor + gaGoalsFor;
                

                
                return (
                  <div key={`attack-${quarterPositionData.quarter}`} className="text-center p-2 rounded-lg border-2 bg-green-100 border-green-300 relative">
                    <div className="absolute -top-1 -left-1">
                      <div className="text-xs font-bold px-1 py-0.5 rounded-full bg-green-500 text-white text-[10px]">
                        Q{quarterPositionData.quarter}
                      </div>
                    </div>
                    <div className="space-y-1 mt-1">
                      <div className="text-base font-bold text-green-600">
                        {attackTotal.toFixed(1)}
                      </div>
                      <div className="text-xs text-green-700">Scored</div>
                      <div className="text-[10px] space-y-0.5">
                        <div className="flex justify-between">
                          <span>GS: {gsGoalsFor.toFixed(1)}</span>
                          <span>GA: {gaGoalsFor.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 flex">
                        <div 
                          className="h-1.5 rounded-l-full bg-green-600"
                          style={{ 
                            width: attackTotal > 0 ? `${(gsGoalsFor / attackTotal) * 100}%` : '50%'
                          }}
                        ></div>
                        <div 
                          className="h-1.5 rounded-r-full bg-green-400"
                          style={{ 
                            width: attackTotal > 0 ? `${(gaGoalsFor / attackTotal) * 100}%` : '50%'
                          }}
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
              <span className="text-2xl font-bold text-red-600">{displayDefenseTotal.toFixed(1)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>GK: {roundedGkAvg.toFixed(1)}</span>
                <span>GD: {roundedGdAvg.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 flex">
                <div
                  className="bg-red-600 h-3 rounded-l-full"
                  style={{ width: positionTotals.defendingPositionsTotal > 0 ? `${(positionTotals.gkAvgGoalsAgainst / positionTotals.defendingPositionsTotal) * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-red-400 h-3 rounded-r-full"
                  style={{ width: positionTotals.defendingPositionsTotal > 0 ? `${(positionTotals.gdAvgGoalsAgainst / positionTotals.defendingPositionsTotal) * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Goals conceded based on {seasonAverages.gamesWithStats} games with official scores recorded.
            </div>
          </div>

          {/* Defense Quarters */}
          {quarterData.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {quarterData.map((quarterPositionData) => {
                const gkGoalsAgainst = quarterPositionData.gkGoalsAgainst;
                const gdGoalsAgainst = quarterPositionData.gdGoalsAgainst;
                const defenseTotal = gkGoalsAgainst + gdGoalsAgainst;
                

                
                return (
                  <div key={`defense-${quarterPositionData.quarter}`} className="text-center p-2 rounded-lg border-2 bg-red-100 border-red-300 relative">
                    <div className="absolute -top-1 -left-1">
                      <div className="text-xs font-bold px-1 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                        Q{quarterPositionData.quarter}
                      </div>
                    </div>
                    <div className="space-y-1 mt-1">
                      <div className="text-base font-bold text-red-600">
                        {defenseTotal.toFixed(1)}
                      </div>
                      <div className="text-xs text-red-700">Conceded</div>
                      <div className="text-[10px] space-y-0.5">
                        <div className="flex justify-between">
                          <span>GK: {gkGoalsAgainst.toFixed(1)}</span>
                          <span>GD: {gdGoalsAgainst.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 flex">
                        <div 
                          className="h-1.5 rounded-l-full bg-red-600"
                          style={{ 
                            width: defenseTotal > 0 ? `${(gkGoalsAgainst / defenseTotal) * 100}%` : '50%'
                          }}
                        ></div>
                        <div 
                          className="h-1.5 rounded-r-full bg-red-400"
                          style={{ 
                            width: defenseTotal > 0 ? `${(gdGoalsAgainst / defenseTotal) * 100}%` : '50%'
                          }}
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
}; 