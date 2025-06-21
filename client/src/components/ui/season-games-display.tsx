import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar } from 'lucide-react';
import GameResultCard from '@/components/ui/game-result-card';
import { calculatePositionAverages } from '@/lib/positionStatsCalculator';
import PositionPerformanceDisplay from '@/components/ui/position-performance-display';

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
            Season
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
            Season ({seasonName || 'Current Season'})
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

  // Calculate position-based statistics using shared utility
  const positionAverages = calculatePositionAverages(seasonGames, batchStats, currentTeamId);
  const { 
    gsAvgGoalsFor, 
    gaAvgGoalsFor, 
    gdAvgGoalsAgainst, 
    gkAvgGoalsAgainst, 
    attackingPositionsTotal, 
    defendingPositionsTotal, 
    gamesWithPositionStats 
  } = positionAverages;

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
            {seasonGames.map((game, index) => {
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

              return (
                <div key={game.id} className="relative">
                  {/* Use the standard GameResultCard for consistent styling and scoring */}
                  <GameResultCard
                    game={game}
                    currentTeamId={currentTeamId}
                    centralizedScores={transformedScores}
                    showLink={true}
                    showQuarterScores={true}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>

          {/* Season Position Performance */}
          <PositionPerformanceDisplay 
            averages={positionAverages}
            label="Season Position Performance"
            className="mt-6"
          />
        </div>
      </CardContent>
    </Card>
  );
}