import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Game, Player } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectablePlayerBox } from '@/components/ui/selectable-player-box';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/apiClient';
import { invalidateAvailability } from '@/lib/cacheInvalidation';
import { useToast } from '@/hooks/use-toast';

interface SimplePlayerAvailabilityManagerProps {
  gameId: number;
  players: Player[];
  games: Game[];
  onComplete?: () => void;
  onAvailabilityChange?: (availablePlayerIds: number[]) => void;
  onGameChange?: (gameId: number) => void;
  hideGameSelection?: boolean;
}

export default function SimplePlayerAvailabilityManager({
  gameId,
  players,
  games,
  onAvailabilityChange,
  onGameChange,
  hideGameSelection = false
}: SimplePlayerAvailabilityManagerProps) {
  const queryClient = useQueryClient();
  
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing availability data
  const { data: availabilityResponse, refetch } = useQuery({
    queryKey: ['/api/games', gameId, 'availability'],
    enabled: !!gameId,
  });

  // Initialize selected players from API response
  useEffect(() => {
    if (!gameId || players.length === 0) {
      return;
    }

    if (availabilityResponse?.availablePlayerIds) {
      // Use saved availability data
      const playerIds = players.map(p => p.id);
      const filteredAvailableIds = availabilityResponse.availablePlayerIds.filter(id => playerIds.includes(id));
      setSelectedPlayers(new Set(filteredAvailableIds));
      onAvailabilityChange?.(filteredAvailableIds);
    } else {
      // Default: all active players are available
      const activePlayerIds = players.filter(p => p.active !== false).map(p => p.id);
      setSelectedPlayers(new Set(activePlayerIds));
      onAvailabilityChange?.(activePlayerIds);
    }
  }, [availabilityResponse, players, gameId]);

  // Handle individual player toggle with auto-save
  const handlePlayerToggle = useCallback(async (playerId: number, isSelected: boolean) => {
    const newSelectedPlayers = new Set(selectedPlayers);
    
    if (isSelected) {
      newSelectedPlayers.add(playerId);
    } else {
      newSelectedPlayers.delete(playerId);
    }
    
    setSelectedPlayers(newSelectedPlayers);
    const availablePlayerIds = Array.from(newSelectedPlayers);
    onAvailabilityChange?.(availablePlayerIds);

    // Auto-save if gameId is provided
    if (gameId && !isSaving) {
      setIsSaving(true);
      try {
        await apiClient.post(`/api/games/${gameId}/availability`, {
          availablePlayerIds
        });

        invalidateAvailability(queryClient, gameId);
        await refetch();

        toast({
          title: "Availability updated",
          description: "Player availability saved successfully.",
        });
      } catch (error) {
        console.error("Failed to save player availability:", error);
        toast({
          variant: "destructive",
          title: "Error saving availability", 
          description: "Failed to save player availability. Please try again.",
        });
        
        // Revert the change on error
        setSelectedPlayers(selectedPlayers);
        onAvailabilityChange?.(Array.from(selectedPlayers));
      } finally {
        setIsSaving(false);
      }
    }
  }, [selectedPlayers, gameId, isSaving, queryClient, refetch, toast, onAvailabilityChange]);

  const selectedGame = games.find(g => g.id === gameId);
  const activeTeamPlayers = players.filter(p => p.active !== false);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Player Availability
          {selectedGame && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              vs {selectedGame.awayTeamName || 'TBD'} on {new Date(selectedGame.date).toLocaleDateString()}
            </span>
          )}
        </CardTitle>
        
        {!hideGameSelection && games.length > 0 && (
          <div className="flex items-center space-x-2">
            <label htmlFor="game-select" className="text-sm font-medium">
              Game:
            </label>
            <Select
              value={gameId?.toString() || ''}
              onValueChange={(value) => onGameChange?.(parseInt(value))}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id.toString()}>
                    vs {game.awayTeamName || 'TBD'} - {new Date(game.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {selectedPlayers.size} of {activeTeamPlayers.length} players available
            {isSaving && " (saving...)"}
          </div>
          
          <div className="space-y-2">
            {activeTeamPlayers.map((player) => (
              <SelectablePlayerBox
                key={player.id}
                player={player}
                isSelected={selectedPlayers.has(player.id)}
                onSelectionChange={(playerId, isSelected) => handlePlayerToggle(playerId, isSelected)}
                size="md"
                showPositions={true}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}