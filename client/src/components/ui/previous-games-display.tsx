import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { formatShortDate } from '@/lib/utils';
import { calculateTeamWinRate } from '@/lib/winRateCalculator';
import GameResultCard from '@/components/ui/game-result-card';
import AttackDefenseDisplay from '@/components/ui/attack-defense-display';
import QuarterPerformanceAnalysis from '@/components/ui/quarter-performance-analysis';
import { hasPositionStats } from '@/lib/positionStats';
import { ViewMoreButton } from '@/components/ui/view-more-button';

interface PreviousGamesDisplayProps {
  historicalGames: any[];
  currentTeamId: number;
  currentClubId: number;
  batchScores?: Record<number, any[]>;
  batchStats?: Record<number, any[]>;
  opponentName?: string;
  className?: string;
  hideWinLossIndicators?: boolean;
  centralizedScores?: Record<number, any[]>;
  // New configuration options
  showAnalytics?: boolean; // Show quarter averages and attack/defense
  showQuarterScores?: boolean; // Show quarter-by-quarter overlay
  maxGames?: number; // Limit number of games displayed
  title?: string; // Custom title override
  compact?: boolean; // More compact display for widgets
  excludeSpecialGames?: boolean; // Exclude BYE/forfeit games from analytics
  showViewMore?: boolean; // Show view more button
  viewMoreHref?: string; // Link for view more button
  viewMoreText?: string; // Custom text for view more button
}

export default function PreviousGamesDisplay({ 
  historicalGames = [], 
  currentTeamId, 
  currentClubId, 
  batchScores, 
  batchStats, 
  opponentName = "Opponent",
  className = "",
  hideWinLossIndicators = false,
  centralizedScores,
  showAnalytics = true,
  showQuarterScores = true,
  maxGames,
  title,
  compact = false,
  excludeSpecialGames = false,
  showViewMore = false,
  viewMoreHref,
  viewMoreText = "View more →"
}: PreviousGamesDisplayProps) {
  if (!historicalGames || historicalGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Previous Games vs {opponentName}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No previous matches against {opponentName}</p>
            <p className="text-xs text-gray-500 mt-1">
              This will show completed games against the same opponent team
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate actual statistics based on historical games using proper win rate calculator
  const winRateResult = calculateTeamWinRate(
    historicalGames,
    currentTeamId,
    currentClubId,
    batchScores || {}
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {title || (opponentName === "Recent Form" ? opponentName : `Previous Games vs ${opponentName}`)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {historicalGames.slice(0, maxGames === undefined ? historicalGames.length : maxGames || 5).map((game, index) => {
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

              return { teamScores, opponentScores };
            };

            const quarterData = calculateQuarterScores();
            const hasQuarterData = quarterData !== null;

            return (
              <GameResultCard
                key={game.id}
                game={game}
                currentTeamId={currentTeamId}
                centralizedScores={gameScores}
                gameStats={batchStats?.[game.id] || []}
                showLink={true}
                showQuarterScores={showQuarterScores}
                className="w-full"
              />
            );
          })}
        </div>

        {/* Quarter Average Performance Analysis */}
        {showAnalytics && (
          <div className="mt-6">
            <QuarterPerformanceAnalysis
              games={historicalGames}
              currentTeamId={currentTeamId}
              batchScores={batchScores}
              excludeSpecialGames={excludeSpecialGames}
            />
          </div>
        )}

        {/* Attack vs Defense Performance - Side by Side */}
        {showAnalytics && historicalGames.length > 0 && (
          <div className="mt-6">
            {(() => {
              // Calculate attack vs defense breakdown based on actual position stats
              const positionTotals = {
                'GS': { goalsFor: 0, games: 0 },
                'GA': { goalsFor: 0, games: 0 },
                'GD': { goalsAgainst: 0, games: 0 },
                'GK': { goalsAgainst: 0, games: 0 }
              };

              let gamesWithPositionStats = 0;
              const gamesWithStatsSet = new Set();

              // Use batch stats to get actual position-based statistics
              historicalGames.forEach(game => {
                // Only include games that allow statistics (excludes forfeit games, BYE games, etc.)
                if (!game.statusAllowsStatistics) return;

                // Skip special status games if requested
                if (excludeSpecialGames && (
                  game.statusName === 'bye' || 
                  game.statusName === 'forfeit-win' || 
                  game.statusName === 'forfeit-loss' ||
                  game.statusDisplayName === 'Forfeit Loss' ||
                  game.statusDisplayName === 'Forfeit Win'
                )) return;

                const gameStats = batchStats?.[game.id] || [];
                if (hasPositionStats(gameStats)) {
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

              const attackUnitPerformance = gaAvgGoalsFor + gsAvgGoalsFor;
              const defenseUnitPerformance = gdAvgGoalsAgainst + gkAvgGoalsAgainst;

              const gaContribution = gaAvgGoalsFor;
              const gsContribution = gsAvgGoalsFor;

              const gdContribution = gdAvgGoalsAgainst;
              const gkContribution = gkAvgGoalsAgainst;

              return (
                  <AttackDefenseDisplay
                    averages={{
                      gsAvgGoalsFor: gsContribution,
                      gaAvgGoalsFor: gaContribution,
                      gdAvgGoalsAgainst: gdContribution,
                      gkAvgGoalsAgainst: gkContribution,
                      attackingPositionsTotal: attackUnitPerformance,
                      defendingPositionsTotal: defenseUnitPerformance,
                      gamesWithPositionStats
                    }}
                    label={`${opponentName} Performance`}
                  />
                )
            })()}
          </div>
        )}

        {/* View More Button */}
        {showViewMore && viewMoreHref && historicalGames.length > (maxGames || 5) && (
          <div className="mt-3">
            <ViewMoreButton href={viewMoreHref}>
              {viewMoreText}
            </ViewMoreButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}