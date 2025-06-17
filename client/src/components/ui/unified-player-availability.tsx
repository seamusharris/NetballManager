import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { Player } from '@/shared/api-types';
import { cn } from '@/lib/utils';
import { Zap, RotateCcw } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface UnifiedPlayerAvailabilityProps {
  players: Player[];
  availabilityData: Record<number, boolean>;
  onAvailabilityChange: (data: Record<number, boolean>) => void;
  title?: string;
  showQuickActions?: boolean;
  className?: string;
  gameId?: number;
  variant?: 'compact' | 'detailed';
  autoSave?: boolean;
}

export function UnifiedPlayerAvailability({
  players,
  availabilityData,
  onAvailabilityChange,
  title = "Player Availability",
  showQuickActions = true,
  className,
  gameId,
  variant = 'detailed',
  autoSave = true
}: UnifiedPlayerAvailabilityProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const getPlayerColor = (player: Player) => {
    if (player.avatarColor?.startsWith('bg-')) {
      return player.avatarColor;
    }
    return 'bg-gray-400';
  };

  const getColorHex = (colorClass: string) => {
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
      'bg-green-600': '#16a34a'
    };
    return colorMap[colorClass] || '#9ca3af';
  };

  const handleSelectAll = () => {
    const newData: Record<number, boolean> = {};
    players.forEach(player => {
      newData[player.id] = true;
    });
    onAvailabilityChange(newData);
  };

  const handleSelectNone = () => {
    const newData: Record<number, boolean> = {};
    players.forEach(player => {
      newData[player.id] = false;
    });
    onAvailabilityChange(newData);
  };

  const handlePlayerAvailabilityChange = async (playerId: number, isAvailable: boolean) => {
    const newData = { ...availabilityData, [playerId]: isAvailable };
    onAvailabilityChange(newData);

    // Auto-save if enabled and gameId provided
    if (autoSave && gameId) {
      setIsSaving(true);
      try {
        await apiClient.patch(`/api/games/${gameId}/availability/${playerId}`, {
          isAvailable
        });
        toast({
          title: "Availability updated",
          description: `Player availability updated successfully.`,
        });
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
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const displayNameA = a.displayName || `${a.firstName} ${a.lastName}`;
    const displayNameB = b.displayName || `${b.firstName} ${b.lastName}`;
    return displayNameA.localeCompare(displayNameB);
  });

  const availableCount = Object.values(availabilityData).filter(status => status === true).length;

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
                onClick={handleSelectAll}
                disabled={isSaving}
              >
                <Zap className="h-4 w-4 mr-1" />
                All Available
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectNone}
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
          variant === 'compact' 
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5" 
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}>
          {sortedPlayers.map(player => {
            const isAvailable = availabilityData[player.id] === true;
            const playerColor = getPlayerColor(player);
            const colorHex = getColorHex(playerColor);
            const displayName = player.displayName || `${player.firstName} ${player.lastName}`;

            return (
              <div 
                key={player.id}
                className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
            "hover:scale-105 hover:shadow-sm",
            isAvailable 
              ? "border-green-600 shadow-md" 
              : "border-gray-400 hover:border-gray-500"
          )}
          style={{
            backgroundColor: isAvailable ? '#f0fdf4' : (player.avatarColor ? player.avatarColor.replace('bg-', '') + '20' : '#f8fafc')
          }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar 
                      firstName={player.firstName}
                      lastName={player.lastName}
                      avatarColor={playerColor}
                      size={variant === 'compact' ? 'sm' : 'md'}
                    />
                    <div>
                      <div className={cn(
                        "font-medium",
                        variant === 'compact' ? "text-sm" : ""
                      )}>
                        {displayName}
                      </div>
                      {player.positionPreferences && player.positionPreferences.length > 0 && variant === 'detailed' && (
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
                          checked === true
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