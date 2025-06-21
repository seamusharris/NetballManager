
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar } from 'lucide-react';

interface Game {
  id: number;
  date: string;
  time: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamDivision?: string;
  awayTeamDivision?: string;
  homeClubName?: string;
  awayClubName?: string;
  homeClubCode?: string;
  awayClubCode?: string;
  statusId: number | null;
  statusName?: string;
  statusDisplayName?: string;
  statusIsCompleted?: boolean;
  statusAllowsStatistics?: boolean;
  round?: string;
  venue?: string;
  seasonId: number | null;
  seasonName?: string;
}

interface SeasonGamesDisplayProps {
  seasonGames: Game[];
  currentTeamId: number | null;
  seasonName?: string;
  isLoading?: boolean;
  batchScores?: Record<string, any[]>;
  batchStats?: Record<string, any[]>;
}

export default function SeasonGamesDisplay({
  seasonGames,
  currentTeamId,
  seasonName,
  isLoading = false,
  batchScores = {},
  batchStats = {}
}: SeasonGamesDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Season Games
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
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Season Games ({seasonName || 'Current Season'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No season games found</p>
            <p className="text-xs text-gray-500 mt-1">
              Season games will appear here once they are scheduled
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate position-based statistics from season batch stats
  const positionTotals = {
    'GS': { goalsFor: 0, games: 0 },
    'GA': { goalsFor: 0, games: 0 },
    'GD': { goalsAgainst: 0, games: 0 },
    'GK': { goalsAgainst: 0, games: 0 }
  };

  let gamesWithPositionStats = 0;

  // Aggregate actual position stats from season games
  seasonGames.forEach(seasonGame => {
    // Only include games that allow statistics (excludes forfeit games, BYE games, etc.)
    if (!seasonGame.statusAllowsStatistics) return;

    const gameStats = batchStats?.[seasonGame.id] || [];
    if (gameStats.length > 0) {
      gamesWithPositionStats++;

      // Process stats for current team only
      const teamStats = gameStats.filter(stat => 
        (seasonGame.homeTeamId === currentTeamId && stat.teamId === currentTeamId) ||
        (seasonGame.awayTeamId === currentTeamId && stat.teamId === currentTeamId)
      );

      teamStats.forEach(stat => {
        if (stat.position === 'GS' || stat.position === 'GA') {
          positionTotals[stat.position].goalsFor += stat.goalsFor || 0;
          positionTotals[stat.position].games++;
        } else if (stat.position === 'GD' || stat.position === 'GK') {
          positionTotals[stat.position].goalsAgainst += stat.goalsAgainst || 0;
          positionTotals[stat.position].games++;
        }
      });
    }
  });

  // Calculate averages
  const gsAvgGoalsFor = positionTotals['GS'].games > 0 ? positionTotals['GS'].goalsFor / positionTotals['GS'].games : 0;
  const gaAvgGoalsFor = positionTotals['GA'].games > 0 ? positionTotals['GA'].goalsFor / positionTotals['GA'].games : 0;
  const gdAvgGoalsAgainst = positionTotals['GD'].games > 0 ? positionTotals['GD'].goalsAgainst / positionTotals['GD'].games : 0;
  const gkAvgGoalsAgainst = positionTotals['GK'].games > 0 ? positionTotals['GK'].goalsAgainst / positionTotals['GK'].games : 0;

  const attackingPositionsTotal = gsAvgGoalsFor + gaAvgGoalsFor;
  const defendingPositionsTotal = gdAvgGoalsAgainst + gkAvgGoalsAgainst;

  return (
    <Card>
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
            {seasonGames.map((seasonGame, index) => {
              // Check for special status games (e.g., forfeit, bye)
              const isSpecialStatus = seasonGame.statusName === 'forfeit-win' || 
                                    seasonGame.statusName === 'forfeit-loss' || 
                                    seasonGame.statusName === 'bye' || 
                                    seasonGame.statusName === 'abandoned' || 
                                    seasonGame.statusDisplayName === 'Forfeit Loss' || 
                                    seasonGame.statusDisplayName === 'Forfeit Win';

              const gameScores = batchScores?.[seasonGame.id] || [];
              const homeScores = gameScores.filter(s => s.teamId === seasonGame.homeTeamId);
              const awayScores = gameScores.filter(s => s.teamId === seasonGame.awayTeamId);
              const homeScore = homeScores.reduce((sum, s) => sum + (s.score || 0), 0);
              const awayScore = awayScores.reduce((sum, s) => sum + (s.score || 0), 0);

              const isHomeTeam = seasonGame.homeTeamId === currentTeamId;
              const opponentName = isHomeTeam ? seasonGame.awayTeamName : seasonGame.homeTeamName;
              const ourScore = isHomeTeam ? homeScore : awayScore;
              const theirScore = isHomeTeam ? awayScore : homeScore;

              return (
                <div key={seasonGame.id} className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          vs {opponentName || 'TBD'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(seasonGame.date).toLocaleDateString()} - Round {seasonGame.round}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Score Display */}
                    {seasonGame.statusIsCompleted && !isSpecialStatus && gameScores.length > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          <span className={ourScore > theirScore ? 'text-green-600' : ourScore < theirScore ? 'text-red-600' : 'text-gray-600'}>
                            {ourScore}
                          </span>
                          <span className="text-gray-400 mx-1">-</span>
                          <span className={theirScore > ourScore ? 'text-green-600' : theirScore < ourScore ? 'text-red-600' : 'text-gray-600'}>
                            {theirScore}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <Badge 
                      variant={seasonGame.statusIsCompleted ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {seasonGame.statusDisplayName || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Season Position Performance */}
          {gamesWithPositionStats > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Season Position Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Attack */}
                <div className="space-y-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Season Attack</span>
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
                    Based on position stats from {gamesWithPositionStats} season games
                  </div>
                </div>

                {/* Defence */}
                <div className="space-y-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Season Defence</span>
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
                    Based on position stats from {gamesWithPositionStats} season games
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
