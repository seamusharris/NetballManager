import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { GameStat, Position, allPositions, Opponent, Game } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Minus, Plus, RotateCcw, Save } from 'lucide-react';

// Define the types of statistics we track
type StatType = 'goalsFor' | 'goalsAgainst' | 'missedGoals' | 'rebounds' | 
                'intercepts' | 'badPass' | 'handlingError' | 'pickUp' | 'infringement';

// Default empty stats for a position
const emptyPositionStats = {
  goalsFor: 0,
  goalsAgainst: 0,
  missedGoals: 0,
  rebounds: 0,
  intercepts: 0,
  badPass: 0,
  handlingError: 0,
  pickUp: 0,
  infringement: 0
};

// Stat colors for visual indication
const statColors: Record<StatType, string> = {
  goalsFor: 'bg-green-100 hover:bg-green-200 text-green-700',
  missedGoals: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
  goalsAgainst: 'bg-red-100 hover:bg-red-200 text-red-700',
  rebounds: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
  intercepts: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700',
  pickUp: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
  badPass: 'bg-amber-100 hover:bg-amber-200 text-amber-700',
  handlingError: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
  infringement: 'bg-rose-100 hover:bg-rose-200 text-rose-700'
};

// Human-readable labels for stats
const statLabels: Record<StatType, string> = {
  goalsFor: 'Goal',
  missedGoals: 'Miss',
  goalsAgainst: 'Goal Against',
  rebounds: 'Rebound',
  intercepts: 'Intercept',
  pickUp: 'Pick Up',
  badPass: 'Bad Pass',
  handlingError: 'Handling Error',
  infringement: 'Infringement'
};

// Which stats should be shown for each position
const positionStats: Record<Position, Record<StatType, boolean>> = {
  "GS": {
    goalsFor: true,
    goalsAgainst: false,
    missedGoals: true,
    rebounds: true,
    intercepts: false,
    badPass: true,
    handlingError: true,
    pickUp: false,
    infringement: true
  },
  "GA": {
    goalsFor: true,
    goalsAgainst: false,
    missedGoals: true,
    rebounds: true,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: false,
    infringement: true
  },
  "WA": {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: false,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  "C": {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: false,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  "WD": {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: false,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  "GD": {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: true,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  "GK": {
    goalsFor: false,
    goalsAgainst: true,
    missedGoals: false,
    rebounds: true,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  }
};

// Interface for our LiveStats state
interface PositionStats {
  [position: string]: {
    [quarter: string]: Record<StatType, number>;
  };
}

// Interface for tracking undo/redo
type HistoryRecord = PositionStats;

export default function LiveStatsByPosition() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id);
  const [, navigate] = useLocation();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for tracking the game
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [liveStats, setLiveStats] = useState<PositionStats>({});
  const [undoStack, setUndoStack] = useState<HistoryRecord[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryRecord[]>([]);
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  
  // Fetch game details
  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => apiRequest(`/api/games/${gameId}`),
    enabled: !!gameId && !isNaN(gameId)
  });
  
  // Fetch opponent details if we have a game
  const { data: opponent, isLoading: opponentLoading } = useQuery({
    queryKey: ['/api/opponents', game?.opponentId],
    queryFn: () => apiRequest(`/api/opponents/${game?.opponentId}`),
    enabled: !!game?.opponentId
  });
  
  // Fetch existing game stats
  const { data: existingStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => apiRequest(`/api/games/${gameId}/stats?t=${Date.now()}`),
    enabled: !!gameId && !isNaN(gameId),
    staleTime: 0, // Consider it always stale to fetch fresh data
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });
  
  // Create or update game stats
  const { mutate: saveGameStat } = useMutation({
    mutationFn: (gameStat: Partial<GameStat>) => 
      apiRequest(`/api/gamestats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameStat)
      }),
    onSuccess: () => {
      // We'll invalidate queries after saving all stats
    }
  });
  
  // Initialize the live stats based on existing data
  useEffect(() => {
    if (existingStats) {
      console.log(`Initializing LiveStatsByPosition with ${existingStats.length} existing stats`);
      
      // Create a clean structure for position-based stats
      const initialStats: PositionStats = {};
      
      // Initialize stats structure for all positions
      allPositions.forEach((position) => {
        initialStats[position] = {
          "1": { ...emptyPositionStats },
          "2": { ...emptyPositionStats },
          "3": { ...emptyPositionStats },
          "4": { ...emptyPositionStats }
        };
      });
      
      // Group stats by position and quarter, keeping only the latest entries
      const statsByPositionAndQuarter: Record<string, GameStat> = {};
      
      existingStats.forEach((stat: GameStat) => {
        if (!stat.position || !stat.quarter) {
          console.warn("Found invalid stat without position or quarter:", stat);
          return;
        }
        
        const key = `${stat.position}-${stat.quarter}`;
        
        // If this is the first stat for this position/quarter or has a higher ID (newer)
        if (!statsByPositionAndQuarter[key] || stat.id > statsByPositionAndQuarter[key].id) {
          statsByPositionAndQuarter[key] = stat;
        }
      });
      
      // Apply the latest stats to our data structure
      Object.values(statsByPositionAndQuarter).forEach((stat: GameStat) => {
        if (stat.position && stat.quarter >= 1 && stat.quarter <= 4) {
          const position = stat.position;
          const quarter = stat.quarter.toString();
          
          // Log the stats we're applying
          console.log(`Found stat for ${position} in Q${quarter}: Goals: ${stat.goalsFor}, Against: ${stat.goalsAgainst}`);
          
          // Copy all stat values to our structure
          Object.keys(emptyPositionStats).forEach(key => {
            const statKey = key as StatType;
            if (stat[statKey] !== undefined) {
              const value = Number(stat[statKey]) || 0;
              
              // Make sure the position exists in our structure
              if (!initialStats[position]) {
                initialStats[position] = {
                  "1": { ...emptyPositionStats },
                  "2": { ...emptyPositionStats },
                  "3": { ...emptyPositionStats },
                  "4": { ...emptyPositionStats }
                };
              }
              
              // Make sure the quarter exists for this position
              if (!initialStats[position][quarter]) {
                initialStats[position][quarter] = { ...emptyPositionStats };
              }
              
              // Set the stat value
              initialStats[position][quarter][statKey] = value;
              
              // Log non-zero values
              if (value > 0) {
                console.log(`Setting ${statKey} = ${value} for ${position} in Q${quarter}`);
              }
            }
          });
        }
      });
      
      setLiveStats(initialStats);
      // Clear undo/redo stacks when loading fresh data
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [existingStats]);
  
  // Save state to undo stack
  const pushToUndoStack = (state: PositionStats) => {
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(state))]);
  };
  
  // Handle undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    // Get the last state from the undo stack
    const prevState = undoStack[undoStack.length - 1];
    
    // Save current state to redo stack
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(liveStats))]);
    
    // Set the state back to the previous state
    setLiveStats(prevState);
    
    // Remove the used state from the undo stack
    setUndoStack(prev => prev.slice(0, -1));
  };
  
  // Handle redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    // Get the last state from the redo stack
    const nextState = redoStack[redoStack.length - 1];
    
    // Save current state to undo stack
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(liveStats))]);
    
    // Set the state to the next state
    setLiveStats(nextState);
    
    // Remove the used state from the redo stack
    setRedoStack(prev => prev.slice(0, -1));
  };
  
  // Increment or decrement a stat for a position
  const recordStat = (position: Position, stat: StatType, value: number = 1) => {
    // Save the current state to the undo stack
    pushToUndoStack(liveStats);
    
    // Update the stat
    setLiveStats(prev => {
      const newStats = { ...prev };
      
      // Make sure the position exists in our data
      if (!newStats[position]) {
        newStats[position] = {
          "1": { ...emptyPositionStats },
          "2": { ...emptyPositionStats },
          "3": { ...emptyPositionStats },
          "4": { ...emptyPositionStats }
        };
      }
      
      // Get the current quarter
      const quarter = currentQuarter.toString();
      
      // Make sure the quarter exists for this position
      if (!newStats[position][quarter]) {
        newStats[position][quarter] = { ...emptyPositionStats };
      }
      
      // Get the current value or default to 0
      const currentValue = newStats[position][quarter][stat] || 0;
      
      // Calculate the new value (prevent negative values)
      const newValue = Math.max(0, currentValue + value);
      
      // Update the stat
      newStats[position][quarter][stat] = newValue;
      
      // Clear the redo stack since we've made a new change
      setRedoStack([]);
      
      return newStats;
    });
  };
  
  // Save all stats for the game
  const saveAllStats = async () => {
    if (saveInProgress) return; // Prevent double-clicking
    
    try {
      setSaveInProgress(true);
      
      // Save a snapshot to the undo stack
      pushToUndoStack(liveStats);
      
      // Build a list of all stat entries
      const statsToSave: Partial<GameStat>[] = [];
      
      // For each position and quarter with stats
      for (const position of allPositions) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          const quarterStr = quarter.toString();
          
          // Skip if position doesn't exist in our data
          if (!liveStats[position] || !liveStats[position][quarterStr]) {
            continue;
          }
          
          // Create a stat object for this position and quarter
          const statObject: Partial<GameStat> = {
            gameId,
            position, 
            quarter,
            goalsFor: liveStats[position][quarterStr].goalsFor || 0,
            goalsAgainst: liveStats[position][quarterStr].goalsAgainst || 0,
            missedGoals: liveStats[position][quarterStr].missedGoals || 0,
            rebounds: liveStats[position][quarterStr].rebounds || 0,
            intercepts: liveStats[position][quarterStr].intercepts || 0,
            badPass: liveStats[position][quarterStr].badPass || 0,
            handlingError: liveStats[position][quarterStr].handlingError || 0,
            pickUp: liveStats[position][quarterStr].pickUp || 0,
            infringement: liveStats[position][quarterStr].infringement || 0
          };
          
          console.log(`Saving stats for position ${position} in quarter ${quarter}: ` + 
            `Goals: ${statObject.goalsFor}, ` + 
            `Against: ${statObject.goalsAgainst}`);
          
          statsToSave.push(statObject);
        }
      }
      
      // Save all stats in sequence
      const savePromises = statsToSave.map(stat => saveGameStat(stat));
      await Promise.all(savePromises);
      
      // Manually fetch and update the stats without forcing a refresh
      try {
        // Get fresh stats
        const freshStats = await fetch(`/api/games/${gameId}/stats?t=${Date.now()}`).then(res => res.json());
        console.log(`Manually fetched ${freshStats.length} fresh stats after saving`);
        
        // Directly update the query cache
        queryClient.setQueryData(['/api/games', gameId, 'stats'], freshStats);
      } catch (err) {
        console.error("Error refreshing stats after save:", err);
      }
      
      // Clear the redo stack
      setRedoStack([]);
      
      // Invalidate related queries but with a delay so it doesn't interrupt the user
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/gamestats', gameId] });
        queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
        queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      }, 500);
      
      toast({
        title: "Stats Saved",
        description: "All game statistics have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving stats:', error);
      toast({
        title: "Error",
        description: "Failed to save game statistics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaveInProgress(false);
    }
  };
  
  // Get quarter total for a specific stat
  const getQuarterTotal = (stat: StatType): number => {
    let total = 0;
    
    allPositions.forEach(position => {
      if (liveStats[position]?.[currentQuarter.toString()]?.[stat]) {
        total += liveStats[position][currentQuarter.toString()][stat];
      }
    });
    
    return total;
  };
  
  // Get game total for a specific stat
  const getGameTotal = (stat: StatType): number => {
    let total = 0;
    
    allPositions.forEach(position => {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterStr = quarter.toString();
        if (liveStats[position]?.[quarterStr]?.[stat]) {
          total += liveStats[position][quarterStr][stat];
        }
      }
    });
    
    return total;
  };
  
  // Render a button for adjusting a stat
  const renderStatButton = (position: Position, stat: StatType, compact: boolean = false, important: boolean = false) => {
    // Skip stats that don't apply to this position
    if (!positionStats[position][stat]) {
      return null;
    }
    
    const currentValue = liveStats[position]?.[currentQuarter.toString()]?.[stat] || 0;
    
    return (
      <div className={`flex flex-col items-center ${compact ? 'p-1' : 'p-2'} rounded-md border`}>
        <p className={`${important ? 'text-sm font-semibold' : 'text-xs font-medium'} mb-1`}>{statLabels[stat]}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0`}
            onClick={() => recordStat(position, stat, -1)}
            disabled={currentValue <= 0}
          >
            <Minus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
          
          <span className={`${compact ? 'w-6' : 'w-8'} text-center font-semibold ${important ? 'text-base' : ''}`}>
            {currentValue}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0 ${statColors[stat]}`}
            onClick={() => recordStat(position, stat, 1)}
          >
            <Plus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </div>
    );
  };
  
  // Go back to games list
  const handleBackClick = () => {
    navigate('/games');
  };
  
  // Loading state
  if (gameLoading || opponentLoading || statsLoading) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }
  
  // Game not found state
  if (!game) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
        <p className="mb-4">The game you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={handleBackClick}>Go Back to Games</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Live Stats Tracking</h1>
          <Button variant="outline" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Round {game.round} vs. {opponent?.teamName || 'Unknown Opponent'}
                </h2>
                <p className="text-gray-600">{game.date} {game.time}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-center px-4 py-2 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-500">Current Quarter</p>
                  <p className="text-2xl font-bold">{getQuarterTotal('goalsFor')} - {getQuarterTotal('goalsAgainst')}</p>
                </div>
                
                <div className="text-center px-4 py-2 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-500">Game Total</p>
                  <p className="text-2xl font-bold">{getGameTotal('goalsFor')} - {getGameTotal('goalsAgainst')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Statistics Entry</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleUndo} 
                      disabled={undoStack.length === 0}
                      className="h-8 w-8 p-0"
                      title="Undo"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={saveAllStats}
                      disabled={saveInProgress}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveInProgress ? 'Saving...' : 'Save Stats'}
                    </Button>
                  </div>
                </div>
                
                <Tabs value={currentQuarter.toString()} onValueChange={(val) => setCurrentQuarter(parseInt(val))}>
                  <TabsList className="grid grid-cols-4 mb-4 w-full">
                    <TabsTrigger value="1">Quarter 1</TabsTrigger>
                    <TabsTrigger value="2">Quarter 2</TabsTrigger>
                    <TabsTrigger value="3">Quarter 3</TabsTrigger>
                    <TabsTrigger value="4">Quarter 4</TabsTrigger>
                  </TabsList>
                  
                  {/* All quarters share the same content, just with different data */}
                  {["1", "2", "3", "4"].map((quarter) => (
                    <TabsContent key={quarter} value={quarter} className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Shooting positions */}
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Shooting Circle</h4>
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <h5 className="text-md font-semibold mb-2">GS</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {renderStatButton("GS", "goalsFor", true, true)}
                                {renderStatButton("GS", "missedGoals", true, true)}
                                {renderStatButton("GS", "rebounds", true)}
                                {renderStatButton("GS", "badPass", true)}
                                {renderStatButton("GS", "handlingError", true)}
                                {renderStatButton("GS", "infringement", true)}
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <h5 className="text-md font-semibold mb-2">GA</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {renderStatButton("GA", "goalsFor", true, true)}
                                {renderStatButton("GA", "missedGoals", true, true)}
                                {renderStatButton("GA", "rebounds", true)}
                                {renderStatButton("GA", "intercepts", true)}
                                {renderStatButton("GA", "badPass", true)}
                                {renderStatButton("GA", "handlingError", true)}
                                {renderStatButton("GA", "infringement", true)}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Mid-court positions */}
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Mid Court</h4>
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <h5 className="text-md font-semibold mb-2">WA</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {renderStatButton("WA", "intercepts", true)}
                                {renderStatButton("WA", "badPass", true)}
                                {renderStatButton("WA", "handlingError", true)}
                                {renderStatButton("WA", "pickUp", true)}
                                {renderStatButton("WA", "infringement", true)}
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <h5 className="text-md font-semibold mb-2">C</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {renderStatButton("C", "intercepts", true)}
                                {renderStatButton("C", "badPass", true)}
                                {renderStatButton("C", "handlingError", true)}
                                {renderStatButton("C", "pickUp", true)}
                                {renderStatButton("C", "infringement", true)}
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <h5 className="text-md font-semibold mb-2">WD</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {renderStatButton("WD", "intercepts", true)}
                                {renderStatButton("WD", "badPass", true)}
                                {renderStatButton("WD", "handlingError", true)}
                                {renderStatButton("WD", "pickUp", true)}
                                {renderStatButton("WD", "infringement", true)}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Defensive positions */}
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Defensive Circle</h4>
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <h5 className="text-md font-semibold mb-2">GD</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {renderStatButton("GD", "rebounds", true)}
                                {renderStatButton("GD", "intercepts", true)}
                                {renderStatButton("GD", "badPass", true)}
                                {renderStatButton("GD", "handlingError", true)}
                                {renderStatButton("GD", "pickUp", true)}
                                {renderStatButton("GD", "infringement", true)}
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <h5 className="text-md font-semibold mb-2">GK</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {renderStatButton("GK", "goalsAgainst", true, true)}
                                {renderStatButton("GK", "rebounds", true)}
                                {renderStatButton("GK", "intercepts", true)}
                                {renderStatButton("GK", "badPass", true)}
                                {renderStatButton("GK", "handlingError", true)}
                                {renderStatButton("GK", "pickUp", true)}
                                {renderStatButton("GK", "infringement", true)}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Right sidebar for game information and stats summary */}
          <div className="col-span-1">
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Game Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium mb-1">Score by Quarter</h4>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[1, 2, 3, 4].map(q => (
                        <div key={q} className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Q{q}</p>
                          <p className="font-semibold">
                            {liveStats["GS"]?.[q.toString()]?.goalsFor + (liveStats["GA"]?.[q.toString()]?.goalsFor || 0) || 0} - {liveStats["GK"]?.[q.toString()]?.goalsAgainst || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-100 rounded p-2 text-center">
                      <p className="text-sm text-gray-500">Final Score</p>
                      <p className="text-xl font-bold">{getGameTotal('goalsFor')} - {getGameTotal('goalsAgainst')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-1">Team Stats</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Rebounds</p>
                        <p className="font-semibold">{getGameTotal('rebounds')}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Intercepts</p>
                        <p className="font-semibold">{getGameTotal('intercepts')}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Bad Passes</p>
                        <p className="font-semibold">{getGameTotal('badPass')}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Handling Errors</p>
                        <p className="font-semibold">{getGameTotal('handlingError')}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Pick Ups</p>
                        <p className="font-semibold">{getGameTotal('pickUp')}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Infringements</p>
                        <p className="font-semibold">{getGameTotal('infringement')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-1">Shooting</h4>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Goals</p>
                      <p className="font-semibold">{getGameTotal('goalsFor')}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Misses</p>
                      <p className="font-semibold">{getGameTotal('missedGoals')}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Shoot %</p>
                      <p className="font-semibold">
                        {getGameTotal('goalsFor') + getGameTotal('missedGoals') > 0
                          ? Math.round((getGameTotal('goalsFor') / (getGameTotal('goalsFor') + getGameTotal('missedGoals'))) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}