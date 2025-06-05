import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Game, Player, GameStat, Roster, allPositions, Position } from '@shared/schema';
import { getInitials, formatShortDate, positionLabels, generatePlayerAvatarColor } from '@/lib/utils';
import { Save, Undo, Redo, Plus, Minus, RefreshCw, RotateCcw } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { BackButton } from '@/components/ui/back-button';
import { clearGameCache, clearAllCache } from '@/lib/scoresCache';

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

// Get color for each netball position - colors coordinate with position roles
const getPositionColor = (position: Position | ''): string => {
  switch(position) {
    case 'GS': return '#ef4444'; // Goalers (red)
    case 'GA': return '#f97316'; // Goalers (orange)
    case 'WA': return '#eab308'; // Mid-court (yellow)
    case 'C':  return '#22c55e'; // Mid-court (green)
    case 'WD': return '#06b6d4'; // Defense (cyan)
    case 'GD': return '#3b82f6'; // Defense (blue)
    case 'GK': return '#8b5cf6'; // Defense (purple)
    default:   return '#6b7280'; // Gray for unknown positions
  }
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

import { STAT_LABELS, STAT_COLORS } from '@/lib/constants';
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

  // Fetch game details - use direct game endpoint to bypass team filtering
  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => apiClient.get(`/api/games/${gameId}`),
    enabled: !!gameId && !isNaN(gameId)
  });

  // Fetch opponent details if we have a game
  const { data: opponent, isLoading: opponentLoading } = useQuery({
    queryKey: ['/api/opponents', game?.opponentId],
    queryFn: () => apiClient.get(`/api/opponents/${game?.opponentId}`),
    enabled: !!game?.opponentId
  });

  // Fetch player roster for this game
  const { data: rosters, isLoading: rostersLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'rosters'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/rosters`),
    enabled: !!gameId && !isNaN(gameId)
  });

  // Fetch existing stats for this game with forced refresh when needed
  const { data: existingStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/stats`),
    enabled: !!gameId && !isNaN(gameId),
    staleTime: 0, // Consider it always stale to fetch fresh data
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  // Fetch all players
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players'],
    queryFn: () => apiClient.get('/api/players'),
  });

  

  // Check if game is forfeit and redirect if needed
  useEffect(() => {
    if (game && game.status === 'forfeit') {
      toast({
        title: "Forfeit Game",
        description: "Statistics tracking is not available for forfeit games.",
        variant: "destructive"
      });
      navigate('/games');
    }
  }, [game, navigate, toast]);

  // Initialize the live stats when existing data is loaded
  useEffect(() => {
    if (existingStats && players && rosters) {
      console.log(`Initializing live stats with ${existingStats.length} existing stats and ${rosters.length} roster entries`);

      const initialStats: GameStats = {};

      // Initialize stats structure by player
      players.forEach((player: Player) => {
        initialStats[player.id] = {
          1: { ...emptyQuarterStats },
          2: { ...emptyQuarterStats },
          3: { ...emptyQuarterStats },
          4: { ...emptyQuarterStats }
        };
      });

      // Create a mapping from positions to players for each quarter
      const positionToPlayer: Record<number, Record<string, number>> = {};

      // Initialize quarters in the position-to-player mapping
      for (let q = 1; q <= 4; q++) {
        positionToPlayer[q] = {};
      }

      // Populate the position-to-player mapping from roster data
      if (rosters && rosters.length > 0) {
        rosters.forEach((roster: Roster) => {
          if (!positionToPlayer[roster.quarter]) {
            positionToPlayer[roster.quarter] = {};
          }
          positionToPlayer[roster.quarter][roster.position] = roster.playerId;
          console.log(`Roster entry: Player ${roster.playerId} (${players.find(p => p.id === roster.playerId)?.displayName}) played ${roster.position} in Q${roster.quarter}`);
        });
      }

      // Process the existing stats and map them to players via roster
      if (existingStats && existingStats.length > 0) {
        // Group stats by position and quarter to handle duplicates - take the latest one per position/quarter
        const statsByPositionAndQuarter: Record<string, GameStat> = {};

        // Get the latest stat for each position/quarter combination
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

        console.log(`Processing ${Object.keys(statsByPositionAndQuarter).length} unique position/quarter combinations`);

        // Process each unique position/quarter stat
        Object.values(statsByPositionAndQuarter).forEach((stat: GameStat) => {
          if (stat.position && stat.quarter >= 1 && stat.quarter <= 4) {
            // Find the player who played this position in this quarter
            const playerId = positionToPlayer[stat.quarter]?.[stat.position];

            if (playerId && initialStats[playerId]) {
              const playerName = players.find(p => p.id === playerId)?.displayName || `Player ${playerId}`;
              console.log(`Mapping stat for ${stat.position} in Q${stat.quarter} to ${playerName}: Goals: ${stat.goalsFor || 0}, Missed: ${stat.missedGoals || 0}, Against: ${stat.goalsAgainst || 0}`);

              // Ensure quarter stats are initialized
              if (!initialStats[playerId][stat.quarter]) {
                initialStats[playerId][stat.quarter] = { ...emptyQuarterStats };
              }

              // Populate individual stat values from position-based stats
              const statKeys: StatType[] = ['goalsFor', 'goalsAgainst', 'missedGoals', 'rebounds', 'intercepts', 'badPass', 'handlingError', 'pickUp', 'infringement'];

              statKeys.forEach(statKey => {
                if (stat[statKey] !== undefined && stat[statKey] !== null) {
                  const value = Number(stat[statKey]) || 0;
                  initialStats[playerId][stat.quarter][statKey] = value;

                  // Log non-zero values to help with debugging
                  if (value > 0) {
                    console.log(`Setting ${statKey} = ${value} for ${playerName} in Q${stat.quarter}`);
                  }
                }
              });

              // Store position with the stats
              initialStats[playerId][stat.quarter].position = stat.position;
            } else {
              console.warn(`No player found in roster for position ${stat.position} in quarter ${stat.quarter}. Available players in Q${stat.quarter}:`, Object.entries(positionToPlayer[stat.quarter] || {}).map(([pos, pid]) => `${pos}: ${players.find(p => p.id === pid)?.displayName || pid}`));
            }
          }
        });
      }

      console.log('Final initialized stats:', initialStats);
      setLiveStats(initialStats);
      // Clear undo/redo stacks when loading fresh data
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [existingStats, players, rosters]);

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

  // Used to define player-position pairing (playerId can be 0 for positions without assigned players)
  interface PlayerPosition {
    playerId: number;
    position: Position;
    hasPlayer: boolean; // Track if this position has an actual player assigned
  }

  // Get list of all positions for the current quarter, with or without assigned players
  const getPlayersOnCourt = (): PlayerPosition[] => {
    // Always include all 7 positions
    const positionMap: PlayerPosition[] = allPositions.map(position => {
      // Look for a roster entry for this position in this quarter
      const rosterEntry = rosters?.find(r => 
        r.quarter === currentQuarter && r.position === position
      );

      return {
        playerId: rosterEntry?.playerId || 0, // Use 0 for unassigned positions
        position,
        hasPlayer: !!rosterEntry // Boolean: true if there's a roster entry
      };
    });

    // Sort by position order (GS, GA, WA, C, WD, GD, GK)
    return positionMap.sort((a: PlayerPosition, b: PlayerPosition) => {
      return allPositions.indexOf(a.position) - allPositions.indexOf(b.position);
    });
  };

  // Record a new stat (local only - no API call)
  const recordStat = (playerId: number, stat: StatType, value: number = 1) => {
    console.log(`Recording stat ${stat} for player ${playerId}: ${value > 0 ? 'add' : 'remove'}`);
    
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
      const newValue = Math.max(0, currentValue + value);
      newStats[playerId][currentQuarter][stat] = newValue;

      // Store position with the stats
      if (position) {
        newStats[playerId][currentQuarter].position = position;
      }

      console.log(`Updated ${stat} from ${currentValue} to ${newValue} for player ${playerId}`);
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

  // Reset stats for the current quarter only
  const resetCurrentQuarter = () => {
    // Save current state for undo
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(liveStats))]);
    setRedoStack([]);

    setLiveStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));

      // For each player, reset only the current quarter's stats
      Object.keys(newStats).forEach(playerId => {
        if (newStats[playerId][currentQuarter]) {
          // Preserve the position information but reset all stat values
          const position = newStats[playerId][currentQuarter].position;
          newStats[playerId][currentQuarter] = { ...emptyQuarterStats };

          // Add back the position information
          if (position) {
            newStats[playerId][currentQuarter].position = position;
          }
        }
      });

      return newStats;
    });

    // Clear the game cache when stats are reset to ensure scores are recalculated properly
    clearGameCache(gameId);
    console.log(`Cleared score cache for game ${gameId} after resetting quarter ${currentQuarter}`);

    toast({
      title: "Quarter Reset",
      description: `All stats for Quarter ${currentQuarter} have been reset to zero.`,
      variant: "default"
    });
  };

  // Reset all stats for all quarters
  const resetAllStats = () => {
    // Save current state for undo
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(liveStats))]);
    setRedoStack([]);

    setLiveStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));

      // For each player, reset all quarters
      Object.keys(newStats).forEach(playerId => {
        for (let quarter = 1; quarter <= 4; quarter++) {
          if (newStats[playerId][quarter]) {
            // Preserve the position information
            const position = newStats[playerId][quarter].position;
            newStats[playerId][quarter] = { ...emptyQuarterStats };

            // Add back the position information
            if (position) {
              newStats[playerId][quarter].position = position;
            }
          }
        }
      });

      return newStats;
    });

    // Clear the game cache when all stats are reset to ensure scores are recalculated properly
    clearGameCache(gameId);
    console.log(`Cleared score cache for game ${gameId} after resetting all stats`);

    toast({
      title: "All Stats Reset",
      description: "All statistics have been reset to zero for all quarters.",
      variant: "default"
    });
  };

  // Save all stats mutation using the standard mutation pattern
  const saveAllStatsMutation = useMutation({
    mutationFn: async () => {
      console.log('=== SAVING ALL STATS ===');
      console.log('Live stats to save:', liveStats);

      const updates = [];

      // Convert liveStats to API calls
      Object.keys(liveStats).forEach(playerIdStr => {
        const playerId = parseInt(playerIdStr);

        [1, 2, 3, 4].forEach(quarter => {
          const quarterStats = liveStats[playerId]?.[quarter];
          if (quarterStats && quarterStats.position) {
            const position = quarterStats.position;

            // Check if a stat already exists for this position/quarter
            const existingStat = existingStats?.find(s => 
              s.position === position && s.quarter === quarter
            );

            if (existingStat) {
              // Update existing stat
              const updatePromise = apiClient.patch(`/api/games/${gameId}/stats/${existingStat.id}`, {
                goalsFor: quarterStats.goalsFor || 0,
                goalsAgainst: quarterStats.goalsAgainst || 0,
                missedGoals: quarterStats.missedGoals || 0,
                rebounds: quarterStats.rebounds || 0,
                intercepts: quarterStats.intercepts || 0,
                badPass: quarterStats.badPass || 0,
                handlingError: quarterStats.handlingError || 0,
                pickUp: quarterStats.pickUp || 0,
                infringement: quarterStats.infringement || 0
              });
              updates.push(updatePromise);
            } else {
              // Create new stat
              const createPromise = apiClient.post(`/api/games/${gameId}/stats`, {
                gameId: parseInt(gameId),
                position: position,
                quarter: quarter,
                goalsFor: quarterStats.goalsFor || 0,
                goalsAgainst: quarterStats.goalsAgainst || 0,
                missedGoals: quarterStats.missedGoals || 0,
                rebounds: quarterStats.rebounds || 0,
                intercepts: quarterStats.intercepts || 0,
                badPass: quarterStats.badPass || 0,
                handlingError: quarterStats.handlingError || 0,
                pickUp: quarterStats.pickUp || 0,
                infringement: quarterStats.infringement || 0
              });
              updates.push(createPromise);
            }
          }
        });
      });

      if (updates.length === 0) {
        throw new Error('No statistics found to save');
      }

      console.log(`Executing ${updates.length} stat updates/creates`);
      await Promise.all(updates);
      console.log('All stats saved successfully');
    },
    onSuccess: () => {
      // Clear local caches
      clearGameCache(gameId);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/stats`] });
      queryClient.invalidateQueries({ queryKey: ['/api/games/stats/batch'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games'], exact: true });

      toast({
        title: "Success",
        description: "All statistics have been saved successfully",
      });

      // Refetch stats to update UI
      refetchStats();
    },
    onError: (error: any) => {
      console.error('Error saving stats:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save statistics. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save all stats function that uses the mutation
  const saveAllStats = () => {
    if (!liveStats || Object.keys(liveStats).length === 0) {
      toast({
        title: "Nothing to save",
        description: "No statistics have been recorded yet.",
        variant: "destructive"
      });
      return;
    }

    saveAllStatsMutation.mutate();
  };

  // Get quarter total for a specific stat - always use live stats for immediate updates
  const getQuarterTotal = (stat: StatType): number => {
    let total = 0;

    // Use liveStats if available
    Object.keys(liveStats).forEach(playerIdStr => {
      const playerId = parseInt(playerIdStr);
      const playerStats = liveStats[playerId]?.[currentQuarter];
      if (playerStats && playerStats[stat] !== undefined) {
        total += playerStats[stat] || 0;
      }
    });

    return total;
  };

  // Get game total for a specific stat - always use live stats for immediate updates
  const getGameTotal = (stat: StatType): number => {
    let total = 0;

    // Use liveStats for all calculations
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
  const isPositionSpecificStat = (stat:StatType): boolean => {
    return !isCommonStat(stat);
  };

  // Render a stat counter button - supports both players and unassigned positions
  const renderStatCounter = (
    playerId: number, 
    stat: StatType, 
    compact: boolean = false, 
    important: boolean = false, 
    position?: Position, // Optional position for unassigned positions
    posStats?: QuarterStats // Optional stats for unassigned positions
  ) => {
    let currentValue = 0;

    // Always use liveStats - this is the single source of truth during live tracking
    if (playerId === 0 && position) {
      // For unassigned positions, check if we have any stats stored under playerId 0
      currentValue = liveStats[0]?.[currentQuarter]?.[stat] || 0;
    } else {
      // For assigned players, get their stats from liveStats only
      currentValue = liveStats[playerId]?.[currentQuarter]?.[stat] || 0;
    }

    // Function to handle stat updates
    const handleStatChange = (change: number) => {
      if (playerId === 0 && position) {
        // This is an unassigned position - update stats locally only
        updatePositionStat(position, stat, currentValue + change);
      } else {
        // Normal player stat update
        recordStat(playerId, stat, change);
      }
    };

    return (
      <div className={`flex flex-col items-center ${compact ? 'p-1' : 'p-2'} rounded-md border`}>
        <p className={`${important ? 'text-sm font-semibold' : 'text-xs font-medium'} mb-1`}>{statLabels[stat]}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0`}
            onClick={() => handleStatChange(-1)}
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
            onClick={() => handleStatChange(1)}
          >
            <Plus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </div>
    );
  };

  // Function to update stats locally (no server save until "Save All Stats" is clicked)
  const updatePositionStat = (position: Position, statType: StatType, newValue: number) => {
    console.log(`Updating position stat ${statType} for ${position} to ${newValue}`);
    
    // Save current state for undo
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(liveStats))]);
    setRedoStack([]);

    // Ensure newValue is at least 0
    const sanitizedValue = Math.max(0, newValue);

    setLiveStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));

      // Find a player assigned to this position, or create a placeholder entry
      const playerRoster = rosters?.find(r => 
        r.quarter === currentQuarter && r.position === position
      );

      if (playerRoster) {
        // Player is assigned to this position
        const playerId = playerRoster.playerId;

        if (!newStats[playerId]) {
          newStats[playerId] = {};
        }
        if (!newStats[playerId][currentQuarter]) {
          newStats[playerId][currentQuarter] = { ...emptyQuarterStats };
        }

        newStats[playerId][currentQuarter][statType] = sanitizedValue;
        newStats[playerId][currentQuarter].position = position;
        
        console.log(`Updated player ${playerId} ${statType} to ${sanitizedValue}`);
      } else {
        // No player assigned - use position ID 0 as placeholder
        if (!newStats[0]) {
          newStats[0] = {};
        }
        if (!newStats[0][currentQuarter]) {
          newStats[0][currentQuarter] = { ...emptyQuarterStats };
        }

        newStats[0][currentQuarter][statType] = sanitizedValue;
        newStats[0][currentQuarter].position = position;
        
        console.log(`Updated unassigned position ${position} ${statType} to ${sanitizedValue}`);
      }

      return newStats;
    });
  };

  // Loading state
  if (gameLoading || rostersLoading || statsLoading || playersLoading) {
    return (<div className="container py-6">
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

  // Error state - game is a forfeit
  if (game.status === 'forfeit') {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Cannot edit statistics</h1>
        <p>This game is marked as a forfeit. Statistics editing is not available for forfeit games.</p>
        <Button className="mt-4" onClick={() => navigate('/games')}>
          Back to Games
        </Button>
      </div>
    );
  }

  const playersOnCourt = getPlayersOnCourt();

  return (
    <div className="container py-3 px-2 md:py-4 md:px-4">
      <Helmet>
        <title>Live Stats Tracking | NetballManager</title>
      </Helmet>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Live Stats Tracking</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Round {game.round} | {formatShortDate(game.date)} vs {opponent ? opponent.teamName : game.opponentName || "Opponent"}
          </p>
        </div>

        <div className="flex justify-between items-center gap-2 w-full">
          <BackButton fallbackPath={`/game/${gameId}`} className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
            Back to Game
          </BackButton>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetCurrentQuarter}
              className="border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-900"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Quarter {currentQuarter}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetAllStats}
              className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-900"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset All Stats
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={saveAllStats}
              disabled={saveInProgress}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              Save All Stats
            </Button>
          </div>
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
                >
                  <Undo className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                >
                  <Redo className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                  Redo
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
          playersOnCourt.map(({playerId, position, hasPlayer}) => {
            const player = hasPlayer ? getPlayer(playerId) : null;

            // Get stats configuration for this position
            const statConfig = positionStatConfig[position];

            // Always use liveStats - this is our single source of truth during live tracking
            let positionStats = { ...emptyQuarterStats };

            if (hasPlayer && player) {
              // If we have a player, use their stats from liveStats
              positionStats = liveStats[playerId]?.[currentQuarter] || { ...emptyQuarterStats };
            } else {
              // If no player assigned, check for stats under playerId 0 with this position
              positionStats = liveStats[0]?.[currentQuarter] || { ...emptyQuarterStats };
            }

            // Generate a unique key - for positions without players, use the position as key
            const cardKey = hasPlayer ? `player-${playerId}` : `position-${position}-q${currentQuarter}`;

            return (
              <Card key={cardKey} className="mb-3 overflow-hidden">
                <CardHeader className="py-2 pb-2">
                  {/* Use flex instead of grid for better control */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* First section - player identity, fixed width */}
                    <div className="flex items-center gap-2 mr-3 min-w-fit">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                        style={{
                          backgroundColor: player ? getPositionColor(position) : '#e11d48', // Red for unassigned
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                        title={positionLabels[position] || position}
                      >
                        {position}
                      </div>

                      <div className="min-w-[60px]">
                        {player ? (
                          <p className="font-semibold text-sm">{player.displayName}</p>
                        ) : (
                          <p className="font-semibold text-sm">Unassigned</p>
                        )}
                        <p className="text-xs text-muted-foreground">{positionLabels[position]}</p>
                      </div>
                    </div>

                    {/* Second section - common stats, filling remaining space */}
                    <div className="flex-1 flex flex-wrap gap-2">
                      {commonStats.map(stat => (
                        statConfig[stat] && (
                          <div key={`${playerId}-common-${stat}`} className="flex-1 min-w-[120px]">
                            {renderStatCounter(hasPlayer ? playerId : 0, stat, false, false, position)}
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
                            {renderStatCounter(hasPlayer ? playerId : 0, statType, false, true, position)}
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