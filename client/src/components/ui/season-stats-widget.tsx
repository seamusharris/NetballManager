import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SeasonStatsWidgetProps {
  games: any[];
  batchScores: Record<number, any[]>;
  batchStats?: Record<number, any[]>;
  teamId: number;
  className?: string;
}

export function SeasonStatsWidget({ 
  games, 
  batchScores, 
  batchStats,
  teamId, 
  className = "" 
}: SeasonStatsWidgetProps) {
  
  // Calculate season totals
  let totalGoalsFor = 0;
  let totalGoalsAgainst = 0;
  let gamesWithStats = 0;

  games.forEach(game => {
    // Only count games with statistics enabled
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Season Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {/* Official Scores Method */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 mb-3">From Official Scores (Quarter by Quarter)</h4>
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
                <span className="font-semibold">{gamesWithStats}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg goals for/game:</span>
                <span className="font-semibold text-green-600">{avgGoalsFor.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg goals against/game:</span>
                <span className="font-semibold text-red-600">{avgGoalsAgainst.toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Goal difference/game:</span>
                <span className={`font-semibold ${(avgGoalsFor - avgGoalsAgainst) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(avgGoalsFor - avgGoalsAgainst) >= 0 ? '+' : ''}{(avgGoalsFor - avgGoalsAgainst).toFixed(1)}
                </span>
              </div>
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
                      const teamStats = gameStats.filter(stat => stat.teamId === teamId);
                      
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
      </CardContent>
    </Card>
  );
}