import React from 'react';
import { PositionAverages } from '@/lib/positionStatsCalculator';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface CompactAttackDefenseWidgetProps {
  averages: PositionAverages;
  quarterData: Array<{
    quarter: number;
    gsGoalsFor: number;
    gaGoalsFor: number;
    gdGoalsAgainst: number;
    gkGoalsAgainst: number;
  }>;
  className?: string;
  showQuarterBreakdown?: boolean;
}

const CompactAttackDefenseWidget: React.FC<CompactAttackDefenseWidgetProps> = ({
  averages,
  quarterData,
  className,
  showQuarterBreakdown = true
}) => {
  const {
    gsAvgGoalsFor,
    gaAvgGoalsFor,
    gdAvgGoalsAgainst,
    gkAvgGoalsAgainst,
    attackingPositionsTotal,
    defendingPositionsTotal,
    gamesWithPositionStats
  } = averages;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Attack vs Defense Cards with Quarters Below */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attack Column */}
        <div className="space-y-4">
          {/* Attack Summary Card */}
          <div className="space-y-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Attack</span>
              <span className="text-2xl font-bold text-green-600">{attackingPositionsTotal.toFixed(1)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>GS: {gsAvgGoalsFor.toFixed(1)}</span>
                <span>GA: {gaAvgGoalsFor.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 flex">
                <div
                  className="bg-green-600 h-3 rounded-l-full"
                  style={{ width: attackingPositionsTotal > 0 ? `${(gsAvgGoalsFor / attackingPositionsTotal) * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-green-400 h-3 rounded-r-full"
                  style={{ width: attackingPositionsTotal > 0 ? `${(gaAvgGoalsFor / attackingPositionsTotal) * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Goals scored based on {gamesWithPositionStats} games with position statistics recorded.
            </div>
          </div>

          {/* Attack Quarters */}
          {showQuarterBreakdown && quarterData.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {quarterData.map((quarter) => {
                const attackTotal = quarter.gsGoalsFor + quarter.gaGoalsFor;
                
                return (
                  <div key={`attack-${quarter.quarter}`} className="text-center p-2 rounded-lg border-2 bg-green-100 border-green-300 relative">
                    <div className="absolute -top-1 -left-1">
                      <div className="text-xs font-bold px-1 py-0.5 rounded-full bg-green-500 text-white text-[10px]">
                        Q{quarter.quarter}
                      </div>
                    </div>
                    <div className="space-y-1 mt-1">
                      <div className="text-base font-bold text-green-600">
                        {attackTotal.toFixed(1)}
                      </div>
                      <div className="text-xs text-green-700">Scored</div>
                      <div className="text-[10px] space-y-0.5">
                        <div className="flex justify-between">
                          <span>GS: {quarter.gsGoalsFor.toFixed(1)}</span>
                          <span>GA: {quarter.gaGoalsFor.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 flex">
                        <div 
                          className="h-1.5 rounded-l-full bg-green-600"
                          style={{ 
                            width: attackTotal > 0 ? `${(quarter.gsGoalsFor / attackTotal) * 100}%` : '50%'
                          }}
                        ></div>
                        <div 
                          className="h-1.5 rounded-r-full bg-green-400"
                          style={{ 
                            width: attackTotal > 0 ? `${(quarter.gaGoalsFor / attackTotal) * 100}%` : '50%'
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
              <span className="text-2xl font-bold text-red-600">{defendingPositionsTotal.toFixed(1)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>GK: {gkAvgGoalsAgainst.toFixed(1)}</span>
                <span>GD: {gdAvgGoalsAgainst.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 flex">
                <div
                  className="bg-red-600 h-3 rounded-l-full"
                  style={{ width: defendingPositionsTotal > 0 ? `${(gkAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-red-400 h-3 rounded-r-full"
                  style={{ width: defendingPositionsTotal > 0 ? `${(gdAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Goals conceded based on {gamesWithPositionStats} games with position statistics recorded.
            </div>
          </div>

          {/* Defense Quarters */}
          {showQuarterBreakdown && quarterData.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {quarterData.map((quarter) => {
                const defenseTotal = quarter.gdGoalsAgainst + quarter.gkGoalsAgainst;
                
                return (
                  <div key={`defense-${quarter.quarter}`} className="text-center p-2 rounded-lg border-2 bg-red-100 border-red-300 relative">
                    <div className="absolute -top-1 -left-1">
                      <div className="text-xs font-bold px-1 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                        Q{quarter.quarter}
                      </div>
                    </div>
                    <div className="space-y-1 mt-1">
                      <div className="text-base font-bold text-red-600">
                        {defenseTotal.toFixed(1)}
                      </div>
                      <div className="text-xs text-red-700">Conceded</div>
                      <div className="text-[10px] space-y-0.5">
                        <div className="flex justify-between">
                          <span>GK: {quarter.gkGoalsAgainst.toFixed(1)}</span>
                          <span>GD: {quarter.gdGoalsAgainst.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 flex">
                        <div 
                          className="h-1.5 rounded-l-full bg-red-600"
                          style={{ 
                            width: defenseTotal > 0 ? `${(quarter.gkGoalsAgainst / defenseTotal) * 100}%` : '50%'
                          }}
                        ></div>
                        <div 
                          className="h-1.5 rounded-r-full bg-red-400"
                          style={{ 
                            width: defenseTotal > 0 ? `${(quarter.gdGoalsAgainst / defenseTotal) * 100}%` : '50%'
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

export default CompactAttackDefenseWidget; 