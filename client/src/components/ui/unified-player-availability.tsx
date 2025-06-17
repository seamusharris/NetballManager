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

  const getPlayerColorHex = (player: Player) => {
    const colorMap: Record<string, string> = {
      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626', 'bg-red-700': '#b91c1c',
      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c', 'bg-orange-700': '#c2410c',
      'bg-amber-500': '#f59e0b', 'bg-amber-600': '#d97706', 'bg-amber-700': '#b45309',
      'bg-yellow-500': '#eab308', 'bg-yellow-600': '#ca8a04', 'bg-yellow-700': '#a16207',
      'bg-lime-500': '#84cc16', 'bg-lime-600': '#65a30d', 'bg-lime-700': '#4d7c0f',
      'bg-green-500': '#22c55e', 'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
      'bg-emerald-500': '#10b981', 'bg-emerald-600': '#059669', 'bg-emerald-700': '#047857',
      'bg-teal-500': '#14b8a6', 'bg-teal-600': '#0d9488', 'bg-teal-700': '#0f766e',
      'bg-cyan-500': '#06b6d4', 'bg-cyan-600': '#0891b2', 'bg-cyan-700': '#0e7490',
      'bg-sky-500': '#0ea5e9', 'bg-sky-600': '#0284c7', 'bg-sky-700': '#0369a1',
      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb', 'bg-blue-700': '#1d4ed8',
      'bg-indigo-500': '#6366f1', 'bg-indigo-600': '#4f46e5', 'bg-indigo-700': '#4338ca',
      'bg-violet-500': '#8b5cf6', 'bg-violet-600': '#7c3aed', 'bg-violet-700': '#6d28d9',
      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea', 'bg-purple-700': '#7e22ce',
      'bg-fuchsia-500': '#d946ef', 'bg-fuchsia-600': '#c026d3', 'bg-fuchsia-700': '#a21caf',
      'bg-pink-500': '#ec4899', 'bg-pink-600': '#db2777', 'bg-pink-700': '#be185d',
      'bg-rose-500': '#f43f5e', 'bg-rose-600': '#e11d48', 'bg-rose-700': '#be123c',
      'bg-gray-500': '#6b7280', 'bg-gray-600': '#4b5563', 'bg-gray-700': '#374151'
    };
    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
  };

  const handleSelectAll = () => {
    const newData: Record<number, boolean> = {};
    players.forEach(player => {
      newData[player.id] = true;
    });
    onAvailabilityChange(newData);
    
    // Auto-save all changes if enabled and gameId provided
    if (autoSave && gameId) {
      saveBulkAvailability(newData);
    }
  };

  const handleSelectNone = () => {
    const newData: Record<number, boolean> = {};
    players.forEach(player => {
      newData[player.id] = false;
    });
    onAvailabilityChange(newData);
    
    // Auto-save all changes if enabled and gameId provided
    if (autoSave && gameId) {
      saveBulkAvailability(newData);
    }
  };

  const saveBulkAvailability = async (newData: Record<number, boolean>) => {
    setIsSaving(true);
    try {
      const availablePlayerIds = Object.entries(newData)
        .filter(([_, isAvailable]) => isAvailable)
        .map(([playerId, _]) => parseInt(playerId));

      await apiClient.post(`/api/games/${gameId}/availability`, {
        availablePlayerIds
      });
      
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
    } finally {
      setIsSaving(false);
    }
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
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" 
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {sortedPlayers.map(player => {
            const isAvailable = availabilityData[player.id] === true;
            const playerColorHex = getPlayerColorHex(player);
            const lightBackgroundColor = `${playerColorHex}20`;
            const borderColor = `${playerColorHex}80`;
            const displayName = player.displayName || `${player.firstName} ${player.lastName}`;

            return (
              <div 
                key={player.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                  "hover:scale-105 hover:shadow-md min-h-[100px]",
                  isAvailable 
                    ? "border-green-500 bg-green-50 shadow-sm" 
                    : ""
                )}
                style={{
                  backgroundColor: isAvailable ? '#f0fdf4' : lightBackgroundColor,
                  borderColor: isAvailable ? '#22c55e' : borderColor,
                  color: playerColorHex
                }}
              >
                {/* Avatar */}
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 ${player.avatarColor || 'bg-gray-500'}`}
                >
                  {player.firstName?.[0]}{player.lastName?.[0]}
                </div>
                
                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate">
                    {displayName}
                  </div>
                  {player.positionPreferences && player.positionPreferences.length > 0 && (
                    <div className="text-sm opacity-75 mt-1">
                      {player.positionPreferences.join(', ')}
                    </div>
                  )}
                  {player.active === false && (
                    <Badge variant="secondary" className="text-xs mt-1">Inactive</Badge>
                  )}
                </div>
                
                {/* Availability Switch */}
                <div className="flex-shrink-0">
                  <Switch
                    checked={isAvailable}
                    disabled={isSaving}
                    onCheckedChange={(checked) => {
                      handlePlayerAvailabilityChange(
                        player.id, 
                        checked === true
                      );
                    }}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}