
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import GameResultCard from '@/components/ui/game-result-card';
import { Game } from '@shared/schema';

interface RecentGamesWidgetProps {
  games: Game[];
  teamId?: number;
  clubId?: number;
  limit?: number;
  title?: string;
  className?: string;
  centralizedScores?: any[];
  gameStats?: any[];
  clubTeams?: any[];
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
    .filter(game => 
      game.statusIsCompleted && 
      !game.isBye && 
      game.statusName !== 'bye'
    )
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
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentGames.map((game) => (
          <GameResultCard
            key={game.id}
            game={game}
            layout="medium"
            currentTeamId={teamId}
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
