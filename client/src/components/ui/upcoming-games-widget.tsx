import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameResultCard } from '@/components/ui/game-result-card';
import { GamesContainer } from '@/components/ui/games-container';
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
    .filter(game => {
      const isUpcoming = game.date >= currentDate && 
        !game.statusIsCompleted &&
        !game.isBye &&
        game.statusName !== 'bye';

      // If teamId is specified, filter for that team
      if (teamId) {
        return isUpcoming && (game.homeTeamId === teamId || game.awayTeamId === teamId);
      }

      // If clubId is specified, filter for that club
      if (clubId) {
        return isUpcoming && (game.homeClubId === clubId || game.awayClubId === clubId);
      }

      return isUpcoming;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

  if (upcomingGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No upcoming games scheduled</p>
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