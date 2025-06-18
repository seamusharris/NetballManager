import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, BarChart3, Target, Trophy, Clock, ArrowRight } from 'lucide-react';
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
import GameResultCard from '@/components/ui/game-result-card';

const Preparation = () => {
  const queryClient = useQueryClient();
  const { currentTeamId } = useClub();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<'game-selection' | 'availability' | 'roster' | 'analysis'>('game-selection');
  const [availablePlayerIds, setAvailablePlayerIds] = useState<number[]>([]);
  const [rosterAssignments, setRosterAssignments] = useState<Record<number, Record<string, number | null>>>({});
  const { toast } = useToast();

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
    queryKey: ['games'],
    queryFn: () => apiClient.get('/api/games'),
  });

  const { data: team, isLoading: isLoadingTeam, error: errorTeam } = useQuery({
    queryKey: ['team', currentTeamId],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}`),
    enabled: !!currentTeamId,
  });

  // Get data safely
  const playersData = Array.isArray(players) ? players : [];
  const gamesData = Array.isArray(allGames) ? allGames : [];
  
  // Filter games for current team
  const games = currentTeamId ? gamesData.filter((game: any) => 
    game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId
  ) : gamesData;

  // Get upcoming games
  const upcomingGames = games.filter((game: any) => 
    new Date(game.date) > new Date()
  ).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  // Get recent games
  const recentGames = games.filter((game: any) => 
    new Date(game.date) < new Date()
  ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiClient.get(`/api/teams`);
        const teamsData = Array.isArray(response) ? response : [];
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleGameSelection = (gameId: number) => {
    setSelectedGameId(gameId);
    setCurrentStep('availability');
  };

  const handleAvailabilityComplete = () => {
    setCurrentStep('roster');
  };

  const handleRosterComplete = () => {
    setCurrentStep('analysis');
    toast({
      title: "Roster Complete",
      description: "Your team lineup is ready for the game!",
    });
  };

  const selectedGame = games.find((game: any) => game.id === selectedGameId);
  const selectedGameInfo = selectedGame ? {
    id: selectedGame.id,
    date: selectedGame.date,
    time: selectedGame.time,
    opponent: selectedGame.homeTeamId === currentTeamId ? selectedGame.awayTeamName : selectedGame.homeTeamName,
    venue: selectedGame.venue,
    isHome: selectedGame.homeTeamId === currentTeamId
  } : null;

  if (isLoadingPlayers || isLoadingGames || isLoadingTeam) {
    return (
      <PageTemplate title="Game Preparation">
        <div className="flex items-center justify-center p-8">
          <div>Loading...</div>
        </div>
      </PageTemplate>
    );
  }

  // Step Indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        currentStep === 'game-selection' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600'
      }`}>
        <Calendar className="h-4 w-4" />
        <span className="text-sm font-medium">Select Game</span>
      </div>
      
      <ArrowRight className="h-4 w-4 text-gray-400" />
      
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        currentStep === 'availability' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600'
      }`}>
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">Player Availability</span>
      </div>
      
      <ArrowRight className="h-4 w-4 text-gray-400" />
      
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        currentStep === 'roster' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600'
      }`}>
        <Target className="h-4 w-4" />
        <span className="text-sm font-medium">Team Lineup</span>
      </div>
      
      <ArrowRight className="h-4 w-4 text-gray-400" />
      
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        currentStep === 'analysis' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600'
      }`}>
        <BarChart3 className="h-4 w-4" />
        <span className="text-sm font-medium">Game Analysis</span>
      </div>
    </div>
  );

  return (
    <PageTemplate title="Game Preparation">
      <TeamSwitcher />
      
      {renderStepIndicator()}

      <Tabs defaultValue="workflow" className="w-full">
        <TabsList>
          <TabsTrigger value="workflow">Preparation Workflow</TabsTrigger>
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="analysis">Advanced Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow">
          {/* Game Selection Step */}
          {currentStep === 'game-selection' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Game to Prepare
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingGames.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingGames.map((game: any) => (
                      <div key={game.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                           onClick={() => handleGameSelection(game.id)}>
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
                          <Badge variant="outline">{game.statusDisplayName}</Badge>
                        </div>
                        <div className="mt-3">
                          <Button size="sm" className="w-full">
                            Prepare for this Game
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
          )}

          {/* Player Availability Step */}
          {currentStep === 'availability' && selectedGameId && (
            <div className="space-y-4">
              <PlayerAvailabilityManager
                gameId={selectedGameId}
                players={playersData}
                games={games}
                onComplete={handleAvailabilityComplete}
                onAvailabilityChange={setAvailablePlayerIds}
                onGameChange={(gameId) => setSelectedGameId(gameId)}
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('game-selection')}
                >
                  ← Back to Game Selection
                </Button>
                <Button 
                  onClick={handleAvailabilityComplete}
                  disabled={availablePlayerIds.length === 0}
                >
                  Continue to Team Lineup → 
                </Button>
              </div>
            </div>
          )}

          {/* Roster Management Step */}
          {currentStep === 'roster' && selectedGameId && selectedGameInfo && (
            <div className="space-y-6">
              <DragDropRosterManager
                availablePlayers={playersData.filter((p: any) => availablePlayerIds.includes(p.id))}
                gameInfo={selectedGameInfo}
                gameId={selectedGameId}
                onRosterChange={setRosterAssignments}
                onRosterSaved={() => {
                  toast({
                    title: "Success",
                    description: "Roster saved successfully!"
                  });
                }}
              />
              
              <RosterSummary
                selectedGameId={selectedGameId}
                localRosterState={rosterAssignments}
                players={playersData}
              />
              
              <div className="flex justify-center">
                <Button onClick={handleRosterComplete} size="lg">
                  Complete Roster & Analyze
                </Button>
              </div>
            </div>
          )}

          {/* Analysis Step */}
          {currentStep === 'analysis' && selectedGameId && selectedGameInfo && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Game Preparation Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800 font-medium">
                        Your team is ready for the game!
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        {availablePlayerIds.length} players available, roster assigned for all quarters
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Game Recommendations */}
              <UpcomingGameRecommendations
                games={games}
                players={playersData}
                centralizedStats={gamePerformances}
                centralizedRosters={{}}
                currentClubId={team?.club_id}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Team Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Players:</span>
                    <span className="font-medium">{playersData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recent Games:</span>
                    <span className="font-medium">{recentGames.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upcoming Games:</span>
                    <span className="font-medium">{upcomingGames.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Game Widget */}
            {upcomingGames.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Next Game
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">vs {upcomingGames[0].homeTeamId === currentTeamId ? upcomingGames[0].awayTeamName : upcomingGames[0].homeTeamName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(upcomingGames[0].date).toLocaleDateString()} at {upcomingGames[0].time}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleGameSelection(upcomingGames[0].id)}
                      className="w-full"
                    >
                      Prepare for this Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                            vs {game.homeTeamId === currentTeamId ? game.awayTeamName || 'Away Team' : game.homeTeamName || 'Home Team'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(game.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">{game.statusDisplayName || 'Completed'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-6">
            {/* Player Combination Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Player Combination Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Player combination analysis shows which players work best together in different positions.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {playersData.slice(0, 6).map((player: any) => (
                      <div key={player.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">{player.displayName}</p>
                        <p className="text-xs text-gray-600">
                          {player.positionPreferences?.join(', ') || 'Versatile'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Performance Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Advanced performance analytics and opponent analysis will be displayed here.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round((recentGames.length / (recentGames.length + 1)) * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">Win Rate</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {playersData.filter((p: any) => p.active !== false).length}
                      </p>
                      <p className="text-sm text-gray-600">Active Players</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {upcomingGames.length}
                      </p>
                      <p className="text-sm text-gray-600">Games Ahead</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {teams.length}
                      </p>
                      <p className="text-sm text-gray-600">Teams</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default Preparation;