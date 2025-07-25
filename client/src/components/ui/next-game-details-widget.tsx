import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, UserCheck, UserCog, MapPin, TrendingUp, Target, Trophy } from 'lucide-react';

interface NextGameDetailsWidgetProps {
  nextGame: {
    id: number;
    date: string;
    time?: string;
    homeTeam: {
      id: number;
      name: string;
    };
    awayTeam: {
      id: number;
      name: string;
    };
    round?: string;
    venue?: string;
  } | null;
  currentTeamId: number;
  onAvailabilityClick?: (gameId: number) => void;
  onRosterClick?: (gameId: number) => void;
  onTeamPlayerManagementClick?: () => void;
  className?: string;
  recentForm?: { wins: number; losses: number; draws: number };
  seasonStats?: { 
    wins: number; 
    losses: number; 
    draws: number;
    goalsFor: number; 
    goalsAgainst: number; 
    gamesPlayed: number;
    points?: number;
  };
}

export function NextGameDetailsWidget({
  nextGame,
  currentTeamId,
  onAvailabilityClick,
  onRosterClick,
  onTeamPlayerManagementClick,
  className = "",
  recentForm = { wins: 3, losses: 1, draws: 0 },
  seasonStats = { 
    wins: 6, 
    losses: 2, 
    draws: 0, 
    goalsFor: 45, 
    goalsAgainst: 32, 
    gamesPlayed: 8,
    points: 18
  }
}: NextGameDetailsWidgetProps) {
  if (!nextGame) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Next Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground text-sm">
              No upcoming games scheduled
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isHomeTeam = nextGame.homeTeam.id === currentTeamId;
  const opponent = isHomeTeam ? nextGame.awayTeam : nextGame.homeTeam;
  const isHomeGame = isHomeTeam;

  // Format date
  const gameDate = new Date(nextGame.date);
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format time if available
  const formattedTime = nextGame.time ? 
    new Date(`2000-01-01T${nextGame.time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : 'TBD';

  // Calculate season percentages
  const seasonWinRate = seasonStats.gamesPlayed > 0 ? (seasonStats.wins / seasonStats.gamesPlayed) * 100 : 0;
  const seasonGoalsPerGame = seasonStats.gamesPlayed > 0 ? (seasonStats.goalsFor / seasonStats.gamesPlayed) : 0;
  const seasonGoalsAgainstPerGame = seasonStats.gamesPlayed > 0 ? (seasonStats.goalsAgainst / seasonStats.gamesPlayed) : 0;
  const goalDifference = seasonStats.goalsFor - seasonStats.goalsAgainst;

  // Calculate recent form percentages
  const ourFormTotal = recentForm.wins + recentForm.losses + recentForm.draws;
  const ourWinRate = ourFormTotal > 0 ? (recentForm.wins / ourFormTotal) * 100 : 0;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Next Game</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
              <span>•</span>
              <Clock className="h-4 w-4" />
              <span>{formattedTime}</span>
            </div>
          </div>
          <Badge variant={isHomeGame ? "default" : "secondary"} className="text-xs">
            {isHomeGame ? 'HOME' : 'AWAY'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Game Details Box */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Team vs Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">vs {opponent.name}</h3>
              {nextGame.round && (
                <Badge variant="outline" className="text-xs">
                  Round {nextGame.round}
                </Badge>
              )}
            </div>
            {nextGame.venue && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{nextGame.venue}</span>
              </div>
            )}
            {/* Action Buttons Row: Availability & Roster */}
            <div className="flex justify-center pt-1">
              <div className="flex gap-4">
                <Button
                  onClick={() => onAvailabilityClick?.(nextGame.id)}
                  variant="outline"
                  className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 min-w-[100px] text-sm py-1"
                >
                  Availability
                </Button>
                <Button
                  onClick={() => onRosterClick?.(nextGame.id)}
                  variant="outline"
                  className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 min-w-[100px] text-sm py-1"
                >
                  Roster
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Our Season */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Our Season</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Wins</span>
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    {seasonStats.wins}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Losses</span>
                  <Badge variant="destructive" className="text-xs">
                    {seasonStats.losses}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Draws</span>
                  <Badge variant="secondary" className="text-xs">
                    {seasonStats.draws}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Win Rate: {seasonWinRate.toFixed(0)}%
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-xs">
                    <span>Goals For</span>
                    <span className="font-semibold text-green-600">{seasonStats.goalsFor}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Goals Against</span>
                    <span className="font-semibold text-red-600">{seasonStats.goalsAgainst}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Goal Diff</span>
                    <span className={cn("font-semibold", goalDifference >= 0 ? "text-green-600" : "text-red-600")}>
                      {goalDifference >= 0 ? '+' : ''}{goalDifference}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Avg: {seasonGoalsPerGame.toFixed(1)} GF, {seasonGoalsAgainstPerGame.toFixed(1)} GA
                  </div>
                  {seasonStats.points && (
                    <div className="text-xs text-muted-foreground">
                      Points: {seasonStats.points}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Form */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-sm">Recent Form</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Wins</span>
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    {recentForm.wins}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Losses</span>
                  <Badge variant="destructive" className="text-xs">
                    {recentForm.losses}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Draws</span>
                  <Badge variant="secondary" className="text-xs">
                    {recentForm.draws}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Win Rate: {ourWinRate.toFixed(0)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-3">
                <UserCog className="h-4 w-4 text-yellow-600" />
                <h4 className="font-semibold text-sm">Quick Actions</h4>
              </div>
              <Button
                onClick={() => onAvailabilityClick?.(nextGame.id)}
                variant="outline"
                className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Player Availability
              </Button>
              <Button
                onClick={() => onRosterClick?.(nextGame.id)}
                variant="outline"
                className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Users className="mr-2 h-4 w-4" />
                Game Roster
              </Button>
              <Button
                onClick={() => onTeamPlayerManagementClick?.()}
                variant="outline"
                className="w-full bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Team Player Management
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
} 