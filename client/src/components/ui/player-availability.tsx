
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@shared/schema';
import { PlayerBox } from '@/components/ui/player-box';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';

interface PlayerAvailabilityProps {
  players: Player[];
  availabilityData: Record<number, 'available' | 'unavailable' | 'maybe'>;
  onAvailabilityChange: (data: Record<number, 'available' | 'unavailable' | 'maybe'>) => void;
  title?: string;
  showQuickActions?: boolean;
  className?: string;
  gameId?: number;
  teamId?: number;
  variant?: 'compact' | 'detailed';
  autoSave?: boolean;
}

export function PlayerAvailability({
  players,
  availabilityData,
  onAvailabilityChange,
  title = "Player Availability",
  showQuickActions = true,
  className,
  gameId,
  teamId,
  variant = 'detailed',
  autoSave = true
}: PlayerAvailabilityProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<number, 'available' | 'unavailable' | 'maybe'>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Debouncing refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isProcessingRef = useRef(false);
  const lastSavePromiseRef = useRef<Promise<void>>(Promise.resolve());

  // Debounced save function
  const debouncedSave = useCallback(async (finalAvailabilityData: Record<number, 'available' | 'unavailable' | 'maybe'>) => {
    if (!gameId || !autoSave) return;

    // Wait for any previous save to complete to prevent race conditions
    await lastSavePromiseRef.current;
    
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    setIsSaving(true);
    
    const savePromise = (async () => {
      try {
        // Convert to available player IDs format expected by API
        const availablePlayerIds = Object.entries(finalAvailabilityData)
          .filter(([_, status]) => status === 'available')
          .map(([playerId, _]) => parseInt(playerId));

        console.log(`Saving availability for game ${gameId}: ${availablePlayerIds.length} players available`);

        // Use team-based endpoint when available
        if (teamId) {
          await apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, {
            availablePlayerIds
          });
        } else {
          await apiClient.post(`/api/games/${gameId}/availability`, {
            availablePlayerIds
          });
        }

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['availability', teamId, gameId] });
        
        // Clear pending changes after successful save
        setPendingChanges({});
        
        toast({
          title: "Availability saved",
          description: `${availablePlayerIds.length} players marked as available.`,
        });
      } catch (error) {
        console.error("Failed to save player availability:", error);
        toast({
          variant: "destructive",
          title: "Save failed",
          description: "Failed to save player availability. Please try again.",
        });
      } finally {
        setIsSaving(false);
        isProcessingRef.current = false;
      }
    })();
    
    lastSavePromiseRef.current = savePromise;
    await savePromise;
  }, [gameId, teamId, autoSave, queryClient, toast]);

  // Handle individual player changes with debouncing
  const handlePlayerAvailabilityChange = useCallback((playerId: number, availability: 'available' | 'unavailable' | 'maybe') => {
    // Optimistically update local state immediately
    const newAvailabilityData = {
      ...availabilityData,
      ...pendingChanges,
      [playerId]: availability
    };
    
    // Update pending changes
    setPendingChanges(prev => ({
      ...prev,
      [playerId]: availability
    }));
    
    // Update parent state immediately for UI responsiveness
    onAvailabilityChange(newAvailabilityData);

    // Clear existing timeout and set new one
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(newAvailabilityData);
    }, 500); // 500ms debounce
  }, [availabilityData, pendingChanges, onAvailabilityChange, debouncedSave]);

  // Handle bulk operations
  const handleSetAllAvailable = useCallback(async () => {
    const allAvailable = players.reduce((acc, player) => {
      acc[player.id] = 'available';
      return acc;
    }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
    
    onAvailabilityChange(allAvailable);
    setPendingChanges({});
    
    // Clear any pending debounced saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Save immediately for bulk operations
    await debouncedSave(allAvailable);
  }, [players, onAvailabilityChange, debouncedSave]);

  const handleSetAllUnavailable = useCallback(async () => {
    const allUnavailable = players.reduce((acc, player) => {
      acc[player.id] = 'unavailable';
      return acc;
    }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
    
    onAvailabilityChange(allUnavailable);
    setPendingChanges({});
    
    // Clear any pending debounced saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Save immediately for bulk operations
    await debouncedSave(allUnavailable);
  }, [players, onAvailabilityChange, debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Merge current data with pending changes for display
  const displayAvailabilityData = {
    ...availabilityData,
    ...pendingChanges
  };

  const sortedPlayers = (players || []).filter(player => player).sort((a, b) => {
    const displayNameA = a.displayName || `${a.firstName} ${a.lastName}`;
    const displayNameB = b.displayName || `${b.firstName} ${b.lastName}`;
    return displayNameA.localeCompare(displayNameB);
  });

  const availableCount = Object.values(displayAvailabilityData).filter(status => status === 'available').length;
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
            {(isSaving || hasPendingChanges) && (
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            )}
          </CardTitle>
          {showQuickActions && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSetAllAvailable}
                disabled={isSaving}
              >
                <Zap className="h-4 w-4 mr-1" />
                All Available
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSetAllUnavailable}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge 
            variant="outline" 
            className={cn(
              "mr-1",
              hasPendingChanges && "border-orange-500 text-orange-600"
            )}
          >
            {availableCount}
          </Badge>
          <span className="text-sm text-gray-600">
            Available Players
            {hasPendingChanges && (
              <span className="text-orange-600 ml-1">(saving...)</span>
            )}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className={cn(
          "grid gap-4 mt-2",
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        )}>
          {sortedPlayers.map(player => {
            const isSelected = displayAvailabilityData[player.id] === 'available';
            const isPending = player.id in pendingChanges;

            return (
              <PlayerBox
                key={player.id}
                player={player}
                isSelectable={true}
                isSelected={isSelected}
                onSelectionChange={(playerId, selected) => {
                  if (!isSaving) {
                    handlePlayerAvailabilityChange(
                      playerId, 
                      selected ? 'available' : 'unavailable'
                    );
                  }
                }}
                size={variant === 'compact' ? 'sm' : 'md'}
                showPositions={variant === 'detailed'}
                isLoading={isSaving && isPending}
                className={cn(
                  isPending && "ring-2 ring-orange-200 ring-offset-2"
                )}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default PlayerAvailability;
