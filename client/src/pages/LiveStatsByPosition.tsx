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
  
  // Get position color for the avatar
  const getPositionColor = (position: Position): string => {
    const colorMap: Record<Position, string> = {
      "GS": "#f43f5e", // rose-500
      "GA": "#ef4444", // red-500
      "WA": "#f97316", // orange-500
      "C": "#f59e0b",  // amber-500
      "WD": "#10b981", // emerald-500
      "GD": "#3b82f6", // blue-500
      "GK": "#6366f1"  // indigo-500
    };
    
    return colorMap[position] || "#6b7280"; // gray-500 as fallback
  };
  
  // Get position full name
  const positionLabels: Record<Position, string> = {
    "GS": "Goal Shooter",
    "GA": "Goal Attack",
    "WA": "Wing Attack",
    "C": "Center",
    "WD": "Wing Defense",
    "GD": "Goal Defense",
    "GK": "Goal Keeper"
  };
  
  // Common stats shown at the top of each player card - show all of these for every position
  const commonStats: StatType[] = ['intercepts', 'badPass', 'handlingError', 'infringement', 'pickUp'];
  
  // Position-specific stats shown in the second row
  const positionSpecificStats: Record<Position, StatType[]> = {
    "GS": ["goalsFor", "missedGoals", "rebounds"],
    "GA": ["goalsFor", "missedGoals", "rebounds"],
    "WA": [],
    "C": [],
    "WD": [],
    "GD": ["goalsAgainst", "rebounds"],
    "GK": ["goalsAgainst", "rebounds"]
  };
  
  // Get roster information to display player names
  const [rosterData, setRosterData] = useState<Roster[]>([]);
  const [playerData, setPlayerData] = useState<Record<number, Player>>({});
  
  // Load roster information and player data
  useEffect(() => {
    if (game) {
      // Fetch roster information for this game
      const fetchRosterData = apiRequest<Roster[]>(`/api/games/${game.id}/rosters`);
      // Fetch all players at once
      const fetchAllPlayers = apiRequest<Player[]>(`/api/players`);
      
      // Run both requests in parallel
      Promise.all([fetchRosterData, fetchAllPlayers])
        .then(([rosters, players]) => {
          setRosterData(rosters);
          
          // Create a map of player ID to player data
          const playerMap: Record<number, Player> = {};
          players.forEach(player => {
            playerMap[player.id] = player;
          });
          setPlayerData(playerMap);
        })
        .catch(err => {
          console.error("Error loading roster data:", err);
        });
    }
  }, [game]);
  
  // Get player name for a position in current quarter
  const getPlayerForPosition = (position: Position): string => {
    if (!rosterData.length) return positionLabels[position]; // Fallback to position label
    
    const rosterEntry = rosterData.find(r => 
      r.position === position && r.quarter === currentQuarter
    );
    
    if (!rosterEntry) return positionLabels[position]; // Fallback if no roster entry
    
    const player = playerData[rosterEntry.playerId];
    return player ? player.displayName : positionLabels[position]; // Return player name or fallback
  };
  
  return (
    <div className="container py-3 px-2 md:py-4 md:px-4">
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
      
      {/* Scoreboard and Quarter Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <p className="text-xs md:text-sm text-muted-foreground">Team</p>
                <p className="text-2xl md:text-3xl font-bold">{getGameTotal('goalsFor')}</p>
              </div>
              <div className="text-xl md:text-2xl font-bold">-</div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-muted-foreground">{opponent?.teamName || "Opponent"}</p>
                <p className="text-2xl md:text-3xl font-bold">{getGameTotal('goalsAgainst')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="py-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base md:text-lg font-semibold">Quarter {currentQuarter}</CardTitle>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(quarter => (
                  <Button
                    key={quarter}
                    variant={quarter === currentQuarter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuarter(quarter)}
                    className="w-7 h-7 md:w-8 md:h-8 p-0 text-xs md:text-sm"
                  >
                    {quarter}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Quarter Score</p>
                <p className="text-xl md:text-2xl font-bold">{getQuarterTotal('goalsFor')} - {getQuarterTotal('goalsAgainst')}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="h-7 w-7 md:h-8 md:w-8 p-0"
                >
                  <Undo className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="h-7 w-7 md:h-8 md:w-8 p-0"
                >
                  <Redo className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Position Cards - Same format as the original */}
      <div className="space-y-3">
        {/* GS */}
        <Card className="overflow-hidden">
          <CardHeader className="py-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-3 w-[180px]">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                  style={{
                    backgroundColor: getPositionColor("GS"),
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  title="Goal Shooter"
                >
                  GS
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("GS")}</p>
                  <p className="text-xs text-muted-foreground">{positionLabels["GS"]}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`GS-common-${stat}`} className="flex-1 min-w-[120px] max-w-[140px]">
                    {renderStatCounter("GS", stat, false, false)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Only render CardContent if this position has position-specific stats */}
          {positionSpecificStats["GS"].length > 0 && (
            <CardContent className="py-2 pt-1">
              <div className="flex justify-center gap-3 flex-wrap">
                {positionSpecificStats["GS"].map(stat => (
                  <div key={`GS-specific-${stat}`} className="min-w-[120px]">
                    {renderStatCounter("GS", stat, false, stat === "goalsFor" || stat === "goalsAgainst")}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* GA */}
        <Card className="overflow-hidden">
          <CardHeader className="py-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-3 w-[180px]">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                  style={{
                    backgroundColor: getPositionColor("GA"),
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  title="Goal Attack"
                >
                  GA
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("GA")}</p>
                  <p className="text-xs text-muted-foreground">{positionLabels["GA"]}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`GA-common-${stat}`} className="flex-1 min-w-[120px] max-w-[140px]">
                    {renderStatCounter("GA", stat, false, false)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Only render CardContent if this position has position-specific stats */}
          {positionSpecificStats["GA"].length > 0 && (
            <CardContent className="py-2 pt-1">
              <div className="flex justify-center gap-3 flex-wrap">
                {positionSpecificStats["GA"].map(stat => (
                  <div key={`GA-specific-${stat}`} className="min-w-[120px]">
                    {renderStatCounter("GA", stat, false, stat === "goalsFor" || stat === "goalsAgainst")}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* WA */}
        <Card className="overflow-hidden">
          <CardHeader className="py-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-3 w-[180px]">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                  style={{
                    backgroundColor: getPositionColor("WA"),
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  title="Wing Attack"
                >
                  WA
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("WA")}</p>
                  <p className="text-xs text-muted-foreground">{positionLabels["WA"]}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`WA-common-${stat}`} className="flex-1 min-w-[120px] max-w-[140px]">
                    {renderStatCounter("WA", stat, false, false)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Only render CardContent if this position has position-specific stats */}
          {positionSpecificStats["WA"].length > 0 && (
            <CardContent className="py-2 pt-1">
              <div className="flex justify-center gap-3 flex-wrap">
                {positionSpecificStats["WA"].map(stat => (
                  <div key={`WA-specific-${stat}`} className="min-w-[120px]">
                    {renderStatCounter("WA", stat, false, stat === "goalsFor" || stat === "goalsAgainst")}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* C */}
        <Card className="overflow-hidden">
          <CardHeader className="py-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-3 w-[180px]">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                  style={{
                    backgroundColor: getPositionColor("C"),
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  title="Center"
                >
                  C
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("C")}</p>
                  <p className="text-xs text-muted-foreground">{positionLabels["C"]}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`C-common-${stat}`} className="flex-1 min-w-[120px] max-w-[140px]">
                    {renderStatCounter("C", stat, false, false)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Only render CardContent if this position has position-specific stats */}
          {positionSpecificStats["C"].length > 0 && (
            <CardContent className="py-2 pt-1">
              <div className="flex justify-center gap-3 flex-wrap">
                {positionSpecificStats["C"].map(stat => (
                  <div key={`C-specific-${stat}`} className="min-w-[120px]">
                    {renderStatCounter("C", stat, false, stat === "goalsFor" || stat === "goalsAgainst")}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* WD */}
        <Card className="overflow-hidden">
          <CardHeader className="py-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-3 w-[180px]">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                  style={{
                    backgroundColor: getPositionColor("WD"),
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  title="Wing Defense"
                >
                  WD
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("WD")}</p>
                  <p className="text-xs text-muted-foreground">{positionLabels["WD"]}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`WD-common-${stat}`} className="flex-1 min-w-[120px] max-w-[140px]">
                    {renderStatCounter("WD", stat, false, false)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Only render CardContent if this position has position-specific stats */}
          {positionSpecificStats["WD"].length > 0 && (
            <CardContent className="py-2 pt-1">
              <div className="flex justify-center gap-3 flex-wrap">
                {positionSpecificStats["WD"].map(stat => (
                  <div key={`WD-specific-${stat}`} className="min-w-[120px]">
                    {renderStatCounter("WD", stat, false, stat === "goalsFor" || stat === "goalsAgainst")}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* GD */}
        <Card className="overflow-hidden">
          <CardHeader className="py-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-3 w-[180px]">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                  style={{
                    backgroundColor: getPositionColor("GD"),
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  title="Goal Defense"
                >
                  GD
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("GD")}</p>
                  <p className="text-xs text-muted-foreground">{positionLabels["GD"]}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`GD-common-${stat}`} className="flex-1 min-w-[120px] max-w-[140px]">
                    {renderStatCounter("GD", stat, false, false)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Only render CardContent if this position has position-specific stats */}
          {positionSpecificStats["GD"].length > 0 && (
            <CardContent className="py-2 pt-1">
              <div className="flex justify-center gap-3 flex-wrap">
                {positionSpecificStats["GD"].map(stat => (
                  <div key={`GD-specific-${stat}`} className="min-w-[120px]">
                    {renderStatCounter("GD", stat, false, stat === "goalsFor" || stat === "goalsAgainst")}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* GK */}
        <Card className="overflow-hidden">
          <CardHeader className="py-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-3 w-[180px]">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                  style={{
                    backgroundColor: getPositionColor("GK"),
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  title="Goal Keeper"
                >
                  GK
                </div>
                
                <div className="min-w-[60px]">
                  <p className="font-semibold text-sm">{getPlayerForPosition("GK")}</p>
                  <p className="text-xs text-muted-foreground">{positionLabels["GK"]}</p>
                </div>
              </div>
              
              {/* Common stats - show all for every position */}
              <div className="flex-1 flex flex-wrap gap-2">
                {commonStats.map(stat => (
                  <div key={`GK-common-${stat}`} className="flex-1 min-w-[120px] max-w-[140px]">
                    {renderStatCounter("GK", stat, false, false)}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          {/* Only render CardContent if this position has position-specific stats */}
          {positionSpecificStats["GK"].length > 0 && (
            <CardContent className="py-2 pt-1">
              <div className="flex justify-center gap-3 flex-wrap">
                {positionSpecificStats["GK"].map(stat => (
                  <div key={`GK-specific-${stat}`} className="min-w-[120px]">
                    {renderStatCounter("GK", stat, false, stat === "goalsFor" || stat === "goalsAgainst")}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}