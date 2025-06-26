
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@shared/schema';
import { PlayerBox } from '@/components/ui/player-box';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';

interface PlayerAvailabilityProps {
  players: Player[];
  availabilityData: Record<number, 'available' | 'unavailable' | 'maybe'>;
  onAvailabilityChange: (data: Record<number, 'available' | 'unavailable' | 'maybe'>) => void;
  title?: string;
  showQuickActions?: boolean;
  className?: string;
  gameId?: number;
  variant?: 'compact' | 'detailed';
}

export function PlayerAvailability({
  players,
  availabilityData,
  onAvailabilityChange,
  title = "Player Availability",
  showQuickActions = true,
  className,
  gameId,
  variant = 'detailed'
}: PlayerAvailabilityProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSetAllAvailable = () => {
    const allAvailable = players.reduce((acc, player) => {
      acc[player.id] = 'available';
      return acc;
    }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
    onAvailabilityChange(allAvailable);
  };

  const handleSetAllUnavailable = () => {
    const allUnavailable = players.reduce((acc, player) => {
      acc[player.id] = 'unavailable';
      return acc;
    }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
    onAvailabilityChange(allUnavailable);
  };

  const handlePlayerAvailabilityChange = async (playerId: number, availability: 'available' | 'unavailable' | 'maybe') => {
    setIsSaving(true);
    try {
      // Optimistically update local state
      onAvailabilityChange({
        ...availabilityData,
        [playerId]: availability
      });

      // Auto-save if gameId is provided
      if (gameId) {
        const isAvailable = availability === 'available';
        await apiClient.patch(`/api/games/${gameId}/availability/${playerId}`, { isAvailable });
        toast({
          title: "Availability updated",
          description: `Player availability updated successfully.`,
        });
      }
    } catch (error) {
      console.error("Failed to update player availability:", error);
      toast({
        variant: "destructive",
        title: "Error updating availability",
        description: "Failed to update player availability. Please try again.",
      });

      // Revert optimistic update on error
      onAvailabilityChange(availabilityData);
    } finally {
      setIsSaving(false);
    }
  };

  const sortedPlayers = (players || []).filter(player => player).sort((a, b) => {
    const displayNameA = a.displayName || `${a.firstName} ${a.lastName}`;
    const displayNameB = b.displayName || `${b.firstName} ${b.lastName}`;
    return displayNameA.localeCompare(displayNameB);
  });

  const availableCount = Object.values(availabilityData).filter(status => status === 'available').length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
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
          <Badge variant="outline" className="mr-1">
            {availableCount}
          </Badge>
          <span className="text-sm text-gray-600">Available Players</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className={cn(
          "grid gap-4 mt-2",
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        )}>
          {sortedPlayers.map(player => {
            const isSelected = availabilityData[player.id] === 'available';

            return (
              <PlayerBox
                key={player.id}
                player={player}
                isSelectable={true}
                isSelected={isSelected}
                onSelectionChange={(selected) => {
                  if (!isSaving) {
                    handlePlayerAvailabilityChange(
                      player.id, 
                      selected ? 'available' : 'unavailable'
                    );
                  }
                }}
                size={variant === 'compact' ? 'sm' : 'md'}
                showPosition={variant === 'detailed'}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default PlayerAvailability;
