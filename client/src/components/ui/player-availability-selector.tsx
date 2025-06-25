import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlayerAvatar from '@/components/ui/player-avatar';
import { Player } from '@/shared/api-types';
import { cn, getInitials } from '@/lib/utils';
import { Zap, RotateCcw } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface PlayerAvailabilitySelectorProps {
  players: Player[];
  availabilityData: Record<number, 'available' | 'unavailable' | 'maybe'>;
  onAvailabilityChange: (data: Record<number, 'available' | 'unavailable' | 'maybe'>) => void;
  title?: string;
  showQuickActions?: boolean;
  className?: string;
  gameId?: number; // Optional gameId for auto-save functionality
}

export function PlayerAvailabilitySelector({
  players,
  availabilityData,
  onAvailabilityChange,
  title = "Player Availability",
  showQuickActions = true,
  className,
  gameId
}: PlayerAvailabilitySelectorProps) {
  const [isSaving, setIsSaving] = useState(false);
  

  // Get player color using the player's own avatarColor property from their profile
  const getPlayerColor = (player: Player) => {
    // Use the player's stored avatarColor if it exists
    if (player.avatarColor) {
      // If it's already a Tailwind class (starts with 'bg-'), use it directly
      if (player.avatarColor.startsWith('bg-')) {
        return player.avatarColor;
      }
    }

    // If the player doesn't have an avatarColor or it's not a Tailwind class,
    // we use a default gray color - this should be very rare as all players
    // should have colors assigned in the database
    return 'bg-gray-400';
  };

  // Get color hex value for styling
  const getColorHex = (colorClass: string) => {
    // Convert bg-color-shade to a hex color for borders and text
    const colorMap: Record<string, string> = {
      'bg-red-500': '#ef4444',
      'bg-emerald-600': '#059669',
      'bg-teal-600': '#0d9488',
      'bg-blue-600': '#2563eb',
      'bg-indigo-600': '#4f46e5',
      'bg-purple-600': '#9333ea',
      'bg-pink-600': '#db2777',
      'bg-pink-500': '#ec4899',
      'bg-orange-500': '#f97316',
      'bg-yellow-600': '#ca8a04',
      'bg-rose-600': '#e11d48',
      'bg-lime-600': '#65a30d',
      'bg-sky-600': '#0284c7',
      'bg-violet-600': '#7c3aed',
      'bg-cyan-600': '#0891b2',
      'bg-gray-400': '#9ca3af',
      'bg-accent': '#0d9488',
      'bg-secondary': '#7c3aed',
      'bg-primary': '#2563eb',
      'bg-green-600': '#16a34a',
      'bg-green-700': '#15803d'
    };

    return colorMap[colorClass] || '#9ca3af';
  };

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

      if (gameId) {
        const isAvailable = availability === 'available';
        await apiClient.patch(`/api/games/${gameId}/availability/${playerId}`, { isAvailable });
        toast({
          title: "Availability updated",
          description: `Player availability updated successfully.`,
        });
      } else {
        console.warn("gameId is not provided. Auto-saving is disabled.");
      }
    } catch (error) {
      console.error("Failed to update player availability:", error);
      toast({
        variant: "destructive",
        title: "Error updating availability",
        description: "Failed to update player availability. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Sort players by display name
  const sortedPlayers = [...players].sort((a, b) => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {sortedPlayers.map(player => {
            const status = availabilityData[player.id] || 'unavailable';
            const playerColor = getPlayerColor(player);
            const colorHex = getColorHex(playerColor);
            const displayName = player.displayName || `${player.firstName} ${player.lastName}`;
            const isAvailable = status === 'available';

            return (
              <div 
                key={player.id}
                className={cn(
                  "p-4 border rounded-lg shadow-sm transition-all",
                  isAvailable 
                    ? "border-2 shadow" 
                    : "opacity-75 border border-gray-200"
                )}
                style={{
                  borderColor: isAvailable ? colorHex : '',
                  backgroundColor: isAvailable ? `${colorHex}10` : ''
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar 
                      firstName={player.firstName}
                      lastName={player.lastName}
                      avatarColor={playerColor}
                      size="md"
                    />
                    <div>
                      <div className="font-medium">{displayName}</div>
                      {player.positionPreferences && player.positionPreferences.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {player.positionPreferences.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isAvailable}
                      disabled={isSaving}
                      onCheckedChange={(checked) => {
                        handlePlayerAvailabilityChange(
                          player.id, 
                          checked ? 'available' : 'unavailable'
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}