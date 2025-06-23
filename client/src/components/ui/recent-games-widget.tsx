
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
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentGamesWidgetProps {
  games: any[];
  centralizedScores?: Record<string, any[]>;
  maxGames?: number;
  teamId?: number;
  clubId?: number;
  title?: string;
  className?: string;
}

export default function RecentGamesWidget({ 
  games, 
  centralizedScores = {}, 
  maxGames = 5, 
  teamId, 
  clubId, 
  title = "Recent Games",
  className 
}: RecentGamesWidgetProps) {
  // Calculate official score for a game
  const calculateOfficialScore = (game: any) => {
    const gameScores = centralizedScores[game.id] || [];
    if (gameScores.length === 0) return null;

    const teamScore = gameScores
      .filter(score => score.teamId === (teamId || game.homeTeamId))
      .reduce((sum, score) => sum + score.score, 0);

    const opponentId = teamId 
      ? (game.homeTeamId === teamId ? game.awayTeamId : game.homeTeamId)
      : game.awayTeamId;
    
    const opponentScore = gameScores
      .filter(score => score.teamId === opponentId)
      .reduce((sum, score) => sum + score.score, 0);

    return { teamScore, opponentScore };
  };

  // Get result type for styling
  const getResultType = (game: any) => {
    const scores = calculateOfficialScore(game);
    if (!scores) return 'unknown';
    
    if (scores.teamScore > scores.opponentScore) return 'win';
    if (scores.teamScore < scores.opponentScore) return 'loss';
    return 'draw';
  };

  // Get result colors
  const getResultColors = (resultType: string) => {
    switch (resultType) {
      case 'win':
        return 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'loss':
        return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'draw':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300';
    }
  };

  // Filter and sort recent completed games
  const recentGames = games
    .filter(game => {
      const isCompleted = game.statusIsCompleted && !game.isBye && game.statusName !== 'bye';
      
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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxGames);

  if (recentGames.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No recent games found</p>
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
        {recentGames.map((game) => {
          const isHome = teamId ? game.homeTeamId === teamId : true;
          const opponent = isHome ? game.awayTeamName : game.homeTeamName;
          const opponentClub = isHome ? game.awayClubCode : game.homeClubCode;
          const venue = game.venue || (isHome ? 'Home' : 'Away');
          const scores = calculateOfficialScore(game);
          const resultType = getResultType(game);
          const resultColors = getResultColors(resultType);
          
          return (
            <div
              key={game.id}
              className={cn(
                "flex items-center justify-between p-3 border rounded-lg transition-colors",
                resultColors
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={isHome ? "default" : "secondary"}>
                    {isHome ? 'Home' : 'Away'}
                  </Badge>
                  <span className="font-medium">vs {opponent}</span>
                  {opponentClub && (
                    <span className="text-sm opacity-75">({opponentClub})</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm opacity-75">
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
                {scores ? (
                  <div className="text-lg font-bold">
                    {scores.teamScore}-{scores.opponentScore}
                  </div>
                ) : (
                  <div className="text-sm opacity-75">No score</div>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="opacity-75">
                    Round {game.round}
                  </Badge>
                  <Badge 
                    variant={resultType === 'win' ? 'default' : resultType === 'loss' ? 'destructive' : 'secondary'}
                    className="uppercase text-xs"
                  >
                    {resultType === 'unknown' ? 'N/A' : resultType}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
