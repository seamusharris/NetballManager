
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import GameResultCard from '@/components/ui/game-result-card';
import { Game } from '@shared/schema';

interface UpcomingGamesWidgetProps {
  games: Game[];
  teamId?: number;
  clubId?: number;
  limit?: number;
  title?: string;
  className?: string;
  centralizedScores?: any[];
  gameStats?: any[];
  clubTeams?: any[];
  showDate?: boolean;
  showRound?: boolean;
  showScore?: boolean;
}

export default function UpcomingGamesWidget({
  games = [],
  teamId,
  clubId,
  limit = 5,
  title = "Upcoming Games",
  className = "",
  centralizedScores = [],
  gameStats = [],
  clubTeams = [],
  showDate = true,
  showRound = true,
  showScore = false
}: UpcomingGamesWidgetProps) {
  // Filter and sort upcoming games
  const currentDate = new Date().toISOString().split('T')[0];
  const upcomingGames = games
    .filter(game => 
      game.date >= currentDate && 
      !game.statusIsCompleted &&
      !game.isBye &&
      game.statusName !== 'bye'
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

  if (upcomingGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No upcoming games found</p>
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
        {upcomingGames.map((game) => (
          <GameResultCard
            key={game.id}
            game={game}
            layout="medium"
            currentTeamId={teamId}
            centralizedScores={centralizedScores}
            gameStats={gameStats}
            clubTeams={clubTeams}
            showDate={showDate}
            showRound={showRound}
            showScore={showScore}
            showLink={true}
          />
        ))}
      </CardContent>
    </Card>
  );
}
