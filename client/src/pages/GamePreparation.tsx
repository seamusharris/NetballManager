import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
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
import PageTemplate from '@/components/layout/PageTemplate';
import TeamPositionAnalysis from '@/components/dashboard/TeamPositionAnalysis';
import PlayerPerformance from '@/components/dashboard/PlayerPerformance';
import OpponentPreparation from '@/pages/OpponentPreparation';
import { CourtDisplay } from '@/components/ui/court-display';
import DragDropRosterManager from '@/components/roster/DragDropRosterManager';
import PlayerAvailabilityManager from '@/components/roster/PlayerAvailabilityManager';
import { AnalysisTab } from '@/components/game-preparation/AnalysisTab';
import LineupTab from '@/components/game-preparation/LineupTab';

type Tab = 'overview' | 'analysis' | 'lineup' | 'strategy';

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

      <div className="space-y-6">
        {/* Header with Game Details */}
        <Card>
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
                  <h1 className="text-2xl font-bold">vs {opponent}</h1>
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="lineup">Lineup</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Team Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Team Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recent Games:</span>
                    <span className="font-medium">Last 5 matches</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Win Rate:</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Goals Average:</span>
                    <span className="font-medium">42.3 per game</span>
                  </div>
                </CardContent>
              </Card>

              {/* Opponent Analysis */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Opponent Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Head-to-Head:</span>
                    <span className="font-medium">{historicalGames.length} games</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Result:</span>
                    <span className="font-medium">
                      {historicalGames.length > 0 ? 'W 45-38' : 'No previous matches'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Their Strength:</span>
                    <span className="font-medium">Defense</span>
                  </div>
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
                      <span>8/12 confirmed</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lineup Ready</span>
                      <span>60% complete</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Strategy Notes</span>
                      <span>{tacticalNotes.length} notes</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
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

          <TabsContent value="lineup" className="space-y-6">
          <LineupTab
            gameId={gameId!}
            teamId={currentTeamId!}
            players={players}
            historicalLineups={[]}
            playerAvailability={[]}
            recommendedLineups={[]}
          />
        </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Game Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Game Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tacticalNotes.map(note => (
                    <div key={note.id} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-blue-800">{note.title}</h4>
                        <Badge 
                          variant={note.priority === 'high' ? 'destructive' : note.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {note.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-700">{note.content}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {note.category === 'offense' && <Swords className="h-3 w-3 text-blue-600" />}
                        {note.category === 'defense' && <Shield className="h-3 w-3 text-blue-600" />}
                        {note.category === 'general' && <Target className="h-3 w-3 text-blue-600" />}
                        <span className="text-xs text-blue-600 capitalize">{note.category}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Key Matchups */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Key Matchups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">GS vs GK</span>
                      <Badge variant="outline">Critical</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Our shooting accuracy will be key against their defensive pressure
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">WD vs WA</span>
                      <Badge variant="outline">Important</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Mid-court battle will determine possession control
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">C vs C</span>
                      <Badge variant="outline">Watch</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Center court dominance for transition opportunities
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Pre-game Objectives */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Pre-game Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameObjectives.map(objective => (
                      <div key={objective.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <button
                          onClick={() => toggleObjectiveComplete(objective.id)}
                          className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center ${
                            objective.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {objective.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <div className="flex-1">
                          <h4 className={`font-medium ${objective.completed ? 'line-through text-gray-500' : ''}`}>
                            {objective.description}
                          </h4>
                          {objective.target && (
                            <p className="text-sm text-gray-600 mt-1">{objective.target}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}