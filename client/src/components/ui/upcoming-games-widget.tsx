import React from 'react';
import GameResultCard from '@/components/ui/game-result-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  showScore = true,
}: UpcomingGamesWidgetProps) {
  const displayedGames = games.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <GamesContainer>
          {displayedGames.map((game) => (
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
        </GamesContainer>
      </CardContent>
    </Card>
  );
}