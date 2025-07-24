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

  console.log('🔍 COMPACT ATTACK/DEFENSE WIDGET CALCULATIONS:');
  console.log('🔍 Season averages:', seasonAverages);
  console.log('🔍 Quarter averages (should match QuarterPerformanceAnalysis):');
  quarterAverages.forEach(({ quarter, avgTeamScore, avgOpponentScore, gamesWithData }) => {
    console.log(`🔍 Q${quarter}: ${avgTeamScore.toFixed(1)}-${avgOpponentScore.toFixed(1)} (${gamesWithData} games)`);
  });
  console.log('🔍 Quarter data (position breakdown):');
  quarterData.forEach(({ quarter, gsGoalsFor, gaGoalsFor, gkGoalsAgainst, gdGoalsAgainst }) => {
    console.log(`🔍 Q${quarter}: GS=${gsGoalsFor.toFixed(1)}, GA=${gaGoalsFor.toFixed(1)}, GK=${gkGoalsAgainst.toFixed(1)}, GD=${gdGoalsAgainst.toFixed(1)}`);
  });

  // Debug quarter-by-quarter comparison
  console.log('🔍 COMPACT ATTACK DEFENSE - QUARTER BREAKDOWN:');
  quarterData.forEach(({ quarter, gsGoalsFor, gaGoalsFor, gkGoalsAgainst, gdGoalsAgainst }) => {
    const attackTotal = gsGoalsFor + gaGoalsFor;
    const defenseTotal = gkGoalsAgainst + gdGoalsAgainst;
    console.log(`🔍 Q${quarter}: Attack=${attackTotal.toFixed(1)} (GS:${gsGoalsFor.toFixed(1)}, GA:${gaGoalsFor.toFixed(1)}) Defense=${defenseTotal.toFixed(1)} (GK:${gkGoalsAgainst.toFixed(1)}, GD:${gdGoalsAgainst.toFixed(1)})`);
  });

  // Use the calculated position averages
  const roundedGsAvg = Math.round(positionTotals.gsAvgGoalsFor * 10) / 10;
  const roundedGaAvg = Math.round(positionTotals.gaAvgGoalsFor * 10) / 10;
  const roundedGkAvg = Math.round(positionTotals.gkAvgGoalsAgainst * 10) / 10;
  const roundedGdAvg = Math.round(positionTotals.gdAvgGoalsAgainst * 10) / 10;

  // Use season averages for display (consistent across all widgets)
  const displayAttackTotal = seasonAverages.avgGoalsFor;  // Season average per game
  const displayDefenseTotal = seasonAverages.avgGoalsAgainst;  // Season average per game
  
  // Debug logging to verify calculations match Season Stats
  console.log('🔍 ATTACK/DEFENSE CALCULATION VERIFICATION:');
  console.log('📊 Should match Season Stats Widget:');
  console.log(`  Season averages: ${seasonAverages.avgGoalsFor.toFixed(1)} attack, ${seasonAverages.avgGoalsAgainst.toFixed(1)} defense`);
  console.log('📊 Position breakdown:');
  console.log(`  GS: ${roundedGsAvg.toFixed(1)}, GA: ${roundedGaAvg.toFixed(1)}, Total: ${(roundedGsAvg + roundedGaAvg).toFixed(1)}`);
  console.log(`  GK: ${roundedGkAvg.toFixed(1)}, GD: ${roundedGdAvg.toFixed(1)}, Total: ${(roundedGkAvg + roundedGdAvg).toFixed(1)}`);
  
  // Debug quarter-by-quarter position stats comparison
  console.log('📊 QUARTER-BY-QUARTER POSITION STATS COMPARISON:');
  if (batchStats) {
    [1, 2, 3, 4].forEach(quarter => {
      let qGsGoals = 0, qGaGoals = 0, qGkGoals = 0, qGdGoals = 0;
      let qGamesWithStats = 0;

      games.forEach(game => {
        if (game.status === 'completed' && game.statusAllowsStatistics === true) {
          const gameStats = batchStats[game.id] || [];
          const quarterTeamStats = gameStats.filter(stat => 
            stat.teamId === teamId && stat.quarter === quarter
          );
          
          if (quarterTeamStats.length > 0) {
            qGamesWithStats++;
            quarterTeamStats.forEach(stat => {
              if (stat.position === 'GS') qGsGoals += stat.goalsFor || 0;
              if (stat.position === 'GA') qGaGoals += stat.goalsFor || 0;
              if (stat.position === 'GK') qGkGoals += stat.goalsAgainst || 0;
              if (stat.position === 'GD') qGdGoals += stat.goalsAgainst || 0;
            });
          }
        }
      });

      const qAttackTotal = qGsGoals + qGaGoals;
      const qDefenseTotal = qGkGoals + qGdGoals;
      const qGsPercent = qAttackTotal > 0 ? (qGsGoals / qAttackTotal) * 100 : 50;
      const qGaPercent = qAttackTotal > 0 ? (qGaGoals / qAttackTotal) * 100 : 50;
      
      // Find corresponding quarter data from our calculation
      const ourQuarter = quarterData.find(q => q.quarter === quarter);
      
      console.log(`  Q${quarter} Position Stats: GS=${qGsGoals} GA=${qGaGoals} (${qGsPercent.toFixed(0)}/${qGaPercent.toFixed(0)}%) vs Our Calc: GS=${ourQuarter?.gsGoalsFor.toFixed(1)} GA=${ourQuarter?.gaGoalsFor.toFixed(1)}`);
    });
  }
  
  console.log('📊 Overall percentages used:');
  console.log(`  Attack: GS=${(positionTotals.gsAvgGoalsFor / positionTotals.attackingPositionsTotal * 100).toFixed(1)}% GA=${(positionTotals.gaAvgGoalsFor / positionTotals.attackingPositionsTotal * 100).toFixed(1)}%`);
  console.log(`  Defense: GK=${(positionTotals.gkAvgGoalsAgainst / positionTotals.defendingPositionsTotal * 100).toFixed(1)}% GD=${(positionTotals.gdAvgGoalsAgainst / positionTotals.defendingPositionsTotal * 100).toFixed(1)}%`);

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