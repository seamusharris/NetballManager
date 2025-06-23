import { useState, useEffect, useCallback, useRef } from 'react';
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

interface FixedPlayerAvailabilityManagerProps {
  gameId: number | null;
  players: Player[];
  games: Game[];
  onAvailabilityChange?: (availablePlayerIds: number[]) => void;
  onAvailabilityStateChange?: (availabilityState: Record<number, boolean>) => void;
  onGameChange?: (gameId: number) => void;
  hideGameSelection?: boolean;
  onComplete?: () => void;
}

export default function FixedPlayerAvailabilityManager({
  gameId,
  players,
  games,
  onAvailabilityChange,
  onAvailabilityStateChange,
  hideGameSelection = false
}: FixedPlayerAvailabilityManagerProps) {
  const [availabilityData, setAvailabilityData] = useState<Record<number, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch availability data from API
  const { data: availabilityResponse, isLoading } = useQuery<{availablePlayerIds: number[]}>({
    queryKey: CACHE_KEYS.playerAvailability(gameId || 0),
    queryFn: () => apiClient.get(`/api/games/${gameId}/availability`),
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize availability data when API data loads or when starting fresh
  useEffect(() => {
    console.log('FixedPlayerAvailabilityManager: useEffect triggered', {
      gameId,
      playersCount: players.length,
      isLoading,
      hasAvailabilityResponse: !!availabilityResponse,
      availablePlayerIds: availabilityResponse?.availablePlayerIds,
      currentAvailabilityDataKeys: Object.keys(availabilityData),
      isInitialized
    });

    if (!gameId || players.length === 0) {
      console.log('FixedPlayerAvailabilityManager: Skipping initialization - no gameId or players', { gameId, playersCount: players.length });
      return;
    }

    if (isLoading) {
      console.log('FixedPlayerAvailabilityManager: Still loading availability data');
      return;
    }

    // Only initialize if we don't have existing data or if the API data has changed
    const currentlySelectedIds = Object.entries(availabilityData)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([playerId, _]) => parseInt(playerId));
    
    const apiAvailableIds = availabilityResponse?.availablePlayerIds || [];
    
    // Check if current state matches API data
    const stateMatchesApi = currentlySelectedIds.length === apiAvailableIds.length && 
      currentlySelectedIds.every(id => apiAvailableIds.includes(id));
    
    if (Object.keys(availabilityData).length > 0 && stateMatchesApi) {
      console.log('FixedPlayerAvailabilityManager: State already matches API data, skipping reinitalization');
      return;
    }

    console.log('FixedPlayerAvailabilityManager: Proceeding with initialization');

    let newAvailabilityData: Record<number, boolean> = {};

    if (availabilityResponse?.availablePlayerIds) {
      // Use API data if available
      const availableIds = availabilityResponse.availablePlayerIds;
      console.log('FixedPlayerAvailabilityManager: Using API data, available IDs:', availableIds);
      players.forEach(player => {
        newAvailabilityData[player.id] = availableIds.includes(player.id);
      });
    } else {
      // Default all active players to available 
      console.log('FixedPlayerAvailabilityManager: No API data, defaulting all active players to available');
      players.forEach(player => {
        newAvailabilityData[player.id] = player.active !== false;
      });
    }

    console.log('FixedPlayerAvailabilityManager: Setting availability data:', newAvailabilityData);
    setAvailabilityData(newAvailabilityData);
    setIsInitialized(true);

    // Notify parent
    const availableIds = Object.entries(newAvailabilityData)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([playerId, _]) => parseInt(playerId));
    
    console.log('FixedPlayerAvailabilityManager: Notifying parent with available IDs:', availableIds);
    onAvailabilityChange?.(availableIds);
    onAvailabilityStateChange?.(newAvailabilityData);
  }, [gameId, players.length, availabilityResponse?.availablePlayerIds, isLoading]);

  // Reset initialization flag when gameId changes
  useEffect(() => {
    console.log('FixedPlayerAvailabilityManager: Game ID changed to:', gameId);
    setIsInitialized(false);
    setAvailabilityData({});
  }, [gameId]);

  // Handle individual player toggle
  const handlePlayerToggle = async (playerId: number) => {
    const currentValue = availabilityData[playerId] || false;
    const newValue = !currentValue;
    
    // Update local state immediately
    const newAvailabilityData = {
      ...availabilityData,
      [playerId]: newValue
    };
    setAvailabilityData(newAvailabilityData);

    // Get available player IDs
    const availablePlayerIds = Object.entries(newAvailabilityData)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([id, _]) => parseInt(id));

    // Notify parent immediately
    onAvailabilityChange?.(availablePlayerIds);
    onAvailabilityStateChange?.(newAvailabilityData);

    // Save to API
    if (gameId) {
      try {
        await apiClient.post(`/api/games/${gameId}/availability`, {
          availablePlayerIds
        });

        // Invalidate cache
        queryClient.invalidateQueries({ 
          queryKey: CACHE_KEYS.playerAvailability(gameId)
        });

        toast({
          title: "Availability updated",
          description: `${players.find(p => p.id === playerId)?.displayName} ${newValue ? 'added to' : 'removed from'} available players.`,
        });
      } catch (error) {
        console.error("Failed to save player availability:", error);
        
        // Revert on error
        setAvailabilityData(availabilityData);
        onAvailabilityChange?.(Object.entries(availabilityData)
          .filter(([_, isAvailable]) => isAvailable)
          .map(([id, _]) => parseInt(id)));
        onAvailabilityStateChange?.(availabilityData);

        toast({
          variant: "destructive",
          title: "Error saving availability",
          description: "Failed to save player availability. Please try again.",
        });
      }
    }
  };

  // Handle bulk operations
  const handleSelectAll = async () => {
    const newData: Record<number, boolean> = {};
    players.forEach(player => {
      newData[player.id] = true;
    });
    
    setAvailabilityData(newData);
    const availableIds = players.map(p => p.id);
    onAvailabilityChange?.(availableIds);
    onAvailabilityStateChange?.(newData);

    if (gameId) {
      try {
        await apiClient.post(`/api/games/${gameId}/availability`, {
          availablePlayerIds: availableIds
        });
        queryClient.invalidateQueries({ queryKey: CACHE_KEYS.playerAvailability(gameId) });
        toast({ title: "All players selected" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error saving availability" });
      }
    }
  };

  const handleClearAll = async () => {
    const newData: Record<number, boolean> = {};
    players.forEach(player => {
      newData[player.id] = false;
    });
    
    setAvailabilityData(newData);
    onAvailabilityChange?.([]);
    onAvailabilityStateChange?.(newData);

    if (gameId) {
      try {
        await apiClient.post(`/api/games/${gameId}/availability`, {
          availablePlayerIds: []
        });
        queryClient.invalidateQueries({ queryKey: CACHE_KEYS.playerAvailability(gameId) });
        toast({ title: "All players cleared" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error saving availability" });
      }
    }
  };

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
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {players
              .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
              .map(player => {
                const isSelected = availabilityData[player.id] === true;
                console.log(`FixedPlayerAvailabilityManager: Player ${player.displayName} (${player.id}) - isSelected: ${isSelected}, availabilityData:`, availabilityData[player.id]);
                const playerColorHex = getPlayerColorHex(player.avatarColor);
                const darkerTextColor = getDarkerColorHex(player.avatarColor);

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