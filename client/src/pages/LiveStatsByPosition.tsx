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

// Nice display labels for positions
const positionLabels: Record<Position, string> = {
  "GS": "Goal Shooter",
  "GA": "Goal Attack",
  "WA": "Wing Attack",
  "C": "Center",
  "WD": "Wing Defense",
  "GD": "Goal Defense",
  "GK": "Goal Keeper"
};

// Common stats that should appear for all positions
const commonStats: StatType[] = [
  'intercepts',
  'pickUp',
  'badPass',
  'handlingError',
  'infringement'
];

// Position-specific stats that appear below common stats
const positionSpecificStats: Record<Position, StatType[]> = {
  "GS": ['goalsFor', 'missedGoals', 'rebounds'],
  "GA": ['goalsFor', 'missedGoals', 'rebounds'],
  "WA": [],
  "C": [],
  "WD": [],
  "GD": ['goalsAgainst', 'rebounds'],
  "GK": ['goalsAgainst', 'rebounds']
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
  // Use route params to get the game ID
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State hooks - define ALL state variables first
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [positionStats, setPositionStats] = useState<PositionStats>({});
  const [undoStack, setUndoStack] = useState<HistoryRecord[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryRecord[]>([]);
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [rosterData, setRosterData] = useState<Roster[]>([]);
  const [playerData, setPlayerData] = useState<Record<number, Player>>({});
  
  // Queries - define all queries after state
  const { data: game, isLoading: isLoadingGame } = useQuery({
    queryKey: ['/api/games', gameId],
    enabled: !!gameId
  });
  
  const { data: opponent, isLoading: isLoadingOpponent } = useQuery({
    queryKey: ['/api/opponents', game?.opponentId],
    enabled: !!game?.opponentId
  });
  
  const { data: existingStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    enabled: !!gameId
  });
  
  // Mutations - define after queries
  const saveStatMutation = useMutation({
    mutationFn: async (statData: Omit<GameStat, 'id'>) => {
      return apiRequest('/api/game-stats', {
        method: 'POST',
        data: statData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
    }
  });
  
  // All effects after state, queries, and mutations
  
  // Initialize stats from existing data
  useEffect(() => {
    if (existingStats && existingStats.length > 0) {
      console.log(`Initializing LiveStatsByPosition with ${existingStats.length} existing stats`);
      
      const initialStats: PositionStats = {};
      
      // Initialize positions and quarters
      allPositions.forEach(position => {
        initialStats[position] = {};
        for (let q = 1; q <= 4; q++) {
          initialStats[position][q.toString()] = { ...emptyPositionStats };
        }
      });
      
      // Apply existing stats
      existingStats.forEach((stat: GameStat) => {
        if (stat.position && stat.quarter >= 1 && stat.quarter <= 4) {
          const position = stat.position as Position;
          const quarter = stat.quarter.toString();
          
          console.log(`Found stat for ${position} in Q${quarter}: Goals: ${stat.goalsFor}, Against: ${stat.goalsAgainst}`);
          
          // Make sure the position and quarter exist
          if (!initialStats[position]) {
            initialStats[position] = {};
          }
          if (!initialStats[position][quarter]) {
            initialStats[position][quarter] = { ...emptyPositionStats };
          }
          
          // Copy all relevant statistics 
          (Object.keys(emptyPositionStats) as StatType[]).forEach(key => {
            if (stat[key] !== undefined) {
              const value = Number(stat[key]) || 0;
              initialStats[position][quarter][key] = value;
              
              if (value > 0) {
                console.log(`Setting ${key} = ${value} for ${position} in Q${quarter}`);
              }
            }
          });
        }
      });
      
      setPositionStats(initialStats);
    }
  }, [existingStats]);
  
  // Load roster and player data
  useEffect(() => {
    if (game) {
      // Fetch roster information
      apiRequest<Roster[]>(`/api/games/${game.id}/rosters`)
        .then(rosters => {
          setRosterData(rosters);
        })
        .catch(err => {
          console.error("Error loading roster data:", err);
        });
        
      // Fetch player information
      apiRequest<Player[]>('/api/players')
        .then(players => {
          const playerMap: Record<number, Player> = {};
          players.forEach(player => {
            playerMap[player.id] = player;
          });
          setPlayerData(playerMap);
        })
        .catch(err => {
          console.error("Error loading player data:", err);
        });
    }
  }, [game]);
  
  // Helper functions - defined after all hooks
  
  // Get player name for position in current quarter
  const getPlayerForPosition = (position: Position): string => {
    if (!rosterData.length) return position;
    
    const rosterEntry = rosterData.find(r => 
      r.position === position && r.quarter === currentQuarter
    );
    
    if (!rosterEntry) return position;
    
    const player = playerData[rosterEntry.playerId];
    return player ? player.displayName : position;
  };
  
  // Save current state to undo stack
  const pushToUndoStack = () => {
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(positionStats))]);
    setRedoStack([]);
  };
  
  // Undo last action
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const prevState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    setRedoStack(prev => [JSON.parse(JSON.stringify(positionStats)), ...prev]);
    setPositionStats(prevState);
    setUndoStack(newUndoStack);
  };
  
  // Redo last undone action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const [nextState, ...remainingRedoStack] = redoStack;
    
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(positionStats))]);
    setPositionStats(nextState);
    setRedoStack(remainingRedoStack);
  };
  
  // Update stat value for position in current quarter
  const updateStat = (position: Position, stat: StatType, increment: number = 1) => {
    pushToUndoStack();
    
    setPositionStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));
      const quarterKey = currentQuarter.toString();
      
      // Ensure position and quarter exist
      if (!newStats[position]) {
        newStats[position] = {};
      }
      if (!newStats[position][quarterKey]) {
        newStats[position][quarterKey] = { ...emptyPositionStats };
      }
      
      // Update the stat value (min 0)
      const currentValue = newStats[position][quarterKey][stat] || 0;
      newStats[position][quarterKey][stat] = Math.max(0, currentValue + increment);
      
      return newStats;
    });
  };
  
  // Save all stats to database
  const saveAllStats = async () => {
    if (saveInProgress) return;
    
    try {
      setSaveInProgress(true);
      
      // Build stats to save
      const statsToSave: Omit<GameStat, 'id'>[] = [];
      
      Object.entries(positionStats).forEach(([position, quarters]) => {
        Object.entries(quarters).forEach(([quarter, stats]) => {
          statsToSave.push({
            gameId,
            position: position as Position,
            quarter: parseInt(quarter),
            ...stats
          });
        });
      });
      
      // Save all stats
      await Promise.all(statsToSave.map(stat => saveStatMutation.mutateAsync(stat)));
      
      toast({
        title: "Stats Saved",
        description: "Game statistics have been saved successfully."
      });
      
      // Clear redo stack after successful save
      setRedoStack([]);
      
    } catch (error) {
      console.error("Error saving stats:", error);
      toast({
        title: "Error Saving Stats",
        description: "There was a problem saving the game statistics.",
        variant: "destructive"
      });
    } finally {
      setSaveInProgress(false);
    }
  };
  
  // Render stat counter with increment/decrement buttons
  const renderStatCounter = (
    position: Position, 
    stat: StatType, 
    hideButtons: boolean = false,
    isBold: boolean = false
  ) => {
    const currentStats = positionStats[position]?.[currentQuarter.toString()] || { ...emptyPositionStats };
    const value = currentStats[stat] || 0;
    
    return (
      <div className="flex flex-col items-center">
        <div className={`text-center p-2 rounded-lg w-full ${statColors[stat]}`}>
          <p className={`text-xs ${isBold ? 'font-bold' : ''}`}>{statLabels[stat]}</p>
          <p className={`text-xl ${isBold ? 'font-bold' : ''}`}>{value}</p>
        </div>
        
        {!hideButtons && (
          <div className="flex justify-between w-full mt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 h-7"
              onClick={() => updateStat(position, stat, -1)}
              disabled={value === 0}
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
  
  return (
    <div className="container py-3 px-2 md:py-4 md:px-4">
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
      
      <Tabs value={currentQuarter.toString()} onValueChange={(v) => setCurrentQuarter(parseInt(v))}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="1">Quarter 1</TabsTrigger>
          <TabsTrigger value="2">Quarter 2</TabsTrigger>
          <TabsTrigger value="3">Quarter 3</TabsTrigger>
          <TabsTrigger value="4">Quarter 4</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          
          {/* Always render the specific stats for GS */}
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
          
          {/* Always render the specific stats for GA */}
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
          
          {/* Always render the specific stats for GD */}
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
          
          {/* Always render the specific stats for GK */}
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