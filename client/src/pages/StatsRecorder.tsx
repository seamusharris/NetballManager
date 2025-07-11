import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useClub } from '@/contexts/ClubContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Game, Player, GameStat, Roster, Position, allPositions } from '@shared/schema';
import { getInitials, formatShortDate, positionLabels, generatePlayerAvatarColor } from '@/lib/utils';
import { 
  Target, Shield, RotateCcw, X, AlertCircle, ArrowUp, Ban, Play, 
  Save, Undo, Redo, AlertTriangle, CheckCircle, Zap, Plus, Minus,
  RefreshCw, Users, Coffee, Clock, Timer
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { clearGameCache } from '@/lib/scoresCache';
import PageTemplate from '@/components/layout/PageTemplate';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Import centralized stat ordering
import { getPositionOrderedStats, isStatRelevantForPosition } from '@/lib/statOrderUtils';

// Stat types that can be tracked
type StatType = 'goalsFor' | 'goalsAgainst' | 'missedGoals' | 'rebounds' | 
                'intercepts' | 'deflections' | 'turnovers' | 'gains' | 'receives' | 'penalties';

// Quarter stats including both regular stats and position info
interface QuarterStats {
  goalsFor: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  deflections: number;
  turnovers: number;
  gains: number;
  receives: number;
  penalties: number;
  rating: number | null;
}

// Position-based stats by quarter - key format: "position-quarter" (e.g., "GS-1", "GA-2")
interface PositionStats {
  [positionQuarterKey: string]: QuarterStats;
}

// New empty stat entry
const emptyQuarterStats = {
  goalsFor: 0,
  goalsAgainst: 0,
  intercepts: 0,
  deflections: 0,
  rebounds: 0,
  turnovers: 0,
  gains: 0,
  receives: 0,
  penalties: 0,
  missedGoals: 0,
  rating: 5 as number
};

// Get color for each netball position
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

interface StatsRecorderProps {
  gameId?: number;
  teamId?: number;
}

export default function StatsRecorder({ gameId: propGameId, teamId: propTeamId }: StatsRecorderProps = {}) {
  // Route params - extract both gameId and teamId from URL
  const { gameId: gameIdParam, teamId: teamIdParam } = useParams<{ gameId: string; teamId: string }>();
  const gameId = propGameId || parseInt(gameIdParam || '0', 10);
  const teamId = propTeamId || parseInt(teamIdParam || '0', 10);
  const [, navigate] = useLocation();

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTeam, clubTeams } = useClub();

  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [currentPositions, setCurrentPositions] = useState<Record<Position, number | null>>({
    'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null
  });

  // State for tracking the game - using position-quarter keys
  const [positionStats, setPositionStats] = useState<PositionStats>({});
  const [undoStack, setUndoStack] = useState<PositionStats[]>([]);
  const [redoStack, setRedoStack] = useState<PositionStats[]>([]);
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [pendingStatChange, setPendingStatChange] = useState<any>(null);

  // Timer state
  const [quarterStartTime, setQuarterStartTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(15 * 60); // seconds remaining in quarter
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [quarterLength, setQuarterLength] = useState<number>(15); // minutes

  // Determine team context - use the teamId from URL params or current team
  const currentTeamId = teamId || currentTeam?.id;

  // Timer effect - countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);

  // Timer functions
  const startTimer = () => {
    if (!quarterStartTime) {
      setQuarterStartTime(new Date());
    }
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setQuarterStartTime(null);
    setTimeRemaining(quarterLength * 60);
    setIsTimerRunning(false);
  };

  // Reset timer when quarter length changes
  useEffect(() => {
    if (!isTimerRunning) {
      setTimeRemaining(quarterLength * 60);
    }
  }, [quarterLength, isTimerRunning]);

  // Reset timer when quarter changes
  useEffect(() => {
    setQuarterStartTime(null);
    setTimeRemaining(quarterLength * 60);
    setIsTimerRunning(false);
  }, [currentQuarter, quarterLength]);

  const formatTimeRemaining = (): string => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  console.log(`StatsRecorder: Initialized with gameId=${gameId}, teamId=${teamId}, currentTeamId=${currentTeamId}`);

  // Fetch game details using team-based endpoint
  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['/api/teams', currentTeamId, 'games', gameId],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}/games/${gameId}`),
    enabled: !!gameId && !!currentTeamId && !isNaN(gameId) && !isNaN(currentTeamId)
  });

  // Fetch player roster for this game using team-based endpoint
  const { data: rosters, isLoading: rostersLoading } = useQuery({
    queryKey: ['/api/teams', currentTeamId, 'games', gameId, 'rosters'],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}/games/${gameId}/rosters`),
    enabled: !!gameId && !!currentTeamId && !isNaN(gameId) && !isNaN(currentTeamId)
  });

  // Fetch existing stats for this game using game-centric endpoint
  const { data: existingStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['game-team-stats', gameId, teamId],
    queryFn: () => apiClient.get(`/api/game/${gameId}/team/${teamId}/stats`),
    enabled: !!gameId && !!teamId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  // Fetch players directly for the team - much simpler approach
  const { data: allPlayers, isLoading: allPlayersLoading } = useQuery({
    queryKey: ['/api/teams', currentTeamId, 'players'],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}/players`),
    enabled: !!currentTeamId
  });

  console.log('StatsRecorder players query:', {
    gameId,
    teamId,
    currentTeamId,
    allPlayersLength: allPlayers?.length,
    enabled: !!currentTeamId
  });

  // Filter to only show players assigned to the current team
  const players = useMemo(() => {
    if (!allPlayers || !currentTeamId) {
      console.log('players: Missing allPlayers or currentTeamId', { allPlayersLength: allPlayers?.length, currentTeamId });
      return [];
    }

    const teamPlayerIds = new Set();
    if (rosters) {
        rosters.forEach((r: any) => teamPlayerIds.add(r.playerId));
    }

    const filteredPlayers = allPlayers.filter((player: any) => 
      player.active && teamPlayerIds.has(player.id)
    );

    console.log('players: Filtered players', {
      allPlayersCount: allPlayers.length,
      teamPlayerIds: Array.from(teamPlayerIds),
      filteredPlayersCount: filteredPlayers.length,
      filteredPlayerNames: filteredPlayers.map(p => `${p.id}: ${p.displayName}`)
    });

    return filteredPlayers;
  }, [allPlayers, currentTeamId, rosters]);

  // Check if game is completed
  const isGameCompleted = game?.statusIsCompleted === true;

  // Initialize the position stats when existing data is loaded
  useEffect(() => {
    if (existingStats) {
      console.log(`Initializing position-based stats with ${existingStats.length} existing stats`);

      const initialStats: PositionStats = {};

      // Initialize all position-quarter combinations with empty stats
      allPositions.forEach(position => {
        for (let quarter = 1; quarter <= 4; quarter++) {
          const key = `${position}-${quarter}`;
          initialStats[key] = { ...emptyQuarterStats };
        }
      });

      // Process existing stats if any
      if (existingStats && existingStats.length > 0) {
        const statsByPositionAndQuarter: Record<string, GameStat> = {};

        // Get the latest stat for each position/quarter combination
        existingStats.forEach((stat: GameStat) => {
          if (!stat.position || !stat.quarter) {
            console.warn("Found invalid stat without position or quarter:", stat);
            return;
          }

          const key = `${stat.position}-${stat.quarter}`;
          if (!statsByPositionAndQuarter[key] || stat.id > statsByPositionAndQuarter[key].id) {
            statsByPositionAndQuarter[key] = stat;
          }
        });

        // Apply the stats to our initial structure
        Object.values(statsByPositionAndQuarter).forEach((stat: GameStat) => {
          const key = `${stat.position}-${stat.quarter}`;

          // Map database field names to component field names
          const fieldMapping = {
            goalsFor: 'goalsFor',
            goalsAgainst: 'goalsAgainst', 
            missedGoals: 'missedGoals',
            rebounds: 'rebounds',
            intercepts: 'intercepts',
            deflections: 'deflections',
            turnovers: 'turnovers',
            gains: 'gains',
            receives: 'receives',
            penalties: 'penalties'
          };

          Object.entries(fieldMapping).forEach(([componentField, dbField]) => {
            if (stat[dbField] !== undefined && stat[dbField] !== null) {
              const value = Number(stat[dbField]) || 0;
              initialStats[key][componentField as StatType] = value;
            }
          });

          if (stat.rating !== undefined) {
            initialStats[key].rating = stat.rating;
          }
        });
      }

      setPositionStats(initialStats);
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [existingStats]);

  // Initialize current positions from roster data
  useEffect(() => {
    if (rosters && rosters.length > 0) {
      console.log(`Setting up positions for quarter ${currentQuarter} from ${rosters.length} roster entries`);

      const latestPositions: Record<Position, number | null> = {
        'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null
      };

      // Find roster entries for the current quarter
      const currentQuarterRosters = rosters.filter((entry: any) => entry.quarter === currentQuarter);
      console.log(`Found ${currentQuarterRosters.length} roster entries for quarter ${currentQuarter}:`, currentQuarterRosters);

      currentQuarterRosters.forEach((entry: any) => {
        if (entry.position && allPositions.includes(entry.position as Position)) {
          latestPositions[entry.position as Position] = entry.playerId;
          console.log(`Mapped Q${currentQuarter} ${entry.position} to player ${entry.playerId}`);
        }
      });

      console.log(`Final position mapping for Q${currentQuarter}:`, latestPositions);
      setCurrentPositions(latestPositions);
    }
  }, [rosters, currentQuarter]);

  // Get player details by ID
  const getPlayer = (playerId: number): Player | undefined => {
    return players?.find((p: Player) => p.id === playerId);
  };

  // Get current position for a player in the specified quarter
  const getPlayerForPosition = (position: Position, quarter: number): Player | undefined => {
    // For the current quarter, use the currentPositions state
    if (quarter === currentQuarter) {
      const playerId = currentPositions[position];
      if (playerId) {
        const player = getPlayer(playerId);
        console.log(`getPlayerForPosition: Q${quarter} ${position} -> Player ${playerId} (${player?.displayName || 'Unknown'})`);
        return player;
      }
      console.log(`getPlayerForPosition: Q${quarter} ${position} -> No player assigned`);
      return undefined;
    }

    // For other quarters, look up from roster data
    if (!rosters) return undefined;

    const roster = rosters.find((r: any) => 
      r.position === position && r.quarter === quarter
    );

    return roster ? getPlayer(roster.playerId) : undefined;
  };

  // Generate position-quarter key
  const getPositionQuarterKey = (position: Position, quarter: number): string => {
    return `${position}-${quarter}`;
  };

  // Record a new stat
  const recordStat = (position: Position, stat: StatType, value: number = 1) => {
    if (isGameCompleted) {
        setPendingStatChange({ position, stat, value });
        return;
    }

    executeStatChange(position, stat, value);
  };

  const executeStatChange = (position: Position, stat: StatType, value: number = 1) => {
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);
    setRedoStack([]);

    const key = getPositionQuarterKey(position, currentQuarter);

    setPositionStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));
      if (!newStats[key]) {
        newStats[key] = { ...emptyQuarterStats };
      }
      const currentValue = newStats[key][stat] || 0;
      const newValue = Math.max(0, currentValue + value);
      newStats[key][stat] = newValue;
      return newStats;
    });
  };

  const handleConfirmStatChange = () => {
    if (pendingStatChange) {
      const { position, stat, value } = pendingStatChange;
      executeStatChange(position, stat, value);
      setPendingStatChange(null);
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      setRedoStack([...redoStack, JSON.parse(JSON.stringify(positionStats))]);
      setPositionStats(lastState);
      setUndoStack(newUndoStack);
    }
  };

  // Redo last undone action
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);
      setPositionStats(nextState);
      setRedoStack(newRedoStack);
    }
  };

  // Reset stats for the current quarter only
  const resetCurrentQuarter = () => {
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);
    setRedoStack([]);

    setPositionStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));
      allPositions.forEach(position => {
        const key = getPositionQuarterKey(position, currentQuarter);
        newStats[key] = { ...emptyQuarterStats };
      });
      return newStats;
    });

    clearGameCache(gameId);
    toast({
      title: "Quarter Reset",
      description: `All stats for Quarter ${currentQuarter} have been reset to zero.`,
      variant: "default"
    });
  };

  // Save all stats mutation
  const saveAllStatsMutation = useMutation({
    mutationFn: async () => {
      console.log('=== SAVING ALL POSITION STATS ===');

      if (!currentTeamId) {
        throw new Error('Cannot determine team context for saving stats');
      }

      const updates = [];

      Object.entries(positionStats).forEach(([key, stats]) => {
        const [position, quarterStr] = key.split('-');
        const quarter = parseInt(quarterStr);

        if (!position || !quarter || quarter < 1 || quarter > 4) {
          console.warn(`Invalid position-quarter key: ${key}`);
          return;
        }

        const existingStat = existingStats?.find((s: any) => 
          s.position === position && 
          s.quarter === quarter &&
          s.teamId === currentTeamId
        );

        if (existingStat) {
          // Use game-centric endpoint for updates too
          const updatePromise = apiClient.patch(`/api/game/${gameId}/team/${currentTeamId}/stats/${existingStat.id}`, {
            goalsFor: stats.goalsFor || 0,
            goalsAgainst: stats.goalsAgainst || 0,
            missedGoals: stats.missedGoals || 0,
            rebounds: stats.rebounds || 0,
            intercepts: stats.intercepts || 0,
            deflections: stats.deflections || 0,
            turnovers: stats.turnovers || 0,
            gains: stats.gains || 0,
            receives: stats.receives || 0,
            penalties: stats.penalties || 0,
            rating: stats.rating
          });
          updates.push(updatePromise);
        } else {
          const createPromise = apiClient.post(`/api/game/${gameId}/team/${currentTeamId}/stats`, {
            gameId: parseInt(gameId),
            teamId: currentTeamId,
            position: position,
            quarter: quarter,
            goalsFor: stats.goalsFor || 0,
            goalsAgainst: stats.goalsAgainst || 0,
            missedGoals: stats.missedGoals || 0,
            rebounds: stats.rebounds || 0,
            intercepts: stats.intercepts || 0,
            deflections: stats.deflections || 0,
            turnovers: stats.turnovers || 0,
            gains: stats.gains || 0,
            receives: stats.receives || 0,
            penalties: stats.penalties || 0,
            rating: stats.rating
          });
          updates.push(createPromise);
        }
      });

      if (updates.length === 0) {
        throw new Error('No statistics found to save');
      }

      await Promise.all(updates);
    },
    onSuccess: () => {
      clearGameCache(gameId);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/teams', currentTeamId, 'games', gameId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['gameScores', gameId] });

      toast({
        title: "Success",
        description: "All statistics have been saved successfully",
      });

      refetchStats();
    },
    onError: (error: any) => {
      console.error('Error saving position stats:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save statistics. Please try again.",
        variant: "destructive"
      });
    }
  });

  const saveAllStats = () => {
    if (!positionStats || Object.keys(positionStats).length === 0) {
        toast({
            title: "Nothing to save",
            description: "No statistics have been recorded yet.",
            variant: "destructive"
        });
        return;
    }

    saveAllStatsMutation.mutate();
  };

  // Get quarter total for a specific stat
  const getQuarterTotal = (stat: StatType): number => {
    let total = 0;
    allPositions.forEach(position => {
      const key = getPositionQuarterKey(position, currentQuarter);
      const stats = positionStats[key];
      if (stats && stats[stat] !== undefined) {
        total += stats[stat] || 0;
      }
    });
    return total;
  };

  // Get game total for a specific stat
  const getGameTotal = (stat: StatType): number => {
    let total = 0;
    allPositions.forEach(position => {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const key = getPositionQuarterKey(position, quarter);
        const stats = positionStats[key];
        if (stats && stats[stat] !== undefined) {
          total += stats[stat] || 0;
        }
      }
    });
    return total;
  };

  // Quick tap stat button - single tap to increment, long press to decrement once
  const QuickStatButton = ({ position, stat, important = false }) => {
    const key = getPositionQuarterKey(position, currentQuarter);
    const currentValue = positionStats[key]?.[stat] || 0;
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

    // Map stats to their icons directly
    const statIconMap = {
      'goalsFor': Target,
      'goalsAgainst': Shield, 
      'missedGoals': RotateCcw,
      'rebounds': ArrowUp,
      'intercepts': Zap,
      'deflections': RefreshCw,
      'turnovers': Ban,
      'gains': Play,
      'receives': Users,
      'penalties': Coffee
    };

    // Map stats to their colors
    const statColorMap = {
      'goalsFor': 'bg-green-100 hover:bg-green-200 border-green-300 text-green-700',
      'goalsAgainst': 'bg-red-100 hover:bg-red-200 border-red-300 text-red-700',
      'missedGoals': 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700',
      'rebounds': 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-700',
      'intercepts': 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700',
      'deflections': 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-700',
      'turnovers': 'bg-red-100 hover:bg-red-200 border-red-300 text-red-700',
      'gains': 'bg-green-100 hover:bg-green-200 border-green-300 text-green-700',
      'receives': 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-700',
      'penalties': 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-700'
    };

    // Map stats to their labels (singular form)
    const statLabelMap = {
      'goalsFor': 'Goal',
      'goalsAgainst': 'Against',
      'missedGoals': 'Miss',
      'rebounds': 'Rebound',
      'intercepts': 'Intercept',
      'deflections': 'Deflection',
      'turnovers': 'Turnover',
      'gains': 'Gain',
      'receives': 'Receive',
      'penalties': 'Penalty'
    };

    const StatIcon = statIconMap[stat] || Target;
    const statColor = statColorMap[stat] || 'bg-gray-100 hover:bg-gray-200 border-gray-300';
    const statLabel = statLabelMap[stat] || stat;

    // Handle touch events for long press - single decrement per press cycle
    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      if (longPressTriggered) return; // Prevent multiple triggers during same press

      const timer = setTimeout(() => {
        if (currentValue > 0) {
          recordStat(position, stat, -1);
          setLongPressTriggered(true); // Mark as triggered for this press cycle
        }
      }, 500); // 500ms long press threshold
      setLongPressTimer(timer);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      
      // If long press wasn't triggered, this is a normal tap to increment
      if (!longPressTriggered) {
        recordStat(position, stat, 1);
      }
      
      // Reset for next press cycle
      setLongPressTriggered(false);
    };

    const handleTouchCancel = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      setLongPressTriggered(false);
    };

    // Handle mouse events for desktop right-click fallback
    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      if (currentValue > 0) {
        recordStat(position, stat, -1);
      }
    };

    return (
      <Button
        variant="outline"
        className={`${important ? 'h-16 w-full' : 'h-12 w-full'} ${statColor} border-2 touch-manipulation flex flex-col gap-1 relative transition-all hover:scale-102 active:scale-95`}
        onClick={(e) => {
          // Only handle click if not in touch context
          if (e.type === 'click' && !longPressTriggered) {
            recordStat(position, stat, 1);
          }
        }}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <StatIcon className={important ? 'h-5 w-5' : 'h-4 w-4'} />
        <span className={`${important ? 'text-sm' : 'text-xs'} font-medium`}>{statLabel}</span>
        {currentValue > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
            {currentValue}
          </Badge>
        )}
      </Button>
    );
  };

  // Loading state
  if (gameLoading || rostersLoading || statsLoading || allPlayersLoading) {
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

  // Determine team names
  const ourTeamDisplayName = game.teamPerspective === 'home' ? game.homeTeamName : game.awayTeamName;
  const opponentDisplayName = game.teamPerspective === 'home' ? game.awayTeamName : game.homeTeamName;

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Games', href: '/games' },
    {
      label: `Round ${game?.round || gameId} vs ${opponentDisplayName}`,
      href: `/game/${gameId}`
    },
    { label: 'Record Stats' }
  ];

  // Get all relevant stats for a position based on centralized ordering
  const getRelevantStatsForPosition = (position: Position): { common: string[], specific: string[] } => {
    const orderedStats = getPositionOrderedStats(position);

    // Split into common (all positions) and position-specific stats
    const allStats = ['intercepts', 'deflections', 'gains', 'receives', 'turnovers', 'penalties'];
    const common = orderedStats.filter(s => allStats.includes(s.key)).map(s => s.key);
    const specific = orderedStats.filter(s => !allStats.includes(s.key)).map(s => s.key);

    return { common, specific };
  };

  return (
    <PageTemplate
      title="Quick Tap Stats"
      subtitle={`Round ${game.round} | ${formatShortDate(game.date)} vs ${opponentDisplayName}`}
      breadcrumbs={breadcrumbs}
      showBackButton={true}
      backButtonProps={{ 
        fallbackPath: `/game/${gameId}`,
        className: "border-gray-200 text-gray-700 hover:bg-gray-50"
      }}
    >
      <Helmet>
        <title>Record Stats | NetballManager</title>
      </Helmet>

      {/* Game Header with Score - Quick Tap Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Timer Section - Left */}
        <Card>
          <CardContent className="py-4">
            <div className="text-center space-y-3">
              <div className="text-sm font-semibold">Game Time</div>
              <div className="text-3xl font-mono font-bold">{formatTimeRemaining()}</div>
              
              {/* Quarter Length Dropdown */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Quarter Length</div>
                <select 
                  value={quarterLength}
                  onChange={(e) => setQuarterLength(parseInt(e.target.value))}
                  className="w-full h-7 px-2 text-xs border border-gray-300 rounded touch-manipulation"
                  disabled={isTimerRunning}
                >
                  <option value="15">15 minutes</option>
                  <option value="12">12 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="8">8 minutes</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={startTimer}
                  disabled={isTimerRunning}
                  className="touch-manipulation"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopTimer}
                  disabled={!isTimerRunning}
                  className="touch-manipulation"
                >
                  <X className="h-3 w-3 mr-1" />
                  Stop
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetTimer}
                  className="touch-manipulation"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scores Section - Center */}
        <Card>
          <CardContent className="py-4">
            <div className="text-center space-y-3">
              <div className="text-sm font-semibold">Game Score</div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <div>
                  <p className="text-xs text-muted-foreground">{ourTeamDisplayName}</p>
                  <p className="text-3xl font-bold">{getGameTotal('goalsFor')}</p>
                </div>
                <div className="text-2xl font-bold">-</div>
                <div>
                  <p className="text-xs text-muted-foreground">{opponentDisplayName}</p>
                  <p className="text-3xl font-bold">{getGameTotal('goalsAgainst')}</p>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="text-sm font-semibold">Quarter {currentQuarter} Score</div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div>
                    <p className="text-xl font-bold">{getQuarterTotal('goalsFor')}</p>
                  </div>
                  <div className="text-lg font-bold">-</div>
                  <div>
                    <p className="text-xl font-bold">{getQuarterTotal('goalsAgainst')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls Section - Right */}
        <Card>
          <CardContent className="py-4">
            <div className="space-y-3">
              {/* Quarter Selector */}
              <div className="text-center">
                <div className="text-sm font-semibold mb-2">Quarter</div>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map(quarter => (
                    <Button
                      key={quarter}
                      variant={quarter === currentQuarter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuarter(quarter)}
                      className="h-8 touch-manipulation"
                    >
                      {quarter}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Controls */}
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="touch-manipulation"
                >
                  <Undo className="h-3 w-3 mr-1" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="touch-manipulation"
                >
                  <Redo className="h-3 w-3 mr-1" />
                  Redo
                </Button>
              </div>

              <Button 
                onClick={resetCurrentQuarter}
                variant="outline"
                size="sm"
                className="w-full border-amber-500 text-amber-700 hover:bg-amber-50 touch-manipulation"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Q{currentQuarter}
              </Button>

              <Button
                onClick={saveAllStats}
                disabled={saveInProgress}
                className="w-full bg-green-600 hover:bg-green-700 text-white touch-manipulation"
              >
                <Save className="h-4 w-4 mr-1" />
                {saveInProgress ? 'Saving...' : 'Save All Stats'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Cards with Quick Tap Interface */}
      <div className="space-y-3">
        {allPositions.map(position => {
          const assignedPlayerId = currentPositions[position];
          const assignedPlayer = players?.find(p => p.id === assignedPlayerId);
          const { common, specific } = getRelevantStatsForPosition(position);
          
          // Check if this is a midcourt position for center alignment
          const isMidcourt = ['WA', 'C', 'WD'].includes(position);

          return (
            <Card key={position} className="overflow-hidden">
              <CardHeader className="py-2 pb-2">
                <div className={`flex items-center gap-3 ${isMidcourt ? 'justify-center' : 'justify-start'}`}>
                  {/* Position Identity */}
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{
                      backgroundColor: getPositionColor(position),
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {position}
                  </div>

                  <div className="min-w-[100px]">
                    {assignedPlayer ? (
                      <p className="font-semibold text-sm">{assignedPlayer.displayName}</p>
                    ) : (
                      <p className="font-semibold text-sm text-gray-400">Unassigned</p>
                    )}
                    <p className="text-xs text-muted-foreground">{positionLabels[position]}</p>
                  </div>

                  {/* Common Stats Row - Quick Tap */}
                  <div className="flex-1 grid grid-cols-6 gap-2">
                    {common.map(stat => (
                      <QuickStatButton
                        key={stat}
                        position={position}
                        stat={stat}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>

              {/* Position-Specific Stats Row */}
              <CardContent className="py-2 pt-1">
                {(() => {
                  if (specific.length === 0) {
                    return null;
                  }

                  return (
                    <div className="flex justify-center gap-2">
                      {specific.map(statType => (
                        <QuickStatButton
                          key={statType}
                          position={position}
                          stat={statType}
                          important={true}
                        />
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog for Completed Game Edits */}
      <AlertDialog open={!!pendingStatChange} onOpenChange={() => setPendingStatChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Confirm Edit to Completed Game
            </AlertDialogTitle>
            <AlertDialogDescription>
              This game is marked as completed. Are you sure you want to modify the statistics?
              This change will affect final scores and records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatChange} className="bg-amber-600 hover:bg-amber-700">
              Yes, Edit Stats
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}