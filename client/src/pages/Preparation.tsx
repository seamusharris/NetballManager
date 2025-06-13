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
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorDisplay } from '@/components/ui/error-display';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { 
  Trophy, Target, TrendingUp, Users, CheckCircle, Clock, 
  AlertTriangle, Lightbulb, ChevronRight, ArrowRight, 
  RotateCcw, Zap, Play, Save, Calendar, MapPin, Copy
} from 'lucide-react';
import { 
  Game, GameStat, Player, PlayerAvailability, 
  Position, NETBALL_POSITIONS 
} from '@/shared/api-types';

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
}

const POSITIONS_ORDER: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

export default function Preparation() {
  const { currentClubId, currentTeamId } = useClub();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [selectedOpponent, setSelectedOpponent] = useState<{ teamId: number; teamName: string; clubName: string; } | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [availabilityData, setAvailabilityData] = useState<Record<number, 'available' | 'unavailable' | 'maybe'>>({});
  const [activeTab, setActiveTab] = useState('opponent');
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [isLoadingTeamPlayers, setIsLoadingTeamPlayers] = useState(false);

  // Progress tracking
  const preparationSteps: PreparationStep[] = [
    { id: 'opponent', title: 'Select Opponent', completed: !!selectedOpponent },
    { id: 'availability', title: 'Set Player Availability', completed: Object.keys(availabilityData).length > 0 },
    { id: 'recommendations', title: 'Review Recommendations', completed: false, optional: true },
    { id: 'roster', title: 'Apply to Roster', completed: false, optional: true }
  ];

  const completedSteps = preparationSteps.filter(step => step.completed).length;
  const totalSteps = preparationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONS BEFORE HOOKS
  
  // Optimized data fetching with error boundaries
  const { data: games, isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ['games', currentClubId, currentTeamId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId && !!currentTeamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: players, isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['players', currentClubId],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClubId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: gameStats, isLoading: statsLoading } = useQuery({
    queryKey: ['game-stats-batch', selectedOpponent?.teamId],
    queryFn: async () => {
      if (!games || !selectedOpponent) return {};

      const opponentGames = games.filter(game => 
        (game.homeTeamId === currentTeamId && game.awayTeamId === selectedOpponent.teamId) ||
        (game.awayTeamId === currentTeamId && game.homeTeamId === selectedOpponent.teamId)
      );

      if (opponentGames.length === 0) return {};

      const gameIds = opponentGames.map(g => g.id);
      return apiClient.post('/api/games/stats/batch', { gameIds });
    },
    enabled: !!games && !!selectedOpponent,
    staleTime: 5 * 60 * 1000,
  });

  // Player availability mutation
  const saveAvailabilityMutation = useMutation({
    mutationFn: async (availabilityUpdate: { gameId: number; playerId: number; status: string }) => {
      return apiClient.post('/api/player-availability', availabilityUpdate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-availability'] });
    },
  });

  // Load team players for the current team
  useEffect(() => {
    const loadTeamPlayers = async () => {
      if (!currentTeamId) {
        setTeamPlayers([]);
        return;
      }

      setIsLoadingTeamPlayers(true);
      try {
        const response = await apiClient.get(`/api/teams/${currentTeamId}/players`);
        console.log(`Loaded ${response.length} team players for team ${currentTeamId}`);
        setTeamPlayers(response);
      } catch (error) {
        console.error('Error loading team players:', error);
        // Fallback to all club players if team players can't be loaded
        setTeamPlayers(players || []);
      } finally {
        setIsLoadingTeamPlayers(false);
      }
    };

    loadTeamPlayers();
  }, [currentTeamId, players]);

  // Get unique opponents from games
  const opponents = useMemo(() => {
    if (!games) return [];

    const opponentMap = new Map();

    games.forEach(game => {
      if (game.homeTeamId === currentTeamId && game.awayTeamId) {
        opponentMap.set(game.awayTeamId, {
          teamId: game.awayTeamId,
          teamName: game.awayTeamName,
          clubName: game.awayClubName
        });
      } else if (game.awayTeamId === currentTeamId && game.homeTeamId) {
        opponentMap.set(game.homeTeamId, {
          teamId: game.homeTeamId,
          teamName: game.homeTeamName,
          clubName: game.homeClubName
        });
      }
    });

    return Array.from(opponentMap.values());
  }, [games, currentTeamId]);

  // Generate opponent analysis
  const opponentAnalysis = useMemo(() => {
    if (!games || !gameStats || !selectedOpponent) return null;

    const opponentGames = games.filter(game => 
      (game.homeTeamId === currentTeamId && game.awayTeamId === selectedOpponent.teamId) ||
      (game.awayTeamId === currentTeamId && game.homeTeamId === selectedOpponent.teamId)
    );

    if (opponentGames.length === 0) return null;

    let wins = 0;
    let totalOurScore = 0;
    let totalTheirScore = 0;
    const quarterPerformance = { 1: { for: 0, against: 0 }, 2: { for: 0, against: 0 }, 3: { for: 0, against: 0 }, 4: { for: 0, against: 0 } };

    opponentGames.forEach(game => {
      const stats = gameStats[game.id] || [];
      const ourScore = stats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const theirScore = stats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

      if (ourScore > theirScore) wins++;
      totalOurScore += ourScore;
      totalTheirScore += theirScore;

      // Quarter analysis
      [1, 2, 3, 4].forEach(quarter => {
        const quarterStats = stats.filter(s => s.quarter === quarter);
        const quarterFor = quarterStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0);
        const quarterAgainst = quarterStats.reduce((sum, s) => sum + (s.goalsAgainst || 0), 0);
        quarterPerformance[quarter].for += quarterFor;
        quarterPerformance[quarter].against += quarterAgainst;
      });
    });

    const winRate = (wins / opponentGames.length) * 100;
    const avgOurScore = totalOurScore / opponentGames.length;
    const avgTheirScore = totalTheirScore / opponentGames.length;

    return {
      gamesPlayed: opponentGames.length,
      winRate,
      avgOurScore: Math.round(avgOurScore * 10) / 10,
      avgTheirScore: Math.round(avgTheirScore * 10) / 10,
      quarterPerformance,
      confidence: opponentGames.length >= 3 ? 'high' : opponentGames.length >= 1 ? 'medium' : 'low'
    };
  }, [games, gameStats, selectedOpponent, currentTeamId]);

  // Generate player recommendations
  const playerRecommendations = useMemo((): PlayerRecommendation[] => {
    if (!teamPlayers || !gameStats || !selectedOpponent) return [];

    const availablePlayers = teamPlayers.filter(p => 
      availabilityData[p.id] === 'available' || 
      (Object.keys(availabilityData).length === 0) // If no availability set, consider all available
    );

    return POSITIONS_ORDER.map(position => {
      const positionPlayers = availablePlayers.filter(p => 
        p.positionPreferences?.includes(position)
      );

      const playersWithStats = positionPlayers.map(player => {
        const playerStats = Object.values(gameStats).flat().filter(stat => 
          stat.position === position && stat.teamId === currentTeamId
        );

        const gamesInPosition = playerStats.length;
        const avgRating = gamesInPosition > 0 
          ? playerStats.reduce((sum, stat) => sum + (stat.rating || 0), 0) / gamesInPosition 
          : 0;

        // Calculate confidence based on data availability
        let confidence = 0.5; // Base confidence
        if (gamesInPosition >= 5) confidence += 0.3;
        else if (gamesInPosition >= 2) confidence += 0.2;
        else if (gamesInPosition >= 1) confidence += 0.1;

        if (player.positionPreferences?.[0] === position) confidence += 0.2; // Preferred position
        if (avgRating >= 7) confidence += 0.2;
        else if (avgRating >= 5) confidence += 0.1;

        const reason = gamesInPosition > 0 
          ? `Avg rating: ${avgRating.toFixed(1)} (${gamesInPosition} games)`
          : `Preferred position, no recent stats`;

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
        players: playersWithStats.slice(0, 3) // Top 3 recommendations
      };
    });
  }, [players, gameStats, selectedOpponent, availabilityData, currentTeamId]);

  // Quick actions (defined after hooks)
  const handleSetAllAvailable = () => {
    if (!teamPlayers) return;
    const allAvailable = teamPlayers.reduce((acc, player) => {
      acc[player.id] = 'available';
      return acc;
    }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
    setAvailabilityData(allAvailable);
  };

  const handleUseLastGameAvailability = async () => {
    if (!games || !currentTeamId) return;

    const lastGame = games
      .filter(g => g.homeTeamId === currentTeamId || g.awayTeamId === currentTeamId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (lastGame) {
      try {
        const lastAvailability = await apiClient.get(`/api/games/${lastGame.id}/availability`);
        const availabilityMap = lastAvailability.reduce((acc, avail) => {
          acc[avail.playerId] = avail.status;
          return acc;
        }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
        setAvailabilityData(availabilityMap);
      } catch (error) {
        console.error('Failed to load last game availability:', error);
      }
    }
  };

  // NOW CONDITIONAL LOGIC AFTER ALL HOOKS
  
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

  return (
    <PageTemplate 
      title="Game Preparation" 
      icon={Target}
      description="Prepare your team for the upcoming game with AI-powered recommendations"
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
                  {step.optional && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="opponent">Select Opponent</TabsTrigger>
            <TabsTrigger value="availability" disabled={!selectedOpponent}>
              Player Availability
            </TabsTrigger>
            <TabsTrigger value="recommendations" disabled={!selectedOpponent}>
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="apply" disabled={!selectedOpponent}>
              Apply to Roster
            </TabsTrigger>
          </TabsList>

          {/* Opponent Selection */}
          <TabsContent value="opponent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Opponent</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedOpponent?.teamId.toString() || ""} 
                  onValueChange={(value) => {
                    const opponent = opponents.find(o => o.teamId === parseInt(value));
                    setSelectedOpponent(opponent || null);
                    if (opponent) setActiveTab('availability');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an opponent team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {opponents.map(opponent => (
                      <SelectItem key={opponent.teamId} value={opponent.teamId.toString()}>
                        {opponent.teamName} ({opponent.clubName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedOpponent && opponentAnalysis && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Historical Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Games Played</span>
                        <p className="font-semibold">{opponentAnalysis.gamesPlayed}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Win Rate</span>
                        <p className="font-semibold">{opponentAnalysis.winRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Score</span>
                        <p className="font-semibold">{opponentAnalysis.avgOurScore} - {opponentAnalysis.avgTheirScore}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Data Quality</span>
                        <Badge variant={
                          opponentAnalysis.confidence === 'high' ? 'default' : 
                          opponentAnalysis.confidence === 'medium' ? 'secondary' : 'outline'
                        }>
                          {opponentAnalysis.confidence}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player Availability */}
          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Player Availability</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSetAllAvailable}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      All Available
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleUseLastGameAvailability}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Use Last Game
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="mr-1">
                    {Object.values(availabilityData).filter(status => status === 'available').length}
                  </Badge>
                  <span className="text-sm text-gray-600">Available Players</span>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(availabilityData).length === 0 && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No availability set. Players will be considered available by default for recommendations.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {teamPlayers?.map(player => {
                    const isAvailable = availabilityData[player.id] === 'available' || (!availabilityData[player.id] && Object.keys(availabilityData).length === 0);
                    const isMaybe = availabilityData[player.id] === 'maybe';
                    const isUnavailable = availabilityData[player.id] === 'unavailable';
                    const playerColor = player.avatarColor || 'bg-gray-400';
                    
                    // Convert bg-color-shade to hex for styling
                    const getColorHex = (colorClass: string) => {
                      const colorMap: Record<string, string> = {
                        'bg-red-500': '#ef4444',
                        'bg-emerald-600': '#059669',
                        'bg-teal-600': '#0d9488',
                        'bg-blue-600': '#2563eb',
                        'bg-indigo-600': '#4f46e5',
                        'bg-purple-600': '#9333ea',
                        'bg-pink-600': '#db2777',
                        'bg-pink-500': '#ec4899',
                        'bg-orange-500': '#f97316',
                        'bg-yellow-600': '#ca8a04',
                        'bg-rose-600': '#e11d48',
                        'bg-lime-600': '#65a30d',
                        'bg-sky-600': '#0284c7',
                        'bg-violet-600': '#7c3aed',
                        'bg-cyan-600': '#0891b2',
                        'bg-gray-400': '#9ca3af',
                        'bg-green-600': '#16a34a'
                      };
                      return colorMap[colorClass] || '#9ca3af';
                    };

                    const colorHex = getColorHex(playerColor);

                    return (
                      <div 
                        key={player.id}
                        className={`p-4 border rounded-lg shadow-sm transition-all ${
                          isAvailable 
                            ? "border-2 shadow" 
                            : isMaybe 
                            ? "border border-yellow-300 opacity-90"
                            : "opacity-75 border border-gray-200"
                        }`}
                        style={{
                          borderColor: isAvailable ? colorHex : isMaybe ? '#fbbf24' : '',
                          backgroundColor: isAvailable ? `${colorHex}10` : isMaybe ? '#fbbf2410' : ''
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${playerColor}`}
                            >
                              <span className="font-semibold">
                                {player.firstName?.[0]}{player.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{player.displayName}</div>
                              {player.positionPreferences && player.positionPreferences.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  {player.positionPreferences.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={availabilityData[player.id] || "available"}
                              onValueChange={(value) => 
                                setAvailabilityData(prev => ({ ...prev, [player.id]: value as any }))
                              }
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="maybe">Maybe</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab('opponent')}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveTab('recommendations')}>
                    View Recommendations
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-4">
            {statsLoading ? (
              <LoadingState message="Analyzing player performance..." />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Position Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {playerRecommendations.map(rec => (
                        <div key={rec.position} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3">{rec.position}</h4>
                          {rec.players.length === 0 ? (
                            <p className="text-gray-500 text-sm">No available players for this position</p>
                          ) : (
                            <div className="space-y-2">
                              {rec.players.map((playerRec, index) => (
                                <div key={playerRec.player.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                  <Badge variant={index === 0 ? "default" : "secondary"}>
                                    #{index + 1}
                                  </Badge>
                                  <PlayerAvatar player={playerRec.player} size="sm" />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{playerRec.player.displayName}</p>
                                    <p className="text-xs text-gray-600">{playerRec.reason}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs font-medium">
                                      {Math.round(playerRec.confidence * 100)}% confidence
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab('availability')}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveTab('apply')}>
                    Apply to Roster
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Apply to Roster */}
          <TabsContent value="apply" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Apply Recommendations to Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Select an upcoming game to apply these recommendations to your roster.
                    </AlertDescription>
                  </Alert>

                  {/* Game Selection */}
                  <div className="grid gap-4">
                    {games
                      ?.filter(game => 
                        !game.statusIsCompleted && 
                        ((game.homeTeamId === currentTeamId && game.awayTeamId === selectedOpponent?.teamId) ||
                         (game.awayTeamId === currentTeamId && game.homeTeamId === selectedOpponent?.teamId))
                      )
                      .map(game => (
                        <div 
                          key={game.id} 
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedGameId === game.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedGameId(game.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {game.homeTeamName} vs {game.awayTeamName}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(game.date).toLocaleDateString()}</span>
                                </span>
                                <span>{game.time}</span>
                                {game.venue && (
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{game.venue}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <Checkbox checked={selectedGameId === game.id} />
                          </div>
                        </div>
                      ))}
                  </div>

                  {selectedGameId && (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => navigate(`/roster/${selectedGameId}`)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Open Roster Manager
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // Copy recommendations to clipboard or save as draft
                          console.log('Save recommendations as draft');
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}