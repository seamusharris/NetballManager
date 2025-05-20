import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Game, Player, GameStat, Roster, allPositions } from '@shared/schema';
import { getInitials, formatShortDate, positionLabels } from '@/lib/utils';
import { 
  PlusCircle, MinusCircle, Save, Undo, Redo, 
  RefreshCw, XCircle, CheckCircle, Plus, Minus 
} from 'lucide-react';

// Stat types that can be tracked
type StatType = 'goalsFor' | 'goalsAgainst' | 'missedGoals' | 'rebounds' | 
                'intercepts' | 'badPass' | 'handlingError' | 'pickUp' | 'infringement';

// Game stats by quarter and player
interface GameStats {
  [playerId: number]: {
    [quarter: number]: {
      [stat in StatType]?: number;
    }
  }
}

// New empty stat entry for a player
const emptyQuarterStats = {
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

// Stat button configuration
interface StatButton {
  stat: StatType;
  label: string;
  color: string;
  icon: React.ReactNode;
}

// Group stats into categories
const statButtons: Record<string, StatButton[]> = {
  'Shooting': [
    { stat: 'goalsFor', label: 'Goal', color: 'bg-green-100 hover:bg-green-200 text-green-700', icon: <PlusCircle className="h-4 w-4" /> },
    { stat: 'goalsAgainst', label: 'Goal Against', color: 'bg-red-100 hover:bg-red-200 text-red-700', icon: <MinusCircle className="h-4 w-4" /> },
    { stat: 'missedGoals', label: 'Miss', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700', icon: <XCircle className="h-4 w-4" /> },
  ],
  'Defense': [
    { stat: 'rebounds', label: 'Rebound', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700', icon: <Plus className="h-4 w-4" /> },
    { stat: 'intercepts', label: 'Intercept', color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700', icon: <Plus className="h-4 w-4" /> },
    { stat: 'pickUp', label: 'Pick Up', color: 'bg-purple-100 hover:bg-purple-200 text-purple-700', icon: <Plus className="h-4 w-4" /> },
  ],
  'Errors': [
    { stat: 'badPass', label: 'Bad Pass', color: 'bg-amber-100 hover:bg-amber-200 text-amber-700', icon: <Minus className="h-4 w-4" /> },
    { stat: 'handlingError', label: 'Handling Error', color: 'bg-pink-100 hover:bg-pink-200 text-pink-700', icon: <Minus className="h-4 w-4" /> },
    { stat: 'infringement', label: 'Infringement', color: 'bg-rose-100 hover:bg-rose-200 text-rose-700', icon: <Minus className="h-4 w-4" /> },
  ]
};

export default function LiveStats() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id);
  const [, navigate] = useLocation();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for tracking the game
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [liveStats, setLiveStats] = useState<GameStats>({});
  const [undoStack, setUndoStack] = useState<GameStats[]>([]);
  const [redoStack, setRedoStack] = useState<GameStats[]>([]);
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  
  // Fetch game details
  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => apiRequest(`/api/games/${gameId}`),
    enabled: !!gameId && !isNaN(gameId)
  });
  
  // Fetch player roster for this game
  const { data: rosters, isLoading: rostersLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'rosters'],
    queryFn: () => apiRequest(`/api/games/${gameId}/rosters`),
    enabled: !!gameId && !isNaN(gameId)
  });
  
  // Fetch existing stats for this game
  const { data: existingStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => apiRequest(`/api/games/${gameId}/stats`),
    enabled: !!gameId && !isNaN(gameId)
  });
  
  // Fetch all players
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players'],
    queryFn: () => apiRequest('/api/players'),
  });
  
  // Create or update game stats
  const { mutate: saveGameStat } = useMutation({
    mutationFn: (gameStat: Partial<GameStat>) => 
      apiRequest(`/api/games/${gameId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameStat)
      } as RequestInit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
    }
  });
  
  // Initialize the live stats when existing data is loaded
  useEffect(() => {
    if (existingStats && existingStats.length > 0 && players) {
      const initialStats: GameStats = {};
      
      // Initialize empty stats for all players
      players.forEach(player => {
        initialStats[player.id] = {
          1: { ...emptyQuarterStats },
          2: { ...emptyQuarterStats },
          3: { ...emptyQuarterStats },
          4: { ...emptyQuarterStats }
        };
      });
      
      // Populate with existing stats
      existingStats.forEach(stat => {
        if (!initialStats[stat.playerId]) {
          initialStats[stat.playerId] = {
            1: { ...emptyQuarterStats },
            2: { ...emptyQuarterStats },
            3: { ...emptyQuarterStats },
            4: { ...emptyQuarterStats }
          };
        }
        
        // Safety check for undefined quarters
        if (!initialStats[stat.playerId][stat.quarter]) {
          initialStats[stat.playerId][stat.quarter] = { ...emptyQuarterStats };
        }
        
        // Populate individual stat values
        Object.keys(emptyQuarterStats).forEach(key => {
          const statKey = key as StatType;
          if (stat[statKey] !== undefined) {
            initialStats[stat.playerId][stat.quarter][statKey] = stat[statKey] as number;
          }
        });
      });
      
      setLiveStats(initialStats);
      // Clear undo/redo stacks when loading fresh data
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [existingStats, players]);
  
  // Get player details by ID
  const getPlayer = (playerId: number): Player | undefined => {
    return players?.find(p => p.id === playerId);
  };
  
  // Get current position for a player in the specified quarter
  const getPlayerPosition = (playerId: number, quarter: number): string => {
    if (!rosters) return '';
    
    const playerRoster = rosters.find(r => 
      r.playerId === playerId && r.quarter === quarter
    );
    
    return playerRoster ? playerRoster.position : '';
  };
  
  // Get list of players on court in the current quarter
  const getPlayersOnCourt = (): number[] => {
    if (!rosters) return [];
    
    return rosters
      .filter(r => r.quarter === currentQuarter && allPositions.includes(r.position))
      .map(r => r.playerId);
  };
  
  // Record a new stat
  const recordStat = (playerId: number, stat: StatType, value: number = 1) => {
    // Save current state for undo
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(liveStats))]);
    setRedoStack([]);
    
    setLiveStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));
      
      // Initialize if needed
      if (!newStats[playerId]) {
        newStats[playerId] = {};
      }
      
      if (!newStats[playerId][currentQuarter]) {
        newStats[playerId][currentQuarter] = { ...emptyQuarterStats };
      }
      
      // Update the stat
      const currentValue = newStats[playerId][currentQuarter][stat] || 0;
      newStats[playerId][currentQuarter][stat] = Math.max(0, currentValue + value);
      
      return newStats;
    });
  };
  
  // Undo last action
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      
      // Save current state to redo stack
      setRedoStack([...redoStack, JSON.parse(JSON.stringify(liveStats))]);
      
      // Restore previous state
      setLiveStats(lastState);
      setUndoStack(newUndoStack);
    }
  };
  
  // Redo last undone action
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      
      // Save current state to undo stack
      setUndoStack([...undoStack, JSON.parse(JSON.stringify(liveStats))]);
      
      // Restore next state
      setLiveStats(nextState);
      setRedoStack(newRedoStack);
    }
  };
  
  // Save all stats to the database
  const saveAllStats = async () => {
    if (!liveStats || Object.keys(liveStats).length === 0) {
      toast({
        title: "Nothing to save",
        description: "No statistics have been recorded yet.",
        variant: "destructive"
      });
      return;
    }
    
    setSaveInProgress(true);
    
    try {
      // For each player and quarter with stats
      for (const playerId in liveStats) {
        for (const quarter in liveStats[playerId]) {
          const playerQuarterStats = liveStats[playerId][parseInt(quarter)];
          
          // Skip empty quarters
          if (!playerQuarterStats || Object.values(playerQuarterStats).every(v => v === 0)) {
            continue;
          }
          
          // Prepare the stat object
          const statObject: Partial<GameStat> = {
            gameId,
            playerId: parseInt(playerId),
            quarter: parseInt(quarter),
            ...playerQuarterStats
          };
          
          // Save to database
          await saveGameStat(statObject);
        }
      }
      
      toast({
        title: "Statistics saved",
        description: "All game statistics have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error saving statistics",
        description: "There was a problem saving the statistics. Please try again.",
        variant: "destructive"
      });
      console.error("Error saving stats:", error);
    } finally {
      setSaveInProgress(false);
    }
  };
  
  // Get quarter total for a specific stat
  const getQuarterTotal = (stat: StatType): number => {
    let total = 0;
    
    Object.keys(liveStats).forEach(playerIdStr => {
      const playerId = parseInt(playerIdStr);
      const playerStats = liveStats[playerId][currentQuarter];
      if (playerStats && playerStats[stat]) {
        total += playerStats[stat] || 0;
      }
    });
    
    return total;
  };
  
  // Get game total for a specific stat
  const getGameTotal = (stat: StatType): number => {
    let total = 0;
    
    Object.keys(liveStats).forEach(playerIdStr => {
      const playerId = parseInt(playerIdStr);
      
      [1, 2, 3, 4].forEach(quarter => {
        const playerStats = liveStats[playerId][quarter];
        if (playerStats && playerStats[stat]) {
          total += playerStats[stat] || 0;
        }
      });
    });
    
    return total;
  };
  
  // Format score for display (our goals vs their goals)
  const formatScore = (ourGoals: number, theirGoals: number): string => {
    return `${ourGoals} - ${theirGoals}`;
  };
  
  // Loading state
  if (gameLoading || rostersLoading || statsLoading || playersLoading) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Loading game statistics...</h1>
        <p>Please wait while we load the game data.</p>
      </div>
    );
  }
  
  // Error state - game not found
  if (!game) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Game not found</h1>
        <p>The requested game could not be found. Please check the game ID and try again.</p>
        <Button className="mt-4" onClick={() => navigate('/games')}>
          Back to Games
        </Button>
      </div>
    );
  }
  
  // Error state - game is a bye
  if (game.isBye) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Cannot track statistics</h1>
        <p>This game is marked as a BYE. Statistics tracking is not available for BYE games.</p>
        <Button className="mt-4" onClick={() => navigate('/games')}>
          Back to Games
        </Button>
      </div>
    );
  }
  
  const playersOnCourt = getPlayersOnCourt();
  const currentScore = formatScore(getGameTotal('goalsFor'), getGameTotal('goalsAgainst'));
  const quarterScore = formatScore(getQuarterTotal('goalsFor'), getQuarterTotal('goalsAgainst'));
  
  return (
    <div className="container py-4 px-2 md:py-6 md:px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div>
          <h1 className="text-2xl font-bold">Live Stats Tracking</h1>
          <p className="text-muted-foreground">
            {formatShortDate(game.date)} vs {game.opponentName}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/games/${gameId}`)}
          >
            Back to Game
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-lg font-semibold">Game Score</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Our Team</p>
                <p className="text-3xl font-bold">{getGameTotal('goalsFor')}</p>
              </div>
              <div className="text-2xl font-bold">-</div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{game.opponentName}</p>
                <p className="text-3xl font-bold">{getGameTotal('goalsAgainst')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Quarter {currentQuarter}</CardTitle>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(quarter => (
                  <Button
                    key={quarter}
                    variant={quarter === currentQuarter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuarter(quarter)}
                    className="w-8 h-8 p-0"
                  >
                    {quarter}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Quarter Score</p>
                <p className="text-2xl font-bold">{getQuarterTotal('goalsFor')} - {getQuarterTotal('goalsAgainst')}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Players on court */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Players on Court - Quarter {currentQuarter}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {playersOnCourt.map(playerId => {
            const player = getPlayer(playerId);
            if (!player) return null;
            
            const position = getPlayerPosition(playerId, currentQuarter);
            
            return (
              <Card key={playerId} className="overflow-hidden">
                <CardHeader className="p-3 pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(player.firstName, player.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold leading-none">{player.displayName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{positionLabels[position as any] || position}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Goals</p>
                      <p className="font-semibold">{liveStats[playerId]?.[currentQuarter]?.goalsFor || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Int</p>
                      <p className="font-semibold">{liveStats[playerId]?.[currentQuarter]?.intercepts || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Reb</p>
                      <p className="font-semibold">{liveStats[playerId]?.[currentQuarter]?.rebounds || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Stat recording section */}
      <div className="mb-4">
        <Tabs defaultValue="Shooting">
          <TabsList className="mb-2">
            {Object.keys(statButtons).map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(statButtons).map(([category, buttons]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">{category} Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {buttons.map(button => (
                      <div key={button.stat} className="space-y-2">
                        <p className="text-sm font-medium">{button.label}</p>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {playersOnCourt.map(playerId => {
                            const player = getPlayer(playerId);
                            if (!player) return null;
                            
                            const currentValue = liveStats[playerId]?.[currentQuarter]?.[button.stat] || 0;
                            
                            return (
                              <div key={`${playerId}-${button.stat}`} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                      {getInitials(player.firstName, player.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{player.displayName}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => recordStat(playerId, button.stat, -1)}
                                    disabled={currentValue <= 0}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  
                                  <span className="w-8 text-center font-semibold">
                                    {currentValue}
                                  </span>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${button.color}`}
                                    onClick={() => recordStat(playerId, button.stat, 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Save button at the bottom */}
      <div className="flex justify-end mt-4">
        <Button
          size="lg"
          onClick={saveAllStats}
          disabled={saveInProgress}
          className="px-8"
        >
          <Save className="h-5 w-5 mr-2" />
          Save All Statistics
        </Button>
      </div>
    </div>
  );
}