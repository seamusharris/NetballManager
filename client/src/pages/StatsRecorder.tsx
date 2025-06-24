import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { GameStat, Position, allPositions, Game, Player, Roster } from '@shared/schema';
import { POSITION_NAMES, STAT_LABELS, STAT_COLORS, EMPTY_POSITION_STATS, COMMON_STATS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Minus, ArrowLeft, Save, Undo, Redo } from 'lucide-react';
import { useClub } from '@/contexts/ClubContext';

// Define the types of statistics we track
type StatType = 'goalsFor' | 'goalsAgainst' | 'missedGoals' | 'rebounds' | 
                'intercepts' | 'badPass' | 'handlingError' | 'pickUp' | 'infringement';

// Use constants from centralized location
const emptyPositionStats = EMPTY_POSITION_STATS;

// Common stats that should appear in the top row for every position
const commonStats: StatType[] = [
  'intercepts',
  'pickUp',
  'badPass',
  'handlingError',
  'infringement'
];

// Position-specific stats that should be shown in bold on the second row
const positionSpecificStats: Record<Position, StatType[]> = {
  "GS": ["goalsFor", "missedGoals", "rebounds"],
  "GA": ["goalsFor", "missedGoals", "rebounds"],
  "WA": [],
  "C": [],
  "WD": [],
  "GD": ["goalsAgainst", "rebounds"],
  "GK": ["goalsAgainst", "rebounds"]
};

// Interface for our live stats state
interface PositionStats {
  [position: string]: {
    [quarter: string]: Record<StatType, number>;
  };
}

// Interface for tracking undo/redo history
type HistoryRecord = PositionStats;

export default function StatsRecorder() {
  // Route params - NEW: Extract both gameId and teamId from URL
  const { gameId: gameIdParam, teamId: teamIdParam } = useParams<{ gameId: string; teamId: string }>();
  const gameId = parseInt(gameIdParam);
  const teamId = parseInt(teamIdParam);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentClubId } = useClub();

  // State variables - must declare all state first
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [stats, setStats] = useState<PositionStats>({});
  const [undoStack, setUndoStack] = useState<HistoryRecord[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryRecord[]>([]);
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  // NEW: Game data with team context
  const { data: game, isLoading: isLoadingGame } = useQuery<Game>({
    queryKey: ['/api/game', gameId, 'team', teamId],
    queryFn: () => apiClient.get(`/api/game/${gameId}/team/${teamId}`),
    enabled: !!gameId && !!teamId && !isNaN(gameId) && !isNaN(teamId)
  });

  // NEW: Club-scoped players instead of global
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<Player[]>({
    queryKey: ['/api/clubs', currentClubId, 'players'],
    queryFn: () => apiClient.get(`/api/clubs/${currentClubId}/players`),
    enabled: !!currentClubId
  });

  // NEW: Game-centric roster endpoint
  const { data: rosters = [], isLoading: isLoadingRoster } = useQuery<Roster[]>({
    queryKey: ['/api/game', gameId, 'team', teamId, 'rosters'],
    queryFn: () => apiClient.get(`/api/game/${gameId}/team/${teamId}/rosters`),
    enabled: !!gameId && !!teamId && !isNaN(gameId) && !isNaN(teamId)
  });

  // NEW: Game-centric stats endpoint
  const { data: existingStats = [], isLoading: isLoadingStats } = useQuery<GameStat[]>({
    queryKey: ['/api/game', gameId, 'team', teamId, 'stats'],
    queryFn: () => apiClient.get(`/api/game/${gameId}/team/${teamId}/stats`),
    enabled: !!gameId && !!teamId && !isNaN(gameId) && !isNaN(teamId)
  });

  // Initialize stats from existing data
  useEffect(() => {
    if (existingStats.length > 0) {
      const initialStats: PositionStats = {};
      
      existingStats.forEach(stat => {
        if (!initialStats[stat.position]) {
          initialStats[stat.position] = {};
        }
        if (!initialStats[stat.position][stat.quarter]) {
          initialStats[stat.position][stat.quarter] = { ...emptyPositionStats };
        }
        
        // Map stat fields to our interface
        initialStats[stat.position][stat.quarter] = {
          goalsFor: stat.goalsFor || 0,
          goalsAgainst: stat.goalsAgainst || 0,
          missedGoals: stat.missedGoals || 0,
          rebounds: stat.rebounds || 0,
          intercepts: stat.intercepts || 0,
          badPass: stat.badPass || 0,
          handlingError: stat.handlingError || 0,
          pickUp: stat.pickUp || 0,
          infringement: stat.infringement || 0
        };
      });
      
      setStats(initialStats);
    }
  }, [existingStats]);

  // NEW: Stats save mutation using game-centric endpoint
  const saveStatsMutation = useMutation({
    mutationFn: async (statsData: PositionStats) => {
      const statsArray = [];
      
      // Convert PositionStats to GameStat array
      for (const position of Object.keys(statsData)) {
        for (const quarter of Object.keys(statsData[position])) {
          const quarterStats = statsData[position][quarter];
          
          // Check if this stat entry already exists
          const existingStat = existingStats.find(s => 
            s.position === position && s.quarter === parseInt(quarter)
          );
          
          statsArray.push({
            id: existingStat?.id,
            gameId,
            teamId,
            position: position as Position,
            quarter: parseInt(quarter),
            goalsFor: quarterStats.goalsFor,
            goalsAgainst: quarterStats.goalsAgainst,
            missedGoals: quarterStats.missedGoals,
            rebounds: quarterStats.rebounds,
            intercepts: quarterStats.intercepts,
            badPass: quarterStats.badPass,
            handlingError: quarterStats.handlingError,
            pickUp: quarterStats.pickUp,
            infringement: quarterStats.infringement,
            rating: null // Allow manual rating later
          });
        }
      }
      
      return apiClient.post(`/api/game/${gameId}/team/${teamId}/stats`, { stats: statsArray });
    },
    onSuccess: () => {
      toast({
        title: "Stats Saved",
        description: "Game statistics have been saved successfully.",
      });
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/game', gameId, 'team', teamId, 'stats'] });
    },
    onError: (error) => {
      console.error('Error saving stats:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save statistics. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Helper functions for stat manipulation
  const getPositionStats = (position: Position, quarter: number): Record<StatType, number> => {
    return stats[position]?.[quarter] || { ...emptyPositionStats };
  };

  const updatePositionStat = (position: Position, quarter: number, statType: StatType, delta: number) => {
    if (saveInProgress) return;
    
    const currentValue = getPositionStats(position, quarter)[statType];
    const newValue = Math.max(0, currentValue + delta);
    
    // Save current state for undo
    setUndoStack(prev => [...prev, { ...stats }]);
    setRedoStack([]); // Clear redo stack when making new changes
    
    setStats(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        [quarter]: {
          ...getPositionStats(position, quarter),
          [statType]: newValue
        }
      }
    }));
  };

  const handleSave = () => {
    setSaveInProgress(true);
    saveStatsMutation.mutate(stats, {
      onSettled: () => setSaveInProgress(false)
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [stats, ...prev]);
    setStats(previousState);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    setUndoStack(prev => [...prev, stats]);
    setStats(nextState);
    setRedoStack(prev => prev.slice(1));
  };

  // Loading states
  if (isLoadingGame || isLoadingPlayers || isLoadingRoster || isLoadingStats) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Game not found or you don't have access to record stats for this game.</p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={() => navigate('/games')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teamName = game.homeTeamId === teamId ? game.homeTeamName : game.awayTeamName;
  const opponentName = game.homeTeamId === teamId ? game.awayTeamName : game.homeTeamName;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/games')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
          <h1 className="text-3xl font-bold">Record Stats</h1>
          <p className="text-muted-foreground">
            {teamName} vs {opponentName || 'BYE'} - Round {game.round}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleUndo}
            disabled={undoStack.length === 0 || saveInProgress}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRedo}
            disabled={redoStack.length === 0 || saveInProgress}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveInProgress}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveInProgress ? 'Saving...' : 'Save Stats'}
          </Button>
        </div>
      </div>

      {/* Quarter Selection */}
      <Tabs value={currentQuarter.toString()} onValueChange={(value) => setCurrentQuarter(parseInt(value))}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1">Quarter 1</TabsTrigger>
          <TabsTrigger value="2">Quarter 2</TabsTrigger>
          <TabsTrigger value="3">Quarter 3</TabsTrigger>
          <TabsTrigger value="4">Quarter 4</TabsTrigger>
        </TabsList>

        {/* Stats Recording Interface */}
        {[1, 2, 3, 4].map(quarter => (
          <TabsContent key={quarter} value={quarter.toString()}>
            <div className="grid grid-cols-7 gap-4">
              {allPositions.map(position => {
                const positionStats = getPositionStats(position, quarter);
                const specificStats = positionSpecificStats[position];
                
                return (
                  <Card key={position} className="bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-center text-lg">
                        {POSITION_NAMES[position]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Common stats */}
                      {commonStats.map(statType => (
                        <div key={statType} className="flex items-center justify-between">
                          <span className="text-sm">{STAT_LABELS[statType]}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePositionStat(position, quarter, statType, -1)}
                              disabled={positionStats[statType] === 0 || saveInProgress}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-mono">
                              {positionStats[statType]}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePositionStat(position, quarter, statType, 1)}
                              disabled={saveInProgress}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Position-specific stats */}
                      {specificStats.length > 0 && (
                        <>
                          <Separator />
                          {specificStats.map(statType => (
                            <div key={statType} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{STAT_LABELS[statType]}</span>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePositionStat(position, quarter, statType, -1)}
                                  disabled={positionStats[statType] === 0 || saveInProgress}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-mono font-bold">
                                  {positionStats[statType]}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePositionStat(position, quarter, statType, 1)}
                                  disabled={saveInProgress}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}