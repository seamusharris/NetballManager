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

  const getDarkerPlayerColorHex = (player: Player) => {
    const colorMap: Record<string, string> = {
      'bg-red-500': '#b91c1c', 'bg-red-600': '#9f1239', 'bg-red-700': '#881337',
      'bg-orange-500': '#c2410c', 'bg-orange-600': '#9a3412', 'bg-orange-700': '#7c2d12',
      'bg-amber-500': '#b45309', 'bg-amber-600': '#92400e', 'bg-amber-700': '#78350f',
      'bg-yellow-500': '#a16207', 'bg-yellow-600': '#854d0e', 'bg-yellow-700': '#713f12',
      'bg-lime-500': '#4d7c0f', 'bg-lime-600': '#3f6212', 'bg-lime-700': '#365314',
      'bg-green-500': '#15803d', 'bg-green-600': '#166534', 'bg-green-700': '#14532d',
      'bg-emerald-500': '#047857', 'bg-emerald-600': '#065f46', 'bg-emerald-700': '#064e3b',
      'bg-teal-500': '#0f766e', 'bg-teal-600': '#115e59', 'bg-teal-700': '#134e4a',
      'bg-cyan-500': '#0e7490', 'bg-cyan-600': '#0c6380', 'bg-cyan-700': '#0b5274',
      'bg-sky-500': '#0369a1', 'bg-sky-600': '#075985', 'bg-sky-700': '#0c4a6e',
      'bg-blue-500': '#1d4ed8', 'bg-blue-600': '#1e40af', 'bg-blue-700': '#1e3a8a',
      'bg-indigo-500': '#4338ca', 'bg-indigo-600': '#3730a3', 'bg-indigo-700': '#312e81',
      'bg-violet-500': '#6d28d9', 'bg-violet-600': '#5b21b6', 'bg-violet-700': '#4c1d95',
      'bg-purple-500': '#7e22ce', 'bg-purple-600': '#6b21a8', 'bg-purple-700': '#581c87',
      'bg-fuchsia-500': '#a21caf', 'bg-fuchsia-600': '#86198f', 'bg-fuchsia-700': '#6d28d9',
      'bg-pink-500': '#be185d', 'bg-pink-600': '#9d174d', 'bg-pink-700': '#831843',
      'bg-rose-500': '#be123c', 'bg-rose-600': '#9f1239', 'bg-rose-700': '#881337',
      'bg-gray-500': '#374151', 'bg-gray-600': '#262f3f', 'bg-gray-700': '#1f2937'
    };
    return colorMap[player.avatarColor || 'bg-gray-700'] || '#374151';
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
            const darkerBorderColor = getDarkerPlayerColorHex(player);
            const displayName = player.displayName || `${player.firstName} ${player.lastName}`;
            const isSelected = isAvailable;

            return (
              <div
                key={player.id}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer shadow-sm
                  ${isSelected 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'hover:shadow-md'
                  }
                `}
                style={{ 
                  backgroundColor: isSelected ? undefined : `${playerColorHex}15`,
                  borderColor: isSelected ? undefined : darkerBorderColor,
                  color: isSelected ? undefined : playerColorHex
                }}
                onClick={() => handlePlayerAvailabilityChange(player.id, !isAvailable)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <PlayerAvatar 
                      player={player} 
                      size="md"
                      className={`
                        border-2 border-white shadow-lg shadow-black/15
                        ${isSelected ? 'ring-2 ring-green-500' : ''}
                      `}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900' : ''}`}>
                      {displayName}
                    </p>
                    {player.positionPreferences && (
                      <p className={`text-xs truncate ${isSelected ? 'text-gray-600' : 'opacity-80'}`}>
                        {player.positionPreferences.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center
                      ${isSelected 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 bg-white'
                      }
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
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

export default UnifiedPlayerAvailability;