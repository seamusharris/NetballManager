
import React from 'react';
import { PositionAverages } from '@/lib/positionStatsCalculator';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface AttackDefenseDisplayProps {
  averages: PositionAverages;
  label?: string;
  className?: string;
  showQuarterBreakdown?: boolean;
  quarterData?: Array<{
    quarter: number;
    gsGoalsFor: number;
    gaGoalsFor: number;
    gdGoalsAgainst: number;
    gkGoalsAgainst: number;
  }>;
}

const AttackDefenseDisplay: React.FC<AttackDefenseDisplayProps> = ({
  averages,
  label = "Attack vs Defense Performance",
  className,
  showQuarterBreakdown = false,
  quarterData = []
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
      <h4 className="font-semibold mb-3">{label}</h4>
      
      {/* Main Attack vs Defense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attack */}
        <div className="space-y-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Attack</span>
            <span className="text-2xl font-bold text-green-600">{attackingPositionsTotal.toFixed(1)}</span>
          </div>
          {gamesWithPositionStats > 0 ? (
            <>
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
            </>
          ) : (
            <div className="text-xs text-gray-500">
              No position statistics available
            </div>
          )}
        </div>

        {/* Defense */}
        <div className="space-y-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Defense</span>
            <span className="text-2xl font-bold text-red-600">{defendingPositionsTotal.toFixed(1)}</span>
          </div>
          {gamesWithPositionStats > 0 ? (
            <>
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
            </>
          ) : (
            <div className="text-xs text-gray-500">
              No position statistics available
            </div>
          )}
        </div>
      </div>

      {/* Quarter-by-Quarter Breakdown - Separate Attack and Defense Rows */}
      {showQuarterBreakdown && quarterData.length > 0 && (
        <div className="mt-6">
          
          {/* Attack Row */}
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quarterData.map((quarter) => {
                const attackTotal = quarter.gsGoalsFor + quarter.gaGoalsFor;
                
                return (
                  <div key={`attack-${quarter.quarter}`} className="text-center p-3 rounded-lg border-2 bg-green-100 border-green-300 transition-colors relative">
                    {/* Quarter badge in top-left corner */}
                    <div className="absolute -top-2 -left-2">
                      <Badge className="text-xs font-bold px-2 py-1 rounded-full shadow-sm border bg-green-500 text-white border-green-600">
                        Q{quarter.quarter}
                      </Badge>
                    </div>

                    <div className="space-y-2 mt-1">
                      {/* Attack Total */}
                      <div className="text-lg font-bold text-green-600">
                        {attackTotal.toFixed(1)}
                      </div>
                      <div className="text-xs text-green-700 font-medium">Total Goals</div>

                      {/* Attack Breakdown */}
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>GS: {quarter.gsGoalsFor.toFixed(1)}</span>
                          <span>GA: {quarter.gaGoalsFor.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Performance Bar - GS vs GA proportion */}
                      <div 
                        className="w-full bg-gray-200 rounded-full h-2 mt-3 flex" 
                        title="GS vs GA proportion"
                      >
                        <div 
                          className="h-2 rounded-l-full bg-green-600"
                          style={{ 
                            width: attackTotal > 0 ? `${(quarter.gsGoalsFor / attackTotal) * 100}%` : '50%'
                          }}
                        ></div>
                        <div 
                          className="h-2 rounded-r-full bg-green-400"
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
          </div>

          {/* Defense Row */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quarterData.map((quarter) => {
                const defenseTotal = quarter.gdGoalsAgainst + quarter.gkGoalsAgainst;
                
                return (
                  <div key={`defense-${quarter.quarter}`} className="text-center p-3 rounded-lg border-2 bg-red-100 border-red-300 transition-colors relative">
                    {/* Quarter badge in top-left corner */}
                    <div className="absolute -top-2 -left-2">
                      <Badge className="text-xs font-bold px-2 py-1 rounded-full shadow-sm border bg-red-500 text-white border-red-600">
                        Q{quarter.quarter}
                      </Badge>
                    </div>

                    <div className="space-y-2 mt-1">
                      {/* Defense Total */}
                      <div className="text-lg font-bold text-red-600">
                        {defenseTotal.toFixed(1)}
                      </div>
                      <div className="text-xs text-red-700 font-medium">Goals Conceded</div>

                      {/* Defense Breakdown */}
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>GK: {quarter.gkGoalsAgainst.toFixed(1)}</span>
                          <span>GD: {quarter.gdGoalsAgainst.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Performance Bar - GD vs GK proportion */}
                      <div 
                        className="w-full bg-gray-200 rounded-full h-2 mt-3 flex" 
                        title="GD vs GK proportion"
                      >
                        <div 
                          className="h-2 rounded-l-full bg-red-600"
                          style={{ 
                            width: defenseTotal > 0 ? `${(quarter.gkGoalsAgainst / defenseTotal) * 100}%` : '50%'
                          }}
                        ></div>
                        <div 
                          className="h-2 rounded-r-full bg-red-400"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AttackDefenseDisplay;
