
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlayerBox } from '@/components/ui/player-box';
import { CACHE_KEYS } from '@/lib/cacheKeys';
import { Player, Game } from '@shared/schema';
import { apiClient } from '@/lib/apiClient';

interface PlayerAvailabilityManagerProps {
  gameId: number;
  players: Player[];
  games: Game[];
  onComplete?: () => void;
  onAvailabilityChange?: (availablePlayerIds: number[]) => void;
  onAvailabilityStateChange?: (availabilityState: Record<number, boolean>) => void;
  onGameChange?: (gameId: number) => void;
  hideGameSelection?: boolean;
}

export default function PlayerAvailabilityManager({
  gameId,
  players,
  games,
  onComplete,
  onAvailabilityChange,
  onAvailabilityStateChange,
  onGameChange,
  hideGameSelection = false
}: PlayerAvailabilityManagerProps) {
  // Simple React state - no complex managers
  const [availability, setAvailability] = useState<Record<number, boolean>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<number, boolean>>({});
  const [hasPendingSave, setHasPendingSave] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get team players for this game
  const teamPlayers = players.filter(player => {
    const selectedGame = games.find(g => g.id === gameId);
    if (!selectedGame) return false;
    
    const currentTeamIdFromContext = window.localStorage.getItem('selectedTeamId');
    let teamToLoad = selectedGame.homeTeamId;
    
    if (currentTeamIdFromContext) {
      const currentTeamIdNum = parseInt(currentTeamIdFromContext);
      if (currentTeamIdNum === selectedGame.homeTeamId || currentTeamIdNum === selectedGame.awayTeamId) {
        teamToLoad = currentTeamIdNum;
      }
    }
    
    return !player.teamId || player.teamId === teamToLoad;
  });

  // Fetch existing availability data
  const { data: availabilityResponse, isLoading } = useQuery<{availablePlayerIds: number[]}>({
    queryKey: CACHE_KEYS.playerAvailability(gameId || 0),
    queryFn: () => apiClient.get(`/api/teams/${teamPlayers[0]?.teamId}/games/${gameId}/availability`),
    enabled: !!gameId && teamPlayers.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize availability state from API response
  useEffect(() => {
    if (!gameId || teamPlayers.length === 0) return;

    const newAvailability: Record<number, boolean> = {};
    
    if (availabilityResponse?.availablePlayerIds) {
      // Use saved availability data
      teamPlayers.forEach(player => {
        newAvailability[player.id] = availabilityResponse.availablePlayerIds.includes(player.id);
      });
    } else {
      // Default: all active players available
      teamPlayers.forEach(player => {
        newAvailability[player.id] = player.active !== false;
      });
    }

    setAvailability(newAvailability);
    
    // Notify parent components
    const availableIds = Object.entries(newAvailability)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([playerId, _]) => parseInt(playerId));
    
    onAvailabilityChange?.(availableIds);
    onAvailabilityStateChange?.(newAvailability);
  }, [availabilityResponse, teamPlayers, gameId]);

  // Batch save function - efficient database operations
  const saveBatch = useCallback(async (availabilityData: Record<number, boolean>) => {
    if (!gameId || teamPlayers.length === 0) return;

    try {
      const availablePlayerIds = Object.entries(availabilityData)
        .filter(([_, isAvailable]) => isAvailable)
        .map(([playerId, _]) => parseInt(playerId));

      await apiClient.post(`/api/teams/${teamPlayers[0]?.teamId}/games/${gameId}/availability`, {
        availablePlayerIds
      });

      // Clear pending state
      setPendingChanges({});
      setHasPendingSave(false);

      // Invalidate cache to get fresh data
      queryClient.invalidateQueries({ 
        queryKey: CACHE_KEYS.playerAvailability(gameId)
      });

    } catch (error) {
      console.error("Failed to save player availability:", error);
      toast({
        variant: "destructive",
        title: "Error saving availability",
        description: "Failed to save player availability. Please try again.",
      });
      
      // Revert to last known good state on error
      setAvailability(prev => {
        const reverted = { ...prev };
        Object.keys(pendingChanges).forEach(playerId => {
          delete reverted[parseInt(playerId)];
        });
        return reverted;
      });
      setPendingChanges({});
      setHasPendingSave(false);
    }
  }, [gameId, teamPlayers, queryClient, toast, pendingChanges]);

  // Handle player selection with optimistic updates
  const handlePlayerToggle = useCallback((playerId: number, isSelected: boolean) => {
    // Update UI immediately (optimistic)
    const newAvailability = { ...availability, [playerId]: isSelected };
    setAvailability(newAvailability);
    
    // Track as pending change
    setPendingChanges(prev => ({ ...prev, [playerId]: isSelected }));
    setHasPendingSave(true);

    // Notify parent immediately
    const availableIds = Object.entries(newAvailability)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([playerId, _]) => parseInt(playerId));
    
    onAvailabilityChange?.(availableIds);
    onAvailabilityStateChange?.(newAvailability);

    // Clear existing timeout and set new one (debounce)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveBatch(newAvailability);
    }, 1000); // 1 second debounce
  }, [availability, onAvailabilityChange, onAvailabilityStateChange, saveBatch]);

  // Handle bulk operations - immediate save
  const handleSelectAll = useCallback(async () => {
    const allSelected: Record<number, boolean> = {};
    teamPlayers.forEach(player => {
      allSelected[player.id] = true;
    });

    setAvailability(allSelected);
    setHasPendingSave(true);

    // Clear debounce timer
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Immediate save for bulk operations
    await saveBatch(allSelected);
  }, [teamPlayers, saveBatch]);

  const handleClearAll = useCallback(async () => {
    const allCleared: Record<number, boolean> = {};
    teamPlayers.forEach(player => {
      allCleared[player.id] = false;
    });

    setAvailability(allCleared);
    setHasPendingSave(true);

    // Clear debounce timer
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Immediate save for bulk operations
    await saveBatch(allCleared);
  }, [teamPlayers, saveBatch]);

  // Navigation protection - save on navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingSave) {
        e.preventDefault();
        e.returnValue = 'You have unsaved player availability changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handleUnload = () => {
      if (hasPendingSave && saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Force immediate save - use sendBeacon for reliability
        const availableIds = Object.entries(availability)
          .filter(([_, isAvailable]) => isAvailable)
          .map(([playerId, _]) => parseInt(playerId));

        const data = JSON.stringify({ availablePlayerIds: availableIds });
        navigator.sendBeacon(
          `/api/teams/${teamPlayers[0]?.teamId}/games/${gameId}/availability`,
          data
        );
      }
    };

    if (hasPendingSave) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('unload', handleUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [hasPendingSave, availability, gameId, teamPlayers]);

  // Cleanup - force save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (hasPendingSave) {
        // Force final save on unmount
        saveBatch(availability);
      }
    };
  }, [hasPendingSave, availability, saveBatch]);

  if (!gameId) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">Please select a game to manage player availability.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && teamPlayers.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">Loading team players and availability...</div>
        </CardContent>
      </Card>
    );
  }

  const selectedGame = games.find(game => game.id === gameId);
  const availableCount = Object.values(availability).filter(isAvailable => isAvailable === true).length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Player Availability 
            {selectedGame && (
              <span className="font-normal text-gray-600 ml-2">
                for {selectedGame.date}
              </span>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="mr-1">
            {availableCount}
          </Badge>
          <span className="text-sm text-gray-600">Available Players</span>
          {hasPendingSave && (
            <Badge variant="secondary" className="ml-2">
              Saving...
            </Badge>
          )}
        </div>

        {!hideGameSelection && (
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-4">
              <Select 
                value={gameId?.toString() || ''} 
                onValueChange={(value) => {
                  const newGameId = Number(value);
                  onGameChange?.(newGameId);
                }}
              >
                <SelectTrigger className="w-[400px]">
                  <SelectValue placeholder="Switch Game" />
                </SelectTrigger>
                <SelectContent>
                  {games.length === 0 ? (
                    <SelectItem value="no-games" disabled>No games available</SelectItem>
                  ) : (
                    [...games]
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(game => (
                        <SelectItem key={game.id} value={game.id.toString()}>
                          {game.date} - {game.awayTeamId ? 'vs Away Team' : 'BYE'}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={onComplete}
              disabled={availableCount === 0}
              className="ml-2"
            >
              Continue to Roster ({availableCount} available)
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamPlayers
              .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
              .map(player => {
                const isSelected = availability[player.id] === true;

                return (
                  <PlayerBox 
                    key={player.id}
                    player={player}
                    size="md"
                    showPositions={true}
                    isSelectable={true}
                    isSelected={isSelected}
                    onSelectionChange={(playerId, selected) => {
                      handlePlayerToggle(playerId, selected);
                    }}
                    className="shadow-md transition-all duration-200 hover:shadow-lg"
                  />
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
