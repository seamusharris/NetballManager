import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, BarChart3, Target, Trophy, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import PageTemplate from '@/components/layout/PageTemplate';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { useClub } from '@/contexts/ClubContext';
import PlayerCombinationAnalysis from '@/components/dashboard/PlayerCombinationAnalysis';
import PlayerAvailabilityManager from '@/components/roster/PlayerAvailabilityManager';
import DragDropRosterManager from '@/components/roster/DragDropRosterManager';
import RosterSummary from '@/components/roster/RosterSummary';
import { useNextGame } from '@/hooks/use-next-game';
import UpcomingGameRecommendations from '@/components/dashboard/UpcomingGameRecommendations';
import { GameResultCard } from '@/components/ui/game-result-card';
import React from 'react';

const TeamDashboard = () => {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { currentTeamId } = useClub();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  // Mocked game performance data (replace with actual data fetching)
  const [gamePerformances, setGamePerformances] = useState({
    1: {
      us: { q1: '15', q2: '20', q3: '18', q4: '22' },
      them: { q1: '12', q2: '18', q3: '20', q4: '15' },
    },
  });

  const nextGame = useNextGame();

  const { data: players, isLoading: isLoadingPlayers, error: errorPlayers } = useQuery({
    queryKey: ['teamPlayers', currentTeamId],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}/players`),
    enabled: !!currentTeamId,
  });

  const { data: allGames, isLoading: isLoadingGames, error: errorGames } = useQuery({
    queryKey: ['teamGames', currentTeamId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentTeamId,
  });

  const { data: team, isLoading: isLoadingTeam, error: errorTeam } = useQuery({
    queryKey: ['team', currentTeamId],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}`),
    enabled: !!currentTeamId,
  });

  // Filter games for current team with proper type handling
  const gamesData = allGames?.data || allGames || [];
  const games = Array.isArray(gamesData) ? gamesData.filter((game: any) => 
    game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId
  ) : [];

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiClient.get(`/api/teams`);
        const teamsData = response?.data || response || [];
        setTeams(Array.isArray(teamsData) ? teamsData : []);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    if (currentTeamId) {
      queryClient.prefetchQuery({
        queryKey: ['teamPlayers', currentTeamId],
        queryFn: () => apiClient.get(`/api/teams/${currentTeamId}/players`)
      });
      queryClient.prefetchQuery({
        queryKey: ['teamGames', currentTeamId],
        queryFn: () => apiClient.get('/api/games')
      });
    }
  }, [currentTeamId, queryClient]);

  if (isLoadingPlayers || isLoadingGames || isLoadingTeam) {
    return <div>Loading...</div>;
  }

  if (errorPlayers || errorGames || errorTeam) {
    return <div>Error: {errorPlayers?.message || errorGames?.message || errorTeam?.message}</div>;
  }

  if (!currentTeamId) {
    return <div>Please select a team.</div>;
  }

  // Fetch game performance when a game is selected
  useEffect(() => {
    const fetchGamePerformance = async () => {
      if (selectedGameId) {
        // Replace with your actual API endpoint
        // const response = await apiClient.get(`/games/${selectedGameId}/performance`);
        // setGamePerformances({ ...gamePerformances, [selectedGameId]: response.data });
        // For now, using mocked data:
        setGamePerformances({
          ...gamePerformances,
          [selectedGameId]: {
            us: { q1: '15', q2: '20', q3: '18', q4: '22' },
            them: { q1: '12', q2: '18', q3: '20', q4: '15' },
          },
        });
      }
    };

    fetchGamePerformance();
  }, [selectedGameId]);

  // Find the selected game
  const selectedGame = games.find((game) => game.id === selectedGameId);

  // Get previous games (simplified - just get past games for now)
  const previousGames = games.filter((game) => 
    game.id !== selectedGameId && new Date(game.date) < new Date()
  );

  return (
    <PageTemplate title="Team Dashboard">
      <TeamSwitcher />

      <Tabs defaultValue="roster" className="w-full">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="roster">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Complete Roster Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Complete Roster Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nextGame && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Next Game: {nextGame.opponentName}</p>
                  </div>
                )}

                {/* Upcoming Game Recommendations */}
                {selectedGameId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Recommended Team Lineups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UpcomingGameRecommendations gameId={selectedGameId} />
                    </CardContent>
                  </Card>
                )}

                <div className="mb-4">
                  <RosterSummary players={Array.isArray(players?.data) ? players.data : Array.isArray(players) ? players : []} selectedGameId={selectedGameId} />
                </div>
                <div className="mb-4">
                  <PlayerAvailabilityManager players={Array.isArray(players?.data) ? players.data : Array.isArray(players) ? players : []} gameId={selectedGameId || 0} games={games} />
                </div>
                <div>
                  <DragDropRosterManager 
                    availablePlayers={Array.isArray(players?.data) ? players.data : Array.isArray(players) ? players : []}
                    gameInfo={{
                      id: selectedGameId || 0,
                      date: new Date().toISOString().split('T')[0],
                      time: '12:00',
                      opponent: 'TBD'
                    }}
                    onRosterChange={() => {}}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Player Combination Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Player Combination Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerCombinationAnalysis players={Array.isArray(players?.data) ? players.data : []} games={games} centralizedStats={{}} centralizedRosters={{}} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Game Overview and Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Game Overview and Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {games?.map((game) => (
                    <Button
                      key={game.id}
                      variant={selectedGameId === game.id ? 'secondary' : 'outline'}
                      onClick={() => setSelectedGameId(game.id)}
                      className="justify-start"
                    >
                      <div className="flex justify-between w-full">
                        <span>{game.opponentName}</span>
                        <span>{game.date}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Details and Performance */}
            {selectedGame && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Game Details and Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Quarter Performance Analysis */}
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Quarter Performance Analysis</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="text-xs font-medium text-gray-600">Team</div>
                    <div className="text-xs font-medium text-gray-600">Q1</div>
                    <div className="text-xs font-medium text-gray-600">Q2</div>
                    <div className="text-xs font-medium text-gray-600">Q3</div>
                    <div className="text-xs font-medium text-gray-600">Q4</div>

                    <div className="text-xs font-medium">{teams.find(t => t.id === currentTeamId)?.name || 'Us'}</div>
                    <div className="text-xs text-center">{gamePerformances[selectedGameId]?.us.q1 || '0.0'}</div>
                    <div className="text-xs text-center">{gamePerformances[selectedGameId]?.us.q2 || '0.0'}</div>
                    <div className="text-xs text-center">{gamePerformances[selectedGameId]?.us.q3 || '0.0'}</div>
                    <div className="text-xs text-center">{gamePerformances[selectedGameId]?.us.q4 || '0.0'}</div>

                    <div className="text-xs font-medium">{nextGame?.opponentName || 'Opponent'}</div>
                    <div className="text-xs text-center">{gamePerformances[selectedGameId]?.them.q1 || '0.0'}</div>
                    <div className="text-xs text-center">{gamePerformances[selectedGameId]?.them.q2 || '0.0'}</div>
                    <div className="text-xs text-center">{gamePerformances[selectedGameId]?.them.q3 || '0.0'}</div>
                    <div className="text-xs text-center">{gamePerformances[selectedGameId]?.them.q4 || '0.0'}</div>
                  </div>

                  {/* Head-to-Head Games */}
                  <h3 className="text-sm font-medium text-gray-600 mt-4 mb-2">Head-to-Head Games</h3>
                  <div className="grid gap-3">
                    {previousGames.length > 0 ? (
                      previousGames.map((game) => (
                        <GameResultCard 
                          key={game.id}
                          game={game}
                          teams={teams}
                          onClick={() => {}}
                          showTeamName={false}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No previous games against this opponent</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Team Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Detailed team analysis content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default TeamDashboard;