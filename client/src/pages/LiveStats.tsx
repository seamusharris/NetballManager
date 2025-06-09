import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useClub } from '@/contexts/ClubContext';
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
import { PageTemplate } from '@/components/layout/PageTemplate';

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
}

// Position-based stats by quarter - key format: "position-quarter" (e.g., "GS-1", "GA-2")
interface PositionStats {
  [positionQuarterKey: string]: QuarterStats;
}

// New empty stat entry
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
  const { currentTeam, clubTeams } = useClub();

  // State for tracking the game - now using position-quarter keys
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [positionStats, setPositionStats] = useState<PositionStats>({});
  const [undoStack, setUndoStack] = useState<PositionStats[]>([]);
  const [redoStack, setRedoStack] = useState<PositionStats[]>([]);
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

  // Determine team context - check if current team is home or away
  const isCurrentTeamHome = game?.homeTeamId === currentTeam?.id;
  const isCurrentTeamAway = game?.awayTeamId === currentTeam?.id;
  const hasTeamContext = isCurrentTeamHome || isCurrentTeamAway;

  // Get team names for display
  const currentTeamName = currentTeam?.name || 'Our Team';
  const homeTeamName = clubTeams?.find(t => t.id === game?.homeTeamId)?.name || game?.homeTeamName || 'Home Team';
  const awayTeamName = clubTeams?.find(t => t.id === game?.awayTeamId)?.name || opponent?.teamName || 'Away Team';

  // Determine display names based on team context
  const ourTeamDisplayName = hasTeamContext ? currentTeamName : homeTeamName;
  const opponentDisplayName = hasTeamContext 
    ? (isCurrentTeamHome ? awayTeamName : homeTeamName)
    : awayTeamName;

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

        // Apply the stats to our initial structure
        Object.values(statsByPositionAndQuarter).forEach((stat: GameStat) => {
          const key = `${stat.position}-${stat.quarter}`;

          console.log(`Loading stat for ${stat.position} in Q${stat.quarter}: Goals: ${stat.goalsFor || 0}, Against: ${stat.goalsAgainst || 0}`);

          // Populate individual stat values
          const statKeys: StatType[] = ['goalsFor', 'goalsAgainst', 'missedGoals', 'rebounds', 'intercepts', 'badPass', 'handlingError', 'pickUp', 'infringement'];

          statKeys.forEach(statKey => {
            if (stat[statKey] !== undefined && stat[statKey] !== null) {
              const value = Number(stat[statKey]) || 0;
              initialStats[key][statKey] = value;

              // Log non-zero values to help with debugging
              if (value > 0) {
                console.log(`Setting ${statKey} = ${value} for ${stat.position} in Q${stat.quarter}`);
              }
            }
          });
        });
      }

      console.log('Final initialized position stats:', initialStats);
      setPositionStats(initialStats);
      // Clear undo/redo stacks when loading fresh data
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [existingStats]);

  // Get player details by ID
  const getPlayer = (playerId: number): Player | undefined => {
    return players?.find((p: Player) => p.id === playerId);
  };

  // Get current position for a player in the specified quarter
  const getPlayerForPosition = (position: Position, quarter: number): Player | undefined => {
    if (!rosters) return undefined;

    const roster = rosters.find((r: Roster) => 
      r.position === position && r.quarter === quarter
    );

    return roster ? getPlayer(roster.playerId) : undefined;
  };

  // Generate position-quarter key
  const getPositionQuarterKey = (position: Position, quarter: number): string => {
    return `${position}-${quarter}`;
  };

  // Record a new stat (local only - no API call)
  const recordStat = (position: Position, stat: StatType, value: number = 1) => {
    console.log(`Recording stat ${stat} for position ${position} in Q${currentQuarter}: ${value > 0 ? 'add' : 'remove'}`);

    // Save current state for undo
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);
    setRedoStack([]);

    const key = getPositionQuarterKey(position, currentQuarter);

    setPositionStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));

      // Initialize if needed
      if (!newStats[key]) {
        newStats[key] = { ...emptyQuarterStats };
      }

      // Update the stat
      const currentValue = newStats[key][stat] || 0;
      const newValue = Math.max(0, currentValue + value);
      newStats[key][stat] = newValue;

      console.log(`Updated ${position}-Q${currentQuarter} ${stat} from ${currentValue} to ${newValue}`);
      return newStats;
    });
  };

  // Undo last action
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);

      // Save current state to redo stack
      setRedoStack([...redoStack, JSON.parse(JSON.stringify(positionStats))]);

      // Restore previous state
      setPositionStats(lastState);
      setUndoStack(newUndoStack);
    }
  };

  // Redo last undone action
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);

      // Save current state to undo stack
      setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);

      // Restore next state
      setPositionStats(nextState);
      setRedoStack(newRedoStack);
    }
  };

  // Reset stats for the current quarter only
  const resetCurrentQuarter = () => {
    // Save current state for undo
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);
    setRedoStack([]);

    setPositionStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));

      // Reset only the current quarter's stats for all positions
      allPositions.forEach(position => {
        const key = getPositionQuarterKey(position, currentQuarter);
        newStats[key] = { ...emptyQuarterStats };
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
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);
    setRedoStack([]);

    setPositionStats(prev => {
      const newStats: PositionStats = {};

      // Reset all position-quarter combinations
      allPositions.forEach(position => {
        for (let quarter = 1; quarter <= 4; quarter++) {
          const key = getPositionQuarterKey(position, quarter);
          newStats[key] = { ...emptyQuarterStats };
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
      console.log('=== SAVING ALL POSITION STATS ===');
      console.log('Position stats to save:', positionStats);

      // Determine the team ID for these stats
      const teamId = isCurrentTeamHome ? game.homeTeamId : game.awayTeamId;

      if (!teamId) {
        throw new Error('Cannot determine team context for saving stats');
      }

      console.log(`Saving stats for team ID: ${teamId} (${isCurrentTeamHome ? 'home' : 'away'})`);

      const updates = [];

      // Convert position stats to API calls
      Object.entries(positionStats).forEach(([key, stats]) => {
        const [position, quarterStr] = key.split('-');
        const quarter = parseInt(quarterStr);

        if (!position || !quarter || quarter < 1 || quarter > 4) {
          console.warn(`Invalid position-quarter key: ${key}`);
          return;
        }

        // Check if a stat already exists for this team/position/quarter
        const existingStat = existingStats?.find(s => 
          s.position === position && 
          s.quarter === quarter &&
          s.teamId === teamId
        );

        if (existingStat) {
          // Update existing stat
          const updatePromise = apiClient.patch(`/api/games/${gameId}/stats/${existingStat.id}`, {
            goalsFor: stats.goalsFor || 0,
            goalsAgainst: stats.goalsAgainst || 0,
            missedGoals: stats.missedGoals || 0,
            rebounds: stats.rebounds || 0,
            intercepts: stats.intercepts || 0,
            badPass: stats.badPass || 0,
            handlingError: stats.handlingError || 0,
            pickUp: stats.pickUp || 0,
            infringement: stats.infringement || 0
          });
          updates.push(updatePromise);
        } else {
          // Create new stat only if there are non-zero values
          const hasNonZeroStats = Object.values(stats).some(value => value > 0);
          if (hasNonZeroStats) {
            const createPromise = apiClient.post(`/api/games/${gameId}/stats`, {
              gameId: parseInt(gameId),
              teamId: teamId,
              position: position,
              quarter: quarter,
              goalsFor: stats.goalsFor || 0,
              goalsAgainst: stats.goalsAgainst || 0,
              missedGoals: stats.missedGoals || 0,
              rebounds: stats.rebounds || 0,
              intercepts: stats.intercepts || 0,
              badPass: stats.badPass || 0,
              handlingError: stats.handlingError || 0,
              pickUp: stats.pickUp || 0,
              infringement: stats.infringement || 0
            });
            updates.push(createPromise);
          }
        }
      });

      if (updates.length === 0) {
        throw new Error('No statistics found to save');
      }

      console.log(`Executing ${updates.length} stat updates/creates`);
      await Promise.all(updates);
      console.log('All position stats saved successfully');
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries immediately
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/stats`] });
      queryClient.invalidateQueries({ queryKey: ['gameScores', gameId] });
      queryClient.invalidateQueries({ queryKey: ['positionStats', gameId] });
      queryClient.invalidateQueries({ queryKey: ['playerStats', gameId] });

      // Invalidate all batch stats queries that might include this game
      queryClient.invalidateQueries({ queryKey: ['batchGameStats'] });

      // Invalidate games scores queries (used by dashboard and games list)
      queryClient.invalidateQueries({ queryKey: ['gameScores'] });

      // Also invalidate the games list to ensure score updates
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });

      // Clear the global scores cache for this specific game
      clearGameCache(gameId);

      toast({
        title: "Success",
        description: "All statistics have been saved successfully",
      });

      // Refetch stats to update UI
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

  // Save all stats function that uses the mutation
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

  // Get quarter total for a specific stat - using position stats
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

  // Get game total for a specific stat - using position stats
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

  // Get contextual scores based on team perspective
  const getContextualQuarterScores = () => {
    const ourScore = getQuarterTotal('goalsFor');
    const theirScore = getQuarterTotal('goalsAgainst');

    // If current team is away, flip the scores
    if (hasTeamContext && isCurrentTeamAway) {
      return { ourScore: theirScore, theirScore: ourScore };
    }

    return { ourScore, theirScore };
  };

  const getContextualGameScores = () => {
    const ourScore = getGameTotal('goalsFor');
    const theirScore = getGameTotal('goalsAgainst');

    // If current team is away, flip the scores
    if (hasTeamContext && isCurrentTeamAway) {
      return { ourScore: theirScore, theirScore: ourScore };
    }

    return { ourScore, theirScore };
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

  // Render a stat counter button for a position
  const renderStatCounter = (
    position: Position, 
    stat: StatType, 
    compact: boolean = false, 
    important: boolean = false
  ) => {
    const key = getPositionQuarterKey(position, currentQuarter);
    const currentValue = positionStats[key]?.[stat] || 0;

    // Function to handle stat updates
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
            className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0 ${statColors[stat]}`}
            onClick={() => handleStatChange(1)}
          >
            <Plus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </div>
    );
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

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Games', href: '/games' },
    { 
      label: `Round ${game?.round || gameId} vs ${opponentDisplayName}`, 
      href: `/game/${gameId}` 
    },
    { label: 'Live Stats' }
  ];

  // Page actions (reset and save buttons)
  const pageActions = (
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
  );

  return (
    <PageTemplate
      title="Live Stats Tracking"
      subtitle={`Round ${game.round} | ${formatShortDate(game.date)} vs ${opponentDisplayName}`}
      breadcrumbs={breadcrumbs}
      actions={pageActions}
      showBackButton={true}
      backButtonProps={{ 
        fallbackPath: `/game/${gameId}`,
        className: "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      }}
    >
      <Helmet>
        <title>Live Stats Tracking | NetballManager</title>
      </Helmet>

      {/* Game scoreboard - optimized for all tablet sizes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <Card className="overflow-hidden">
          <CardHeader className="py-2">
            <CardTitle className="text-base md:text-lg font-semibold">Game Score</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{ourTeamDisplayName}</p>
                <p className="text-2xl md:text-3xl font-bold">{getContextualGameScores().ourScore}</p>
              </div>
              <div className="text-xl md:text-2xl font-bold">-</div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-muted-foreground">{opponentDisplayName}</p>
                <p className="text-2xl md:text-3xl font-bold">{getContextualGameScores().theirScore}</p>
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
                <p className="text-xl md:text-2xl font-bold">{getContextualQuarterScores().ourScore} - {getContextualQuarterScores().theirScore}</p>
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

      {/* Position stat cards */}
      <div className="mb-4 md:mb-5">
        <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Positions - Quarter {currentQuarter}</h2>

        {allPositions.map(position => {
          const player = getPlayerForPosition(position, currentQuarter);
          const statConfig = positionStatConfig[position];

          // Generate a unique key
          const cardKey = `position-${position}-q${currentQuarter}`;

          return (
            <Card key={cardKey} className="mb-3 overflow-hidden">
              <CardHeader className="py-2 pb-2">
                                {/* Use flex instead of grid for better control */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* First section - position identity, fixed width */}
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
                        <div key={`${position}-common-${stat}`} className="flex-1 min-w-[120px]">
                          {renderStatCounter(position, stat, false, false)}
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
    </PageTemplate>
  );
}