
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
    { id: 'analysis', title: 'Review Analysis', completed: false, optional: true },
    { id: 'lineups', title: 'Lineup Recommendations', completed: false, optional: true },
    { id: 'roster', title: 'Apply to Roster', completed: false, optional: true }
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

  // Load team players
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
        
        if (Object.keys(availabilityData).length === 0) {
          const defaultAvailability = response.reduce((acc, player) => {
            acc[player.id] = 'available';
            return acc;
          }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
          setAvailabilityData(defaultAvailability);
        }
      } catch (error) {
        console.error('Error loading team players:', error);
        const fallbackPlayers = players || [];
        setTeamPlayers(fallbackPlayers);
        
        if (Object.keys(availabilityData).length === 0) {
          const defaultAvailability = fallbackPlayers.reduce((acc, player) => {
            acc[player.id] = 'available';
            return acc;
          }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
          setAvailabilityData(defaultAvailability);
        }
      } finally {
        setIsLoadingTeamPlayers(false);
      }
    };

    loadTeamPlayers();
  }, [currentTeamId, players]);

  // Get unique opponents and auto-select next game opponent
  const opponents = useMemo(() => {
    if (!games) return [];

    const opponentMap = new Map();
    let nextGameOpponent: { teamId: number; teamName: string; clubName: string; } | null = null;

    // Find the next upcoming game first
    const upcomingGames = games
      .filter(game => !game.statusIsCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (upcomingGames.length > 0) {
      const nextGame = upcomingGames[0];
      if (nextGame.homeTeamId === currentTeamId && nextGame.awayTeamId) {
        nextGameOpponent = {
          teamId: nextGame.awayTeamId,
          teamName: nextGame.awayTeamName,
          clubName: nextGame.awayClubName
        };
      } else if (nextGame.awayTeamId === currentTeamId && nextGame.homeTeamId) {
        nextGameOpponent = {
          teamId: nextGame.homeTeamId,
          teamName: nextGame.homeTeamName,
          clubName: nextGame.homeClubName
        };
      }
    }

    // Get all opponents from games
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

    const opponentsList = Array.from(opponentMap.values());

    // Auto-select next game opponent if not already selected
    if (nextGameOpponent && !selectedOpponent) {
      setSelectedOpponent(nextGameOpponent);
    }

    return opponentsList;
  }, [games, currentTeamId, selectedOpponent]);

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
    const recentForm: string[] = [];

    opponentGames
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(game => {
        const stats = gameStats[game.id] || [];
        const ourScore = stats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const theirScore = stats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
        const result = getWinLoseLabel(ourScore, theirScore);

        if (result === 'Win') {
          wins++;
          recentForm.push('W');
        } else if (result === 'Loss') {
          recentForm.push('L');
        } else {
          recentForm.push('D');
        }

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
      recentForm: recentForm.slice(0, 5),
      confidence: opponentGames.length >= 3 ? 'high' : opponentGames.length >= 1 ? 'medium' : 'low',
      lastPlayed: opponentGames[0]?.date || null
    };
  }, [games, gameStats, selectedOpponent, currentTeamId]);

  // Generate player recommendations
  const playerRecommendations = useMemo((): PlayerRecommendation[] => {
    if (!teamPlayers || !gameStats || !selectedOpponent) return [];

    const availablePlayers = teamPlayers.filter(p => 
      availabilityData[p.id] === 'available' || 
      (Object.keys(availabilityData).length === 0)
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

        let confidence = 0.5;
        if (gamesInPosition >= 5) confidence += 0.3;
        else if (gamesInPosition >= 2) confidence += 0.2;
        else if (gamesInPosition >= 1) confidence += 0.1;

        if (player.positionPreferences?.[0] === position) confidence += 0.2;
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
        players: playersWithStats.slice(0, 3)
      };
    });
  }, [teamPlayers, gameStats, selectedOpponent, availabilityData, currentTeamId]);

  // Generate lineup recommendations
  const lineupRecommendations = useMemo((): LineupRecommendation[] => {
    if (!gameStats || !selectedOpponent || !teamPlayers) return [];

    const availablePlayers = teamPlayers.filter(p => 
      availabilityData[p.id] === 'available' || 
      (Object.keys(availabilityData).length === 0)
    );

    const opponentGames = games?.filter(game => 
      (game.homeTeamId === currentTeamId && game.awayTeamId === selectedOpponent.teamId) ||
      (game.awayTeamId === currentTeamId && game.homeTeamId === selectedOpponent.teamId)
    ) || [];

    const lineupMap = new Map();

    // Analyze historical lineups against this opponent
    opponentGames.forEach(game => {
      const stats = gameStats[game.id] || [];
      
      // Group stats by quarter to find quarter lineups
      const quarterData = new Map();
      stats.forEach(stat => {
        if (!quarterData.has(stat.quarter)) {
          quarterData.set(stat.quarter, []);
        }
        quarterData.get(stat.quarter).push(stat);
      });

      quarterData.forEach((quarterStats, quarter) => {
        const positionLineup = {};
        
        POSITIONS_ORDER.forEach(position => {
          const positionStat = quarterStats.find(s => s.position === position);
          if (positionStat) {
            const player = teamPlayers.find(p => p.id === positionStat.playerId);
            if (player) {
              positionLineup[position] = player;
            }
          }
        });

        if (Object.keys(positionLineup).length === 7) {
          const lineupKey = POSITIONS_ORDER.map(pos => `${pos}:${positionLineup[pos]?.id}`).join(',');
          
          if (!lineupMap.has(lineupKey)) {
            lineupMap.set(lineupKey, {
              formation: positionLineup,
              quarters: [],
              totalGoalsFor: 0,
              totalGoalsAgainst: 0,
              gamesPlayed: new Set()
            });
          }

          const lineupData = lineupMap.get(lineupKey);
          const quarterGoalsFor = quarterStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
          const quarterGoalsAgainst = quarterStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
          
          lineupData.quarters.push(quarter);
          lineupData.totalGoalsFor += quarterGoalsFor;
          lineupData.totalGoalsAgainst += quarterGoalsAgainst;
          lineupData.gamesPlayed.add(game.id);
        }
      });
    });

    // Convert to recommendations
    const recommendations: LineupRecommendation[] = [];
    lineupMap.forEach((data, lineupKey) => {
      if (data.quarters.length >= 1) {
        const avgGoalsFor = data.totalGoalsFor / data.quarters.length;
        const avgGoalsAgainst = data.totalGoalsAgainst / data.quarters.length;
        const goalDiff = avgGoalsFor - avgGoalsAgainst;
        
        let lineupWins = 0;
        data.gamesPlayed.forEach(gameId => {
          const gameStats = Object.values(gameStats[gameId] || []);
          const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
          const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
          if (ourScore > theirScore) lineupWins++;
        });
        
        const winRate = (lineupWins / data.gamesPlayed.size) * 100;
        const effectiveness = goalDiff + (winRate / 10);

        recommendations.push({
          id: lineupKey,
          type: 'team-specific',
          formation: data.formation,
          confidence: Math.min(data.quarters.length / 4, 1),
          effectiveness,
          winRate,
          averageGoalsFor: avgGoalsFor,
          averageGoalsAgainst: avgGoalsAgainst,
          gamesUsed: data.gamesPlayed.size,
          reasoning: [
            `Used in ${data.quarters.length} quarters across ${data.gamesPlayed.size} games`,
            `Win rate: ${winRate.toFixed(1)}%`,
            `Average goals for: ${avgGoalsFor.toFixed(1)}`,
            `Goal differential: ${goalDiff >= 0 ? '+' : ''}${goalDiff.toFixed(1)}`
          ]
        });
      }
    });

    recommendations.sort((a, b) => b.effectiveness - a.effectiveness);
    return recommendations.slice(0, 3);
  }, [gameStats, selectedOpponent, teamPlayers, availabilityData, games, currentTeamId]);

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
      description="Prepare your team for the upcoming game with comprehensive opponent analysis and AI-powered recommendations"
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="opponent">Select Opponent</TabsTrigger>
            <TabsTrigger value="availability" disabled={!selectedOpponent}>
              Player Availability
            </TabsTrigger>
            <TabsTrigger value="analysis" disabled={!selectedOpponent}>
              Opponent Analysis
            </TabsTrigger>
            <TabsTrigger value="lineups" disabled={!selectedOpponent}>
              Lineup Recommendations
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
                    <h4 className="font-semibold mb-2">Quick Overview</h4>
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
            <PlayerAvailabilitySelector
              players={teamPlayers}
              availabilityData={availabilityData}
              onAvailabilityChange={setAvailabilityData}
              title="Player Availability"
              showQuickActions={true}
            />

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('opponent')}>
                Back
              </Button>
              <Button onClick={() => setActiveTab('analysis')}>
                View Analysis
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>

          {/* Opponent Analysis */}
          <TabsContent value="analysis" className="space-y-4">
            {statsLoading ? (
              <LoadingState message="Analyzing opponent data..." />
            ) : opponentAnalysis ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Head-to-Head Record */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Head-to-Head Record</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Record:</span>
                          <span className="font-bold">
                            {Math.round(opponentAnalysis.gamesPlayed * opponentAnalysis.winRate / 100)}W - 
                            {opponentAnalysis.gamesPlayed - Math.round(opponentAnalysis.gamesPlayed * opponentAnalysis.winRate / 100)}L
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>Win Rate</span>
                            <span>{opponentAnalysis.winRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={opponentAnalysis.winRate} className="h-2" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span>Recent Form:</span>
                          <div className="flex gap-1">
                            {opponentAnalysis.recentForm.map((result, index) => (
                              <Badge 
                                key={index}
                                variant={result === 'W' ? 'default' : result === 'L' ? 'destructive' : 'secondary'}
                                className="text-xs w-6 h-6 p-0 flex items-center justify-center"
                              >
                                {result}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quarter Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quarter Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map(quarter => {
                          const qData = opponentAnalysis.quarterPerformance[quarter];
                          const avgFor = qData.for / opponentAnalysis.gamesPlayed;
                          const avgAgainst = qData.against / opponentAnalysis.gamesPlayed;
                          const margin = avgFor - avgAgainst;
                          
                          return (
                            <div key={quarter} className="flex items-center justify-between p-2 rounded bg-gray-50">
                              <span className="font-medium">Q{quarter}</span>
                              <span>{avgFor.toFixed(1)} - {avgAgainst.toFixed(1)}</span>
                              <span className={`font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {margin >= 0 ? '+' : ''}{margin.toFixed(1)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab('availability')}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveTab('lineups')}>
                    View Lineups
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Historical Data</h3>
                  <p className="text-gray-600">
                    No previous games found against this opponent. You can still proceed with general recommendations.
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab('lineups')}>
                    Continue to Lineups
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Lineup Recommendations */}
          <TabsContent value="lineups" className="space-y-4">
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
                    {playerRecommendations.map(rec => (
                      <div key={rec.position} className="border rounded-lg p-3">
                        <h4 className="font-semibold mb-2">{rec.position}</h4>
                        {rec.players.length === 0 ? (
                          <p className="text-gray-500 text-sm">No available players for this position</p>
                        ) : (
                          <div className="space-y-2">
                            {rec.players.slice(0, 2).map((playerRec, index) => (
                              <div key={playerRec.player.id} className="flex items-center space-x-2 text-sm">
                                <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                                  #{index + 1}
                                </Badge>
                                <PlayerAvatar player={playerRec.player} size="sm" />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{playerRec.player.displayName}</p>
                                  <p className="text-xs text-gray-600">{playerRec.reason}</p>
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

              {/* Lineup Combinations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Proven Lineups</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lineupRecommendations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No historical lineups found against this opponent.</p>
                      <p className="text-xs">Consider using the position recommendations above.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lineupRecommendations.map((lineup, index) => (
                        <div key={lineup.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline">Lineup #{index + 1}</Badge>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">
                                {lineup.winRate?.toFixed(0)}% Win Rate
                              </div>
                              <div className="text-xs text-gray-600">
                                {lineup.gamesUsed} games
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-7 gap-1 mb-3">
                            {POSITIONS_ORDER.map(position => (
                              <div key={position} className="text-center">
                                <div className="text-xs font-medium text-gray-600">{position}</div>
                                <div className="text-xs">
                                  {lineup.formation[position]?.displayName || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Avg Goals: {lineup.averageGoalsFor?.toFixed(1)}</div>
                            <div>Avg Against: {lineup.averageGoalsAgainst?.toFixed(1)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('analysis')}>
                Back
              </Button>
              <Button onClick={() => setActiveTab('apply')}>
                Apply to Roster
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
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

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('lineups')}>
                Back
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
