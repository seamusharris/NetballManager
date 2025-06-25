import { useRef, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerBox } from '@/components/ui/player-box';
import { CACHE_KEYS } from '@/lib/cacheKeys';
import { Player, Game } from '@shared/schema';
import { getPlayerColorHex, getDarkerColorHex, getLighterColorHex, getMediumColorHex } from '@/lib/playerColorUtils';
import { apiClient } from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';

interface FixedPlayerAvailabilityManagerProps {
  gameId: number | null;
  teamId?: number | null;
  players: Player[];
  games: Game[];
  hideGameSelection?: boolean;
}

export default function FixedPlayerAvailabilityManager({
  gameId,
  teamId,
  players,
  games,
  hideGameSelection = false
}: FixedPlayerAvailabilityManagerProps) {
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();

  // Fetch availability data from API using team-based endpoint when possible
      console.log('FixedPlayerAvailabilityManager: Fetching availability for game', gameId, 'team', teamId);
      if (teamId) {
        return apiClient.get(`/api/teams/${teamId}/games/${gameId}/availability`);
      } else {
        return apiClient.get(`/api/games/${gameId}/availability`);
      }
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });

  // Optimistic state for instant UI updates
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<number, boolean>>({});

  // Track pending save operations
  const [pendingSaves, setPendingSaves] = useState<Set<number>>(new Set());

  // Derive availability state from API response + optimistic updates
  const availabilityData: Record<number, boolean> = {};
  if (players.length > 0) {
    const availableIds = availabilityResponse?.availablePlayerIds || [];
    console.log('FixedPlayerAvailabilityManager: Processing availability', {
      gameId,
      totalPlayers: players.length,
      availableIds: availableIds,
      optimisticUpdates
    });
    
    players.forEach(player => {
      // Use optimistic update if available, otherwise use API data
      if (player.id in optimisticUpdates) {
        availabilityData[player.id] = optimisticUpdates[player.id];
      } else {
        availabilityData[player.id] = availableIds.includes(player.id);
      }
    });
  }

  // Handle individual player toggle
  const handlePlayerToggle = async (playerId: number) => {
    if (!gameId) return;

    // Get current state (including optimistic updates)
    const isCurrentlyAvailable = availabilityData[playerId] === true;
    const newState = !isCurrentlyAvailable;

    // Apply optimistic update for instant UI response
    setOptimisticUpdates(prev => ({
      ...prev,
      [playerId]: newState
    }));

    // Calculate new available player IDs for API call
    const currentAvailableIds = availabilityResponse?.availablePlayerIds || [];
    let newAvailablePlayerIds: number[];
    if (newState) {
      // Add player to available list
      newAvailablePlayerIds = [...currentAvailableIds.filter(id => id !== playerId), playerId];
    } else {
      // Remove player from available list
      newAvailablePlayerIds = currentAvailableIds.filter(id => id !== playerId);
    }

    console.log(`Player ${playerId} toggled. Now ${newAvailablePlayerIds.length} players available`);

    // Track this save as pending
    setPendingSaves(prev => new Set(prev).add(gameId));

    // Save to backend using team-based endpoint when possible
    try {
      if (teamId) {
        await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
          availablePlayerIds: newAvailablePlayerIds
        });
      } else {
        await apiClient.post(`/api/games/${gameId}/availability`, {
          availablePlayerIds: newAvailablePlayerIds
        });
      }

      console.log(`Player ${playerId} availability saved successfully`);
      console.log('Invalidating cache for game', gameId);
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.playerAvailability(gameId) });
    } catch (error) {
      console.error('Error saving player availability:', error);
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });
      toast({
        variant: "destructive",
        title: "Error saving",
        description: "Failed to save player availability. Please try again."
      });
    } finally {
      // Remove from pending saves
      setPendingSaves(prev => {
        const updated = new Set(prev);
        updated.delete(gameId);
        return updated;
      });
    }
  };

  // Handle bulk operations
  const handleSelectAll = async () => {
    if (!gameId) return;

    const availableIds = players.map(p => p.id);
    console.log(`Select all: ${availableIds.length} players now available`);

    // Apply optimistic updates for all players
    const optimisticUpdates: Record<number, boolean> = {};
    players.forEach(player => {
      optimisticUpdates[player.id] = true;
    });
    setOptimisticUpdates(optimisticUpdates);

    // Track this save as pending
    setPendingSaves(prev => new Set(prev).add(gameId));

    try {
      if (teamId) {
        await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
          availablePlayerIds: availableIds
        });
      } else {
        await apiClient.post(`/api/games/${gameId}/availability`, {
          availablePlayerIds: availableIds
        });
      }

      toast({ title: "All players selected" });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.playerAvailability(gameId) });
    } catch (error) {
      // Revert optimistic updates on error
      setOptimisticUpdates({});
      toast({ variant: "destructive", title: "Error saving availability" });
    } finally {
      // Remove from pending saves
      setPendingSaves(prev => {
        const updated = new Set(prev);
        updated.delete(gameId);
        return updated;
      });
    }
  };

  const handleClearAll = async () => {
    if (!gameId) return;

    console.log('Clear all: 0 players now available');

    // Apply optimistic updates for all players
    const optimisticUpdates: Record<number, boolean> = {};
    players.forEach(player => {
      optimisticUpdates[player.id] = false;
    });
    setOptimisticUpdates(optimisticUpdates);

    // Track this save as pending
    setPendingSaves(prev => new Set(prev).add(gameId));

    try {
      if (teamId) {
        await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
          availablePlayerIds: []
        });
      } else {
        await apiClient.post(`/api/games/${gameId}/availability`, {
          availablePlayerIds: []
        });
      }

      toast({ title: "All players cleared" });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.playerAvailability(gameId) });
    } catch (error) {
      // Revert optimistic updates on error
      setOptimisticUpdates({});
      toast({ variant: "destructive", title: "Error saving availability" });
    } finally {
      // Remove from pending saves
      setPendingSaves(prev => {
        const updated = new Set(prev);
        updated.delete(gameId);
        return updated;
      });
    }
  };

  // Navigation protection when saves are pending
  useEffect(() => {
    const hasPendingSaves = pendingSaves.size > 0;

    if (hasPendingSaves) {
      // Prevent browser navigation/refresh
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'You have unsaved player availability changes. Are you sure you want to leave?';
        return e.returnValue;
      };

      // Prevent navigation within the app
      const handlePopState = (e: PopStateEvent) => {
        const shouldStay = window.confirm('You have unsaved player availability changes. Are you sure you want to leave?');
        if (!shouldStay) {
          e.preventDefault();
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);

      // Push current state to enable popstate detection
      window.history.pushState(null, '', window.location.href);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [pendingSaves.size]);

  if (!gameId) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">Please select a game to manage player availability.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedGame = games.find(game => game.id === gameId);
  const availableCount = Object.values(availabilityData).filter(isAvailable => isAvailable === true).length;

  // Only show loading if we're actually loading data
  if (isLoading || (gameId && players.length === 0)) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">Loading player availability...</div>
        </CardContent>
      </Card>
    );
  }

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
              disabled={pendingSaves.size > 0}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              disabled={pendingSaves.size > 0}
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
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {players
              .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
              .map(player => {
                const isSelected = availabilityData[player.id] === true;
                const playerColorHex = getPlayerColorHex(player.avatarColor);
                const darkerTextColor = getDarkerColorHex(player.avatarColor);
                const lighterBgColor = getLighterColorHex(player.avatarColor);
                const mediumBgColor = getMediumColorHex(player.avatarColor);

                return (
                  <div key={player.id} className="relative">
                    <div 
                      className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3 transition-all duration-200"
                      style={{ 
                        backgroundColor: isSelected ? darkerTextColor : 'transparent', 
                        border: isSelected ? 'none' : `2px solid ${darkerTextColor}`
                      }}
                      onClick={() => handlePlayerToggle(player.id)}
                    >
                      {isSelected && '✓'}
                    </div>
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      hasSelect={true}
                      className="shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? mediumBgColor : lighterBgColor,
                        opacity: isSelected ? 1 : 0.7
                      }}
                      onClick={() => handlePlayerToggle(player.id)}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}