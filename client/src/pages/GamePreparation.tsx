import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, Clock, Target, Trophy, Users, FileText, 
  TrendingUp, AlertCircle, CheckCircle, BarChart3, 
  Zap, Star, ChevronRight, MapPin, Shield, Swords
} from 'lucide-react';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { formatShortDate } from '@/lib/utils';
import { calculateTeamWinRate } from '@/lib/winRateCalculator';
import PageTemplate from '@/components/layout/PageTemplate';
import TeamPositionAnalysis from '@/components/dashboard/TeamPositionAnalysis';
import PlayerPerformance from '@/components/dashboard/PlayerPerformance';
import OpponentPreparation from '@/pages/OpponentPreparation';
import CourtDisplay from '@/components/ui/court-display';
import DragDropRosterManager from '@/components/roster/DragDropRosterManager';
import PlayerAvailabilityManager from '@/components/roster/PlayerAvailabilityManager';
import AnalysisTab from '@/components/game-preparation/AnalysisTab';
import LineupTab from '@/components/game-preparation/LineupTab';
import StrategyTab from '@/components/game-preparation/StrategyTab';
import GameResultCard from '@/components/ui/game-result-card';
import { GamesContainer } from '@/components/ui/games-container';
import QuarterPerformanceWidget from '@/components/dashboard/QuarterPerformanceWidget';
import PrintWrapper from '@/components/common/PrintWrapper';
import { printClasses, formatForPrint } from '@/lib/printUtils';


type Tab = 'overview' | 'season' | 'analysis' | 'lineup' | 'strategy';

interface GamePreparationProps {
  gameId?: number;
  teamId?: number;
  clubId?: number;
}

interface TacticalNote {
  id: string;
  category: 'offense' | 'defense' | 'general';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

interface GameObjective {
  id: string;
  description: string;
  target?: string;
  completed: boolean;
}

// Enhanced diagnostic component with comprehensive visual debugging
const DiagnosticWrapper = ({ children, label, color = 'red' }: { children: React.ReactNode; label: string; color?: string }) => {
  return (
    <div style={{ 
      border: `2px dashed ${color}`, 
      backgroundColor: `rgba(255, 0, 0, 0.1)`, 
      padding: '8px',
      margin: '4px',
      position: 'relative'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '-12px', 
        left: '8px', 
        fontSize: '12px', 
        color: color,
        backgroundColor: 'white',
        padding: '2px 6px',
        fontWeight: 'bold',
        border: `1px solid ${color}`,
        borderRadius: '3px'
      }}>
        {label}
      </div>
      {children}
    </div>
  );
};

// Progress bar specific diagnostic with margin/padding visualization
const ProgressBarDiagnostic = ({ children, label }: { children: React.ReactNode; label: string }) => {
  return (
    <div style={{ 
      border: '3px solid purple', 
      backgroundColor: 'rgba(128, 0, 128, 0.1)', 
      padding: '12px',
      margin: '8px',
      position: 'relative'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '-15px', 
        left: '12px', 
        fontSize: '14px', 
        color: 'purple',
        backgroundColor: 'white',
        padding: '4px 8px',
        fontWeight: 'bold',
        border: '2px solid purple',
        borderRadius: '4px'
      }}>
        {label}
      </div>
      {children}
    </div>
  );
};

// Individual quarter box diagnostic
const QuarterBoxDiagnostic = ({ children, quarter }: { children: React.ReactNode; quarter: number }) => {
  return (
    <div style={{ 
      border: '2px solid blue', 
      backgroundColor: 'rgba(0, 0, 255, 0.05)', 
      padding: '4px',
      position: 'relative'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '-10px', 
        right: '4px', 
        fontSize: '10px', 
        color: 'blue',
        backgroundColor: 'white',
        padding: '1px 4px',
        border: '1px solid blue',
        borderRadius: '2px'
      }}>
        Q{quarter} Box
      </div>
      {children}
    </div>
  );
};

// Progress bar element diagnostic
const ProgressElementDiagnostic = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ 
      border: '2px solid orange', 
      backgroundColor: 'rgba(255, 165, 0, 0.1)', 
      padding: '6px',
      position: 'relative'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '-12px', 
        left: '4px', 
        fontSize: '11px', 
        color: 'orange',
        backgroundColor: 'white',
        padding: '2px 4px',
        fontWeight: 'bold',
        border: '1px solid orange',
        borderRadius: '2px'
      }}>
        PROGRESS BAR
      </div>
      {children}
    </div>
  );
};

export default function GamePreparation() {
  const params = useParams();
  const gameId = params.gameId ? parseInt(params.gameId) : undefined;
  const { currentClubId, currentTeamId } = useClub();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedLineup, setSelectedLineup] = useState<Record<string, number | null>>({});
  const [playerAvailability, setPlayerAvailability] = useState<Record<number, boolean>>({});
  const [tacticalNotes, setTacticalNotes] = useState<TacticalNote[]>([]);
  const [gameObjectives, setGameObjectives] = useState<GameObjective[]>([]);

  // Load game data
  const { data: game, isLoading: loadingGame } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => apiClient.get(`/api/games/${gameId}`),
    enabled: !!gameId
  });

  // Load team data
  const { data: team, isLoading: loadingTeam } = useQuery({
    queryKey: ['team', currentTeamId],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}`),
    enabled: !!currentTeamId
  });

  // Load players
  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['teamPlayers', currentTeamId],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}/players`),
    enabled: !!currentTeamId
  });

  // Load game statistics for analysis
  const { data: gameStats = [], isLoading: loadingStats } = useQuery({
    queryKey: ['gameStats', gameId],
    queryFn: () => apiClient.get(`/api/games/${gameId}/statistics`),
    enabled: !!gameId
  });

  // Load historical games against this opponent
  const { data: historicalGames = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['historicalGames', currentTeamId, game?.awayTeamId || game?.homeTeamId],
    queryFn: async () => {
      if (!game || !currentTeamId) return [];

      // Get all games for the current team using existing API
      const headers: Record<string, string> = {};
      if (currentTeamId) {
        headers['x-current-team-id'] = currentTeamId.toString();
      }
      const allGames = await apiClient.get('/api/games', headers);

      // Determine the opponent team ID
      const opponentTeamId = game.homeTeamId === currentTeamId ? game.awayTeamId : game.homeTeamId;

      // Filter for completed games against this specific opponent
      const historicalMatches = allGames.filter((g: any) => {
        // Skip the current game
        if (g.id === game.id) return false;

        // Only include completed games
        if (!g.statusIsCompleted) return false;

        // Check if this game was against the same opponent team ID
        const gameOpponentId = g.homeTeamId === currentTeamId ? g.awayTeamId : g.homeTeamId;
        return gameOpponentId === opponentTeamId;
      });

      console.log(`Historical games against opponent team ${opponentTeamId}:`, historicalMatches);
      return historicalMatches;
    },
    enabled: !!game && !!currentTeamId
  });

  // Strategy data will be handled by StrategyTab component internally
  const strategyData = null;
  const isLoadingStrategy = false;
  const strategyError = null;

  // Use existing batch scores data from the unified data fetcher
  const gameIdsArray = historicalGames?.map(g => g.id) || [];
  const { data: batchScores, isLoading: isLoadingBatchScores } = useQuery({
    queryKey: ['games', 'scores', 'batch', gameIdsArray.join(',')],
    queryFn: async () => {
      if (gameIdsArray.length === 0) return {};
      return apiClient.post('/api/games/scores/batch', { gameIds: gameIdsArray });
    },
    enabled: gameIdsArray.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch batch statistics for position-based analysis
  const { statsMap: batchStats, isLoading: isLoadingBatchStats } = useBatchGameStatistics(gameIdsArray);

  // Load all season games for the current team
  const { data: seasonGames = [], isLoading: loadingSeasonGames } = useQuery({
    queryKey: ['seasonGames', currentTeamId, game?.seasonId],
    queryFn: async () => {
      if (!currentTeamId || !game?.seasonId) return [];

      // Get all games for the current team using existing API
      const headers: Record<string, string> = {};
      if (currentTeamId) {
        headers['x-current-team-id'] = currentTeamId.toString();
      }
      const allGames = await apiClient.get('/api/games', headers);

      // Filter for completed games in the same season, excluding BYE games
      const seasonMatches = allGames.filter((g: any) => {
        // Skip the current game
        if (g.id === game.id) return false;

        // Only include completed games
        if (!g.statusIsCompleted) return false;

        // Only include games from the same season
        return g.seasonId === game.seasonId;
      });

      console.log(`Season games for team ${currentTeamId} in season ${game.seasonId}:`, seasonMatches);
      return seasonMatches;
    },
    enabled: !!game && !!currentTeamId
  });

  // Get batch scores for season games
  const seasonGameIds = seasonGames?.map(g => g.id) || [];
  const { data: seasonBatchScores, isLoading: isLoadingSeasonScores } = useQuery({
    queryKey: ['games', 'scores', 'batch', seasonGameIds.join(',')],
    queryFn: async () => {
      if (seasonGameIds.length === 0) return {};
      return apiClient.post('/api/games/scores/batch', { gameIds: seasonGameIds });
    },
    enabled: seasonGameIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch batch statistics for season games
  const { statsMap: seasonBatchStats, isLoading: isLoadingSeasonStats } = useBatchGameStatistics(seasonGameIds);

  // Initialize default tactical notes and objectives
  useEffect(() => {
    if (game && tacticalNotes.length === 0) {
      const defaultNotes: TacticalNote[] = [
        {
          id: '1',
          category: 'offense',
          title: 'Shooting Circle Strategy',
          content: 'Focus on quick passes into the circle and maintain strong positioning',
          priority: 'high'
        },
        {
          id: '2',
          category: 'defense',
          title: 'Defensive Pressure',
          content: 'Apply consistent pressure in the mid-court to force turnovers',
          priority: 'high'
        },
        {
          id: '3',
          category: 'general',
          title: 'Quarter Momentum',
          content: 'Strong starts in Q1 and Q3 are crucial for maintaining game control',
          priority: 'medium'
        }
      ];
      setTacticalNotes(defaultNotes);

      const defaultObjectives: GameObjective[] = [
        {
          id: '1',
          description: 'Win first quarter',
          target: 'Score more goals than opponent in Q1',
          completed: false
        },
        {
          id: '2',
          description: 'Maintain possession',
          target: 'Keep turnovers under 15 for the game',
          completed: false
        },
        {
          id: '3',
          description: 'Strong defensive performance',
          target: 'Limit opponent to under 80% shooting accuracy',
          completed: false
        }
      ];
      setGameObjectives(defaultObjectives);
    }
  }, [game, tacticalNotes.length]);

  const addTacticalNote = (note: Omit<TacticalNote, 'id'>) => {
    const newNote: TacticalNote = {
      ...note,
      id: Date.now().toString()
    };
    setTacticalNotes(prev => [...prev, newNote]);
  };

  const addGameObjective = (objective: Omit<GameObjective, 'id'>) => {
    const newObjective: GameObjective = {
      ...objective,
      id: Date.now().toString()
    };
    setGameObjectives(prev => [...prev, newObjective]);
  };

  const toggleObjectiveComplete = (id: string) => {
    setGameObjectives(prev => 
      prev.map(obj => 
        obj.id === id ? { ...obj, completed: !obj.completed } : obj
      )
    );
  };

  if (loadingGame || loadingTeam) {
    return (
      <PageTemplate title="Game Preparation">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading game preparation data...</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (!game) {
    return (
      <PageTemplate title="Game Preparation">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Game Not Found</h3>
            <p className="text-gray-600">
              The requested game could not be found.
            </p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const opponent = game.homeTeamId === currentTeamId ? game.awayTeamName : game.homeTeamName;
  const isHomeGame = game.homeTeamId === currentTeamId;

  const gameTitle = game ? formatForPrint.gameTitle(
    game.date, 
    opponent || 'Unknown Opponent', 
    game.round
  ) : 'Game Preparation';

  return (
    <PageTemplate 
      title="Game Preparation" 
      breadcrumbs={[
        { label: "Games", href: "/games" },
        { label: "Game Preparation" }
      ]}
    >
        <Helmet>
          <title>Game Preparation - {opponent} | Team Management</title>
          <meta name="description" content={`Comprehensive game preparation for ${opponent} match`} />
        </Helmet>

        <div className="space-y-6 print-content">
        {/* Header with Game Details */}
        <Card className={printClasses.section}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-sm font-medium">{formatShortDate(game.date)}</p>
                </div>
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-sm font-medium">{game.time}</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <h1 className="text-2xl font-bold">{game.homeTeamName} vs {game.awayTeamName}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {isHomeGame ? 'Home Game' : 'Away Game'}
                    </span>
                    <Badge variant="outline">Round {game.round}</Badge>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {game.statusDisplayName}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="space-y-4 print-content">
          <TabsList className="grid w-full grid-cols-5 no-print print-hide">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="season">Season</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="lineup">Lineup</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>
          
          {/* Print section headers - only visible when printing */}
          <div className={`${printClasses.printOnly} space-y-4`} style={{ display: 'none' }}>
            <div className={printClasses.section}>
              <h2 className={printClasses.subtitle}>Game Overview</h2>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className={`space-y-6 ${printClasses.printShow} ${printClasses.section}`} data-tabs-content="overview">


            {(() => {
              // Calculate actual statistics based on historical games using proper win rate calculator
              const recentGames = historicalGames.slice(0, Math.min(5, historicalGames.length));

              // Calculate win rate using official scores
              const winRateResult = calculateTeamWinRate(
                historicalGames,
                currentTeamId,
                currentClubId,
                batchScores || {}
              );

              const winCount = winRateResult.wins;
              const winRate = winRateResult.winRate;

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Team Form */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Team Form vs {opponent}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Historical Games:</span>
                          <span className="font-medium">{historicalGames.length} matches</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Win Rate:</span>
                          <span className="font-medium">{winRate.toFixed(0)}%</span>
                        </div>

                        {/* Recent Form Streak */}
                        {(() => {
                          if (historicalGames.length === 0) return null;

                          // Calculate recent form (last 3 games)
                          const recentGames = historicalGames.slice(0, 3);
                          const recentResults = recentGames.map(game => {
                            const gameScores = batchScores?.[game.id] || [];
                            if (gameScores.length === 0) return 'U'; // Unknown

                            let ourScore = 0;
                            let theirScore = 0;

                            gameScores.forEach(score => {
                              if (score.teamId === currentTeamId) {
                                ourScore += score.score;
                              } else {
                                theirScore += score.score;
                              }
                            });

                            return ourScore > theirScore ? 'W' : ourScore < theirScore ? 'L' : 'D';
                          });

                          return (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Recent Form:</span>
                              <div className="flex gap-1">
                                {recentResults.map((result, index) => (
                                  <span 
                                    key={index} 
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                      result === 'W' ? 'bg-green-500' : 
                                      result === 'L' ? 'bg-red-500' : 
                                      result === 'D' ? 'bg-amber-500' : 'bg-gray-400'
                                    }`}
                                  >
                                    {result}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Home vs Away Performance */}
                        {(() => {
                          if (historicalGames.length === 0) return null;

                          const homeGames = historicalGames.filter(g => g.homeTeamId === currentTeamId);
                          const awayGames = historicalGames.filter(g => g.awayTeamId === currentTeamId);

                          const homeWins = homeGames.filter(game => {
                            const gameScores = batchScores?.[game.id] || [];
                            if (gameScores.length === 0) return false;

                            let ourScore = 0;
                            let theirScore = 0;
                            gameScores.forEach(score => {
                              if (score.teamId === currentTeamId) ourScore += score.score;
                              else theirScore += score.score;
                            });
                            return ourScore > theirScore;
                          }).length;

                          const awayWins = awayGames.filter(game => {
                            const gameScores = batchScores?.[game.id] || [];
                            if (gameScores.length === 0) return false;

                            let ourScore = 0;
                            let theirScore = 0;
                            gameScores.forEach(score => {
                              if (score.teamId === currentTeamId) ourScore += score.score;
                              else theirScore += score.score;
                            });
                            return ourScore > theirScore;
                          }).length;

                          return (
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Home: {homeWins}/{homeGames.length}</span>
                                <span>Away: {awayWins}/{awayGames.length}</span>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Most Recent:</span>
                          <span className="font-medium">
                            {historicalGames.length > 0 ? formatShortDate(historicalGames[0].date) : 'None'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Head-to-Head Analysis */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Head-to-Head Record
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Games:</span>
                          <span className="font-medium">{historicalGames.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Record:</span>
                          <span className="font-medium">
                            {historicalGames.length > 0 ? `${winRateResult.wins}W-${winRateResult.losses}L${winRateResult.draws > 0 ? `-${winRateResult.draws}D` : ''}` : 'No history'}
                          </span>
                        </div>

                        {(() => {
                          // Enhanced statistics calculation
                          if (historicalGames.length === 0 || !batchScores) return null;

                          let totalGoalsFor = 0;
                          let totalGoalsAgainst = 0;
                          let gamesWithScores = 0;
                          let margins = [];
                          let highestScore = 0;
                          let lowestScore = 999;

                          historicalGames.forEach(game => {
                            const gameScores = batchScores?.[game.id] || [];
                            if (gameScores.length > 0) {
                              gamesWithScores++;

                              let gameGoalsFor = 0;
                              let gameGoalsAgainst = 0;

                              gameScores.forEach(score => {
                                if (score.teamId === currentTeamId) {
                                  gameGoalsFor += score.score;
                                } else {
                                  gameGoalsAgainst += score.score;
                                }
                              });

                              totalGoalsFor += gameGoalsFor;
                              totalGoalsAgainst += gameGoalsAgainst;
                              margins.push(gameGoalsFor - gameGoalsAgainst);

                              if (gameGoalsFor > highestScore) highestScore = gameGoalsFor;
                              if (gameGoalsFor < lowestScore) lowestScore = gameGoalsFor;
                            }
                          });

                          if (gamesWithScores === 0) return null;

                          const avgGoalsFor = totalGoalsFor / gamesWithScores;
                          const avgGoalsAgainst = totalGoalsAgainst / gamesWithScores;
                          const goalDifference = avgGoalsFor - avgGoalsAgainst;
                          const avgMargin = margins.reduce((a, b) => a + Math.abs(b), 0) / margins.length;

                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Avg Margin:</span>
                                <span className="font-medium">{avgMargin.toFixed(1)} goals</span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Avg Score:</span>
                                <span className="font-medium">
                                  {avgGoalsFor.toFixed(1)} - {avgGoalsAgainst.toFixed(1)}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Score Range:</span>
                                <span className="font-medium">
                                  {lowestScore} - {highestScore}
                                </span>
                              </div>

                              {/* Performance Indicator */}
                              <div className="pt-2 border-t">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Dominance:</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full transition-all ${
                                          goalDifference > 5 ? 'bg-green-500' :
                                          goalDifference > 0 ? 'bg-green-400' :
                                          goalDifference > -5 ? 'bg-amber-400' : 'bg-red-500'
                                        }`}
                                        style={{ 
                                          width: `${Math.min(100, Math.max(0, ((goalDifference + 10) / 20) * 100))}%` 
                                        }}
                                      ></div>
                                    </div>
                                    <span className={`text-xs font-medium ${
                                      goalDifference > 0 ? 'text-green-600' : 
                                      goalDifference < 0 ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                      {goalDifference > 5 ? 'Strong' :
                                       goalDifference > 0 ? 'Slight' :
                                       goalDifference > -5 ? 'Even' : 'Weak'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* Preparation Status */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Preparation Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Player Availability</span>
                            <span>{players.length > 0 ? `${Math.min(players.length, 7)}/${players.length}` : 'Loading...'}</span>
                          </div>
                          <Progress value={players.length > 0 ? (Math.min(players.length, 7) / players.length * 100) : 0} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Lineup Completion</span>
                            <span>0/4 quarters</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Historical Analysis</span>
                            <span>{historicalGames.length > 0 ? 'Complete' : 'Missing'}</span>
                          </div>
                          <Progress value={historicalGames.length > 0 ? 100 : 0} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Tactical Planning</span>
                            <span>{tacticalNotes.length}/5 areas</span>
                          </div>
                          <Progress value={(tacticalNotes.length / 5) * 100} className="h-2" />
                        </div>

                        {/* Game Readiness Indicator */}
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Game Readiness:</span>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const availableCount = Math.min(players.length, 7);
                                const hasHistory = historicalGames.length > 0;
                                const hasTactics = tacticalNotes.length >= 3;

                                const readinessScore = (
                                  (availableCount >= 7 ? 40 : (availableCount / 7) * 40) +
                                  (hasHistory ? 30 : 0) +
                                  (hasTactics ? 30 : (tacticalNotes.length / 3) * 30)
                                );

                                const level = readinessScore >= 80 ? 'Excellent' :
                                            readinessScore >= 60 ? 'Good' :
                                            readinessScore >= 40 ? 'Fair' : 'Poor';

                                const color = readinessScore >= 80 ? 'text-green-600' :
                                            readinessScore >= 60 ? 'text-blue-600' :
                                            readinessScore >= 40 ? 'text-amber-600' : 'text-red-600';

                                return (
                                  <>
                                    <span className={`text-sm font-medium ${color}`}>
                                      {readinessScore.toFixed(0)}%
                                    </span>
                                    <Badge variant="outline" className={color}>
                                      {level}
                                    </Badge>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Historical Games with Quarter-by-Quarter Breakdown */}
                  {historicalGames.length > 0 && (
                    <Card>
                      <CardHeader className="pb-6">
                        <CardTitle>
                          Previous Games vs {opponent}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {historicalGames.slice(0, 5).map((game, index) => {
                            // Check for special status games (e.g., forfeit, bye)
                            const isSpecialStatus = game.statusName === 'forfeit-win' || game.statusName=== 'forfeit-loss' || game.statusName === 'bye' || game.statusName === 'abandoned' || game.statusDisplayName === 'Forfeit Loss' || game.statusDisplayName === 'Forfeit Win';

                            // Get scores directly from batch scores (already properly formatted)
                            const gameScores = batchScores?.[game.id] || [];
                            const transformedScores = Array.isArray(gameScores) ? gameScores : [];

                            // Calculate quarter scores for display
                            const calculateQuarterScores = () => {
                              if (!transformedScores.length) return null;

                              const teamScores = [0, 0, 0, 0];
                              const opponentScores = [0, 0, 0, 0];

                              transformedScores.forEach(score => {
                                const quarterIndex = score.quarter - 1;
                                if (quarterIndex >= 0 && quarterIndex < 4) {
                                  if (score.teamId === currentTeamId) {
                                    teamScores[quarterIndex] = score.score;
                                  } else {
                                    opponentScores[quarterIndex] = score.score;
                                  }
                                }
                              });

                              // Calculate cumulative scores
                              const teamCumulative = [];
                              const opponentCumulative = [];
                              let teamTotal = 0;
                              let opponentTotal = 0;

                              for (let i = 0; i < 4; i++) {
                                teamTotal += teamScores[i];
                                opponentTotal += opponentScores[i];
                                teamCumulative.push(teamTotal);
                                opponentCumulative.push(opponentTotal);
                              }

                              return {
                                quarter: teamScores,
                                cumulative: teamCumulative,
                                opponentQuarter: opponentScores,
                                opponentCumulative: opponentCumulative,
                                finalScore: { team: teamTotal, opponent: opponentTotal }
                              };
                            };

                            const quarterData = calculateQuarterScores();
                            const hasQuarterData = quarterData !== null;

                            return (
                              <div key={game.id} className="relative">
                                {/* Use the standard GameResultCard for consistent styling and scoring */}
                                <GameResultCard
                                  game={game}
                                  currentTeamId={currentTeamId}
                                  centralizedScores={transformedScores}
                                  showLink={true}
                                  className="w-full"
                                />

                                {/* Right side - quarter breakdown for non-special games */}
                                <div className="ml-4 flex-shrink-0">
                                  {!isSpecialStatus && hasQuarterData ? (
                                    (() => {
                                      // Calculate quarter scores for display
                                      const teamScores = [0, 0, 0, 0];
                                      const opponentScores = [0, 0, 0, 0];

                                      transformedScores.forEach(score => {
                                        const quarterIndex = score.quarter - 1;
                                        if (quarterIndex >= 0 && quarterIndex < 4) {
                                          if (score.teamId === currentTeamId) {
                                            teamScores[quarterIndex] = score.score;
                                          } else {
                                            opponentScores[quarterIndex] = score.score;
                                          }
                                        }
                                      });

                                      // Calculate cumulative scores
                                      const teamCumulative = [];
                                      const opponentCumulative = [];
                                      let teamTotal = 0;
                                      let opponentTotal = 0;

                                      for (let i = 0; i < 4; i++) {
                                        teamTotal += teamScores[i];
                                        opponentTotal += opponentScores[i];
                                        teamCumulative.push(teamTotal);
                                        opponentCumulative.push(opponentTotal);
                                      }

                                      return (
                                        <div className="absolute right-32 top-1/2 transform -translate-y-1/2 flex items-center gap-4 pointer-events-none">
                                          <div className="text-xs space-y-1">
                                            {/* Quarter-by-quarter scores on top (lighter) */}
                                            <div className="grid grid-cols-4 gap-1">
                                              {teamScores.map((teamScore, qIndex) => {
                                                const opponentScore = opponentScores[qIndex];
                                                const quarterWin = teamScore > opponentScore;
                                                const quarterLoss = teamScore < opponentScore;

                                                const quarterClass = quarterWin 
                                                  ? 'bg-green-100 text-green-800 border border-green-400' 
                                                  : quarterLoss 
                                                    ? 'bg-red-100 text-red-800 border border-red-400'
                                                    : 'bg-amber-100 text-amber-800 border border-amber-400';

                                                return (
                                                  <span key={qIndex} className={`w-16 px-1 py-0.5 ${quarterClass} rounded font-medium text-center block`}>
                                                    {teamScore}–{opponentScore}
                                                  </span>
                                                );
                                              })}
                                            </div>
                                            {/* Cumulative scores underneath (darker) */}
                                            <div className="grid grid-cols-4 gap-1">
                                              {teamCumulative.map((teamCum, qIndex) => {
                                                const opponentCum = opponentCumulative[qIndex];
                                                const cumulativeWin = teamCum > opponentCum;
                                                const cumulativeLoss = teamCum < opponentCum;

                                                const cumulativeClass = cumulativeWin 
                                                  ? 'bg-green-200 text-green-800 border border-green-500' 
                                                  : cumulativeLoss 
                                                    ? 'bg-red-200 text-red-800 border border-red-500'
                                                    : 'bg-amber-200 text-amber-800 border border-amber-500';

                                                return (
                                                  <span key={qIndex} className={`w-16 px-1 py-0.5 ${cumulativeClass} rounded text-xs text-center block`}>
                                                    {teamCum}–{opponentCum}
                                                  </span>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    null
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>



                        {/* Quarter Average Performance Boxes + Goal Difference */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[1, 2, 3, 4].map(quarter => {
                            // Calculate average scores for this quarter across all historical games
                            let totalTeamScore = 0;
                            let totalOpponentScore = 0;
                            let gamesWithData = 0;

                            historicalGames.forEach(game => {
                              const gameScores = batchScores?.[game.id] || [];
                              const transformedScores = Array.isArray(gameScores) ? gameScores.map(score => ({
                                id: score.id,
                                gameId: score.gameId,
                                teamId: score.teamId,
                                quarter: score.quarter,
                                score: score.score,
                                enteredBy: score.enteredBy,
                                enteredAt: score.enteredAt,
                                updatedAt: score.updatedAt,
                                notes: score.notes
                              })) : [];

                              const quarterTeamScore = transformedScores.find(s => s.teamId === currentTeamId && s.quarter === quarter)?.score || 0;
                              const quarterOpponentScore = transformedScores.find(s => s.teamId !== currentTeamId && s.quarter === quarter)?.score || 0;

                                totalTeamScore += quarterTeamScore;
                                totalOpponentScore += quarterOpponentScore;

                              if(quarterTeamScore > 0 || quarterOpponentScore > 0){
                                gamesWithData++;
                              }
                            });

                            const avgTeamScore = gamesWithData > 0 ? totalTeamScore / gamesWithData : 0;
                            const avgOpponentScore = gamesWithData > 0 ? totalOpponentScore / gamesWithData : 0;

                            const isWinning = avgTeamScore > avgOpponentScore;
                            const isLosing = avgTeamScore < avgOpponentScore;
                            const isDraw = Math.abs(avgTeamScore - avgOpponentScore) < 0.1;

                            const getBackgroundClass = () => {
                              if (isDraw) return 'bg-amber-100 border-amber-300';
                              if (isWinning) return 'bg-green-100 border-green-300';
                              return 'bg-red-100 border-red-300';
                            };

                            const getDiffTextColorClass = () => {
                              if (isDraw) return 'text-amber-600 font-bold';
                              return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
                            };

                            return (
                              <div key={quarter} className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
                                {/* Quarter badge in top-left corner */}
                                <div className="absolute -top-2 -left-2">
                                  <Badge 
                                    className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                                      isDraw ? 'bg-amber-500 text-white border-amber-600' :
                                      isWinning ? 'bg-green-500 text-white border-green-600' : 
                                      'bg-red-500 text-white border-red-600'
                                    }`}
                                  >
                                    Q{quarter}
                                  </Badge>
                                </div>

                                <div className="space-y-1 mt-1">
                                  <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                                    {avgTeamScore.toFixed(1)}–{avgOpponentScore.toFixed(1)}
                                  </div>
                                  <div className={`text-base ${getDiffTextColorClass()}`}>
                                    {avgTeamScore - avgOpponentScore > 0 ? `+${(avgTeamScore - avgOpponentScore).toFixed(1)}` : (avgTeamScore - avgOpponentScore).toFixed(1)}
                                  </div>

                                  <div 
                                    className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                                    title="Our share of total quarter scoring"
                                  >
                                    <div 
                                      className={`h-2 rounded-full ${
                                        isWinning ? 'bg-green-500' : 
                                        isLosing ? 'bg-red-500' : 'bg-amber-500'
                                      }`}
                                      style={{ 
                                        width: `${Math.min(100, Math.max(0, (avgTeamScore / (avgTeamScore + avgOpponentScore)) * 100))}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Goal Difference Box - styled like quarter boxes */}
                          {(() => {
                            // Calculate overall goal difference for styling
                            let totalGoalsFor = 0;
                            let totalGoalsAgainst = 0;
                            let gamesWithScores = 0;

                            historicalGames.forEach(game => {
                              const gameScores = batchScores?.[game.id] || [];
                              if (gameScores.length > 0) {
                                gamesWithScores++;

                                let gameGoalsFor = 0;
                                let gameGoalsAgainst = 0;

                                gameScores.forEach(score => {
                                  if (score.teamId === currentTeamId) {
                                    gameGoalsFor += score.score;
                                  } else {
                                    gameGoalsAgainst += score.score;
                                  }
                                });

                                totalGoalsFor += gameGoalsFor;
                                totalGoalsAgainst += gameGoalsAgainst;
                              }
                            });

                            const avgGoalsFor = gamesWithScores > 0 ? totalGoalsFor / gamesWithScores : 0;
                            const avgGoalsAgainst = gamesWithScores > 0 ? totalGoalsAgainst / gamesWithScores : 0;
                            const goalDifference = avgGoalsFor - avgGoalsAgainst;

                            const isWinning = goalDifference > 0;
                            const isLosing = goalDifference < 0;
                            const isDraw = Math.abs(goalDifference) < 0.1;

                            const getBackgroundClass = () => {
                              if (isDraw) return 'bg-amber-100 border-amber-300';
                              if (isWinning) return 'bg-green-100 border-green-300';
                              return 'bg-red-100 border-red-300';
                            };

                            const getDiffTextColorClass = () => {
                              if (isDraw) return 'text-amber-600 font-bold';
                              return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
                            };

                            return (
                              <div className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
                                {/* Goal difference badge in top-left corner */}
                                <div className="absolute -top-2 -left-2">
                                  <Badge 
                                    className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                                      isDraw ? 'bg-amber-500 text-white border-amber-600' :
                                      isWinning ? 'bg-green-500 text-white border-green-600' : 
                                      'bg-red-500 text-white border-red-600'
                                    }`}
                                  >
                                    AVG
                                  </Badge>
                                </div>

                                <div className="space-y-1 mt-1">
                                  <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                                    {avgGoalsFor.toFixed(1)}–{avgGoalsAgainst.toFixed(1)}
                                  </div>
                                  <div className={`text-base ${getDiffTextColorClass()}`}>
                                    {goalDifference >= 0 ? '+' : ''}{goalDifference.toFixed(1)}
                                  </div>

                                  <div 
                                    className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                                    title="Our share of total game scoring"
                                  >
                                    <div 
                                      className={`h-2 rounded-full ${
                                        isWinning ? 'bg-green-500' : 
                                        isLosing ? 'bg-red-500' : 'bg-amber-500'
                                      }`}
                                      style={{ 
                                        width: `${Math.min(100, Math.max(0, (avgGoalsFor / (avgGoalsFor + avgGoalsAgainst)) * 100))}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Position Performance - Side by Side */}
                        {historicalGames.length > 0 && batchScores && Object.keys(batchScores).some(gameId => batchScores[gameId]?.length > 0) && (
                          <div className="mt-6">
                            {(() => {
                              // Calculate position-based statistics from batch stats
                              const positionTotals = {
                                'GS': { goalsFor: 0, games: 0 },
                                'GA': { goalsFor: 0, games: 0 },
                                'GD': { goalsAgainst: 0, games: 0 },
                                'GK': { goalsAgainst: 0, games: 0 }
                              };

                              let gamesWithPositionStats = 0;

                              // Aggregate actual position stats from historical games
                              historicalGames.forEach(game => {
                                const gameStats = batchStats?.[game.id] || [];
                                if (gameStats.length > 0) {
                                  gamesWithPositionStats++;

                                  // Group stats by position and sum across quarters
                                  const positionSums = {};
                                  gameStats.forEach(stat => {
                                    if (!positionSums[stat.position]) {
                                      positionSums[stat.position] = { goalsFor: 0, goalsAgainst: 0 };
                                    }
                                    positionSums[stat.position].goalsFor += stat.goalsFor || 0;
                                    positionSums[stat.position].goalsAgainst += stat.goalsAgainst || 0;
                                  });

                                  // Add to position totals
                                  ['GS', 'GA', 'GD', 'GK'].forEach(position => {
                                    if (positionSums[position]) {
                                      if (position === 'GS' || position === 'GA') {
                                        positionTotals[position].goalsFor += positionSums[position].goalsFor;
                                      }
                                      if (position === 'GD' || position === 'GK') {
                                        positionTotals[position].goalsAgainst += positionSums[position].goalsAgainst;
                                      }
                                      positionTotals[position].games++;
                                    }
                                  });
                                }
                              });

                              // Calculate position averages
                              const gsAvgGoalsFor = positionTotals.GS.games > 0 ? positionTotals.GS.goalsFor / positionTotals.GS.games : 0;
                              const gaAvgGoalsFor = positionTotals.GA.games > 0 ? positionTotals.GA.goalsFor / positionTotals.GA.games : 0;
                              const gdAvgGoalsAgainst = positionTotals.GD.games > 0 ? positionTotals.GD.goalsAgainst / positionTotals.GD.games : 0;
                              const gkAvgGoalsAgainst = positionTotals.GK.games > 0 ? positionTotals.GK.goalsAgainst / positionTotals.GK.games : 0;

                              const attackingPositionsTotal = gsAvgGoalsFor + gaAvgGoalsFor;
                              const defendingPositionsTotal = gdAvgGoalsAgainst + gkAvgGoalsAgainst;

                              return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Attack */}
                                  <div className="space-y-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                                    <div className="flex justify-between items-center">
                                      <span className="text-lg font-bold text-gray-800">Attack</span>
                                      <span className="text-2xl font-bold text-green-600">{attackingPositionsTotal.toFixed(1)}</span>
                                    </div>
                                    {gamesWithPositionStats > 0 ? (
                                      <>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm font-semibold">
                                            <span>GS: {gsAvgGoalsFor.toFixed(1)}</span>
                                            <span>GA: {gaAvgGoalsFor.toFixed(1)}</span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-3 flex">
                                            <div
                                              className="bg-green-600 h-3 rounded-l-full"
                                              style={{ width: attackingPositionsTotal > 0 ? `${(gsAvgGoalsFor / attackingPositionsTotal) * 100}%` : '50%' }}
                                            ></div>
                                            <div
                                              className="bg-green-400 h-3 rounded-r-full"
                                              style={{ width: attackingPositionsTotal > 0 ? `${(gaAvgGoalsFor / attackingPositionsTotal) * 100}%` : '50%' }}
                                            ></div>
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Based on position stats from {gamesWithPositionStats} games
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-xs text-gray-500">
                                        No position statistics available
                                      </div>
                                    )}
                                  </div>

                                  {/* Defence */}
                                  <div className="space-y-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                                    <div className="flex justify-between items-center">
                                      <span className="text-lg font-bold text-gray-800">Defence</span>
                                      <span className="text-2xl font-bold text-red-600">{defendingPositionsTotal.toFixed(1)}</span>
                                    </div>
                                    {gamesWithPositionStats > 0 ? (
                                      <>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm font-semibold">
                                            <span>GD: {gdAvgGoalsAgainst.toFixed(1)}</span>
                                            <span>GK: {gkAvgGoalsAgainst.toFixed(1)}</span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-3 flex">
                                            <div
                                              className="bg-red-600 h-3 rounded-l-full"
                                              style={{ width: defendingPositionsTotal > 0 ? `${(gdAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                                            ></div>
                                            <div
                                              className="bg-red-400 h-3 rounded-r-full"
                                              style={{ width: defendingPositionsTotal > 0 ? `${(gkAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                                            ></div>
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Based on position stats from {gamesWithPositionStats} games
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-xs text-gray-500">
                                        No position statistics available
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}









                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`${printClasses.grid} grid-cols-2 md:grid-cols-4 gap-4 ${printClasses.noPrint}`}>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => setActiveTab('lineup')}
                        >
                          <Users className="h-4 w-4" />
                          Set Lineup
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => setActiveTab('analysis')}
                        >
                          <BarChart3 className="h-4 w-4" />
                          View Analysis
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => setActiveTab('strategy')}
                        >
                          <FileText className="h-4 w-4" />
                          Game Plan
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Trophy className="h-4 w-4" />
                          Print Summary
                        </Button>
                      </div>
                    </CardContent>
                  </Card>


                </>
              );
            })()}
          </TabsContent>

          {/* Season Tab */}
          <TabsContent value="season" className={`space-y-6 ${printClasses.printShow}`} data-tabs-content="season">
            <div className={printClasses.printOnly} style={{ display: 'none' }}>
              <h2 className={printClasses.subtitle}>Season Performance</h2>
            </div>
            {(() => {
              if (loadingSeasonGames) {
                return (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading season games...</p>
                    </div>
                  </div>
                );
              }

              return (
                <Card>
                  <CardHeader className="pb-6">
                    <CardTitle>
                      Season Games ({game?.seasonName || 'Current Season'})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {seasonGames.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {seasonGames.map((seasonGame, index) => {
                            // Check for special status games (e.g., forfeit, bye)
                            const isSpecialStatus = seasonGame.statusName === 'forfeit-win' || seasonGame.statusName === 'forfeit-loss' || seasonGame.statusName === 'bye' || seasonGame.statusName === 'abandoned' || seasonGame.statusDisplayName === 'Forfeit Loss' || seasonGame.statusDisplayName === 'Forfeit Win';

                            // Get scores directly from batch scores (already properly formatted)
                            const gameScores = seasonBatchScores?.[seasonGame.id] || [];
                            const transformedScores = Array.isArray(gameScores) ? gameScores : [];

                            // Calculate quarter scores for display
                            const calculateQuarterScores = () => {
                              if (!transformedScores.length) return null;

                              const teamScores = [0, 0, 0, 0];
                              const opponentScores = [0, 0, 0, 0];

                              transformedScores.forEach(score => {
                                const quarterIndex = score.quarter - 1;
                                if (quarterIndex >= 0 && quarterIndex < 4) {
                                  if (score.teamId === currentTeamId) {
                                    teamScores[quarterIndex] = score.score;
                                  } else {
                                    opponentScores[quarterIndex] = score.score;
                                  }
                                }
                              });

                              // Calculate cumulative scores
                              const teamCumulative = [];
                              const opponentCumulative = [];
                              let teamTotal = 0;
                              let opponentTotal = 0;

                              for (let i = 0; i < 4; i++) {
                                teamTotal += teamScores[i];
                                opponentTotal += opponentScores[i];
                                teamCumulative.push(teamTotal);
                                opponentCumulative.push(opponentTotal);
                              }

                              return {
                                quarter: teamScores,
                                cumulative: teamCumulative,
                                opponentQuarter: opponentScores,
                                opponentCumulative: opponentCumulative,
                                finalScore: { team: teamTotal, opponent: opponentTotal }
                              };
                            };

                            const quarterData = calculateQuarterScores();
                            const hasQuarterData = quarterData !== null;

                            return (
                              <div key={seasonGame.id} className="relative">
                                {/* Use the standard GameResultCard for consistent styling and scoring */}
                                <GameResultCard
                                  game={seasonGame}
                                  currentTeamId={currentTeamId}
                                  centralizedScores={transformedScores}
                                  showLink={true}
                                  className="w-full"
                                />

                                {/* Right side - quarter breakdown for non-special games */}
                                <div className="ml-4 flex-shrink-0">
                                  {!isSpecialStatus && hasQuarterData ? (
                                    (() => {
                                      // Calculate quarter scores for display
                                      const teamScores = [0, 0, 0, 0];
                                      const opponentScores = [0, 0, 0, 0];

                                      transformedScores.forEach(score => {
                                        const quarterIndex = score.quarter - 1;
                                        if (quarterIndex >= 0 && quarterIndex < 4) {
                                          if (score.teamId === currentTeamId) {
                                            teamScores[quarterIndex] = score.score;
                                          } else {
                                            opponentScores[quarterIndex] = score.score;
                                          }
                                        }
                                      });

                                      // Calculate cumulative scores
                                      const teamCumulative = [];
                                      const opponentCumulative = [];
                                      let teamTotal = 0;
                                      let opponentTotal = 0;

                                      for (let i = 0; i < 4; i++) {
                                        teamTotal += teamScores[i];
                                        opponentTotal += opponentScores[i];
                                        teamCumulative.push(teamTotal);
                                        opponentCumulative.push(opponentTotal);
                                      }

                                      return (
                                        <div className="absolute right-32 top-1/2 transform -translate-y-1/2 flex items-center gap-4 pointer-events-none">
                                          <div className="text-xs space-y-1">
                                            {/* Quarter-by-quarter scores on top (lighter) */}
                                            <div className="grid grid-cols-4 gap-1">
                                              {teamScores.map((teamScore, qIndex) => {
                                                const opponentScore = opponentScores[qIndex];
                                                const quarterWin = teamScore > opponentScore;
                                                const quarterLoss = teamScore < opponentScore;

                                                const quarterClass = quarterWin 
                                                  ? 'bg-green-100 text-green-800 border border-green-400' 
                                                  : quarterLoss 
                                                    ? 'bg-red-100 text-red-800 border border-red-400'
                                                    : 'bg-amber-100 text-amber-800 border border-amber-400';

                                                return (
                                                  <span key={qIndex} className={`w-16 px-1 py-0.5 ${quarterClass} rounded font-medium text-center block`}>
                                                    {teamScore}–{opponentScore}
                                                  </span>
                                                );
                                              })}
                                            </div>
                                            {/* Cumulative scores underneath (darker) */}
                                            <div className="grid grid-cols-4 gap-1">
                                              {teamCumulative.map((teamCum, qIndex) => {
                                                const opponentCum = opponentCumulative[qIndex];
                                                const cumulativeWin = teamCum > opponentCum;
                                                const cumulativeLoss = teamCum < opponentCum;

                                                const cumulativeClass = cumulativeWin 
                                                  ? 'bg-green-200 text-green-800 border border-green-500' 
                                                  : cumulativeLoss 
                                                    ? 'bg-red-200 text-red-800 border border-red-500'
                                                    : 'bg-amber-200 text-amber-800 border border-amber-500';

                                                return (
                                                  <span key={qIndex} className={`w-16 px-1 py-0.5 ${cumulativeClass} rounded text-xs text-center block`}>
                                                    {teamCum}–{opponentCum}
                                                  </span>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    null
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Season Quarter Average Performance Boxes + Goal Difference */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[1, 2, 3, 4].map(quarter => {
                            // Calculate average scores for this quarter across all season games
                            let totalTeamScore = 0;
                            let totalOpponentScore = 0;
                            let gamesWithData = 0;

                            seasonGames.forEach(seasonGame => {
                              // Skip BYE games and forfeit games for goal statistics
                              if (seasonGame.statusName === 'bye' || 
                                  seasonGame.statusName === 'forfeit-win' || 
                                  seasonGame.statusName === 'forfeit-loss') return;

                              const gameScores = seasonBatchScores?.[seasonGame.id] || [];
                              const transformedScores = Array.isArray(gameScores) ? gameScores : [];

                              const quarterTeamScore = transformedScores.find(s => s.teamId === currentTeamId && s.quarter === quarter)?.score || 0;
                              const quarterOpponentScore = transformedScores.find(s => s.teamId !== currentTeamId && s.quarter === quarter)?.score || 0;

                              totalTeamScore += quarterTeamScore;
                              totalOpponentScore += quarterOpponentScore;

                              if(quarterTeamScore > 0 || quarterOpponentScore > 0){
                                gamesWithData++;
                              }
                            });

                            const avgTeamScore = gamesWithData > 0 ? totalTeamScore / gamesWithData : 0;
                            const avgOpponentScore = gamesWithData > 0 ? totalOpponentScore / gamesWithData : 0;

                            const isWinning = avgTeamScore > avgOpponentScore;
                            const isLosing = avgTeamScore < avgOpponentScore;
                            const isDraw = Math.abs(avgTeamScore - avgOpponentScore) < 0.1;

                            const getBackgroundClass = () => {
                              if (isDraw) return 'bg-amber-100 border-amber-300';
                              if (isWinning) return 'bg-green-100 border-green-300';
                              return 'bg-red-100 border-red-300';
                            };

                            const getDiffTextColorClass = () => {
                              if (isDraw) return 'text-amber-600 font-bold';
                              return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
                            };

                            return (
                              <div key={quarter} className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
                                {/* Quarter badge in top-left corner */}
                                <div className="absolute -top-2 -left-2">
                                  <Badge 
                                    className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                                      isDraw ? 'bg-amber-500 text-white border-amber-600' :
                                      isWinning ? 'bg-green-500 text-white border-green-600' : 
                                      'bg-red-500 text-white border-red-600'
                                    }`}
                                  >
                                    Q{quarter}
                                  </Badge>
                                </div>

                                <div className="space-y-1 mt-1">
                                  <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                                    {avgTeamScore.toFixed(1)}–{avgOpponentScore.toFixed(1)}
                                  </div>
                                  <div className={`text-base ${getDiffTextColorClass()}`}>
                                    {avgTeamScore - avgOpponentScore > 0 ? `+${(avgTeamScore - avgOpponentScore).toFixed(1)}` : (avgTeamScore - avgOpponentScore).toFixed(1)}
                                  </div>

                                  <div 
                                    className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                                    title="Our share of total quarter scoring"
                                  >
                                    <div 
                                      className={`h-2 rounded-full ${
                                        isWinning ? 'bg-green-500' : 
                                        isLosing ? 'bg-red-500' : 'bg-amber-500'
                                      }`}
                                      style={{ 
                                        width: `${Math.min(100, Math.max(0, (avgTeamScore / (avgTeamScore + avgOpponentScore)) * 100))}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Season Goal Difference Box - styled like quarter boxes */}
                          {(() => {
                            // Calculate overall goal difference for styling
                            let totalGoalsFor = 0;
                            let totalGoalsAgainst = 0;
                            let gamesWithScores = 0;

                            seasonGames.forEach(seasonGame => {
                              // Skip BYE and forfeit games for statistical calculations
                              if (seasonGame.statusName === 'bye' || 
                                  seasonGame.statusName === 'forfeit-win' || 
                                  seasonGame.statusName === 'forfeit-loss') return;

                              const gameScores = seasonBatchScores?.[seasonGame.id] || [];
                              if (gameScores.length > 0) {
                                gamesWithScores++;

                                let gameGoalsFor = 0;
                                let gameGoalsAgainst = 0;

                                gameScores.forEach(score => {
                                  if (score.teamId === currentTeamId) {
                                    gameGoalsFor += score.score;
                                  } else {
                                    gameGoalsAgainst += score.score;
                                  }
                                });

                                totalGoalsFor += gameGoalsFor;
                                totalGoalsAgainst += gameGoalsAgainst;
                              }
                            });

                            const avgGoalsFor = gamesWithScores > 0 ? totalGoalsFor / gamesWithScores : 0;
                            const avgGoalsAgainst = gamesWithScores > 0 ? totalGoalsAgainst / gamesWithScores : 0;
                            const goalDifference = avgGoalsFor - avgGoalsAgainst;

                            const isWinning = goalDifference > 0;
                            const isLosing = goalDifference < 0;
                            const isDraw = Math.abs(goalDifference) < 0.1;

                            const getBackgroundClass = () => {
                              if (isDraw) return 'bg-amber-100 border-amber-300';
                              if (isWinning) return 'bg-green-100 border-green-300';
                              return 'bg-red-100 border-red-300';
                            };

                            const getDiffTextColorClass = () => {
                              if (isDraw) return 'text-amber-600 font-bold';
                              return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
                            };

                            return (
                              <div className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
                                {/* Goal difference badge in top-left corner */}
                                <div className="absolute -top-2 -left-2">
                                  <Badge 
                                    className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                                      isDraw ? 'bg-amber-500 text-white border-amber-600' :
                                      isWinning ? 'bg-green-500 text-white border-green-600' : 
                                      'bg-red-500 text-white border-red-600'
                                    }`}
                                  >
                                    AVG
                                  </Badge>
                                </div>

                                <div className="space-y-1 mt-1">
                                  <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                                    {avgGoalsFor.toFixed(1)}–{avgGoalsAgainst.toFixed(1)}
                                  </div>
                                  <div className={`text-base ${getDiffTextColorClass()}`}>
                                    {goalDifference >= 0 ? '+' : ''}{goalDifference.toFixed(1)}
                                  </div>

                                  <div 
                                    className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                                    title="Our share of total game scoring"
                                  >
                                    <div 
                                      className={`h-2 rounded-full ${
                                        isWinning ? 'bg-green-500' : 
                                        isLosing ? 'bg-red-500' : 'bg-amber-500'
                                      }`}
                                      style={{ 
                                        width: `${Math.min(100, Math.max(0, (avgGoalsFor / (avgGoalsFor + avgGoalsAgainst)) * 100))}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Season Position Performance - Side by Side */}
                        {seasonGames.length > 0 && seasonBatchScores && Object.keys(seasonBatchScores).some(gameId => seasonBatchScores[gameId]?.length > 0) && (
                          <div className="mt-6">
                            {(() => {
                              // Calculate position-based statistics from season batch stats
                              const positionTotals = {
                                'GS': { goalsFor: 0, games: 0 },
                                'GA': { goalsFor: 0, games: 0 },
                                'GD': { goalsAgainst: 0, games: 0 },
                                'GK': { goalsAgainst: 0, games: 0 }
                              };

                              let gamesWithPositionStats = 0;

                              // Aggregate actual position stats from season games
                              seasonGames.forEach(seasonGame => {
                                // Skip BYE and forfeit games for statistical calculations
                                if (seasonGame.statusName === 'bye' || 
                                    seasonGame.statusName === 'forfeit-win' || 
                                    seasonGame.statusName === 'forfeit-loss') return;

                                const gameStats = seasonBatchStats?.[seasonGame.id] || [];
                                if (gameStats.length > 0) {
                                  gamesWithPositionStats++;

                                  // Group stats by position and sum across quarters
                                  const positionSums = {};
                                  gameStats.forEach(stat => {
                                    if (!positionSums[stat.position]) {
                                      positionSums[stat.position] = { goalsFor: 0, goalsAgainst: 0 };
                                    }
                                    positionSums[stat.position].goalsFor += stat.goalsFor || 0;
                                    positionSums[stat.position].goalsAgainst += stat.goalsAgainst || 0;
                                  });

                                  // Add to position totals
                                  ['GS', 'GA', 'GD', 'GK'].forEach(position => {
                                    if (positionSums[position]) {
                                      if (position === 'GS' || position === 'GA') {
                                        positionTotals[position].goalsFor += positionSums[position].goalsFor;
                                      }
                                      if (position === 'GD' || position === 'GK') {
                                        positionTotals[position].goalsAgainst += positionSums[position].goalsAgainst;
                                      }
                                      positionTotals[position].games++;
                                    }
                                  });
                                }
                              });

                              // Calculate position averages
                              const gsAvgGoalsFor = positionTotals.GS.games > 0 ? positionTotals.GS.goalsFor / positionTotals.GS.games : 0;
                              const gaAvgGoalsFor = positionTotals.GA.games > 0 ? positionTotals.GA.goalsFor / positionTotals.GA.games : 0;
                              const gdAvgGoalsAgainst = positionTotals.GD.games > 0 ? positionTotals.GD.goalsAgainst / positionTotals.GD.games : 0;
                              const gkAvgGoalsAgainst = positionTotals.GK.games > 0 ? positionTotals.GK.goalsAgainst / positionTotals.GK.games : 0;

                              const attackingPositionsTotal = gsAvgGoalsFor + gaAvgGoalsFor;
                              const defendingPositionsTotal = gdAvgGoalsAgainst + gkAvgGoalsAgainst;

                              return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Attack */}
                                  <div className="space-y-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                                    <div className="flex justify-between items-center">
                                      <span className="text-lg font-bold text-gray-800">Season Attack</span>
                                      <span className="text-2xl font-bold text-green-600">{attackingPositionsTotal.toFixed(1)}</span>
                                    </div>
                                    {gamesWithPositionStats > 0 ? (
                                      <>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm font-semibold">
                                            <span>GS: {gsAvgGoalsFor.toFixed(1)}</span>
                                            <span>GA: {gaAvgGoalsFor.toFixed(1)}</span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-3 flex">
                                            <div
                                              className="bg-green-600 h-3 rounded-l-full"
                                              style={{ width: attackingPositionsTotal > 0 ? `${(gsAvgGoalsFor / attackingPositionsTotal) * 100}%` : '50%' }}
                                            ></div>
                                            <div
                                              className="bg-green-400 h-3 rounded-r-full"
                                              style={{ width: attackingPositionsTotal > 0 ? `${(gaAvgGoalsFor / attackingPositionsTotal) * 100}%` : '50%' }}
                                            ></div>
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Based on position stats from {gamesWithPositionStats} season games
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-xs text-gray-500">
                                        No position statistics available
                                      </div>
                                    )}
                                  </div>

                                  {/* Defence */}
                                  <div className="space-y-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                                    <div className="flex justify-between items-center">
                                      <span className="text-lg font-bold text-gray-800">Season Defence</span>
                                      <span className="text-2xl font-bold text-red-600">{defendingPositionsTotal.toFixed(1)}</span>
                                    </div>
                                    {gamesWithPositionStats > 0 ? (
                                      <>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm font-semibold">
                                            <span>GD: {gdAvgGoalsAgainst.toFixed(1)}</span>
                                            <span>GK: {gkAvgGoalsAgainst.toFixed(1)}</span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-3 flex">
                                            <div
                                              className="bg-red-600 h-3 rounded-l-full"
                                              style={{ width: defendingPositionsTotal > 0 ? `${(gdAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                                            ></div>
                                            <div
                                              className="bg-red-400 h-3 rounded-r-full"
                                              style={{ width: defendingPositionsTotal > 0 ? `${(gkAvgGoalsAgainst / defendingPositionsTotal) * 100}%` : '50%' }}
                                            ></div>
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Based on position stats from {gamesWithPositionStats} season games
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-xs text-gray-500">
                                        No position statistics available
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">No completed games found for this season</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Season games will appear here once they are completed
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6 print-show" data-tabs-content="analysis">
            <div className="print-only print-show" style={{ display: 'none' }}>
              <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">Opponent Analysis</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Historical Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Historical vs {opponent}</CardTitle>
                </CardHeader>
                <CardContent>
                  {historicalGames.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {historicalGames.length}
                        </div>
                        <div className="text-sm text-blue-600">Previous Games vs {opponent}</div>
                      </div>
                      <div className="space-y-2">
                        {historicalGames.slice(0, 5).map((game: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{formatShortDate(game.date)}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Round {game.round}</span>
                              <Badge variant="outline">{game.statusDisplayName}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      {historicalGames.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          ...and {historicalGames.length - 5} more games
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">No previous matches against {opponent}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        This will show completed games against the same opponent team
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quarter Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Quarter Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(quarter => (
                      <div key={quarter} className="flex items-center justify-between">
                        <span className="font-medium">Q{quarter}</span>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">Avg: 11.2</div>
                            <div className="text-xs text-gray-500">vs 9.8</div>
                          </div>
                          <Progress value={65} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Position Performance */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Position Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <TeamPositionAnalysis
                    games={historicalGames}
                    players={players}
                    currentTeamId={currentTeamId}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lineup Tab */}
          <TabsContent value="lineup" className="print-show" data-tabs-content="lineup">
            <div className="print-only print-show" style={{ display: 'none' }}>
              <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">Team Lineup</h2>
            </div>
            <LineupTab
              game={game}
              players={players || []}
              rosters={[]}
              onRosterUpdate={(rosters) => {
                console.log('Roster updated:', rosters);
                // Handle roster update here if needed
              }}
            />
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="print-show" data-tabs-content="strategy">
            <div className="print-only print-show" style={{ display: 'none' }}>
              <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">Game Strategy</h2>
            </div>
            <StrategyTab
              gameId={gameId!}
              teamId={currentTeamId!}
              opponentId={game.homeTeamId === currentTeamId ? game.awayTeamId : game.homeTeamId}
              players={players || []}
              previousNotes={[
                "Focus on strong defensive pressure in mid-court",
                "Quick ball movement through center court",
                "Maintain shooting accuracy under pressure"
              ]}
              keyMatchups={[]}
              gamePlan={{
                objectives: [],
                keyTactics: [],
                playerRoles: {},
                preGameNotes: '',
                inGameNotes: '',
                postGameNotes: ''
              }}
            />
          </TabsContent>
        </Tabs>
        </div>
    </PageTemplate>
  );
}