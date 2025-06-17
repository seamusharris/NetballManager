import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, BarChart3, Target, Trophy, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/apiClient';
import PageTemplate from '@/components/layout/PageTemplate';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { useClub } from '@/contexts/ClubContext';

const Preparation = () => {
  const { currentTeamId } = useClub();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: () => apiClient.get('/api/players'),
  });

  const { data: allGames, isLoading: isLoadingGames } = useQuery({
    queryKey: ['games'],
    queryFn: () => apiClient.get('/api/games'),
  });

  // Get players data safely
  const playersData = Array.isArray(players) ? players : [];

  // Get games data safely
  const gamesData = Array.isArray(allGames) ? allGames : [];
  const games = currentTeamId ? gamesData.filter((game: any) => 
    game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId
  ) : [];

  // Get upcoming games
  const upcomingGames = games.filter((game: any) => 
    new Date(game.date) > new Date() && game.statusName === 'upcoming'
  ).slice(0, 3);

  // Get recent games
  const recentGames = games.filter((game: any) => 
    new Date(game.date) < new Date() && game.statusName === 'completed'
  ).slice(0, 5);

  if (isLoadingPlayers || isLoadingGames) {
    return (
      <PageTemplate title="Game Preparation">
        <div className="flex items-center justify-center p-8">
          <div>Loading...</div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Game Preparation">
      <TeamSwitcher />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Games */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingGames.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingGames.map((game: any) => (
                      <div key={game.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              vs {game.homeTeamId === currentTeamId ? game.awayTeamName : game.homeTeamName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(game.date).toLocaleDateString()} at {game.time}
                            </p>
                            {game.venue && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {game.venue}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">{game.statusDisplayName}</Badge>
                        </div>
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedGameId(game.id)}
                            variant={selectedGameId === game.id ? "default" : "outline"}
                          >
                            {selectedGameId === game.id ? "Selected" : "Select"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No upcoming games scheduled</p>
                )}
              </CardContent>
            </Card>

            {/* Team Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Team Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Players:</span>
                    <span className="font-medium">{playersData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Games Played:</span>
                    <span className="font-medium">{recentGames.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upcoming Games:</span>
                    <span className="font-medium">{upcomingGames.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Games */}
          {recentGames.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentGames.map((game: any) => (
                    <div key={game.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            vs {game.homeTeamId === currentTeamId ? game.awayTeamName : game.homeTeamName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(game.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">{game.statusDisplayName}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roster">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Roster
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playersData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playersData.map((player: any) => (
                    <div key={player.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${player.avatarColor || 'bg-blue-500'} flex items-center justify-center text-white font-medium`}>
                          {player.firstName?.[0]}{player.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{player.displayName}</p>
                          <p className="text-sm text-gray-600">
                            {player.positionPreferences?.join(', ') || 'No positions set'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No players found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Game Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedGameId ? (
                <div className="space-y-4">
                  <p className="text-lg font-medium">Analysis for Selected Game</p>
                  <p className="text-gray-600">
                    Game ID: {selectedGameId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Detailed analysis features will be added here.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a game from the Overview tab to view analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default Preparation;