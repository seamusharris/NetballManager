
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerBox } from '@/components/ui/player-box';
import { apiClient } from '@/lib/apiClient';
import { Player, Game } from '@shared/schema';

interface PlayerAvailabilityManagerProps {
  gameId: number;
  teamId: number;
  players: Player[];
  game?: Game;
}

class AvailabilityManager {
  private state: Map<string, Record<number, boolean>> = new Map();
  private pendingSaves: Map<string, NodeJS.Timeout> = new Map();
  private activeRequests: Map<string, Promise<any>> = new Map();

  async updateAvailability(gameId: number, teamId: number, playerId: number, isAvailable: boolean) {
    const key = `game-${gameId}`;
    
    // 1. Update state immediately
    const current = this.state.get(key) || {};
    current[playerId] = isAvailable;
    this.state.set(key, current);
    
    // 2. Cancel existing save timeout
    if (this.pendingSaves.has(key)) {
      clearTimeout(this.pendingSaves.get(key)!);
    }
    
    // 3. Schedule new save with deduplication
    this.pendingSaves.set(key, setTimeout(() => {
      this.executeSave(gameId, teamId, current);
    }, 500));
  }

  private async executeSave(gameId: number, teamId: number, state: Record<number, boolean>) {
    const key = `game-${gameId}`;
    
    // Prevent duplicate requests
    if (this.activeRequests.has(key)) {
      await this.activeRequests.get(key);
    }
    
    const savePromise = this.performSave(gameId, teamId, state);
    this.activeRequests.set(key, savePromise);
    
    try {
      await savePromise;
    } finally {
      this.activeRequests.delete(key);
      this.pendingSaves.delete(key);
    }
  }

  private async performSave(gameId: number, teamId: number, state: Record<number, boolean>) {
    const availablePlayerIds = Object.entries(state)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([playerId, _]) => parseInt(playerId));

    await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
      availablePlayerIds
    });
  }

  getState(gameId: number): Record<number, boolean> {
    return this.state.get(`game-${gameId}`) || {};
  }

  setState(gameId: number, state: Record<number, boolean>) {
    this.state.set(`game-${gameId}`, state);
  }
}

const availabilityManager = new AvailabilityManager();

export default function PlayerAvailabilityManager({
  gameId,
  teamId,
  players,
  game
}: PlayerAvailabilityManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch availability data
  const { data: availabilityResponse, isLoading } = useQuery({
    queryKey: ['availability', teamId, gameId],
    queryFn: () => apiClient.get(`/api/teams/${teamId}/games/${gameId}/availability`),
    enabled: !!gameId && !!teamId,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize state from API response
  useEffect(() => {
    if (availabilityResponse && players.length > 0) {
      const availableIds = availabilityResponse.availablePlayerIds || [];
      const newState: Record<number, boolean> = {};
      
      players.forEach(player => {
        newState[player.id] = availableIds.includes(player.id);
      });
      
      availabilityManager.setState(gameId, newState);
    }
  }, [availabilityResponse, players, gameId]);

  const availabilityState = availabilityManager.getState(gameId);
  const availableCount = Object.values(availabilityState).filter(Boolean).length;

  const handlePlayerToggle = useCallback(async (playerId: number) => {
    const currentState = availabilityState[playerId] || false;
    const newState = !currentState;
    
    try {
      await availabilityManager.updateAvailability(gameId, teamId, playerId, newState);
      
      // Invalidate cache after successful save
      queryClient.invalidateQueries({ 
        queryKey: ['availability', teamId, gameId] 
      });
      
    } catch (error) {
      console.error('Error updating player availability:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update player availability. Please try again."
      });
    }
  }, [gameId, teamId, availabilityState, queryClient, toast]);

  const handleSelectAll = useCallback(async () => {
    const availableIds = players.map(p => p.id);
    
    try {
      await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
        availablePlayerIds: availableIds
      });

      // Update local state
      const newState: Record<number, boolean> = {};
      players.forEach(player => {
        newState[player.id] = true;
      });
      availabilityManager.setState(gameId, newState);

      queryClient.invalidateQueries({ 
        queryKey: ['availability', teamId, gameId] 
      });

      toast({ title: "All players selected" });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error selecting all players" 
      });
    }
  }, [gameId, teamId, players, queryClient, toast]);

  const handleClearAll = useCallback(async () => {
    try {
      await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
        availablePlayerIds: []
      });

      // Update local state
      const newState: Record<number, boolean> = {};
      players.forEach(player => {
        newState[player.id] = false;
      });
      availabilityManager.setState(gameId, newState);

      queryClient.invalidateQueries({ 
        queryKey: ['availability', teamId, gameId] 
      });

      toast({ title: "All players cleared" });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error clearing all players" 
      });
    }
  }, [gameId, teamId, players, queryClient, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading player availability...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Player Availability
            {game && (
              <span className="font-normal text-gray-600 ml-2">
                for {game.date}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {players
            .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
            .map(player => {
              const isSelected = availabilityState[player.id] === true;

              return (
                <PlayerBox 
                  key={player.id}
                  player={player}
                  size="md"
                  showPositions={true}
                  isSelectable={true}
                  isSelected={isSelected}
                  onSelectionChange={(playerId, selected) => {
                    handlePlayerToggle(playerId);
                  }}
                  className="shadow-md transition-all duration-200 hover:shadow-lg"
                />
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
