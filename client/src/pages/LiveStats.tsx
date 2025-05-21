import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Game, Player, GameStat, Roster, allPositions, Position } from '@shared/schema';
import { getInitials, formatShortDate, positionLabels, generatePlayerAvatarColor } from '@/lib/utils';
import { Save, Undo, Redo, Plus, Minus } from 'lucide-react';

// Stat types that can be tracked
type StatType = 'goalsFor' | 'goalsAgainst' | 'missedGoals' | 'rebounds' | 
                'intercepts' | 'badPass' | 'handlingError' | 'pickUp' | 'infringement';

// Quarter stats including both regular stats and position info
interface QuarterStats {
  goalsFor: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  badPass: number;
  handlingError: number;
  pickUp: number;
  infringement: number;
  position?: Position; // Track which position this player was in
}

// Game stats by quarter and player
interface GameStats {
  [playerId: number]: {
    [quarter: number]: QuarterStats
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

// Different stat availabilities by position - true means the stat is available for this position
const positionStatConfig: Record<Position, Record<StatType, boolean>> = {
  'GS': {
    goalsFor: true,
    goalsAgainst: false,
    missedGoals: true,
    rebounds: true,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  'GA': {
    goalsFor: true,
    goalsAgainst: false,
    missedGoals: true,
    rebounds: true,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  'WA': {
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
  'C': {
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
  'WD': {
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
  'GD': {
    goalsFor: false,
    goalsAgainst: true,
    missedGoals: false,
    rebounds: true,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  'GK': {
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

// Stat colors and labels
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
  
  // Fetch opponent details if we have a game
  const { data: opponent, isLoading: opponentLoading } = useQuery({
    queryKey: ['/api/opponents', game?.opponentId],
    queryFn: () => apiRequest(`/api/opponents/${game?.opponentId}`),
    enabled: !!game?.opponentId
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
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
    }
  });
  
  // Initialize the live stats when existing data is loaded
  useEffect(() => {
    if (existingStats && players) {
      const initialStats: GameStats = {};
      
      // Initialize empty stats for all players
      players.forEach((player: Player) => {
        initialStats[player.id] = {
          1: { ...emptyQuarterStats },
          2: { ...emptyQuarterStats },
          3: { ...emptyQuarterStats },
          4: { ...emptyQuarterStats }
        };
      });
      
      // Populate with existing stats
      if (existingStats.length > 0) {
        existingStats.forEach((stat: GameStat) => {
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
      }
      
      setLiveStats(initialStats);
      // Clear undo/redo stacks when loading fresh data
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [existingStats, players]);
  
  // Get player details by ID
  const getPlayer = (playerId: number): Player | undefined => {
    return players?.find((p: Player) => p.id === playerId);
  };
  
  // Get current position for a player in the specified quarter
  const getPlayerPosition = (playerId: number, quarter: number): Position | '' => {
    if (!rosters) return '';
    
    const playerRoster = rosters.find((r: Roster) => 
      r.playerId === playerId && r.quarter === quarter
    );
    
    return playerRoster ? playerRoster.position : '';
  };
  
  // Used to define player-position pairing
  interface PlayerPosition {
    playerId: number;
    position: Position;
  }

  // Get list of players on court in the current quarter, sorted by position (GS to GK)
  const getPlayersOnCourt = (): PlayerPosition[] => {
    if (!rosters) return [];
    
    // Get all players on court with their positions
    const positionMap = rosters
      .filter((r: Roster) => r.quarter === currentQuarter && allPositions.includes(r.position))
      .map((r: Roster) => ({
        playerId: r.playerId,
        position: r.position as Position
      }));
    
    // Sort by position order (GS, GA, WA, C, WD, GD, GK)
    return positionMap.sort((a: PlayerPosition, b: PlayerPosition) => {
      return allPositions.indexOf(a.position) - allPositions.indexOf(b.position);
    });
  };
  
  // Record a new stat
  const recordStat = (playerId: number, stat: StatType, value: number = 1) => {
    // Save current state for undo
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(liveStats))]);
    setRedoStack([]);
    
    // Get player's position in this quarter
    const position = getPlayerPosition(playerId, currentQuarter);
    
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
      
      // Store position with the stats
      if (position) {
        newStats[playerId][currentQuarter].position = position;
      }
      
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
      const playerStats = liveStats[playerId]?.[currentQuarter];
      if (playerStats && playerStats[stat] !== undefined) {
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
        const playerStats = liveStats[playerId]?.[quarter];
        if (playerStats && playerStats[stat] !== undefined) {
          total += playerStats[stat] || 0;
        }
      });
    });
    
    return total;
  };
  
  // Common stats to show in the top row
  const commonStats: StatType[] = ['intercepts', 'badPass', 'handlingError', 'infringement', 'pickUp'];
  
  // Check if a stat is common across positions
  const isCommonStat = (stat: StatType): boolean => {
    // These stats are common across most positions
    return commonStats.includes(stat);
  };
  
  // Check if a stat is position-specific
  const isPositionSpecificStat = (stat: StatType): boolean => {
    return !isCommonStat(stat);
  };
  
  // Render a stat counter button
  const renderStatCounter = (playerId: number, stat: StatType, compact: boolean = false, important: boolean = false) => {
    const currentValue = liveStats[playerId]?.[currentQuarter]?.[stat] || 0;
    
    return (
      <div className={`flex flex-col items-center ${compact ? 'p-1' : 'p-2'} rounded-md border`}>
        <p className={`${important ? 'text-sm font-semibold' : 'text-xs font-medium'} mb-1`}>{statLabels[stat]}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0`}
            onClick={() => recordStat(playerId, stat, -1)}
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
            onClick={() => recordStat(playerId, stat, 1)}
          >
            <Plus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </div>
    );
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
  
  return (
    <div className="container py-3 px-2 md:py-4 md:px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Live Stats Tracking</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Round {game.round} | {formatShortDate(game.date)} vs {opponent ? opponent.teamName : game.opponentName || "Opponent"}
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
      
      {/* Game scoreboard - optimized for all tablet sizes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <Card className="overflow-hidden">
          <CardHeader className="py-2">
            <CardTitle className="text-base md:text-lg font-semibold">Game Score</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Our Team</p>
                <p className="text-2xl md:text-3xl font-bold">{getGameTotal('goalsFor')}</p>
              </div>
              <div className="text-xl md:text-2xl font-bold">-</div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-muted-foreground">{opponent ? opponent.teamName : game.opponentName || "Opponent"}</p>
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
      
      {/* Players stat cards - tablet optimized */}
      <div className="mb-4 md:mb-5">
        <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Players on Court - Quarter {currentQuarter}</h2>
        
        {playersOnCourt.length === 0 ? (
          <Card className="p-4 text-center">
            <p>No players have been assigned to positions for this quarter yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Set up your roster first to track stats.</p>
          </Card>
        ) : (
          playersOnCourt.map(({playerId, position}) => {
            const player = getPlayer(playerId);
            if (!player) return null;
            
            const statConfig = positionStatConfig[position];
            const playerStats = liveStats[playerId]?.[currentQuarter] || emptyQuarterStats;
            const avatarColor = generatePlayerAvatarColor(playerId);
            
            return (
              <Card key={playerId} className="mb-3 overflow-hidden">
                <CardHeader className="py-2 pb-2">
                  {/* Use flex instead of grid for better control */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* First section - player identity, fixed width */}
                    <div className="flex items-center gap-2 mr-3 min-w-fit">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                        style={{
                          backgroundColor: '#3b82f6', /* blue-500 */
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {position}
                      </div>
                      
                      <div className="min-w-[60px]">
                        <p className="font-semibold text-sm">{player.displayName}</p>
                      </div>
                    </div>
                    
                    {/* Second section - common stats, filling remaining space */}
                    <div className="flex-1 flex flex-wrap gap-2">
                      {commonStats.map(stat => (
                        statConfig[stat] && (
                          <div key={`${playerId}-common-${stat}`} className="flex-1 min-w-[120px]">
                            {renderStatCounter(playerId, stat, false)}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2 pt-1">
                  {/* Count how many position-specific stats exist */}
                  {(() => {
                    // Get position-specific stat types that are available
                    const posSpecificStats = Object.entries(statConfig)
                      .filter(([stat, isAvailable]) => isAvailable && !commonStats.includes(stat as StatType))
                      .map(([stat]) => stat as StatType);
                    
                    if (posSpecificStats.length === 0) {
                      return null; // No second row needed
                    }
                      
                    return (
                      <div className="flex justify-center gap-2 flex-wrap">
                        {posSpecificStats.map(statType => (
                          <div key={`${playerId}-${statType}`} className="w-[180px]">
                            {renderStatCounter(playerId, statType, false, true)}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}