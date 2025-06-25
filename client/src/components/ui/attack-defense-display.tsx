
import React from 'react';
import { PositionAverages } from '@/lib/positionStatsCalculator';
import { cn } from '@/lib/utils';

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

export const AttackDefenseDisplay: React.FC<AttackDefenseDisplayProps> = ({
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
                Based on {gamesWithPositionStats} games with position statistics recorded.
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
                  <span>GD: {gdAvgGoalsAgainst.toFixed(1)}</span>
                  <span>GK: {gkAvgGoalsAgainst.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 flex">
                  <div
                    className="bg-red-600 h-3 rounded-l-full"
                    style={{ width: defendingPositionsTotal > 0 ? `${(gdAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                  ></div>
                  <div
                    className="bg-red-400 h-3 rounded-r-full"
                    style={{ width: defendingPositionsTotal > 0 ? `${(gkAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Goals conceded across {gamesWithPositionStats} games.
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-500">
              No position statistics available
            </div>
          )}
        </div>
      </div>

      {/* Quarter-by-Quarter Breakdown */}
      {showQuarterBreakdown && quarterData.length > 0 && (
        <div className="mt-6">
          <h5 className="font-medium mb-3 text-gray-700">Quarter-by-Quarter Breakdown</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quarterData.map((quarter) => (
              <div key={quarter.quarter} className="border rounded-lg p-3 bg-white">
                <h6 className="font-medium text-center mb-2">Q{quarter.quarter}</h6>
                
                {/* Attack Section */}
                <div className="mb-2">
                  <div className="text-xs text-green-700 font-medium mb-1">Attack</div>
                  <div className="flex justify-between text-xs">
                    <span>GS: {quarter.gsGoalsFor}</span>
                    <span>GA: {quarter.gaGoalsFor}</span>
                  </div>
                  <div className="text-xs text-green-600 font-semibold">
                    Total: {quarter.gsGoalsFor + quarter.gaGoalsFor}
                  </div>
                </div>

                {/* Defense Section */}
                <div>
                  <div className="text-xs text-red-700 font-medium mb-1">Defense</div>
                  <div className="flex justify-between text-xs">
                    <span>GD: {quarter.gdGoalsAgainst}</span>
                    <span>GK: {quarter.gkGoalsAgainst}</span>
                  </div>
                  <div className="text-xs text-red-600 font-semibold">
                    Total: {quarter.gdGoalsAgainst + quarter.gkGoalsAgainst}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
