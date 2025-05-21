import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { GameStat, Position, allPositions, Opponent, Game } from '@shared/schema';
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
  
  // Render a stat counter button (matching original design)
  const renderStatCounter = (position: Position, stat: StatType, compact: boolean = false, important: boolean = false) => {
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
        <Button onClick={() => navigate('/games')}>Go Back to Games</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-3 px-2 md:py-4 md:px-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Live Stats Tracking</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Round {game.round} | {game.date} vs {opponent?.teamName || "Unknown Opponent"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/games')}
          >
            Back to Games
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={saveAllStats}
            disabled={saveInProgress}
          >
            <Save className="h-4 w-4 mr-1" />
            Save All Stats
          </Button>
        </div>
      </div>
      
      {/* Game scoreboard */}
      <div className="bg-slate-50 border rounded-md p-3 mb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-base font-semibold">Score</h3>
            <div className="flex items-center gap-1">
              <div className="text-sm font-medium">Q{currentQuarter}: {getQuarterTotal('goalsFor')} - {getQuarterTotal('goalsAgainst')}</div>
              <div className="text-sm text-muted-foreground">|</div>
              <div className="text-sm font-medium">Game: {getGameTotal('goalsFor')} - {getGameTotal('goalsAgainst')}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="h-8 w-8 p-0 rounded-r-none"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="h-8 w-8 p-0 rounded-l-none border-l-0"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Tabs value={currentQuarter.toString()} onValueChange={(val) => setCurrentQuarter(parseInt(val))}>
              <TabsList className="bg-transparent">
                <TabsTrigger value="1" className="text-xs px-2">Q1</TabsTrigger>
                <TabsTrigger value="2" className="text-xs px-2">Q2</TabsTrigger>
                <TabsTrigger value="3" className="text-xs px-2">Q3</TabsTrigger>
                <TabsTrigger value="4" className="text-xs px-2">Q4</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Position rows */}
      <div className="space-y-3">
        {/* GS */}
        <Card className="overflow-hidden">
          <div className="flex flex-row">
            <div className="bg-primary text-primary-foreground p-3 w-[100px] flex flex-col justify-center items-center">
              <h3 className="text-sm font-medium">GS</h3>
              <div className="text-xs">Goal Shooter</div>
            </div>
            <CardContent className="p-3 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-2">
                {renderStatCounter("GS", "goalsFor", true, true)}
                {renderStatCounter("GS", "missedGoals", true)}
                {renderStatCounter("GS", "rebounds", true)}
                {renderStatCounter("GS", "badPass", true)}
                {renderStatCounter("GS", "handlingError", true)}
                {renderStatCounter("GS", "infringement", true)}
              </div>
            </CardContent>
          </div>
        </Card>
        
        {/* GA */}
        <Card className="overflow-hidden">
          <div className="flex flex-row">
            <div className="bg-primary text-primary-foreground p-3 w-[100px] flex flex-col justify-center items-center">
              <h3 className="text-sm font-medium">GA</h3>
              <div className="text-xs">Goal Attack</div>
            </div>
            <CardContent className="p-3 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-2">
                {renderStatCounter("GA", "goalsFor", true, true)}
                {renderStatCounter("GA", "missedGoals", true)}
                {renderStatCounter("GA", "rebounds", true)}
                {renderStatCounter("GA", "intercepts", true)}
                {renderStatCounter("GA", "badPass", true)}
                {renderStatCounter("GA", "handlingError", true)}
                {renderStatCounter("GA", "infringement", true)}
              </div>
            </CardContent>
          </div>
        </Card>
        
        {/* WA */}
        <Card className="overflow-hidden">
          <div className="flex flex-row">
            <div className="bg-primary text-primary-foreground p-3 w-[100px] flex flex-col justify-center items-center">
              <h3 className="text-sm font-medium">WA</h3>
              <div className="text-xs">Wing Attack</div>
            </div>
            <CardContent className="p-3 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {renderStatCounter("WA", "intercepts", true)}
                {renderStatCounter("WA", "badPass", true)}
                {renderStatCounter("WA", "handlingError", true)}
                {renderStatCounter("WA", "pickUp", true)}
                {renderStatCounter("WA", "infringement", true)}
              </div>
            </CardContent>
          </div>
        </Card>
        
        {/* C */}
        <Card className="overflow-hidden">
          <div className="flex flex-row">
            <div className="bg-primary text-primary-foreground p-3 w-[100px] flex flex-col justify-center items-center">
              <h3 className="text-sm font-medium">C</h3>
              <div className="text-xs">Center</div>
            </div>
            <CardContent className="p-3 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {renderStatCounter("C", "intercepts", true)}
                {renderStatCounter("C", "badPass", true)}
                {renderStatCounter("C", "handlingError", true)}
                {renderStatCounter("C", "pickUp", true)}
                {renderStatCounter("C", "infringement", true)}
              </div>
            </CardContent>
          </div>
        </Card>
        
        {/* WD */}
        <Card className="overflow-hidden">
          <div className="flex flex-row">
            <div className="bg-primary text-primary-foreground p-3 w-[100px] flex flex-col justify-center items-center">
              <h3 className="text-sm font-medium">WD</h3>
              <div className="text-xs">Wing Defense</div>
            </div>
            <CardContent className="p-3 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {renderStatCounter("WD", "intercepts", true)}
                {renderStatCounter("WD", "badPass", true)}
                {renderStatCounter("WD", "handlingError", true)}
                {renderStatCounter("WD", "pickUp", true)}
                {renderStatCounter("WD", "infringement", true)}
              </div>
            </CardContent>
          </div>
        </Card>
        
        {/* GD */}
        <Card className="overflow-hidden">
          <div className="flex flex-row">
            <div className="bg-primary text-primary-foreground p-3 w-[100px] flex flex-col justify-center items-center">
              <h3 className="text-sm font-medium">GD</h3>
              <div className="text-xs">Goal Defense</div>
            </div>
            <CardContent className="p-3 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {renderStatCounter("GD", "rebounds", true)}
                {renderStatCounter("GD", "intercepts", true)}
                {renderStatCounter("GD", "badPass", true)}
                {renderStatCounter("GD", "handlingError", true)}
                {renderStatCounter("GD", "pickUp", true)}
                {renderStatCounter("GD", "infringement", true)}
              </div>
            </CardContent>
          </div>
        </Card>
        
        {/* GK */}
        <Card className="overflow-hidden">
          <div className="flex flex-row">
            <div className="bg-primary text-primary-foreground p-3 w-[100px] flex flex-col justify-center items-center">
              <h3 className="text-sm font-medium">GK</h3>
              <div className="text-xs">Goal Keeper</div>
            </div>
            <CardContent className="p-3 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-2">
                {renderStatCounter("GK", "goalsAgainst", true, true)}
                {renderStatCounter("GK", "rebounds", true)}
                {renderStatCounter("GK", "intercepts", true)}
                {renderStatCounter("GK", "badPass", true)}
                {renderStatCounter("GK", "handlingError", true)}
                {renderStatCounter("GK", "pickUp", true)}
                {renderStatCounter("GK", "infringement", true)}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}