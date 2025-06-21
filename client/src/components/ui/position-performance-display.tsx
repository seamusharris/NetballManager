
import React from 'react';
import { PositionAverages } from '@/lib/positionStatsCalculator';

interface PositionPerformanceDisplayProps {
  averages: PositionAverages;
  label?: string;
  className?: string;
}

export default function PositionPerformanceDisplay({
  averages,
  label = "Position Performance",
  className = ""
}: PositionPerformanceDisplayProps) {
  const { 
    gsAvgGoalsFor, 
    gaAvgGoalsFor, 
    gdAvgGoalsAgainst, 
    gkAvgGoalsAgainst, 
    attackingPositionsTotal, 
    defendingPositionsTotal, 
    gamesWithPositionStats 
  } = averages;

  if (gamesWithPositionStats === 0) {
    return (
      <div className={className}>
        <h4 className="font-semibold mb-3">{label}</h4>
        <div className="text-xs text-gray-500">
          No position statistics available
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h4 className="font-semibold mb-3">{label}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attack */}
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
            Based on {gamesWithPositionStats} games with position statistics recorded.
          </div>
        </div>

        {/* Defence */}
        <div className="space-y-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Defence</span>
            <span className="text-2xl font-bold text-red-600">{defendingPositionsTotal.toFixed(1)}</span>
          </div>
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
            Based on {gamesWithPositionStats} games with position statistics recorded.
          </div>
        </div>
      </div>
    </div>
  );
}
