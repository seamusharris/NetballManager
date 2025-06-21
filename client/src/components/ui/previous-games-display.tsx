
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { formatShortDate } from '@/lib/utils';
import { calculateTeamWinRate } from '@/lib/winRateCalculator';
import GameResultCard from '@/components/ui/game-result-card';

interface PreviousGamesDisplayProps {
  historicalGames: any[];
  currentTeamId: number;
  currentClubId: number;
  batchScores: Record<string, any[]>;
  opponentName: string;
  className?: string;
}

export default function PreviousGamesDisplay({
  historicalGames,
  currentTeamId,
  currentClubId,
  batchScores,
  opponentName,
  className = ""
}: PreviousGamesDisplayProps) {
  if (historicalGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-6">
          <CardTitle>
            Previous Games vs {opponentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
      <CardHeader className="pb-6">
        <CardTitle>
          Previous Games vs {opponentName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {historicalGames.slice(0, 5).map((game, index) => {
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
              <div key={game.id} className="relative">
                {/* Use the standard GameResultCard for consistent styling and scoring */}
                <GameResultCard
                  game={game}
                  currentTeamId={currentTeamId}
                  centralizedScores={transformedScores}
                  showLink={true}
                  className="w-full"
                />

                {/* Right side - quarter breakdown for non-special games */}
                <div className="ml-4 flex-shrink-0">
                  {!isSpecialStatus && hasQuarterData ? (
                    (() => {
                      const { teamScores, opponentScores } = quarterData;

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

                      return (
                        <div className="absolute right-32 top-1/2 transform -translate-y-1/2 flex items-center gap-4 pointer-events-none">
                          <div className="text-xs space-y-1">
                            {/* Quarter-by-quarter scores on top (lighter) */}
                            <div className="grid grid-cols-4 gap-1">
                              {teamScores.map((teamScore, qIndex) => {
                                const opponentScore = opponentScores[qIndex];
                                const quarterWin = teamScore > opponentScore;
                                const quarterLoss = teamScore < opponentScore;

                                const quarterClass = quarterWin 
                                  ? 'bg-green-100 text-green-800 border border-green-400' 
                                  : quarterLoss 
                                    ? 'bg-red-100 text-red-800 border border-red-400'
                                    : 'bg-amber-100 text-amber-800 border border-amber-400';

                                return (
                                  <span key={qIndex} className={`w-16 px-1 py-0.5 ${quarterClass} rounded font-medium text-center block`}>
                                    {teamScore}–{opponentScore}
                                  </span>
                                );
                              })}
                            </div>
                            {/* Cumulative scores underneath (darker) */}
                            <div className="grid grid-cols-4 gap-1">
                              {teamCumulative.map((teamCum, qIndex) => {
                                const opponentCum = opponentCumulative[qIndex];
                                const cumulativeWin = teamCum > opponentCum;
                                const cumulativeLoss = teamCum < opponentCum;

                                const cumulativeClass = cumulativeWin 
                                  ? 'bg-green-200 text-green-800 border border-green-500' 
                                  : cumulativeLoss 
                                    ? 'bg-red-200 text-red-800 border border-red-500'
                                    : 'bg-amber-200 text-amber-800 border border-amber-500';

                                return (
                                  <span key={qIndex} className={`w-16 px-1 py-0.5 ${cumulativeClass} rounded text-xs text-center block`}>
                                    {teamCum}–{opponentCum}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quarter Average Performance Boxes + Goal Difference */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4].map(quarter => {
            // Calculate average scores for this quarter across all historical games
            let totalTeamScore = 0;
            let totalOpponentScore = 0;
            let gamesWithData = 0;

            historicalGames.forEach(game => {
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

              const quarterTeamScore = transformedScores.find(s => s.teamId === currentTeamId && s.quarter === quarter)?.score || 0;
              const quarterOpponentScore = transformedScores.find(s => s.teamId !== currentTeamId && s.quarter === quarter)?.score || 0;

              totalTeamScore += quarterTeamScore;
              totalOpponentScore += quarterOpponentScore;

              if(quarterTeamScore > 0 || quarterOpponentScore > 0){
                gamesWithData++;
              }
            });

            const avgTeamScore = gamesWithData > 0 ? totalTeamScore / gamesWithData : 0;
            const avgOpponentScore = gamesWithData > 0 ? totalOpponentScore / gamesWithData : 0;

            const isWinning = avgTeamScore > avgOpponentScore;
            const isLosing = avgTeamScore < avgOpponentScore;
            const isDraw = Math.abs(avgTeamScore - avgOpponentScore) < 0.1;

            const getBackgroundClass = () => {
              if (isDraw) return 'bg-amber-100 border-amber-300';
              if (isWinning) return 'bg-green-100 border-green-300';
              return 'bg-red-100 border-red-300';
            };

            const getDiffTextColorClass = () => {
              if (isDraw) return 'text-amber-600 font-bold';
              return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
            };

            return (
              <div key={quarter} className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
                {/* Quarter badge in top-left corner */}
                <div className="absolute -top-2 -left-2">
                  <Badge 
                    className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                      isDraw ? 'bg-amber-500 text-white border-amber-600' :
                      isWinning ? 'bg-green-500 text-white border-green-600' : 
                      'bg-red-500 text-white border-red-600'
                    }`}
                  >
                    Q{quarter}
                  </Badge>
                </div>

                <div className="space-y-1 mt-1">
                  <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                    {avgTeamScore.toFixed(1)}–{avgOpponentScore.toFixed(1)}
                  </div>
                  <div className={`text-base ${getDiffTextColorClass()}`}>
                    {avgTeamScore - avgOpponentScore > 0 ? `+${(avgTeamScore - avgOpponentScore).toFixed(1)}` : (avgTeamScore - avgOpponentScore).toFixed(1)}
                  </div>

                  <div 
                    className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                    title="Our share of total quarter scoring"
                  >
                    <div 
                      className={`h-2 rounded-full ${
                        isWinning ? 'bg-green-500' : 
                        isLosing ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (avgTeamScore / (avgTeamScore + avgOpponentScore)) * 100))}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Goal Difference Box - styled like quarter boxes */}
          {(() => {
            // Calculate overall goal difference for styling
            let totalGoalsFor = 0;
            let totalGoalsAgainst = 0;
            let gamesWithScores = 0;

            historicalGames.forEach(game => {
              const gameScores = batchScores?.[game.id] || [];
              if (gameScores.length > 0) {
                gamesWithScores++;

                let gameGoalsFor = 0;
                let gameGoalsAgainst = 0;

                gameScores.forEach(score => {
                  if (score.teamId === currentTeamId) {
                    gameGoalsFor += score.score;
                  } else {
                    gameGoalsAgainst += score.score;
                  }
                });

                totalGoalsFor += gameGoalsFor;
                totalGoalsAgainst += gameGoalsAgainst;
              }
            });

            const avgGoalsFor = gamesWithScores > 0 ? totalGoalsFor / gamesWithScores : 0;
            const avgGoalsAgainst = gamesWithScores > 0 ? totalGoalsAgainst / gamesWithScores : 0;
            const goalDifference = avgGoalsFor - avgGoalsAgainst;

            const isWinning = goalDifference > 0;
            const isLosing = goalDifference < 0;
            const isDraw = Math.abs(goalDifference) < 0.1;

            const getBackgroundClass = () => {
              if (isDraw) return 'bg-amber-100 border-amber-300';
              if (isWinning) return 'bg-green-100 border-green-300';
              return 'bg-red-100 border-red-300';
            };

            const getDiffTextColorClass = () => {
              if (isDraw) return 'text-amber-600 font-bold';
              return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
            };

            return (
              <div className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
                {/* Goal difference badge in top-left corner */}
                <div className="absolute -top-2 -left-2">
                  <Badge 
                    className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                      isDraw ? 'bg-amber-500 text-white border-amber-600' :
                      isWinning ? 'bg-green-500 text-white border-green-600' : 
                      'bg-red-500 text-white border-red-600'
                    }`}
                  >
                    AVG
                  </Badge>
                </div>

                <div className="space-y-1 mt-1">
                  <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                    {avgGoalsFor.toFixed(1)}–{avgGoalsAgainst.toFixed(1)}
                  </div>
                  <div className={`text-base ${getDiffTextColorClass()}`}>
                    {goalDifference >= 0 ? '+' : ''}{goalDifference.toFixed(1)}
                  </div>

                  <div 
                    className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                    title="Our share of total game scoring"
                  >
                    <div 
                      className={`h-2 rounded-full ${
                        isWinning ? 'bg-green-500' : 
                        isLosing ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (avgGoalsFor / (avgGoalsFor + avgGoalsAgainst)) * 100))}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}

