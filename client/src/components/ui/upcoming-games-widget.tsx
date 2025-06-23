
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
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpcomingGamesWidgetProps {
  games: any[];
  maxGames?: number;
  teamId?: number;
  clubId?: number;
  title?: string;
  className?: string;
}

export default function UpcomingGamesWidget({ 
  games, 
  maxGames = 5, 
  teamId, 
  clubId, 
  title = "Upcoming Games",
  className 
}: UpcomingGamesWidgetProps) {
  // Filter and sort upcoming games
  const currentDate = new Date().toISOString().split('T')[0];
  const upcomingGames = games
    .filter(game => {
      const isUpcoming = game.date >= currentDate && !game.statusIsCompleted;
      
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
    .slice(0, maxGames);

  if (upcomingGames.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No upcoming games scheduled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingGames.map((game) => {
          const isHome = teamId ? game.homeTeamId === teamId : true;
          const opponent = isHome ? game.awayTeamName : game.homeTeamName;
          const opponentClub = isHome ? game.awayClubCode : game.homeClubCode;
          const venue = game.venue || (isHome ? 'Home' : 'Away');
          
          return (
            <div
              key={game.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={isHome ? "default" : "secondary"}>
                    {isHome ? 'Home' : 'Away'}
                  </Badge>
                  <span className="font-medium">vs {opponent}</span>
                  {opponentClub && (
                    <span className="text-sm text-muted-foreground">({opponentClub})</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(game.date).toLocaleDateString()}
                  </div>
                  
                  {game.time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {game.time}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {venue}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium">Round {game.round}</div>
                <Badge variant="outline" className="mt-1">
                  {game.statusDisplayName}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
