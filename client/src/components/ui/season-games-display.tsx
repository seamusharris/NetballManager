import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar } from 'lucide-react';
import GameResultCard from '@/components/ui/game-result-card';
import AttackDefenseDisplay from '@/components/ui/attack-defense-display';
import QuarterPerformanceAnalysis from '@/components/ui/quarter-performance-analysis';

interface SeasonGamesDisplayProps {
  seasonGames: any[];
  currentTeamId?: number;
  seasonName?: string;
  isLoading?: boolean;
  batchScores?: Record<string, any[]>;
  batchStats?: Record<string, any[]>;
  className?: string;
}

export default function SeasonGamesDisplay({
  seasonGames,
  currentTeamId,
  seasonName,
  isLoading = false,
  batchScores,
  batchStats,
  className = ""
}: SeasonGamesDisplayProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Season Games ({seasonName || 'Current Season'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading season games...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (seasonGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Season Games ({seasonName || 'Current Season'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No completed games found for this season</p>
            <p className="text-xs text-gray-500 mt-1">
              Season games will appear here once they are completed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Season Games ({seasonName || 'Current Season'})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Games List */}
          <div className="space-y-3">
            {seasonGames.map((game, index) => {
              // Check for special status games (e.g., forfeit, bye)
              const isSpecialStatus = game.statusName === 'forfeit-win' || game.statusName === 'forfeit-loss' || game.statusName === 'bye' || game.statusName === 'abandoned' || game.statusDisplayName === 'Forfeit Loss' || game.statusDisplayName === 'Forfeit Win';

              // Transform batch scores to calculate quarter breakdown
              const gameScores = batchScores?.[game.id] || [];
              const transformedScores = Array.isArray(gameScores) ? gameScores.map(score => ({
                id: score.id,
                gameId: score.gameId,
                teamId: score.teamId,
                quarter: score.quarter,
                score: score.score,
                enteredBy: score.enteredBy,
                enteredAt: score.enteredAt,
                updatedAt: score.updatedAt,
                notes: score.notes
              })) : [];

              // Calculate quarter scores for display
              const calculateQuarterScores = () => {
                if (!transformedScores.length) return null;

                const teamScores = [0, 0, 0, 0];
                const opponentScores = [0, 0, 0, 0];

                transformedScores.forEach(score => {
                  const quarterIndex = score.quarter - 1;
                  if (quarterIndex >= 0 && quarterIndex < 4) {
                    if (score.teamId === currentTeamId) {
                      teamScores[quarterIndex] = score.score;
                    } else {
                      opponentScores[quarterIndex] = score.score;
                    }
                  }
                });

                // Calculate cumulative scores
                const teamCumulative = [];
                const opponentCumulative = [];
                let teamTotal = 0;
                let opponentTotal = 0;

                for (let i = 0; i < 4; i++) {
                  teamTotal += teamScores[i];
                  opponentTotal += opponentScores[i];
                  teamCumulative.push(teamTotal);
                  opponentCumulative.push(opponentTotal);
                }

                return {
                  quarter: teamScores,
                  cumulative: teamCumulative,
                  opponentQuarter: opponentScores,
                  opponentCumulative: opponentCumulative,
                  finalScore: { team: teamTotal, opponent: opponentTotal }
                };
              };

              const quarterData = calculateQuarterScores();
              const hasQuarterData = quarterData !== null;

              return (
                <div key={game.id} className="relative">
                  {/* Use the standard GameResultCard for consistent styling and scoring */}
                  <GameResultCard
                    game={game}
                    currentTeamId={currentTeamId}
                    centralizedScores={transformedScores}
                    gameStats={batchStats?.[game.id] || []}
                    showLink={true}
                    className="w-full"
                  />

                  {/* Quarter breakdown overlay - now always shows both quarter and cumulative for consistency */}
                  {!isSpecialStatus && hasQuarterData && (
                    <div className="absolute right-32 top-1/2 transform -translate-y-1/2 flex items-center gap-4 pointer-events-none">
                      <div className="text-xs space-y-1">
                        {/* Quarter-by-quarter scores on top (lighter) */}
                        <div className="grid grid-cols-4 gap-1">
                          {(() => {
                            const teamScores = [0, 0, 0, 0];
                            const opponentScores = [0, 0, 0, 0];

                            transformedScores.forEach(score => {
                              const quarterIndex = score.quarter - 1;
                              if (quarterIndex >= 0 && quarterIndex < 4) {
                                if (score.teamId === currentTeamId) {
                                  teamScores[quarterIndex] = score.score;
                                } else {
                                  opponentScores[quarterIndex] = score.score;
                                }
                              }
                            });

                            return teamScores.map((teamScore, qIndex) => {
                              const opponentScore = opponentScores[qIndex];
                              const quarterWin = teamScore > opponentScore;
                              const quarterLoss = teamScore < opponentScore;

                              // Display in Home-Away format but color by team perspective
                              let homeScore, awayScore;
                              if (game.homeTeamId === currentTeamId) {
                                // Current team is home
                                homeScore = teamScore;
                                awayScore = opponentScore;
                              } else {
                                // Current team is away
                                homeScore = opponentScore;
                                awayScore = teamScore;
                              }

                              const quarterClass = quarterWin 
                                ? 'bg-green-100 text-green-800 border border-green-400' 
                                : quarterLoss 
                                  ? 'bg-red-100 text-red-800 border border-red-400'
                                  : 'bg-amber-100 text-amber-800 border border-amber-400';

                              return (
                                <span key={qIndex} className={`w-16 px-1 py-0.5 ${quarterClass} rounded font-medium text-center block`}>
                                  {homeScore}–{awayScore}
                                </span>
                              );
                            });
                          })()}
                        </div>
                        {/* Cumulative scores underneath (darker) */}
                        <div className="grid grid-cols-4 gap-1">
                          {(() => {
                            const teamScores = [0, 0, 0, 0];
                            const opponentScores = [0, 0, 0, 0];

                            transformedScores.forEach(score => {
                              const quarterIndex = score.quarter - 1;
                              if (quarterIndex >= 0 && quarterIndex < 4) {
                                if (score.teamId === currentTeamId) {
                                  teamScores[quarterIndex] = score.score;
                                } else {
                                  opponentScores[quarterIndex] = score.score;
                                }
                              }
                            });

                            // Calculate cumulative scores
                            const teamCumulative = [];
                            const opponentCumulative = [];
                            let teamTotal = 0;
                            let opponentTotal = 0;

                            for (let i = 0; i < 4; i++) {
                              teamTotal += teamScores[i];
                              opponentTotal += opponentScores[i];
                              teamCumulative.push(teamTotal);
                              opponentCumulative.push(opponentTotal);
                            }

                            return teamCumulative.map((teamCum, qIndex) => {
                              const opponentCum = opponentCumulative[qIndex];
                              const cumulativeWin = teamCum > opponentCum;
                              const cumulativeLoss = teamCum < opponentCum;

                              // Display in Home-Away format but color by team perspective
                              let homeCum, awayCum;
                              if (game.homeTeamId === currentTeamId) {
                                // Current team is home
                                homeCum = teamCum;
                                awayCum = opponentCum;
                              } else {
                                // Current team is away
                                homeCum = opponentCum;
                                awayCum = teamCum;
                              }

                              const cumulativeClass = cumulativeWin 
                                ? 'bg-green-200 text-green-800 border border-green-500' 
                                : cumulativeLoss 
                                  ? 'bg-red-200 text-red-800 border border-red-500'
                                  : 'bg-amber-200 text-amber-800 border border-amber-500';

                              return (
                                <span key={qIndex} className={`w-16 px-1 py-0.5 ${cumulativeClass} rounded text-xs text-center block`}>
                                  {homeCum}–{awayCum}
                                </span>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Season Quarter Performance Analysis */}
          <div className="mt-6">
            <QuarterPerformanceAnalysis
              games={seasonGames}
              currentTeamId={currentTeamId}
              batchScores={batchScores}
              excludeSpecialGames={true}
            />
          </div>

          {/* Season Position Performance - Side by Side */}
          {seasonGames.length > 0 && batchScores && Object.keys(batchScores).some(gameId => batchScores[gameId]?.length > 0) && (
            <div className="mt-6">
              {(() => {
                // Calculate position-based statistics using actual position stats
                const positionTotals = {
                  'GS': { goalsFor: 0, games: 0 },
                  'GA': { goalsFor: 0, games: 0 },
                  'GD': { goalsAgainst: 0, games: 0 },
                  'GK': { goalsAgainst: 0, games: 0 }
                };

                let gamesWithPositionStats = 0;
                const gamesWithStatsSet = new Set();

                // Use batch stats to get actual position-based statistics
                seasonGames.forEach(game => {
                  // Only include games that allow statistics (excludes forfeit games, BYE games, etc.)
                  if (!game.statusAllowsStatistics) return;

                  const gameStats = batchStats?.[game.id] || [];
                  if (gameStats.length > 0) {
                    // Check if this game has position stats for any of our target positions
                    const hasRelevantStats = gameStats.some(stat => 
                      ['GS', 'GA', 'GD', 'GK'].includes(stat.position)
                    );

                    if (hasRelevantStats) {
                      gamesWithStatsSet.add(game.id);

                      // Calculate position sums for this game
                      const positionSums = {
                        'GS': { goalsFor: 0, goalsAgainst: 0 },
                        'GA': { goalsFor: 0, goalsAgainst: 0 },
                        'GD': { goalsFor: 0, goalsAgainst: 0 },
                        'GK': { goalsFor: 0, goalsAgainst: 0 }
                      };

                      gameStats.forEach(stat => {
                        if (['GS', 'GA', 'GD', 'GK'].includes(stat.position)) {
                          positionSums[stat.position].goalsFor += stat.goalsFor || 0;
                          positionSums[stat.position].goalsAgainst += stat.goalsAgainst || 0;
                        }
                      });

                      // Add to position totals
                      ['GS', 'GA', 'GD', 'GK'].forEach(position => {
                        if (positionSums[position]) {
                          if (position === 'GS' || position === 'GA') {
                            positionTotals[position].goalsFor += positionSums[position].goalsFor;
                          }
                          if (position === 'GD' || position === 'GK') {
                            positionTotals[position].goalsAgainst += positionSums[position].goalsAgainst;
                          }
                          positionTotals[position].games++;
                        }
                      });
                    }
                  }
                });

                gamesWithPositionStats = gamesWithStatsSet.size;

                // Calculate averages from actual position stats
                const gaAvgGoalsFor = positionTotals.GA.games > 0 ? positionTotals.GA.goalsFor / positionTotals.GA.games : 0;
                const gsAvgGoalsFor = positionTotals.GS.games > 0 ? positionTotals.GS.goalsFor / positionTotals.GS.games : 0;
                const gdAvgGoalsAgainst = positionTotals.GD.games > 0 ? positionTotals.GD.goalsAgainst / positionTotals.GD.games : 0;
                const gkAvgGoalsAgainst = positionTotals.GK.games > 0 ? positionTotals.GK.goalsAgainst / positionTotals.GK.games : 0;

                const attackingPositionsTotal = gaAvgGoalsFor + gsAvgGoalsFor;
                const defendingPositionsTotal = gdAvgGoalsAgainst + gkAvgGoalsAgainst;

                return (
          <AttackDefenseDisplay
            averages={{
              gsAvgGoalsFor,
              gaAvgGoalsFor,
              gdAvgGoalsAgainst,
              gkAvgGoalsAgainst,
              attackingPositionsTotal,
              defendingPositionsTotal,
              gamesWithPositionStats
            }}
            label="Season Attack vs Defense Performance"
          />
        )
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}