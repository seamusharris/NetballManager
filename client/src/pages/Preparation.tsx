import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorDisplay } from '@/components/ui/error-display';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { PlayerAvailabilitySelector } from '@/components/ui/player-availability-selector';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { CourtDisplay } from '@/components/ui/court-display';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { 
  Trophy, Target, TrendingUp, Users, CheckCircle, Clock, 
  AlertTriangle, Lightbulb, ChevronRight, ArrowRight, 
  RotateCcw, Zap, Play, Save, Calendar, MapPin, Copy, FileText
} from 'lucide-react';
import { 
  Game, GameStat, Player, PlayerAvailability, 
  Position, NETBALL_POSITIONS 
} from '@/shared/api-types';
import { cn, getWinLoseLabel } from "@/lib/utils";

interface PreparationStep {
  id: string;
  title: string;
  completed: boolean;
  optional?: boolean;
}

interface PlayerRecommendation {
  position: Position;
  players: Array<{
    player: Player;
    confidence: number;
    reason: string;
    avgRating?: number;
    gamesInPosition?: number;
    vsOpponentRecord?: { played: number; won: number; };
  }>;
}

interface LineupRecommendation {
  id: string;
  type: 'team-specific' | 'general';
  formation: Record<Position, Player>;
  confidence: number;
  effectiveness: number;
  reasoning: string[];
  gamesUsed?: number;
  winRate?: number;
  averageGoalsFor?: number;
  averageGoalsAgainst?: number;
}

const POSITIONS_ORDER: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

export default function Preparation() {
  const { currentClubId, currentTeamId } = useClub();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [availabilityData, setAvailabilityData] = useState<Record<number, 'available' | 'unavailable' | 'maybe'>>({});
  const [selectedLineup, setSelectedLineup] = useState<Record<Position, Player | null>>({
    GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
  });
  const [activeTab, setActiveTab] = useState('game');
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [isLoadingTeamPlayers, setIsLoadingTeamPlayers] = useState(false);

  // Progress tracking
  const preparationSteps: PreparationStep[] = [
    { id: 'game', title: 'Select Game', completed: !!selectedGameId },
    { id: 'availability', title: 'Set Player Availability', completed: Object.keys(availabilityData).length > 0 },
    { id: 'lineup', title: 'Select Starting Lineup', completed: Object.values(selectedLineup).every(p => p !== null) },
    { id: 'apply', title: 'Apply to Roster', completed: false }
  ];

  const completedSteps = preparationSteps.filter(step => step.completed).length;
  const totalSteps = preparationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Data fetching
  const { data: games, isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ['games', currentClubId, currentTeamId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId && !!currentTeamId,
    staleTime: 2 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: players, isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['players', currentClubId],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClubId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: gameStats, isLoading: statsLoading } = useQuery({
    queryKey: ['game-stats-batch', selectedGameId],
    queryFn: async () => {
      if (!games || !selectedGameId) return {};

      const selectedGame = games.find(game => game.id === selectedGameId);
      if (!selectedGame) return {};

      const opponentTeamId = selectedGame.homeTeamId === currentTeamId 
        ? selectedGame.awayTeamId 
        : selectedGame.homeTeamId;

      if (!opponentTeamId) return {};

      // Get historical games against this opponent
      const opponentGames = games.filter(game => 
        game.statusIsCompleted &&
        ((game.homeTeamId === currentTeamId && game.awayTeamId === opponentTeamId) ||
         (game.awayTeamId === currentTeamId && game.homeTeamId === opponentTeamId))
      );

      if (opponentGames.length === 0) return {};

      const gameIds = opponentGames.map(g => g.id);
      return apiClient.post('/api/games/stats/batch', { gameIds });
    },
    enabled: !!games && !!selectedGameId && !!currentTeamId,
    staleTime: 5 * 60 * 1000,
  });

  // Load team players and set default availability
  useEffect(() => {
    const loadTeamPlayers = async () => {
      if (!currentTeamId) {
        setTeamPlayers([]);
        return;
      }

      setIsLoadingTeamPlayers(true);
      try {
        const response = await apiClient.get(`/api/teams/${currentTeamId}/players`);
        setTeamPlayers(response);

        // Set all players as available by default
        const defaultAvailability = response.reduce((acc, player) => {
          acc[player.id] = 'available';
          return acc;
        }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
        setAvailabilityData(defaultAvailability);
      } catch (error) {
        console.error('Error loading team players:', error);
        const fallbackPlayers = players || [];
        setTeamPlayers(fallbackPlayers);

        const defaultAvailability = fallbackPlayers.reduce((acc, player) => {
          acc[player.id] = 'available';
          return acc;
        }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
        setAvailabilityData(defaultAvailability);
      } finally {
        setIsLoadingTeamPlayers(false);
      }
    };

    loadTeamPlayers();
  }, [currentTeamId, players]);

  // Get upcoming games for this team
  const upcomingGames = useMemo(() => {
    if (!games || !currentTeamId) return [];

    return games
      .filter(game => 
        !game.statusIsCompleted && 
        (game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [games, currentTeamId]);

  // Auto-select next game if not already selected
  useEffect(() => {
    if (upcomingGames.length > 0 && !selectedGameId) {
      setSelectedGameId(upcomingGames[0].id);
    }
  }, [upcomingGames, selectedGameId]);

  // Generate player recommendations based on selected game
  const playerRecommendations = useMemo((): PlayerRecommendation[] => {
    if (!teamPlayers || !gameStats || !selectedGameId) return [];

    const availablePlayers = teamPlayers.filter(p => 
      availabilityData[p.id] === 'available'
    );

    const selectedGame = games?.find(game => game.id === selectedGameId);
    const opponentTeamId = selectedGame?.homeTeamId === currentTeamId 
      ? selectedGame?.awayTeamId 
      : selectedGame?.homeTeamId;

    return POSITIONS_ORDER.map(position => {
      const positionPlayers = availablePlayers.filter(p => 
        p.positionPreferences?.includes(position)
      );

      const playersWithStats = positionPlayers.map(player => {
        // Get stats from games against this specific opponent
        const playerStats = Object.values(gameStats).flat().filter(stat => 
          stat.playerId === player.id && stat.position === position
        );

        const gamesInPosition = playerStats.length;
        const avgRating = gamesInPosition > 0 
          ? playerStats.reduce((sum, stat) => sum + (stat.rating || 0), 0) / gamesInPosition 
          : 0;

        let confidence = 0.5;
        if (gamesInPosition >= 5) confidence += 0.3;
        else if (gamesInPosition >= 2) confidence += 0.2;
        else if (gamesInPosition >= 1) confidence += 0.1;

        if (player.positionPreferences?.[0] === position) confidence += 0.2;
        if (avgRating >= 7) confidence += 0.2;
        else if (avgRating >= 5) confidence += 0.1;

        const reason = gamesInPosition > 0 
          ? `Avg rating: ${avgRating.toFixed(1)} vs this opponent (${gamesInPosition} games)`
          : player.positionPreferences?.[0] === position
            ? 'Preferred position'
            : 'Secondary position';

        return {
          player,
          confidence: Math.min(confidence, 1),
          reason,
          avgRating: avgRating > 0 ? avgRating : undefined,
          gamesInPosition: gamesInPosition > 0 ? gamesInPosition : undefined
        };
      });

      playersWithStats.sort((a, b) => b.confidence - a.confidence);

      return {
        position,
        players: playersWithStats
      };
    });
  }, [teamPlayers, gameStats, selectedGameId, availabilityData, currentTeamId, games]);

  // Save preparation state to localStorage
  useEffect(() => {
    if (selectedGameId) {
      const state = {
        gameId: selectedGameId,
        availability: availabilityData,
        lineup: selectedLineup,
        timestamp: Date.now()
      };
      localStorage.setItem(`preparation-${currentTeamId}`, JSON.stringify(state));
    }
  }, [selectedGameId, availabilityData, selectedLineup, currentTeamId]);

  // Restore preparation state from localStorage
  useEffect(() => {
    if (currentTeamId) {
      const saved = localStorage.getItem(`preparation-${currentTeamId}`);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          // Only restore if less than 24 hours old
          if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
            if (state.gameId && upcomingGames.some(g => g.id === state.gameId)) {
              setSelectedGameId(state.gameId);
            }
            if (state.availability) {
              setAvailabilityData(state.availability);
            }
            if (state.lineup) {
              setSelectedLineup(state.lineup);
            }
          }
        } catch (error) {
          console.error('Error restoring preparation state:', error);
        }
      }
    }
  }, [currentTeamId, upcomingGames]);

  const handleApplyToRoster = () => {
    if (!selectedGameId) return;

    // Save current state before navigating
    const state = {
      gameId: selectedGameId,
      availability: availabilityData,
      lineup: selectedLineup,
      fromPreparation: true,
      timestamp: Date.now()
    };
    sessionStorage.setItem('roster-prep-state', JSON.stringify(state));

    navigate(`/roster/${selectedGameId}`);
  };

  // Loading states
  if (gamesLoading || playersLoading || isLoadingTeamPlayers) {
    return (
      <PageTemplate title="Game Preparation" icon={Target}>
        <LoadingState message="Loading preparation data..." />
      </PageTemplate>
    );
  }

  // Error states
  if (gamesError || playersError) {
    return (
      <PageTemplate title="Game Preparation" icon={Target}>
        <ErrorDisplay 
          error={gamesError || playersError} 
          retry={() => queryClient.invalidateQueries()}
        />
      </PageTemplate>
    );
  }

  const selectedGame = selectedGameId ? games?.find(g => g.id === selectedGameId) : null;
  const opponentName = selectedGame 
    ? (selectedGame.homeTeamId === currentTeamId 
        ? selectedGame.awayTeamName 
        : selectedGame.homeTeamName)
    : null;

  return (
    <PageTemplate 
      title="Game Preparation" 
      icon={Target}
      description="Prepare your team for upcoming games with player availability and lineup recommendations"
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Preparation Progress</span>
              </CardTitle>
              <Badge variant={progressPercentage === 100 ? "default" : "secondary"}>
                {completedSteps}/{totalSteps} Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {preparationSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-2 p-2 rounded ${
                    step.completed ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={`text-sm ${step.completed ? 'text-green-700' : 'text-gray-600'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="game">Select Game</TabsTrigger>
            <TabsTrigger value="availability" disabled={!selectedGameId}>
              Player Availability
            </TabsTrigger>
            <TabsTrigger value="lineup" disabled={!selectedGameId}>
              Starting Lineup
            </TabsTrigger>
            <TabsTrigger value="apply" disabled={!selectedGameId}>
              Apply to Roster
            </TabsTrigger>
          </TabsList>

          {/* Game Selection */}
          <TabsContent value="game" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Upcoming Game</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingGames.length === 0 ? (
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      No upcoming games found for this team.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Select 
                      value={selectedGameId?.toString() || ""} 
                      onValueChange={(value) => {
                        setSelectedGameId(parseInt(value));
                        setActiveTab('availability');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an upcoming game..." />
                      </SelectTrigger>
                      <SelectContent>
                        {upcomingGames.map(game => {
                          const opponent = game.homeTeamId === currentTeamId 
                            ? game.awayTeamName 
                            : game.homeTeamName;
                          const venue = game.venue || (game.homeTeamId === currentTeamId ? 'Home' : 'Away');

                          return (
                            <SelectItem key={game.id} value={game.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <span>vs {opponent}</span>
                                <Badge variant="outline">{venue}</Badge>
                                <span className="text-gray-500">
                                  {new Date(game.date).toLocaleDateString()} {game.time}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {selectedGame && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Game Details</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Opponent</span>
                            <p className="font-semibold">{opponentName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Date & Time</span>
                            <p className="font-semibold">
                              {new Date(selectedGame.date).toLocaleDateString()} {selectedGame.time}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Venue</span>
                            <p className="font-semibold">
                              {selectedGame.venue || (selectedGame.homeTeamId === currentTeamId ? 'Home' : 'Away')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Round</span>
                            <p className="font-semibold">Round {selectedGame.round}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player Availability */}
          <TabsContent value="availability" className="space-y-4">
            <PlayerAvailabilitySelector
              players={teamPlayers}
              availabilityData={availabilityData}
              onAvailabilityChange={setAvailabilityData}
              title={`Player Availability - vs ${opponentName}`}
              showQuickActions={true}
            />

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('game')}>
                Back
              </Button>
              <Button onClick={() => setActiveTab('lineup')}>
                Choose Starting Lineup
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>

          {/* Starting Lineup */}
          <TabsContent value="lineup" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Position Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Position Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {playerRecommendations.map(rec => {
                      const selectedPlayer = selectedLineup[rec.position];

                      return (
                        <div key={rec.position} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{rec.position}</h4>
                            {selectedPlayer && (
                              <Badge variant="default">
                                {selectedPlayer.displayName}
                              </Badge>
                            )}
                          </div>

                          {rec.players.length === 0 ? (
                            <p className="text-gray-500 text-sm">No available players for this position</p>
                          ) : (
                            <div className="space-y-2">
                              {rec.players.slice(0, 3).map((playerRec, index) => (
                                <div 
                                  key={playerRec.player.id} 
                                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                    selectedPlayer?.id === playerRec.player.id 
                                      ? 'bg-blue-100 border border-blue-300' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedLineup(prev => ({
                                      ...prev,
                                      [rec.position]: playerRec.player
                                    }));
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                                      #{index + 1}
                                    </Badge>
                                    <PlayerAvatar player={playerRec.player} size="sm" />
                                    <div>
                                      <p className="font-medium text-sm">{playerRec.player.displayName}</p>
                                      <p className="text-xs text-gray-600">{playerRec.reason}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-500">
                                      {Math.round(playerRec.confidence * 100)}% match
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Court View */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Starting Lineup</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CourtDisplay 
                    players={selectedLineup}
                    onPlayerClick={(position) => {
                      // Clear selection for position
                      setSelectedLineup(prev => ({
                        ...prev,
                        [position]: null
                      }));
                    }}
                  />

                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      {Object.values(selectedLineup).filter(p => p !== null).length}/7 positions filled
                    </div>
                    {Object.values(selectedLineup).every(p => p !== null) && (
                      <Badge variant="default">Lineup Complete!</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('availability')}>
                Back
              </Button>
              <Button 
                onClick={() => setActiveTab('apply')}
                disabled={!Object.values(selectedLineup).every(p => p !== null)}
              >
                Apply to Roster
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>

          {/* Apply to Roster */}
          <TabsContent value="apply" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Apply to Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Play className="h-4 w-4" />
                    <AlertDescription>
                      Your preparation is complete! Apply your selections to the roster manager.
                    </AlertDescription>
                  </Alert>

                  {selectedGame && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Preparation Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Game</span>
                          <p className="font-semibold">vs {opponentName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedGame.date).toLocaleDateString()} {selectedGame.time}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Available Players</span>
                          <p className="font-semibold">
                            {Object.values(availabilityData).filter(status => status === 'available').length}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Starting Lineup</span>
                          <p className="font-semibold">
                            {Object.values(selectedLineup).filter(p => p !== null).length}/7 Complete
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleApplyToRoster}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Open Roster Manager
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('lineup')}>
                Back
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}