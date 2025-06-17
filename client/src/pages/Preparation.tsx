import React, { useState, useEffect, useMemo } from 'react';
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
import { PlayerBox } from '@/components/ui/player-box';
import PlayerAvailabilityManager from '@/components/roster/PlayerAvailabilityManager';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { CourtDisplay } from '@/components/ui/court-display';
import { ResultBadge } from '@/components/ui/result-badge';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { useBatchRosterData } from '@/components/statistics/hooks/useBatchRosterData';
import DragDropLineupEditor from '@/components/roster/DragDropLineupEditor';
import DragDropRosterManager from '@/components/roster/DragDropRosterManager';
import PlayerCombinationAnalysis from '@/components/dashboard/PlayerCombinationAnalysis';
import UpcomingGameRecommendations from '@/components/dashboard/UpcomingGameRecommendations';
import { 
  Trophy, Target, TrendingUp, Users, CheckCircle, Clock, 
  AlertTriangle, Lightbulb, ChevronRight, ArrowRight, 
  RotateCcw, Zap, Play, Save, Calendar, MapPin, Copy, FileText,
  BarChart3, TrendingDown, Award, Shield, Star, Eye, Brain,
  Activity, Flame, History, Search, Filter, RefreshCw, 
  Crosshair, Focus, Layers, Hash, Flag, Telescope, Check,
  Plus, Minus, ArrowUpDown, Grid3X3, Home, Plane
} from 'lucide-react';
import { cn, getWinLoseLabel, formatShortDate } from "@/lib/utils";

interface Game {
  id: number;
  date: string;
  time: string;
  round?: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeClubName?: string;
  awayClubName?: string;
  homeTeam?: { name: string; clubName: string };
  awayTeam?: { name: string; clubName: string };
  statusIsCompleted: boolean;
  statusName?: string;
  homeClubId?: number;
  awayClubId?: number;
}

interface Player {
  id: number;
  displayName: string;
  positionPreferences: string[];
}

interface Position {
  name: string;
}

interface OpponentAnalysis {
  gamesPlayed: number;
  winRate: number;
  avgOurScore: number;
  avgTheirScore: number;
  quarterPerformance: Record<number, { for: number; against: number; }>;
  recentForm: string[];
  confidence: 'high' | 'medium' | 'low';
  lastPlayed: string | null;
}

interface TeamAnalysisData {
  momentum: {
    trend: 'up' | 'down' | 'stable';
    strength: number;
    recentForm: string[];
  };
  positionEfficiency: Record<string, {
    quarter1: number;
    quarter2: number;
    quarter3: number;
    quarter4: number;
    overall: number;
  }>;
  comebackPotential: {
    deficitRecoveries: number;
    totalDeficits: number;
    recoveryRate: number;
    avgDeficitSize: number;
  };
}

const NETBALL_POSITIONS = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
const POSITIONS_ORDER = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

interface PreparationParams {
  gameId?: string;
}

export default function Preparation() {
  const { currentClubId, currentTeamId } = useClub();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Extract gameId from URL (e.g., /preparation/123)
  const gameIdFromUrl = location.split('/').pop();
  const gameIdNumber = gameIdFromUrl && !isNaN(Number(gameIdFromUrl)) ? Number(gameIdFromUrl) : null;

  // State management
  const [selectedGameId, setSelectedGameId] = useState<number | null>(gameIdNumber);
  const [activeTab, setActiveTab] = useState('overview');
  const [availabilityData, setAvailabilityData] = useState<Record<number, boolean>>({});
  const [selectedLineup, setSelectedLineup] = useState<Record<string, Player | null>>({
    GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
  });

  // Queries
  const { data: allGames = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ['/api/games', currentTeamId],
    enabled: !!currentTeamId,
    queryFn: () => {
      console.log(`Preparation: Fetching games for team ${currentTeamId} and club ${currentClubId}`);
      return apiClient.get('/api/games');
    },
    select: (data) => {
      console.log(`Preparation: Fetched ${data.length} games for team ${currentTeamId}`, data);
      return data;
    }
  });

  // Get all completed games for analysis
  const completedGames = Array.isArray(allGames) ? (allGames as Game[])
    .filter((game: Game) => game.statusIsCompleted === true) : [];

  // Filter for upcoming games (not completed) and sort by date
  const upcomingGames = Array.isArray(allGames) ? (allGames as Game[])
    .filter((game: Game) => {
      // Debug logging for each game
      console.log(`Preparation: Checking game ${game.id}:`, {
        statusIsCompleted: game.statusIsCompleted,
        statusName: game.statusName,
        date: game.date,
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
        currentTeamId
      });

      // Check if this game involves our team
      const involvesByThisTeam = game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId;

      // Check if it's not completed
      const isNotCompleted = game.statusIsCompleted !== true;

      const shouldInclude = involvesByThisTeam && isNotCompleted;

      console.log(`Preparation: Game ${game.id} - involves team: ${involvesByThisTeam}, not completed: ${isNotCompleted}, should include: ${shouldInclude}`);

      return shouldInclude;
    })
    .sort((a: Game, b: Game) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  console.log(`Preparation: Found ${upcomingGames.length} upcoming games out of ${allGames.length} total games for team ${currentTeamId}`);

  const { data: teamPlayers = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ['/api/teams', currentTeamId, 'players'],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}/players`),
    enabled: !!currentTeamId
  });

  const selectedGame = useMemo(() => {
    return upcomingGames.find((g: Game) => g.id === selectedGameId) || null;
  }, [upcomingGames, selectedGameId]);

  // Get completed games for stats
  const gameIds = completedGames.map(game => game.id);

  // Fetch batch statistics for all completed games
  const { statsMap: centralizedStats = {}, isLoading: isLoadingStats } = useBatchGameStatistics(gameIds);

  // Fetch batch roster data
  const { rostersMap: centralizedRosters = {}, isLoading: isLoadingRosters } = useBatchRosterData(gameIds);

  const opponentName = useMemo(() => {
    if (!selectedGame) return null;

    // Handle BYE games
    if (selectedGame.awayTeamName === 'Bye' || selectedGame.homeTeamName === 'Bye') {
      return 'BYE';
    }

    // Determine opponent based on which team we are
    if (selectedGame.homeTeamId === currentTeamId) {
      return selectedGame.awayTeamName || selectedGame.awayTeam?.name || 'Unknown Team';
    } else {
      return selectedGame.homeTeamName || selectedGame.homeTeam?.name || 'Unknown Team';
    }
  }, [selectedGame, currentTeamId]);

  // Calculate opponent analysis for selected game
  const opponentAnalysis = useMemo((): OpponentAnalysis | null => {
    if (!selectedGame || !opponentName || opponentName === 'BYE' || !centralizedStats) return null;

    // Find all games against this opponent
    const opponentGames = completedGames.filter(game => {
      const gameOpponent = game.homeTeamId === currentTeamId 
        ? (game.awayTeamName || game.awayTeam?.name)
        : (game.homeTeamName || game.homeTeam?.name);
      return gameOpponent === opponentName;
    });

    if (opponentGames.length === 0) return null;

    // Calculate stats
    let wins = 0;
    let totalOurScore = 0;
    let totalTheirScore = 0;
    const quarterPerformance: Record<number, { for: number; against: number; }> = {
      1: { for: 0, against: 0 },
      2: { for: 0, against: 0 },
      3: { for: 0, against: 0 },
      4: { for: 0, against: 0 }
    };
    const recentForm: string[] = [];

    const sortedGames = opponentGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedGames.forEach(game => {
      const gameStats = centralizedStats[game.id] || [];

      // Calculate team vs opponent stats from game statistics
      const ourStats = gameStats.filter(stat => stat.teamId === currentTeamId);
      const theirStats = gameStats.filter(stat => stat.teamId !== currentTeamId);

      const ourScore = ourStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const theirScore = theirStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);

      totalOurScore += ourScore;
      totalTheirScore += theirScore;

      const result = getWinLoseLabel(ourScore, theirScore);
      if (result === 'Win') {
        wins++;
        recentForm.push('W');
      } else if (result === 'Loss') {
        recentForm.push('L');
      } else {
        recentForm.push('D');
      }

      // Quarter analysis
      [1, 2, 3, 4].forEach(quarter => {
        const ourQuarterStats = ourStats.filter(s => s.quarter === quarter);
        const theirQuarterStats = theirStats.filter(s => s.quarter === quarter);

        const quarterFor = ourQuarterStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0);
        const quarterAgainst = theirQuarterStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0);

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
      lastPlayed: sortedGames[0]?.date || null
    };
  }, [selectedGame, opponentName, completedGames, centralizedStats, currentTeamId]);

  // Calculate team analysis data
  const teamAnalysis = useMemo((): TeamAnalysisData => {
    if (!centralizedStats || Object.keys(centralizedStats).length === 0 || completedGames.length === 0) {
      return {
        momentum: { trend: 'stable', strength: 0, recentForm: [] },
        positionEfficiency: {},
        comebackPotential: { deficitRecoveries: 0, totalDeficits: 0, recoveryRate: 0, avgDeficitSize: 0 }
      };
    }

    // 1. Performance Momentum Analysis
    const recentGames = [...completedGames]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-5); // Last 5 games

    const recentResults = recentGames.map(game => {
      const gameStats = centralizedStats[game.id] || [];
      const teamStats = gameStats.filter(stat => stat.teamId === currentTeamId);
      const teamScore = teamStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = teamStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      return getWinLoseLabel(teamScore, opponentScore);
    });

    const calculateMomentum = (results: string[]) => {
      if (results.length === 0) return { trend: 'stable' as const, strength: 0, recentForm: [] };

      const winWeight = 3;
      const drawWeight = 1;
      const lossWeight = -2;

      let momentum = 0;
      results.forEach((result, index) => {
        const recencyWeight = (index + 1) / results.length;
        let baseScore = 0;

        if (result === 'Win') baseScore = winWeight;
        else if (result === 'Draw') baseScore = drawWeight;
        else if (result === 'Loss') baseScore = lossWeight;

        momentum += baseScore * recencyWeight;
      });

      const normalizedMomentum = momentum / results.length;
      const trend = normalizedMomentum > 0.5 ? 'up' : normalizedMomentum < -0.5 ? 'down' : 'stable';

      return {
        trend,
        strength: Math.abs(normalizedMomentum),
        recentForm: results
      };
    };

    const momentum = calculateMomentum(recentResults);

    // 2. Position Efficiency Analysis
    const positionStats: Record<string, any> = {};
    const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];

    positions.forEach(position => {
      positionStats[position] = {
        quarter1: 0, quarter2: 0, quarter3: 0, quarter4: 0,
        quarter1Count: 0, quarter2Count: 0, quarter3Count: 0, quarter4Count: 0
      };
    });

    Object.values(centralizedStats).forEach(gameStats => {
      gameStats.forEach(stat => {
        if (stat.position && positions.includes(stat.position) && stat.teamId === currentTeamId) {
          const quarter = `quarter${stat.quarter}`;
          const countKey = `${quarter}Count`;

          if (positionStats[stat.position][quarter] !== undefined) {
            const efficiency = (stat.goalsFor || 0) - (stat.goalsAgainst || 0);
            positionStats[stat.position][quarter] += efficiency;
            positionStats[stat.position][countKey]++;
          }
        }
      });
    });

    const positionEfficiency: Record<string, any> = {};
    positions.forEach(position => {
      const stats = positionStats[position];
      positionEfficiency[position] = {
        quarter1: stats.quarter1Count > 0 ? stats.quarter1 / stats.quarter1Count : 0,
        quarter2: stats.quarter2Count > 0 ? stats.quarter2 / stats.quarter2Count : 0,
        quarter3: stats.quarter3Count > 0 ? stats.quarter3 / stats.quarter3Count : 0,
        quarter4: stats.quarter4Count > 0 ? stats.quarter4 / stats.quarter4Count : 0,
        overall: 0
      };

      const totalQuarters = [1, 2, 3, 4].filter(q => stats[`quarter${q}Count`] > 0).length;
      if (totalQuarters > 0) {
        positionEfficiency[position].overall = 
          (positionEfficiency[position].quarter1 + 
           positionEfficiency[position].quarter2 + 
           positionEfficiency[position].quarter3 + 
           positionEfficiency[position].quarter4) / totalQuarters;
      }
    });

    // 3. Comeback Potential Analysis
    let deficitRecoveries = 0;
    let totalDeficits = 0;
    let totalDeficitSize = 0;

    completedGames.forEach(game => {
      const gameStats = centralizedStats[game.id] || [];
      const teamStats = gameStats.filter(stat => stat.teamId === currentTeamId);
      const quarterScores = { team: [0, 0, 0, 0], opponent: [0, 0, 0, 0] };

      teamStats.forEach(stat => {
        if (stat.quarter >= 1 && stat.quarter <= 4) {
          quarterScores.team[stat.quarter - 1] += stat.goalsFor || 0;
          quarterScores.opponent[stat.quarter - 1] += stat.goalsAgainst || 0;
        }
      });

      for (let q = 0; q < 3; q++) {
        const teamRunning = quarterScores.team.slice(0, q + 1).reduce((a, b) => a + b, 0);
        const opponentRunning = quarterScores.opponent.slice(0, q + 1).reduce((a, b) => a + b, 0);

        if (teamRunning < opponentRunning) {
          totalDeficits++;
          totalDeficitSize += (opponentRunning - teamRunning);

          const finalTeam = quarterScores.team.reduce((a, b) => a + b, 0);
          const finalOpponent = quarterScores.opponent.reduce((a, b) => a + b, 0);

          if (finalTeam >= finalOpponent) {
            deficitRecoveries++;
          }
        }
      }
    });

    const comebackPotential = {
      deficitRecoveries,
      totalDeficits,
      recoveryRate: totalDeficits > 0 ? (deficitRecoveries / totalDeficits) * 100 : 0,
      avgDeficitSize: totalDeficits > 0 ? totalDeficitSize / totalDeficits : 0
    };

    return {
      momentum,
      positionEfficiency,
      comebackPotential
    };
  }, [centralizedStats, completedGames, currentTeamId]);

  // Handle applying selections to roster
  const handleApplyToRoster = () => {
    if (selectedGame && Object.values(selectedLineup).every(p => p !== null)) {
      navigate(`/roster/${selectedGame.id}`);
    }
  };

  const [availablePlayerIds, setAvailablePlayerIds] = useState<number[]>([]);

  // Auto-select game from URL parameter
  useEffect(() => {
    if (gameIdNumber && upcomingGames.length > 0) {
      const gameExists = upcomingGames.find(game => game.id === gameIdNumber);
      if (gameExists) {
        setSelectedGameId(gameIdNumber);
      }
    } else if (upcomingGames.length > 0 && !selectedGameId) {
      // Fallback to first upcoming game if no URL param
      setSelectedGameId(upcomingGames[0].id);
    }
  }, [gameIdNumber, upcomingGames, selectedGameId]);

  if (gamesLoading || playersLoading) {
    return (
      <PageTemplate title="Team Preparation">
        <LoadingState />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Team Preparation">
      <div className="space-y-6">
        {/* Game Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Upcoming Game
            </CardTitle>
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
              <Select 
                value={selectedGameId?.toString() || ""} 
                onValueChange={(value) => setSelectedGameId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a game to prepare for..." />
                </SelectTrigger>
                <SelectContent>
                  {upcomingGames.map((game: Game) => {
                    const opponent = game.homeTeamId === currentTeamId 
                      ? (game.awayTeamName || game.awayTeam?.name || 'Unknown Team')
                      : (game.homeTeamName || game.homeTeam?.name || 'Unknown Team');

                    return (
                      <SelectItem key={game.id} value={game.id.toString()}>
                        {new Date(game.date).toLocaleDateString()} - vs {opponent}
                        {game.round && ` (Round ${game.round})`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {selectedGame && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="opponent">Opponent</TabsTrigger>
              <TabsTrigger value="teamanalysis">Team Analysis</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="lineup">Lineup</TabsTrigger>
              <TabsTrigger value="roster">Apply</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Game Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Match Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{new Date(selectedGame.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span>{selectedGame.time}</span>
                        </div>
                        {selectedGame.round && (
                          <div className="flex justify-between">
                            <span>Round:</span>
                            <span>{selectedGame.round}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Venue:</span>
                          <span className="flex items-center gap-1">
                            {selectedGame.homeTeamId === currentTeamId ? (
                              <>
                                <Home className="h-3 w-3" />
                                Home
                              </>
                            ) : (
                              <>
                                <Plane className="h-3 w-3" />
                                Away
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Opponent:</span>
                          <span className="font-medium">{opponentName || 'Unknown Opponent'}</span>
                        </div>
                        {opponentName !== 'BYE' && opponentName !== 'Unknown Opponent' && (
                          <div className="flex justify-between">
                            <span>Opponent Club:</span>
                            <span className="text-xs">
                              {selectedGame.homeTeamId === currentTeamId 
                                ? (selectedGame.awayClubName || 'Unknown Club')
                                : (selectedGame.homeClubName || 'Unknown Club')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Preparation Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Player Availability</span>
                          <Badge variant="outline">
                            {Object.values(availabilityData).filter(status => status === true).length}/{Array.isArray(teamPlayers) ? teamPlayers.length : 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Starting Lineup</span>
                          <Badge variant="outline">
                            {Object.values(selectedLineup).filter(p => p !== null).length}/7
                          </Badge>
                        </div>
                        {opponentAnalysis && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Historical Record</span>
                            <Badge variant={opponentAnalysis.winRate >= 60 ? "default" : opponentAnalysis.winRate >= 40 ? "secondary" : "destructive"}>
                              {opponentAnalysis.winRate.toFixed(0)}% win rate
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick insights */}
              {(opponentAnalysis || teamAnalysis) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opponentAnalysis && (
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4" />
                          vs {opponentName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-700">
                            {opponentAnalysis.winRate.toFixed(0)}%
                          </div>
                          <div className="text-sm text-blue-600">
                            Win Rate ({opponentAnalysis.gamesPlayed} games)
                          </div>
                          <div className="flex justify-center gap-1 mt-2">
                            {opponentAnalysis.recentForm.map((result, index) => (
                              <div
                                key={index}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                  result === 'W' ? 'bg-green-500' :
                                  result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              >
                                {result}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {teamAnalysis.momentum.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : teamAnalysis.momentum.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <Zap className="h-4 w-4 text-yellow-600" />
                        )}
                        Team Momentum
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          teamAnalysis.momentum.trend === 'up' ? 'text-green-700' :
                          teamAnalysis.momentum.trend === 'down' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {teamAnalysis.momentum.trend.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Strength: {teamAnalysis.momentum.strength.toFixed(1)}
                        </div>
                        <div className="flex justify-center gap-1 mt-2">
                          {teamAnalysis.momentum.recentForm.map((result, index) => (
                            <div
                              key={index}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                result === 'Win' ? 'bg-green-500' :
                                result === 'Draw' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            >
                              {result[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Head-to-Head Games */}
              {selectedGame && opponentName && opponentName !== 'BYE' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Head-to-Head Games vs {opponentName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Find all games against this opponent
                      const opponentGames = allGames.filter(game => {
                        const gameOpponent = game.homeTeamId === currentTeamId 
                          ? (game.awayTeamName || game.awayTeam?.name)
                          : (game.homeTeamName || game.homeTeam?.name);
                        return gameOpponent === opponentName;
                      });

                      const playedGames = opponentGames.filter(g => g.statusIsCompleted === true);
                      const upcomingOpponentGames = opponentGames.filter(g => g.statusIsCompleted !== true);

                      if (opponentGames.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No previous or upcoming games found against {opponentName}</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-6">
                          {/* Played Games */}
                          {playedGames.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3 text-green-700">
                                Previous Games ({playedGames.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {playedGames
                                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                  .slice(0, 6)
                                  .map(game => {
                                    const gameStats = centralizedStats[game.id] || [];
                                    const ourStats = gameStats.filter(stat => stat.teamId === currentTeamId);
                                    const theirStats = gameStats.filter(stat => stat.teamId !== currentTeamId);

                                    const ourScore = ourStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
                                    const theirScore = theirStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
                                    const result = getWinLoseLabel(ourScore, theirScore);

                                    return (
                                      <div key={game.id} className="border rounded-lg p-3 bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-sm font-medium">
                                            Round {game.round}
                                          </span>
                                          <Badge variant={result === 'Win' ? 'default' : result === 'Draw' ? 'secondary' : 'destructive'}>
                                            {result}
                                          </Badge>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-lg font-bold">
                                            {ourScore} - {theirScore}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {formatShortDate(game.date)}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* Upcoming Games */}
                          {upcomingOpponentGames.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3 text-blue-700">
                                Upcoming Games ({upcomingOpponentGames.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {upcomingOpponentGames
                                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                  .map(game => (
                                    <div key={game.id} className={`border rounded-lg p-3 ${
                                      game.id === selectedGameId ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                                    }`}>
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">
                                          Round {game.round}
                                        </span>
                                        {game.id === selectedGameId && (
                                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                                            Selected
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-center">
                                        <div className="text-sm font-medium">
                                          {game.homeTeamId === currentTeamId ? 'vs' : '@'} {opponentName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {formatShortDate(game.date)} {game.time}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Quarter-by-Quarter Analysis */}
                          {playedGames.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3 text-purple-700">
                                Quarter Performance Analysis vs {opponentName}
                              </h4>
                              <div className="bg-purple-50 rounded-lg p-4">
                                <div className="grid grid-cols-5 gap-2 mb-2 text-sm font-medium text-gray-600">
                                  <div></div>
                                  <div className="text-center">Q1</div>
                                  <div className="text-center">Q2</div>
                                  <div className="text-center">Q3</div>
                                  <div className="text-center">Q4</div>
                                </div>
                                {(() => {
                                  const quarterTotals = { us: [0, 0, 0, 0], them: [0, 0, 0, 0] };
                                  let gameCount = 0;

                                  playedGames.forEach(game => {
                                    const gameStats = centralizedStats[game.id] || [];
                                    const ourStats = gameStats.filter(stat => stat.teamId === currentTeamId);
                                    const theirStats = gameStats.filter(stat => stat.teamId !== currentTeamId);

                                    [1, 2, 3, 4].forEach(quarter => {
                                      const ourQuarterStats = ourStats.filter(s => s.quarter === quarter);
                                      const theirQuarterStats = theirStats.filter(s => s.quarter === quarter);

                                      const ourQuarterScore = ourQuarterStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0);
                                      const theirQuarterScore = theirQuarterStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0);

                                      quarterTotals.us[quarter - 1] += ourQuarterScore;
                                      quarterTotals.them[quarter - 1] += theirQuarterScore;
                                    });
                                    gameCount++;
                                  });

                                  return (
                                    <>
                                      <div className="grid grid-cols-5 gap-2 mb-1">
                                        <div className="text-sm font-medium">Us</div>
                                        {quarterTotals.us.map((total, index) => (
                                          <div key={index} className="text-center p-2 bg-blue-100 rounded text-sm font-bold">
                                            {gameCount > 0 ? (total / gameCount).toFixed(1) : '0.0'}
                                          </div>
                                        ))}
                                      </div>
                                      <div className="grid grid-cols-5 gap-2 mb-2">
                                        <div className="text-sm font-medium">Them</div>
                                        {quarterTotals.them.map((total, index) => (
                                          <div key={index} className="text-center p-2 bg-red-100 rounded text-sm font-bold">
                                            {gameCount > 0 ? (total / gameCount).toFixed(1) : '0.0'}
                                          </div>
                                        ))}
                                      </div>
                                      <div className="grid grid-cols-5 gap-2">
                                        <div className="text-sm font-medium">Diff</div>
                                        {quarterTotals.us.map((usTotal, index) => {
                                          const diff = gameCount > 0 ? (usTotal - quarterTotals.them[index]) / gameCount : 0;
                                          return (
                                            <div key={index} className={`text-center p-2 rounded text-sm font-bold ${
                                              diff > 0 ? 'bg-green-100 text-green-800' :
                                              diff < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                                            }`}>
                                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Opponent Analysis Tab */}
            <TabsContent value="opponent" className="space-y-4">
              {opponentName === 'BYE' ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">BYE Round</h3>
                    <p className="text-gray-600">
                      This is a bye round. Use this time for training and preparation.
                    </p>
                  </CardContent>
                </Card>
              ) : !opponentAnalysis ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Previous Matchups</h3>
                    <p className="text-gray-600">
                      You haven't played against {opponentName} before. This will be your first encounter!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Head-to-Head Record */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Head-to-Head vs {opponentName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-700">{opponentAnalysis.gamesPlayed}</div>
                          <div className="text-sm text-blue-600">Games Played</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-700">{opponentAnalysis.winRate.toFixed(0)}%</div>
                          <div className="text-sm text-green-600">Win Rate</div>
                          <Progress value={opponentAnalysis.winRate} className="mt-2" />
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-700">
                            {opponentAnalysis.avgOurScore} - {opponentAnalysis.avgTheirScore}
                          </div>
                          <div className="text-sm text-purple-600">Average Score</div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Recent Form:</span>
                          <div className="flex gap-1">
                            {opponentAnalysis.recentForm.map((result, index) => (
                              <ResultBadge 
                                key={index}
                                result={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
                                size="sm"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Data Confidence:</span>
                          <Badge variant={
                            opponentAnalysis.confidence === 'high' ? 'default' :
                            opponentAnalysis.confidence === 'medium' ? 'secondary' : 'destructive'
                          }>
                            {opponentAnalysis.confidence.toUpperCase()}
                          </Badge>
                        </div>
                        {opponentAnalysis.lastPlayed && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Last Played:</span>
                            <span>{formatShortDate(opponentAnalysis.lastPlayed)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quarter Performance Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quarter Performance vs {opponentName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(quarter => {
                          const qData = opponentAnalysis.quarterPerformance[quarter];
                          const avgFor = qData.for / opponentAnalysis.gamesPlayed;
                          const avgAgainst = qData.against / opponentAnalysis.gamesPlayed;
                          const diff = avgFor - avgAgainst;

                          return (
                            <div key={quarter} className="p-3 rounded-lg border bg-gray-50">
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-600">Q{quarter}</div>
                                <div className="text-lg font-bold">
                                  {avgFor.toFixed(1)} - {avgAgainst.toFixed(1)}
                                </div>
                                <div className={`text-sm ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Team Analysis Tab */}
            <TabsContent value="teamanalysis" className="space-y-4">
              {/* Performance Momentum */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {teamAnalysis.momentum.trend === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : teamAnalysis.momentum.trend === 'down' ? (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    ) : (
                      <Zap className="h-5 w-5 text-yellow-600" />
                    )}
                    Performance Momentum
                    <Badge variant={
                      teamAnalysis.momentum.trend === 'up' ? 'default' : 
                      teamAnalysis.momentum.trend === 'down' ? 'destructive' : 'secondary'
                    }>
                      {teamAnalysis.momentum.trend.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {teamAnalysis.momentum.recentForm.map((result, index) => (
                        <div
                          key={index}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            result === 'Win' ? 'bg-green-500' :
                            result === 'Draw' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        >
                          {result[0]}
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-700">
                        {teamAnalysis.momentum.strength.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Momentum Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comeback Potential */}
              <Card className="bg-gradient-to-r from-orange-50 to-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    Comeback Potential
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-700">
                        {teamAnalysis.comebackPotential.recoveryRate.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Recovery Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-700">
                        {teamAnalysis.comebackPotential.deficitRecoveries}
                      </div>
                      <div className="text-sm text-gray-600">Successful Comebacks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-700">
                        {teamAnalysis.comebackPotential.avgDeficitSize.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Deficit Size</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Position Efficiency Heatmap */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Position Efficiency Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    <div></div>
                    {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
                      <div key={quarter} className="text-center text-sm font-medium text-gray-600">
                        {quarter}
                      </div>
                    ))}
                  </div>

                  {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => (
                    <div key={position} className="grid grid-cols-5 gap-2 mb-2">
                      <div className="text-sm font-medium text-gray-700 flex items-center">
                        {position}
                      </div>
                      {[1, 2, 3, 4].map(quarter => {
                        const efficiency = teamAnalysis.positionEfficiency[position]?.[`quarter${quarter}`] || 0;
                        const intensity = Math.min(1, Math.max(0.1, Math.abs(efficiency) / 2));
                        const color = efficiency > 0 ? 'bg-green-500' : efficiency < 0 ? 'bg-red-500' : 'bg-gray-300';

                        return (
                          <div
                            key={quarter}
                            className={`h-10 ${color} rounded flex items-center justify-center text-sm font-bold text-white`}
                            style={{ opacity: intensity }}
                          >
                            {efficiency > 0 ? '+' : ''}{efficiency.toFixed(1)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Player Availability Tab */}
            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Player Availability</CardTitle>
                  <p className="text-sm text-gray-600">
                    Set player availability for {new Date(selectedGame.date).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <PlayerAvailabilityManager
                    gameId={selectedGame.id}
                    players={Array.isArray(teamPlayers) ? teamPlayers as Player[] : []}
                    games={upcomingGames}
                    opponents={[]}
                    onAvailabilityChange={(availablePlayerIds) => {
                      const newAvailabilityData: Record<number, boolean> = {};
                      teamPlayers.forEach(player => {
                        newAvailabilityData[player.id] = availablePlayerIds.includes(player.id);
                      });
                      setAvailabilityData(newAvailabilityData);
                    }}
                    onGameChange={(gameId) => setSelectedGameId(gameId)}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('overview')}>
                  Back to Overview
                </Button>
                <Button 
                  onClick={() => setActiveTab('lineup')}
                  disabled={Object.values(availabilityData).filter(status => status === true).length < 7}
                >
                  Set Lineup
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            {/* Lineup Selection Tab */}
            <TabsContent value="lineup" className="space-y-4">
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="p-2 bg-gray-100 text-xs">
                  <div>Completed games: {completedGames.length}</div>
                  <div>Players: {Array.isArray(teamPlayers) ? teamPlayers.length : 0}</div>
                  <div>Stats loaded: {Object.keys(centralizedStats || {}).length} games</div>
                  <div>Rosters loaded: {Object.keys(centralizedRosters || {}).length} games</div>
                </div>
              )}

              {/* Upcoming Game Recommendations */}
              <UpcomingGameRecommendations
                games={completedGames}
                players={Array.isArray(teamPlayers) ? teamPlayers as Player[] : []}
                centralizedStats={centralizedStats || {}}
                centralizedRosters={centralizedRosters || {}}
                currentClubId={currentClubId}
              />

              {/* Player Combination Analysis */}
              <PlayerCombinationAnalysis
                games={completedGames}
                players={Array.isArray(teamPlayers) ? teamPlayers as Player[] : []}
                centralizedStats={centralizedStats || {}}
                centralizedRosters={centralizedRosters || {}}
                currentClubId={currentClubId}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Starting Lineup Editor</CardTitle>
                  <p className="text-sm text-gray-600">
                    Create your starting lineup for the game vs {opponentName}
                  </p>
                </CardHeader>
                <CardContent>
                  <DragDropLineupEditor
                    availablePlayers={teamPlayers.filter((p: Player) => availabilityData[p.id] === true)}
                    currentLineup={selectedLineup}
                    onLineupChange={setSelectedLineup}
                    onApplyRecommendation={(lineup) => {
                      setSelectedLineup(lineup);
                      toast({
                        title: "Lineup Applied",
                        description: "Recommended lineup has been applied to the editor",
                      });
                    }}
                  />
                </CardContent>
              </Card>

              {/* Full Roster Management Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid3X3 className="h-5 w-5 text-purple-600" />
                    Complete Roster Management
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Manage full quarter-by-quarter roster assignments for {opponentName}
                  </p>
                </CardHeader>
                <CardContent>
                  <DragDropRosterManager
                    availablePlayers={teamPlayers.filter((p: Player) => availabilityData[p.id] === true)}
                    gameInfo={{
                      opponent: opponentName || 'Unknown Opponent',
                      date: selectedGame?.date || '',
                      time: selectedGame?.time || ''
                    }}
                    onRosterChange={(roster) => {
                      console.log('Full roster changed:', roster);
                      toast({
                        title: "Roster Updated",
                        description: "Quarter-by-quarter roster has been updated",
                      });
                    }}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('availability')}>
                  Back to Availability
                </Button>
                <Button 
                  onClick={() => setActiveTab('roster')}
                  disabled={!Object.values(selectedLineup).every(p => p !== null)}
                >
                  Apply to Roster
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            {/* Apply to Roster Tab */}
            <TabsContent value="roster" className="space-y-4">
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
                              {Object.values(availabilityData).filter(status => status === true).length}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Starting Lineup</span>
                            <p className="font-semibold">
                              {Object.values(selectedLineup).filter(p => p !== null).length}/7 Complete
                            </p>
                          </div>
                        </div>

                        {opponentAnalysis && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="font-medium mb-2">Key Insights</h5>
                            <ul className="text-xs space-y-1 text-gray-600">
                              <li>• Historical win rate vs {opponentName}: {opponentAnalysis.winRate.toFixed(0)}%</li>
                              <li>• Team momentum: {teamAnalysis.momentum.trend}</li>
                              <li>• Comeback potential: {teamAnalysis.comebackPotential.recoveryRate.toFixed(0)}%</li>
                            </ul>
                          </div>
                        )}
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
                  Back to Lineup
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTemplate>
  );
}