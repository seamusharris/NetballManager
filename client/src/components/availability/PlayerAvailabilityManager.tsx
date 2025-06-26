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
import { CardDescription } from '../ui/card';

interface PlayerAvailabilityManagerProps {
  gameId: number;
  teamId: number;
  players: Player[];
  game: Game;
  onComplete?: () => void;
  onAvailabilityChange?: (availablePlayerIds: number[]) => void;
  onAvailabilityStateChange?: (availabilityState: Record<number, boolean>) => void;
  onGameChange?: (gameId: number) => void;
  hideGameSelection?: boolean;
}

export default function PlayerAvailabilityManager({
  gameId,
  teamId,
  players = [],
  game,
  onComplete,
  onAvailabilityChange,
  onAvailabilityStateChange,
  onGameChange,
  hideGameSelection = false
}: PlayerAvailabilityManagerProps) {
  // Simple state management
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch availability data
  const { data: availabilityResponse, isLoading, refetch } = useQuery<{availablePlayerIds: number[]}>({
    queryKey: ['availability', teamId, gameId],
    queryFn: () => apiClient.get(`/api/teams/${teamId}/games/${gameId}/availability`),
    enabled: !!gameId && !!teamId && players.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize selected players from API response
  useEffect(() => {
    if (availabilityResponse?.availablePlayerIds) {
      const validPlayerIds = availabilityResponse.availablePlayerIds.filter(id => 
        players.some(p => p.id === id)
      );
      setSelectedPlayers(new Set(validPlayerIds));
      onAvailabilityChange?.(validPlayerIds);
    } else if (players.length > 0) {
      // Default: all active players are available
      const activePlayerIds = players.filter(p => p.active !== false).map(p => p.id);
      setSelectedPlayers(new Set(activePlayerIds));
      onAvailabilityChange?.(activePlayerIds);
    }
  }, [availabilityResponse, players, gameId, onAvailabilityChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Debounced save function
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingStateRef = useRef<Set<number> | null>(null);

  const debouncedSave = useCallback(async (availablePlayerIds: number[]) => {
    setIsSaving(true);
    try {
      await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
        availablePlayerIds
      });

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['availability', teamId, gameId] });
      pendingStateRef.current = null;

    } catch (error) {
      console.error('Failed to save availability:', error);

      // Revert to last saved state if we have one
      if (pendingStateRef.current) {
        setSelectedPlayers(pendingStateRef.current);
        onAvailabilityChange?.(Array.from(pendingStateRef.current));
      }

      toast({
        title: "Error",
        description: "Failed to save player availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [teamId, gameId, queryClient, toast, onAvailabilityChange]);

  // Handle player toggle with instant UI update and debounced save
  const handlePlayerToggle = useCallback((playerId: number, isSelected: boolean) => {
    // Store current state for potential rollback
    if (!pendingStateRef.current) {
      pendingStateRef.current = new Set(selectedPlayers);
    }

    // Update UI immediately
    const newSelectedPlayers = new Set(selectedPlayers);
    if (isSelected) {
      newSelectedPlayers.add(playerId);
    } else {
      newSelectedPlayers.delete(playerId);
    }

    setSelectedPlayers(newSelectedPlayers);
    const availablePlayerIds = Array.from(newSelectedPlayers);
    onAvailabilityChange?.(availablePlayerIds);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(availablePlayerIds);
    }, 500); // 500ms debounce
  }, [selectedPlayers, onAvailabilityChange, debouncedSave]);

  // Bulk actions
  const handleSelectAll = useCallback(() => {
    const allPlayerIds = players.map(p => p.id);
    
    // Store current state for potential rollback
    pendingStateRef.current = new Set(selectedPlayers);
    
    setSelectedPlayers(new Set(allPlayerIds));
    onAvailabilityChange?.(allPlayerIds);

    // Clear existing timeout and save immediately for bulk actions
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    debouncedSave(allPlayerIds);
  }, [players, selectedPlayers, onAvailabilityChange, debouncedSave]);

  const handleSelectNone = useCallback(() => {
    // Store current state for potential rollback
    pendingStateRef.current = new Set(selectedPlayers);
    
    setSelectedPlayers(new Set());
    onAvailabilityChange?.([]);

    // Clear existing timeout and save immediately for bulk actions
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    debouncedSave([]);
  }, [selectedPlayers, onAvailabilityChange, debouncedSave]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Availability</CardTitle>
          <CardDescription>Loading player availability...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableCount = selectedPlayers.size;
  const totalCount = players.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Player Availability</CardTitle>
            <CardDescription>
              {availableCount} of {totalCount} players available for {game.opponent || 'this game'}
            </CardDescription>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Saving...
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              disabled={false}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectNone}
              disabled={false}
            >
              Select None
            </Button>
          </div>

          {/* Player List */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {players.map(player => (
              <PlayerBox
                key={player.id}
                player={player}
                isSelectable={true}
                isSelected={selectedPlayers.has(player.id)}
                onSelectionChange={(playerId, selected) => {
                  handlePlayerToggle(playerId, selected);
                }}
                size="md"
                showPositions={true}
                isLoading={false}
                className="transition-all duration-200"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}