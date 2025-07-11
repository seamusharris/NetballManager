
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useClub } from '@/contexts/ClubContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Game, Player, GameStat, Roster, Position, allPositions } from '@shared/schema';
import { getInitials, formatShortDate, positionLabels, generatePlayerAvatarColor } from '@/lib/utils';
import { 
  Target, Shield, RotateCcw, X, AlertCircle, ArrowUp, Ban, Play, 
  Save, Undo, Redo, AlertTriangle, CheckCircle, Zap, Plus, Minus 
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { clearGameCache } from '@/lib/scoresCache';
import PageTemplate from '@/components/layout/PageTemplate';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  centrePass: 0,
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

// Different stat availabilities by position
import { getPositionOrderedStats, isStatRelevantForPosition } from '@/lib/statOrderUtils';

// Use centralized stat ordering instead of hardcoded config
const getRelevantStatsForPosition = (position: Position): string[] => {
  return getPositionOrderedStats(position).map(stat => stat.key);
};

const positionStatConfig: Record<Position, Record<StatType, boolean>> = {
  'GS': {
    goalsFor: true,
    goalsAgainst: false,
    missedGoals: true,
    rebounds: true,
    intercepts: true,
    deflections: true,
    turnovers: true,
    gains: true,
    receives: true,
    penalties: true
  },
  'GA': {
    goalsFor: true,
    goalsAgainst: false,
    missedGoals: true,
    rebounds: true,
    intercepts: true,
    deflections: true,
    turnovers: true,
    gains: true,
    receives: true,
    penalties: true
  },
  'WA': {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: false,
    intercepts: true,
    deflections: true,
    turnovers: true,
    gains: true,
    receives: true,
    penalties: true
  },
  'C': {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: false,
    intercepts: true,
    deflections: true,
    turnovers: true,
    gains: true,
    receives: true,
    penalties: true
  },
  'WD': {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: false,
    intercepts: true,
    deflections: true,
    turnovers: true,
    gains: true,
    receives: true,
    penalties: true
  },
  'GD': {
    goalsFor: false,
    goalsAgainst: true,
    missedGoals: false,
    rebounds: true,
    intercepts: true,
    deflections: true,
    turnovers: true,
    gains: true,
    receives: true,
    penalties: true
  },
  'GK': {
    goalsFor: false,
    goalsAgainst: true,
    missedGoals: false,
    rebounds: true,
    intercepts: true,
    deflections: true,
    turnovers: true,
    gains: true,
    receives: true,
    penalties: true
  }
};

const statLabels: Record<StatType, string> = {
  goalsFor: 'Goal',
  missedGoals: 'Miss',
  goalsAgainst: 'Goal Against',
  rebounds: 'Rebound',
  intercepts: 'Intercept',
  deflections: 'Deflection',
  turnovers: 'Turnover',
  gains: 'Gain',
  receives: 'Receive',
  penalties: 'Penalty'
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

  // Determine team context - use the teamId from URL params or current team
  const currentTeamId = teamId || currentTeam?.id;

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

  // Players are already filtered by team from the API

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
            deflections: 'deflections', // Database now uses deflections
            turnovers: 'turnovers', // Database now uses turnovers
            gains: 'gains', // Database now uses gains
            receives: 'receives', // Database now uses receives
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

  // Update player rating for a position in current quarter
  const updateRating = (position: Position, rating: number | null) => {
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);
    setRedoStack([]);

    const key = getPositionQuarterKey(position, currentQuarter);

    setPositionStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));
      if (!newStats[key]) {
        newStats[key] = { ...emptyQuarterStats };
      }
      newStats[key].rating = rating;
      return newStats;
    });
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

  // Common stats to show in the top row
  const commonStats: StatType[] = ['intercepts', 'deflections', 'turnovers', 'gains', 'receives', 'penalties'];

  // Render a stat counter button for a position
  const renderStatCounter = (
    position: Position, 
    stat: StatType, 
    compact: boolean = false, 
    important: boolean = false
  ) => {
    const key = getPositionQuarterKey(position, currentQuarter);
    const currentValue = positionStats[key]?.[stat] || 0;

    const handleStatChange = (change: number) => {
        recordStat(position, stat, change);
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
            className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0`}
            onClick={() => handleStatChange(1)}
          >
            <Plus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </div>
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

  // Page actions
  const pageActions = (
    <div className="flex space-x-2">
      {isGameCompleted && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Warning:</strong> This game is marked as completed. Editing statistics will require confirmation.
          </AlertDescription>
        </Alert>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={resetCurrentQuarter}
        className="border-amber-500 text-amber-700 hover:bg-amber-50"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Reset Quarter {currentQuarter}
      </Button>

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

      <Button
        variant="default"
        size="sm"
        onClick={saveAllStats}
        disabled={saveInProgress}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Save className="h-4 w-4 mr-1" />
        {saveInProgress ? 'Saving...' : 'Save All Stats'}
      </Button>
    </div>
  );

  return (
    <PageTemplate
      title="Record Stats"
      subtitle={`Round ${game.round} | ${formatShortDate(game.date)} vs ${opponentDisplayName}`}
      breadcrumbs={breadcrumbs}
      actions={pageActions}
      showBackButton={true}
      backButtonProps={{ 
        fallbackPath: `/game/${gameId}`,
        className: "border-gray-200 text-gray-700 hover:bg-gray-50"
      }}
    >
      <Helmet>
        <title>Record Stats | NetballManager</title>
      </Helmet>

      {/* Game scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <Card className="overflow-hidden">
          <CardHeader className="py-2">
            <CardTitle className="text-base md:text-lg font-semibold">Game Score</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{ourTeamDisplayName}</p>
                <p className="text-2xl md:text-3xl font-bold">{getGameTotal('goalsFor')}</p>
              </div>
              <div className="text-xl md:text-2xl font-bold">-</div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-muted-foreground">{opponentDisplayName}</p>
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position stat cards */}
      <div className="mb-4 md:mb-5">
        <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Positions - Quarter {currentQuarter}</h2>

        {allPositions.map(position => {
          const player = getPlayerForPosition(position, currentQuarter);
          const statConfig = positionStatConfig[position];

          return (
            <Card key={position} className="mb-3 overflow-hidden">
              <CardHeader className="py-2 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 mr-3 min-w-fit">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                      style={{
                        backgroundColor: getPositionColor(position),
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                      title={positionLabels[position] || position}
                    >
                      {position}
                    </div>

                    <div className="min-w-[60px]">
                      {player ? (
                        <div>
                          <p className="font-semibold text-sm">{player.displayName}</p>
                          <p className="text-xs text-muted-foreground">{positionLabels[position]}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-sm">Unassigned</p>
                          <p className="text-xs text-muted-foreground">{positionLabels[position]}</p>
                        </div>
                      )}
                    </div>

                    {/* Player Rating */}
                    <div className="flex flex-col items-center min-w-[80px]">
                      <p className="text-xs font-medium mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const currentRating = positionStats[getPositionQuarterKey(position, currentQuarter)]?.rating || 5;
                            updateRating(position, Math.max(0, currentRating - 1));
                          }}
                          disabled={(positionStats[getPositionQuarterKey(position, currentQuarter)]?.rating || 5) <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <input
                          type="number"
                          min="0"
                          max="10"
                          className="w-12 h-6 text-center text-sm border border-gray-300 rounded"
                          value={positionStats[getPositionQuarterKey(position, currentQuarter)]?.rating || 5}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Math.min(10, Math.max(0, parseInt(e.target.value)));
                            updateRating(position, value);
                          }}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const currentRating = positionStats[getPositionQuarterKey(position, currentQuarter)]?.rating || 5;
                            updateRating(position, Math.min(10, currentRating + 1));
                          }}
                          disabled={(positionStats[getPositionQuarterKey(position, currentQuarter)]?.rating || 5) >= 10}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Common stats */}
                  <div className="flex-1 flex flex-wrap gap-2">
                    {commonStats.map(stat => (
                      statConfig[stat] && (
                        <div key={`${position}-common-${stat}`} className="flex-1 min-w-[120px]">
                          {renderStatCounter(position, stat, false, false)}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2 pt-1">
                {(() => {
                  const posSpecificStats = Object.entries(statConfig)
                    .filter(([stat, isAvailable]) => isAvailable && !commonStats.includes(stat as StatType))
                    .map(([stat]) => stat as StatType);

                  if (posSpecificStats.length === 0) {
                    return null;
                  }

                  return (
                    <div className="flex justify-center gap-2 flex-wrap">
                      {posSpecificStats.map(statType => (
                        <div key={`${position}-${statType}`} className="w-[180px]">
                          {renderStatCounter(position, statType, false, true)}
                        </div>
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
