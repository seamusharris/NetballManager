import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  BarChart3,
  Activity
} from 'lucide-react';
import BackButton from '@/components/ui/back-button';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';

export default function GameDetails() {
  const params = useParams();
  const gameId = params.gameId ? parseInt(params.gameId) : parseInt(params.id!);
  const teamId = params.teamId ? parseInt(params.teamId) : undefined;
  const { currentClub } = useClub();

  // Fetch game details
  const { data: game, isLoading: gameLoading, error: gameError } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => apiClient.get(`/api/games/${gameId}`),
    enabled: !!gameId && !!currentClub
  });

  // Fetch game scores
  const { data: quarterScores, isLoading: scoresLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'scores'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/scores`),
    enabled: !!gameId && !!game
  });

  // Fetch game stats
  const { data: gameStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/stats`),
    enabled: !!gameId && !!game
  });

  // Fetch roster data
  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: teamId ? ['/api/teams', teamId, 'games', gameId, 'rosters'] : ['/api/games', gameId, 'rosters'],
    queryFn: () => {
      if (teamId) {
        return apiClient.get(`/api/teams/${teamId}/games/${gameId}/rosters`);
      }
      return apiClient.get(`/api/games/${gameId}/rosters`);
    },
    enabled: !!gameId
  });

  const isLoading = gameLoading || scoresLoading || statsLoading || rosterLoading;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (gameError || !game) {
    return (
      <div className="p-4">
        <div className="text-red-600">
          Error loading game details: {gameError?.message || 'Game not found'}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => window.history.back()} 
            className="text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">
              {game.homeTeamName} vs {game.awayTeamName || 'BYE'}
            </h1>
            <p className="text-muted-foreground">
              {formatDate(game.date)} at {game.time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {teamId && (
            <Button 
              variant="outline" 
              asChild
              className="bg-primary/10 border-primary/20 hover:bg-primary/20"
            >
              <Link href={`/team/${teamId}/roster/game/${gameId}`}>
                <Users className="w-4 h-4 mr-2" />
                Manage Roster
              </Link>
            </Button>
          )}
          {game.statusAllowsStatistics && (
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href={`/game/${gameId}/team/${teamId || game.homeTeamId}/stats/record`}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Live Stats
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Game Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Game Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatDate(game.date)}</p>
                <p className="text-sm text-muted-foreground">Date</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{game.time}</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{game.venue || 'TBA'}</p>
                <p className="text-sm text-muted-foreground">Venue</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg">{game.homeTeamName}</h3>
              <p className="text-sm text-muted-foreground">Home Team</p>
              <p className="text-xs text-muted-foreground mt-1">{game.homeTeamDivision}</p>
            </div>
            {game.awayTeamName && game.awayTeamName !== 'BYE' ? (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-lg">{game.awayTeamName}</h3>
                <p className="text-sm text-muted-foreground">Away Team</p>
                <p className="text-xs text-muted-foreground mt-1">{game.awayTeamDivision}</p>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">BYE</h3>
                <p className="text-sm text-muted-foreground">No opponent</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center">
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {game.statusDisplayName}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{game.statusDisplayName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Round</p>
                    <p className="font-medium">{game.round || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Season</p>
                    <p className="font-medium">{game.seasonName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inter-club</p>
                    <p className="font-medium">{game.isInterClub ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Rosters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roster && roster.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">{game.homeTeamName}</h4>
                      <div className="space-y-2">
                        {roster
                          .filter(r => r.teamId === game.homeTeamId)
                          .map((assignment, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="font-medium">{assignment.position}</span>
                              <span>{assignment.playerName || 'Not assigned'}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    {game.awayTeamName && game.awayTeamName !== 'BYE' && (
                      <div>
                        <h4 className="font-semibold mb-2">{game.awayTeamName}</h4>
                        <div className="space-y-2">
                          {roster
                            .filter(r => r.teamId === game.awayTeamId)
                            .map((assignment, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="font-medium">{assignment.position}</span>
                                <span>{assignment.playerName || 'Not assigned'}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No roster data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Game Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gameStats && gameStats.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {gameStats.filter(s => s.statType === 'goal').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {gameStats.filter(s => s.statType === 'intercept').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Intercepts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {gameStats.filter(s => s.statType === 'rebound').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Rebounds</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {gameStats.filter(s => s.statType === 'error').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No statistics recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}