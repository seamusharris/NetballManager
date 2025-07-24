import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateConsistentQuarterPerformance } from '@/lib/positionStatsCalculator';
import { cn } from '@/lib/utils';

interface SeasonStatsWidgetProps {
  games: any[];
  currentTeamId: number;
  batchScores?: Record<number, any[]>;
  batchStats?: Record<number, any[]>;
  className?: string;
  activeSeason?: any;
  selectedSeason?: any;
}

export function SeasonStatsWidget({ 
  games, 
  currentTeamId,
  batchScores = {},
  batchStats,
  className,
  activeSeason, 
  selectedSeason
}: SeasonStatsWidgetProps) {
  // Use utility function for consistent calculations with actual data
  const { seasonAverages, quarterAverages, quarterData, positionTotals } = calculateConsistentQuarterPerformance(
    games,
    batchScores,
    batchStats,
    currentTeamId
  );

  // Calculate season totals from averages
  const totalGames = seasonAverages.gamesWithStats;
  const totalGoalsFor = Math.round(seasonAverages.avgGoalsFor * totalGames);
  const totalGoalsAgainst = Math.round(seasonAverages.avgGoalsAgainst * totalGames);
  const goalDifference = totalGoalsFor - totalGoalsAgainst;

  // Calculate win/loss/draw from games
  let wins = 0, losses = 0, draws = 0;
  games.forEach(game => {
    if (game.status === 'completed' && game.statusAllowsStatistics === true) {
      const homeScore = game.home_score || 0;
      const awayScore = game.away_score || 0;
      
      if (game.home_team_id === currentTeamId) {
        if (homeScore > awayScore) wins++;
        else if (homeScore < awayScore) losses++;
        else draws++;
      } else {
        if (awayScore > homeScore) wins++;
        else if (awayScore < homeScore) losses++;
        else draws++;
      }
    }
  });

  const totalGamesPlayed = wins + losses + draws;
  const winPercentage = totalGamesPlayed > 0 ? (wins / totalGamesPlayed) * 100 : 0;

  console.log('🔍 SEASON STATS WIDGET - CONSISTENT CALCULATIONS:');
  console.log(`📊 Season averages: ${seasonAverages.avgGoalsFor.toFixed(1)} attack, ${seasonAverages.avgGoalsAgainst.toFixed(1)} defense`);
  console.log(`📊 Games with stats: ${totalGames}`);
  console.log(`📊 Win/Loss/Draw: ${wins}/${losses}/${draws} (${winPercentage.toFixed(1)}% win rate)`);
  console.log(`📊 Total goals: ${totalGoalsFor} for, ${totalGoalsAgainst} against (${goalDifference > 0 ? '+' : ''}${goalDifference})`);

  return (
    <div className={cn("px-4 py-6 border-2 border-gray-200 rounded-lg bg-white", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Season Statistics (Debug)
        </div>

        {/* Official Scores Method */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 mb-3">From Official Scores (Quarter by Quarter)</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total goals for:</span>
                <span className="font-semibold text-green-600">{totalGoalsFor}</span>
              </div>
              <div className="flex justify-between">
                <span>Total goals against:</span>
                <span className="font-semibold text-red-600">{totalGoalsAgainst}</span>
              </div>
              <div className="flex justify-between">
                <span>Games with stats:</span>
                <span className="font-semibold">{totalGames}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg goals for/game:</span>
                <span className="font-semibold text-green-600">{seasonAverages.avgGoalsFor.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg goals against/game:</span>
                <span className="font-semibold text-red-600">{seasonAverages.avgGoalsAgainst.toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Goal difference/game:</span>
                <span className={`font-semibold ${(seasonAverages.avgGoalsFor - seasonAverages.avgGoalsAgainst) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(seasonAverages.avgGoalsFor - seasonAverages.avgGoalsAgainst) >= 0 ? '+' : ''}{(seasonAverages.avgGoalsFor - seasonAverages.avgGoalsAgainst).toFixed(1)}
                </span>
              </div>
            </div>

            {/* Position Stats Method */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 mb-3">From Position Statistics</h4>
              <div className="space-y-2">
                {(() => {
                  // Calculate from position stats method with detailed breakdown
                  let totalGsGoals = 0;
                  let totalGaGoals = 0;
                  let totalGkGoals = 0;
                  let totalGdGoals = 0;
                  let gamesWithPositionStats = 0;

                  if (batchStats) {
                    games.forEach(game => {
                      if (game.status === 'completed' && game.statusAllowsStatistics === true) {
                        const gameStats = batchStats[game.id] || [];
                        const teamStats = gameStats.filter(stat => stat.teamId === currentTeamId);
                        
                        if (teamStats.length > 0) {
                          gamesWithPositionStats++;
                          
                          // Sum up goals by position
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

                  const positionGoalsFor = totalGsGoals + totalGaGoals;
                  const positionGoalsAgainst = totalGkGoals + totalGdGoals;
                  const positionAvgFor = gamesWithPositionStats > 0 ? positionGoalsFor / gamesWithPositionStats : 0;
                  const positionAvgAgainst = gamesWithPositionStats > 0 ? positionGoalsAgainst / gamesWithPositionStats : 0;

                  // Calculate percentages
                  const totalAttackGoals = totalGsGoals + totalGaGoals;
                  const totalDefenseGoals = totalGkGoals + totalGdGoals;
                  
                  const gsPercentage = totalAttackGoals > 0 ? (totalGsGoals / totalAttackGoals) * 100 : 50;
                  const gaPercentage = totalAttackGoals > 0 ? (totalGaGoals / totalAttackGoals) * 100 : 50;
                  const gkPercentage = totalDefenseGoals > 0 ? (totalGkGoals / totalDefenseGoals) * 100 : 50;
                  const gdPercentage = totalDefenseGoals > 0 ? (totalGdGoals / totalDefenseGoals) * 100 : 50;

                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Total goals for:</span>
                        <span className="font-semibold text-green-600">{positionGoalsFor || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total goals against:</span>
                        <span className="font-semibold text-red-600">{positionGoalsAgainst || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Games with stats:</span>
                        <span className="font-semibold">{gamesWithPositionStats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg goals for/game:</span>
                        <span className="font-semibold text-green-600">{positionAvgFor.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg goals against/game:</span>
                        <span className="font-semibold text-red-600">{positionAvgAgainst.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Goal difference/game:</span>
                        <span className={`font-semibold ${(positionAvgFor - positionAvgAgainst) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(positionAvgFor - positionAvgAgainst) >= 0 ? '+' : ''}{(positionAvgFor - positionAvgAgainst).toFixed(1)}
                        </span>
                      </div>
                      
                      {/* Position Breakdown Table */}
                      <div className="border-t pt-3 mt-3">
                        <div className="text-xs font-medium text-gray-600 mb-3">Position Breakdown by Quarter:</div>
                        
                        {(() => {
                          // Calculate quarter-by-quarter position stats
                          const quarterStats = [1, 2, 3, 4].map(quarter => {
                            let qGsGoals = 0, qGaGoals = 0, qGkGoals = 0, qGdGoals = 0;
                            let qGamesWithStats = 0;

                            if (batchStats) {
                              games.forEach(game => {
                                if (game.status === 'completed' && game.statusAllowsStatistics === true) {
                                  const gameStats = batchStats[game.id] || [];
                                  const quarterTeamStats = gameStats.filter(stat => 
                                    stat.teamId === currentTeamId && stat.quarter === quarter
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
                            }

                            const qAttackTotal = qGsGoals + qGaGoals;
                            const qDefenseTotal = qGkGoals + qGdGoals;
                            const qGsPercent = qAttackTotal > 0 ? (qGsGoals / qAttackTotal) * 100 : 50;
                            const qGaPercent = qAttackTotal > 0 ? (qGaGoals / qAttackTotal) * 100 : 50;
                            const qGkPercent = qDefenseTotal > 0 ? (qGkGoals / qDefenseTotal) * 100 : 50;
                            const qGdPercent = qDefenseTotal > 0 ? (qGdGoals / qDefenseTotal) * 100 : 50;

                            return {
                              quarter,
                              gsGoals: qGsGoals,
                              gaGoals: qGaGoals,
                              gkGoals: qGkGoals,
                              gdGoals: qGdGoals,
                              attackTotal: qAttackTotal,
                              defenseTotal: qDefenseTotal,
                              gsPercent: qGsPercent,
                              gaPercent: qGaPercent,
                              gkPercent: qGkPercent,
                              gdPercent: qGdPercent,
                              gamesWithStats: qGamesWithStats
                            };
                          });

                          return (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-1 px-2 font-medium">Quarter</th>
                                    <th className="text-center py-1 px-2 font-medium text-green-600">GS</th>
                                    <th className="text-center py-1 px-2 font-medium text-green-600">GA</th>
                                    <th className="text-center py-1 px-2 font-medium text-green-600">Attack %</th>
                                    <th className="text-center py-1 px-2 font-medium text-red-600">GK</th>
                                    <th className="text-center py-1 px-2 font-medium text-red-600">GD</th>
                                    <th className="text-center py-1 px-2 font-medium text-red-600">Defense %</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {quarterStats.map(q => (
                                    <tr key={q.quarter} className="border-b border-gray-100">
                                      <td className="py-1 px-2 font-medium">Q{q.quarter}</td>
                                      <td className="text-center py-1 px-2">{q.gsGoals}</td>
                                      <td className="text-center py-1 px-2">{q.gaGoals}</td>
                                      <td className="text-center py-1 px-2 text-xs">
                                        {q.attackTotal > 0 ? `${q.gsPercent.toFixed(0)}/${q.gaPercent.toFixed(0)}` : '50/50'}
                                      </td>
                                      <td className="text-center py-1 px-2">{q.gkGoals}</td>
                                      <td className="text-center py-1 px-2">{q.gdGoals}</td>
                                      <td className="text-center py-1 px-2 text-xs">
                                        {q.defenseTotal > 0 ? `${q.gkPercent.toFixed(0)}/${q.gdPercent.toFixed(0)}` : '50/50'}
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="border-t-2 font-medium">
                                    <td className="py-1 px-2">Total</td>
                                    <td className="text-center py-1 px-2">{totalGsGoals}</td>
                                    <td className="text-center py-1 px-2">{totalGaGoals}</td>
                                    <td className="text-center py-1 px-2 text-xs">
                                      {totalAttackGoals > 0 ? `${gsPercentage.toFixed(0)}/${gaPercentage.toFixed(0)}` : '50/50'}
                                    </td>
                                    <td className="text-center py-1 px-2">{totalGkGoals}</td>
                                    <td className="text-center py-1 px-2">{totalGdGoals}</td>
                                    <td className="text-center py-1 px-2 text-xs">
                                      {totalDefenseGoals > 0 ? `${gkPercentage.toFixed(0)}/${gdPercentage.toFixed(0)}` : '50/50'}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 