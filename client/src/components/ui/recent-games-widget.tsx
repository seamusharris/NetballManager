import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import GameResultCard from '@/components/ui/game-result-card';
import { Game, GameStats, GameScore, Team } from '@shared/types';

interface RecentGamesWidgetProps {
  games: Game[];
  teamId?: number;
  clubId?: number;
  limit?: number;
  title?: string;
  className?: string;
  centralizedScores?: GameScore[];
  gameStats?: GameStats[];
  clubTeams?: Team[];
  showQuarterScores?: boolean;
}

export default function RecentGamesWidget({
  games = [],
  teamId,
  clubId,
  limit = 5,
  title = "Recent Games",
  className = "",
  centralizedScores = [],
  gameStats = [],
  clubTeams = [],
  showQuarterScores = false
}: RecentGamesWidgetProps) {
  // Filter and sort recent completed games
  const recentGames = games
    .filter(game => {
      const isCompleted = game.statusIsCompleted && 
        !game.isBye && 
        game.statusName !== 'bye';

      // If teamId is specified, filter for that team
      if (teamId) {
        return isCompleted && (game.homeTeamId === teamId || game.awayTeamId === teamId);
      }

      // If clubId is specified, filter for that club
      if (clubId) {
        return isCompleted && (game.homeClubId === clubId || game.awayClubId === clubId);
      }

      return isCompleted;
    })
    // Standardize: always reverse chronological for recent games
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  if (recentGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No recent games found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold mb-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentGames.map((game) => (
          <GameResultCard
            key={game.id}
            game={game}
            layout="medium"
            currentTeamId={teamId}
            currentClubId={clubId}
            centralizedScores={centralizedScores}
            gameStats={gameStats}
            clubTeams={clubTeams}
            showQuarterScores={showQuarterScores}
            showDate={true}
            showRound={true}
            showScore={true}
            showLink={true}
          />
        ))}
      </CardContent>
    </Card>
  );
}