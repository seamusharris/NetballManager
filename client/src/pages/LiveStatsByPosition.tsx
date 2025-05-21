import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { GameStat, Position, allPositions, Opponent, Game, Player, Roster } from '@shared/schema';
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

// Position labels for display
const positionLabels: Record<Position, string> = {
  "GS": "Goal Shooter",
  "GA": "Goal Attack",
  "WA": "Wing Attack",
  "C": "Center",
  "WD": "Wing Defense",
  "GD": "Goal Defense",
  "GK": "Goal Keeper"
};

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

export default function LiveStatsByPosition() {
  // ***** ALL HOOKS FIRST *****
  
  // Route params
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State variables - ALL state hooks must be declared before any other hooks
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [stats, setStats] = useState<PositionStats>({});
  const [undoStack, setUndoStack] = useState<HistoryRecord[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryRecord[]>([]);
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [rosterData, setRosterData] = useState<Roster[]>([]);
  const [playerData, setPlayerData] = useState<Record<number, Player>>({});
  
  // Queries - after all state hooks
  const { data: game, isLoading: isLoadingGame } = useQuery<Game>({
    queryKey: ['/api/games', gameId],
    enabled: !!gameId && !isNaN(gameId)
  });
  
  const { data: opponent, isLoading: isLoadingOpponent } = useQuery<Opponent>({
    queryKey: ['/api/opponents', game?.opponentId],
    enabled: !!game?.opponentId
  });
  
  const { data: existingStats = [], isLoading: isLoadingStats } = useQuery<GameStat[]>({
    queryKey: ['/api/games', gameId, 'stats'],
    enabled: !!gameId && !isNaN(gameId)
  });
  
  // Mutations - after queries
  const saveStatMutation = useMutation({
    mutationFn: async (statData: Partial<GameStat>) => {
      return apiRequest('/api/game-stats', {
        method: 'POST',
        body: JSON.stringify(statData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
    }
  });
  
  // Effect to load stats
  useEffect(() => {
    if (existingStats && existingStats.length > 0) {
      console.log(`Initializing LiveStatsByPosition with ${existingStats.length} existing stats`);
      
      // Initialize empty stats for all positions and quarters
      const initialStats: PositionStats = {};
      allPositions.forEach(position => {
        initialStats[position] = {};
        for (let q = 1; q <= 4; q++) {
          initialStats[position][q.toString()] = { ...emptyPositionStats };
        }
      });
      
      // Apply existing stats from database
      existingStats.forEach((stat) => {
        if (stat.position && stat.quarter >= 1 && stat.quarter <= 4) {
          const position = stat.position;
          const quarter = stat.quarter.toString();
          
          // Log what we found
          console.log(`Found stat for ${position} in Q${quarter}: Goals: ${stat.goalsFor}, Against: ${stat.goalsAgainst}`);
          
          // Ensure position and quarter exist in our structure
          if (!initialStats[position]) {
            initialStats[position] = {};
          }
          if (!initialStats[position][quarter]) {
            initialStats[position][quarter] = { ...emptyPositionStats };
          }
          
          // Copy all statistic values
          Object.keys(emptyPositionStats).forEach(key => {
            const statKey = key as StatType;
            if (stat[statKey] !== undefined && stat[statKey] !== null) {
              const value = typeof stat[statKey] === 'number' ? stat[statKey] as number : 0;
              initialStats[position][quarter][statKey] = value;
              
              // Log non-zero values
              if (value > 0) {
                console.log(`Setting ${statKey} = ${value} for ${position} in Q${quarter}`);
              }
            }
          });
        }
      });
      
      setStats(initialStats);
    }
  }, [existingStats]);
  
  // Effect to load roster data
  useEffect(() => {
    if (game) {
      // Fetch roster data for this game
      apiRequest<Roster[]>(`/api/games/${game.id}/rosters`)
        .then(rosters => {
          setRosterData(rosters || []);
        })
        .catch(err => {
          console.error("Error loading roster data:", err);
        });
      
      // Fetch player data
      apiRequest<Player[]>('/api/players')
        .then(players => {
          const playerMap: Record<number, Player> = {};
          (players || []).forEach(player => {
            playerMap[player.id] = player;
          });
          setPlayerData(playerMap);
        })
        .catch(err => {
          console.error("Error loading player data:", err);
        });
    }
  }, [game]);
  
  // ***** HELPER FUNCTIONS AFTER HOOKS *****
  
  // Get player name for a position in the current quarter
  const getPlayerForPosition = (position: Position): string => {
    if (!rosterData || rosterData.length === 0) return position;
    
    // Find roster entry for this position and quarter
    const rosterEntry = rosterData.find(r => 
      r.position === position && r.quarter === currentQuarter
    );
    
    if (!rosterEntry) return position;
    
    // Get player name from player data
    const player = playerData[rosterEntry.playerId];
    return player ? player.displayName : position;
  };
  
  // Save current state to undo stack
  const addToUndoStack = () => {
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(stats))]);
    setRedoStack([]); // Clear redo stack when new action is taken
  };
  
  // Undo the last action
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    // Get the last state from undo stack
    const previousState = undoStack[undoStack.length - 1];
    
    // Add current state to redo stack
    setRedoStack(prev => [JSON.parse(JSON.stringify(stats)), ...prev]);
    
    // Restore previous state
    setStats(previousState);
    
    // Remove used state from undo stack
    setUndoStack(prev => prev.slice(0, -1));
  };
  
  // Redo the last undone action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    // Get the last state from redo stack
    const nextState = redoStack[0];
    
    // Add current state to undo stack
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(stats))]);
    
    // Restore next state
    setStats(nextState);
    
    // Remove used state from redo stack
    setRedoStack(prev => prev.slice(1));
  };
  
  // Update a stat value
  const updateStat = (position: Position, stat: StatType, increment: number = 1) => {
    // Save current state for undo
    addToUndoStack();
    
    // Update the stat
    setStats(prevStats => {
      const newStats = JSON.parse(JSON.stringify(prevStats));
      const quarter = currentQuarter.toString();
      
      // Ensure position and quarter exist
      if (!newStats[position]) {
        newStats[position] = {};
      }
      if (!newStats[position][quarter]) {
        newStats[position][quarter] = { ...emptyPositionStats };
      }
      
      // Calculate new value (prevent negative values)
      const currentValue = newStats[position][quarter][stat] || 0;
      newStats[position][quarter][stat] = Math.max(0, currentValue + increment);
      
      return newStats;
    });
  };
  
  // Save all stats to the database
  const saveAllStats = async () => {
    if (saveInProgress) return;
    
    try {
      setSaveInProgress(true);
      
      // Build stats to save
      const statsToSave: Array<Partial<GameStat>> = [];
      
      // For each position and quarter with stats
      Object.entries(stats).forEach(([position, quarters]) => {
        Object.entries(quarters).forEach(([quarter, statValues]) => {
          // Create stat object
          const statObject: Partial<GameStat> = {
            gameId,
            position: position as Position,
            quarter: parseInt(quarter),
            // Include all stat values
            goalsFor: statValues.goalsFor || 0,
            goalsAgainst: statValues.goalsAgainst || 0,
            missedGoals: statValues.missedGoals || 0,
            rebounds: statValues.rebounds || 0,
            intercepts: statValues.intercepts || 0,
            badPass: statValues.badPass || 0,
            handlingError: statValues.handlingError || 0,
            pickUp: statValues.pickUp || 0,
            infringement: statValues.infringement || 0,
            rating: null  // Required field with default null
          };
          
          statsToSave.push(statObject);
        });
      });
      
      // Save all stats
      const promises = statsToSave.map(stat => saveStatMutation.mutateAsync(stat));
      await Promise.all(promises);
      
      // Notify user
      toast({
        title: "Stats Saved",
        description: "All game statistics have been saved successfully."
      });
      
    } catch (error) {
      console.error("Error saving stats:", error);
      toast({
        title: "Error",
        description: "Failed to save game statistics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaveInProgress(false);
    }
  };
  
  // Render a stat counter with +/- buttons
  const renderStatCounter = (position: Position, stat: StatType, hideButtons: boolean = false, isBold: boolean = false) => {
    // Get current value for this stat
    const quarterKey = currentQuarter.toString();
    const currentValue = stats[position]?.[quarterKey]?.[stat] || 0;
    
    return (
      <div className="flex flex-col items-center">
        <div className={`text-center p-2 rounded-lg w-full ${statColors[stat]}`}>
          <p className={`text-xs ${isBold ? 'font-bold' : ''}`}>{statLabels[stat]}</p>
          <p className={`text-xl ${isBold ? 'font-bold' : ''}`}>{currentValue}</p>
        </div>
        
        {!hideButtons && (
          <div className="flex justify-between w-full mt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 h-7"
              onClick={() => updateStat(position, stat, -1)}
              disabled={currentValue === 0}
            >
              <Minus size={14} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 h-7"
              onClick={() => updateStat(position, stat, 1)}
            >
              <Plus size={14} />
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // ***** CONDITIONAL RENDERING *****
  
  // Loading state
  const isLoading = isLoadingGame || isLoadingOpponent || isLoadingStats;
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-4">Loading Game Stats...</h1>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
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
  
  // ***** MAIN RENDER *****
  return (
    <div className="container py-3 px-2 md:py-4 md:px-4">
      {/* Header with game info and action buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Live Stats Tracking</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {game.date} - {opponent?.teamName || 'Unknown Opponent'}
          </p>
        </div>
        
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/games')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Games
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
          >
            <Undo className="mr-1 h-4 w-4" />
            Undo
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
          >
            <Redo className="mr-1 h-4 w-4" />
            Redo
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={saveAllStats}
            disabled={saveInProgress}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
      
      {/* Quarter selection tabs */}
      <Tabs value={currentQuarter.toString()} onValueChange={(v) => setCurrentQuarter(parseInt(v))}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="1">Quarter 1</TabsTrigger>
          <TabsTrigger value="2">Quarter 2</TabsTrigger>
          <TabsTrigger value="3">Quarter 3</TabsTrigger>
          <TabsTrigger value="4">Quarter 4</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Position cards - each in its own full-width row */}
      <div className="grid grid-cols-1 gap-4">
        {/* GS Position Card */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center">
                  GS
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("GS")}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`GS-${stat}`} className="flex-1 min-w-[70px]">
                    {renderStatCounter("GS", stat)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Position-specific stats for GS */}
          <CardContent className="py-2 pt-1">
            <div className="flex justify-center gap-3 flex-wrap">
              <div className="min-w-[120px]">
                {renderStatCounter("GS", "goalsFor", false, true)}
              </div>
              <div className="min-w-[120px]">
                {renderStatCounter("GS", "missedGoals", false, true)}
              </div>
              <div className="min-w-[120px]">
                {renderStatCounter("GS", "rebounds", false, true)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* GA Position Card */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center">
                  GA
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("GA")}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`GA-${stat}`} className="flex-1 min-w-[70px]">
                    {renderStatCounter("GA", stat)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Position-specific stats for GA */}
          <CardContent className="py-2 pt-1">
            <div className="flex justify-center gap-3 flex-wrap">
              <div className="min-w-[120px]">
                {renderStatCounter("GA", "goalsFor", false, true)}
              </div>
              <div className="min-w-[120px]">
                {renderStatCounter("GA", "missedGoals", false, true)}
              </div>
              <div className="min-w-[120px]">
                {renderStatCounter("GA", "rebounds", false, true)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* WA Position Card */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center">
                  WA
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("WA")}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`WA-${stat}`} className="flex-1 min-w-[70px]">
                    {renderStatCounter("WA", stat)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* C Position Card */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center">
                  C
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("C")}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`C-${stat}`} className="flex-1 min-w-[70px]">
                    {renderStatCounter("C", stat)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* WD Position Card */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center">
                  WD
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("WD")}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`WD-${stat}`} className="flex-1 min-w-[70px]">
                    {renderStatCounter("WD", stat)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* GD Position Card */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center">
                  GD
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("GD")}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`GD-${stat}`} className="flex-1 min-w-[70px]">
                    {renderStatCounter("GD", stat)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Position-specific stats for GD */}
          <CardContent className="py-2 pt-1">
            <div className="flex justify-center gap-3 flex-wrap">
              <div className="min-w-[120px]">
                {renderStatCounter("GD", "goalsAgainst", false, true)}
              </div>
              <div className="min-w-[120px]">
                {renderStatCounter("GD", "rebounds", false, true)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* GK Position Card */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center">
                  GK
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("GK")}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`GK-${stat}`} className="flex-1 min-w-[70px]">
                    {renderStatCounter("GK", stat)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Position-specific stats for GK */}
          <CardContent className="py-2 pt-1">
            <div className="flex justify-center gap-3 flex-wrap">
              <div className="min-w-[120px]">
                {renderStatCounter("GK", "goalsAgainst", false, true)}
              </div>
              <div className="min-w-[120px]">
                {renderStatCounter("GK", "rebounds", false, true)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}