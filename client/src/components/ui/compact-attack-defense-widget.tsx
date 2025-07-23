import React from 'react';
import { processUnifiedGameData, calculateQuarterAverages } from '@/lib/positionStatsCalculator';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  // Use the same simple calculation method as Season Stats Widget
  let totalGoalsFor = 0;
  let totalGoalsAgainst = 0;
  let gamesWithStats = 0;

  games.forEach(game => {
    // Only count games with statistics enabled (same as Season Stats Widget)
    if (game.status === 'completed' && game.statusAllowsStatistics === true) {
      const gameScores = batchScores?.[game.id] || [];
      
      if (gameScores.length > 0) {
        gamesWithStats++;
        
        // Calculate total goals for this game
        let gameGoalsFor = 0;
        let gameGoalsAgainst = 0;
        
        gameScores.forEach(score => {
          if (score.teamId === teamId) {
            gameGoalsFor += score.score;
          } else {
            gameGoalsAgainst += score.score;
          }
        });
        
        totalGoalsFor += gameGoalsFor;
        totalGoalsAgainst += gameGoalsAgainst;
      }
    }
  });

  const avgGoalsFor = gamesWithStats > 0 ? totalGoalsFor / gamesWithStats : 0;
  const avgGoalsAgainst = gamesWithStats > 0 ? totalGoalsAgainst / gamesWithStats : 0;
  
  // Use shared utility to get quarter averages (same as Quarter Performance Analysis)
  const quarterAverages = calculateQuarterAverages(games, batchScores, teamId, true);
  
  // DEBUG: Compare calculation methods
  console.log('🔍 CALCULATION METHOD COMPARISON:');
  console.log('📊 Season Stats Method (sum all quarters, divide by games):');
  console.log(`  Total goals for: ${totalGoalsFor}, Games: ${gamesWithStats}, Avg: ${avgGoalsFor.toFixed(1)}`);
  console.log(`  Total goals against: ${totalGoalsAgainst}, Games: ${gamesWithStats}, Avg: ${avgGoalsAgainst.toFixed(1)}`);
  
  console.log('📊 Quarter Averages Method (each quarter separately):');
  quarterAverages.forEach(q => {
    console.log(`  Q${q.quarter}: Team ${q.avgTeamScore.toFixed(1)}, Opponent ${q.avgOpponentScore.toFixed(1)}, Games: ${q.gamesWithData}`);
  });
  
  const quarterSum = quarterAverages.reduce((sum, q) => sum + q.avgTeamScore, 0);
  const quarterOpponentSum = quarterAverages.reduce((sum, q) => sum + q.avgOpponentScore, 0);
  console.log(`📊 Quarter method totals: Attack ${quarterSum.toFixed(1)}, Defense ${quarterOpponentSum.toFixed(1)}`);
  console.log(`📊 Expected if same: Attack ${(avgGoalsFor * 4).toFixed(1)}, Defense ${(avgGoalsAgainst * 4).toFixed(1)}`);
  
  // Calculate position percentages from all available position stats
  let totalGsGoals = 0;
  let totalGaGoals = 0;
  let totalGkGoals = 0;
  let totalGdGoals = 0;
  let gamesWithPositionStats = 0;

  if (batchStats) {
    games.forEach(game => {
      if (game.status === 'completed' && game.statusAllowsStatistics === true) {
        const gameStats = batchStats[game.id] || [];
        const teamStats = gameStats.filter(stat => stat.teamId === teamId);
        
        if (teamStats.length > 0) {
          gamesWithPositionStats++;
          
          teamStats.forEach(stat => {
            if (stat.position === 'GS') totalGsGoals += stat.goalsFor || 0;
            if (stat.position === 'GA') totalGaGoals += stat.goalsFor || 0;
            if (stat.position === 'GK') totalGkGoals += stat.goalsAgainst || 0;
            if (stat.position === 'GD') totalGdGoals += stat.goalsAgainst || 0;
          });
        }
      }
    });
  }

  // Calculate position percentages (default to 50/50 if no position stats)
  const totalAttackGoals = totalGsGoals + totalGaGoals;
  const totalDefenseGoals = totalGkGoals + totalGdGoals;
  
  const gsPercentage = totalAttackGoals > 0 ? totalGsGoals / totalAttackGoals : 0.5;
  const gaPercentage = totalAttackGoals > 0 ? totalGaGoals / totalAttackGoals : 0.5;
  const gkPercentage = totalDefenseGoals > 0 ? totalGkGoals / totalDefenseGoals : 0.5;
  const gdPercentage = totalDefenseGoals > 0 ? totalGdGoals / totalDefenseGoals : 0.5;

  console.log('🔍 Position percentages:', {
    gsPercentage: (gsPercentage * 100).toFixed(1) + '%',
    gaPercentage: (gaPercentage * 100).toFixed(1) + '%',
    gkPercentage: (gkPercentage * 100).toFixed(1) + '%',
    gdPercentage: (gdPercentage * 100).toFixed(1) + '%',
    gamesWithPositionStats
  });

  // Calculate proportional distribution of season totals across quarters
  // This ensures quarter breakdown adds up to season totals for UI consistency
  const totalQuarterScores = quarterAverages.reduce((sum, q) => sum + q.avgTeamScore, 0);
  const totalQuarterDefense = quarterAverages.reduce((sum, q) => sum + q.avgOpponentScore, 0);
  
  console.log('🔍 PROPORTIONAL DISTRIBUTION:');
  console.log(`📊 Quarter sum: ${totalQuarterScores.toFixed(1)}, Season total: ${avgGoalsFor.toFixed(1)}`);
  console.log(`📊 Defense sum: ${totalQuarterDefense.toFixed(1)}, Season total: ${avgGoalsAgainst.toFixed(1)}`);
  
  const quarterData = quarterAverages.map(({ quarter, avgTeamScore, avgOpponentScore, gamesWithData }) => {
    // Calculate this quarter's proportional share of the season total
    const proportionalAttack = totalQuarterScores > 0 ? (avgTeamScore / totalQuarterScores) * avgGoalsFor : avgGoalsFor / 4;
    const proportionalDefense = totalQuarterDefense > 0 ? (avgOpponentScore / totalQuarterDefense) * avgGoalsAgainst : avgGoalsAgainst / 4;
    // Calculate quarter-specific position percentages
    let qGsGoals = 0, qGaGoals = 0, qGkGoals = 0, qGdGoals = 0;

    if (batchStats) {
      games.forEach(game => {
        if (game.status === 'completed' && game.statusAllowsStatistics === true) {
          const gameStats = batchStats[game.id] || [];
          const quarterTeamStats = gameStats.filter(stat => 
            stat.teamId === teamId && stat.quarter === quarter
          );
          
          quarterTeamStats.forEach(stat => {
            if (stat.position === 'GS') qGsGoals += stat.goalsFor || 0;
            if (stat.position === 'GA') qGaGoals += stat.goalsFor || 0;
            if (stat.position === 'GK') qGkGoals += stat.goalsAgainst || 0;
            if (stat.position === 'GD') qGdGoals += stat.goalsAgainst || 0;
          });
        }
      });
    }

    // Calculate quarter-specific percentages (default to 50/50 if no data)
    const qAttackTotal = qGsGoals + qGaGoals;
    const qDefenseTotal = qGkGoals + qGdGoals;
    
    const qGsPercentage = qAttackTotal > 0 ? qGsGoals / qAttackTotal : 0.5;
    const qGaPercentage = qAttackTotal > 0 ? qGaGoals / qAttackTotal : 0.5;
    const qGkPercentage = qDefenseTotal > 0 ? qGkGoals / qDefenseTotal : 0.5;
    const qGdPercentage = qDefenseTotal > 0 ? qGdGoals / qDefenseTotal : 0.5;

    // Apply quarter-specific percentages to ORIGINAL quarter scores
    // This ensures quarter totals match between top and bottom rows
    const gsGoalsFor = avgTeamScore * qGsPercentage;
    const gaGoalsFor = avgTeamScore * qGaPercentage;
    const gkGoalsAgainst = avgOpponentScore * qGkPercentage;
    const gdGoalsAgainst = avgOpponentScore * qGdPercentage;
    
    console.log(`🔍 Q${quarter} MISMATCH CHECK:`);
    console.log(`  Original quarter: ${avgTeamScore.toFixed(1)}-${avgOpponentScore.toFixed(1)}`);
    console.log(`  Proportional: ${proportionalAttack.toFixed(1)}-${proportionalDefense.toFixed(1)}`);
    console.log(`  Final display: ${(gsGoalsFor + gaGoalsFor).toFixed(1)}-${(gkGoalsAgainst + gdGoalsAgainst).toFixed(1)}`);

    return {
      quarter,
      gsGoalsFor: Math.round(gsGoalsFor * 10) / 10,
      gaGoalsFor: Math.round(gaGoalsFor * 10) / 10,
      gkGoalsAgainst: Math.round(gkGoalsAgainst * 10) / 10,
      gdGoalsAgainst: Math.round(gdGoalsAgainst * 10) / 10,
      gamesWithQuarterData: gamesWithData
    };
  });

  // Calculate position averages by summing the quarter-specific calculations
  const totalGsFromQuarters = quarterData.reduce((sum, q) => sum + q.gsGoalsFor, 0);
  const totalGaFromQuarters = quarterData.reduce((sum, q) => sum + q.gaGoalsFor, 0);
  const totalGkFromQuarters = quarterData.reduce((sum, q) => sum + q.gkGoalsAgainst, 0);
  const totalGdFromQuarters = quarterData.reduce((sum, q) => sum + q.gdGoalsAgainst, 0);
  
  const gsAvgGoalsFor = totalGsFromQuarters;
  const gaAvgGoalsFor = totalGaFromQuarters;
  const gkAvgGoalsAgainst = totalGkFromQuarters;
  const gdAvgGoalsAgainst = totalGdFromQuarters;
  
  const attackingPositionsTotal = gsAvgGoalsFor + gaAvgGoalsFor;
  const defendingPositionsTotal = gkAvgGoalsAgainst + gdAvgGoalsAgainst;
  
  console.log('🔍 QUARTER-DERIVED TOTALS (NEW CALCULATION):');
  console.log(`📊 GS: ${gsAvgGoalsFor.toFixed(1)}, GA: ${gaAvgGoalsFor.toFixed(1)}, Total: ${attackingPositionsTotal.toFixed(1)}`);
  console.log(`📊 GK: ${gkAvgGoalsAgainst.toFixed(1)}, GD: ${gdAvgGoalsAgainst.toFixed(1)}, Total: ${defendingPositionsTotal.toFixed(1)}`);
  console.log('📊 Quarter breakdown sums:', quarterData.map(q => `Q${q.quarter}: ${(q.gsGoalsFor + q.gaGoalsFor).toFixed(1)}`));

  // Use quarter-derived totals for visual consistency with quarter breakdown
  const quarterAttackSum = quarterAverages.reduce((sum, q) => sum + q.avgTeamScore, 0);
  const quarterDefenseSum = quarterAverages.reduce((sum, q) => sum + q.avgOpponentScore, 0);
  const displayAttackTotal = quarterAttackSum;  // 30.1 - matches quarter breakdown
  const displayDefenseTotal = quarterDefenseSum;  // 19.4 - matches quarter breakdown
  
  // Use the calculated position averages
  const roundedGsAvg = Math.round(gsAvgGoalsFor * 10) / 10;
  const roundedGaAvg = Math.round(gaAvgGoalsFor * 10) / 10;
  const roundedGkAvg = Math.round(gkAvgGoalsAgainst * 10) / 10;
  const roundedGdAvg = Math.round(gdAvgGoalsAgainst * 10) / 10;

  // Debug logging to verify calculations match Season Stats
  console.log('🔍 ATTACK/DEFENSE CALCULATION VERIFICATION:');
  console.log('📊 Should match Season Stats Widget:');
  console.log(`  Total goals for: ${totalGoalsFor}, Avg: ${avgGoalsFor.toFixed(1)}`);
  console.log(`  Total goals against: ${totalGoalsAgainst}, Avg: ${avgGoalsAgainst.toFixed(1)}`);
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
  console.log(`  Attack: GS=${(gsPercentage * 100).toFixed(1)}% GA=${(gaPercentage * 100).toFixed(1)}%`);
  console.log(`  Defense: GK=${(gkPercentage * 100).toFixed(1)}% GD=${(gdPercentage * 100).toFixed(1)}%`);

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
                  style={{ width: attackingPositionsTotal > 0 ? `${(gsAvgGoalsFor / attackingPositionsTotal) * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-green-400 h-3 rounded-r-full"
                  style={{ width: attackingPositionsTotal > 0 ? `${(gaAvgGoalsFor / attackingPositionsTotal) * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Goals scored based on {gamesWithStats} games with official scores recorded.
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
                  style={{ width: defendingPositionsTotal > 0 ? `${(gkAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                ></div>
                <div
                  className="bg-red-400 h-3 rounded-r-full"
                  style={{ width: defendingPositionsTotal > 0 ? `${(gdAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Goals conceded based on {gamesWithStats} games with official scores recorded.
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