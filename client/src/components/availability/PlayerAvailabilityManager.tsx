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

  // Handle player toggle with immediate save
  const handlePlayerToggle = async (playerId: number, isSelected: boolean) => {
    if (isSaving) return;

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

    // Save to backend
    setIsSaving(true);
    try {
      await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
        availablePlayerIds
      });

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['availability', teamId, gameId] });

    } catch (error) {
      console.error('Failed to save availability:', error);

      // Revert on error
      setSelectedPlayers(selectedPlayers);
      onAvailabilityChange?.(Array.from(selectedPlayers));

      toast({
        title: "Error",
        description: "Failed to save player availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk actions
  const handleSelectAll = async () => {
    if (isSaving) return;

    const allPlayerIds = players.map(p => p.id);
    setSelectedPlayers(new Set(allPlayerIds));
    onAvailabilityChange?.(allPlayerIds);

    setIsSaving(true);
    try {
      await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
        availablePlayerIds: allPlayerIds
      });
      queryClient.invalidateQueries({ queryKey: ['availability', teamId, gameId] });
    } catch (error) {
      console.error('Failed to save availability:', error);
      toast({
        title: "Error",
        description: "Failed to save player availability.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectNone = async () => {
    if (isSaving) return;

    setSelectedPlayers(new Set());
    onAvailabilityChange?.([]);

    setIsSaving(true);
    try {
      await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
        availablePlayerIds: []
      });
      queryClient.invalidateQueries({ queryKey: ['availability', teamId, gameId] });
    } catch (error) {
      console.error('Failed to save availability:', error);
      toast({
        title: "Error",
        description: "Failed to save player availability.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
              disabled={isSaving}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectNone}
              disabled={isSaving}
            >
              Select None
            </Button>
          </div>

          {/* Player List */}
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
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
                isLoading={isSaving}
                className="transition-all duration-200"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}