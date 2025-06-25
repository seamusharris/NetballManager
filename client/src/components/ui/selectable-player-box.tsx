
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@shared/schema';
import PlayerAvatar from '@/components/ui/player-avatar';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { getPlayerColorHex, getLighterColorHex, getMediumColorHex } from '@/lib/playerColorUtils';
import { getPlayerBoxContainerClasses, getPlayerBoxCheckboxStyles, getPlayerBoxBackgroundStyle } from '@/lib/playerBoxStyles';
import { Badge } from '@/components/ui/badge';
import { Zap, RotateCcw, UserPlus, UserMinus } from 'lucide-react';

interface SelectablePlayerBoxProps {
  players: Player[];
  selectedPlayerIds: Set<number>;
  onSelectionChange: (selectedIds: Set<number>) => void;
  title?: string;
  showQuickActions?: boolean;
  className?: string;
  mode?: 'availability' | 'team-management';
  onAddPlayer?: (playerId: number) => void;
  onRemovePlayer?: (playerId: number) => void;
  addingPlayerIds?: Set<number>;
  removingPlayerIds?: Set<number>;
  variant?: 'compact' | 'detailed';
}

export function SelectablePlayerBox({
  players,
  selectedPlayerIds,
  onSelectionChange,
  title = "Player Selection",
  showQuickActions = true,
  className,
  mode = 'availability',
  onAddPlayer,
  onRemovePlayer,
  addingPlayerIds = new Set(),
  removingPlayerIds = new Set(),
  variant = 'detailed'
}: SelectablePlayerBoxProps) {
  const [isSaving, setIsSaving] = useState(false);
  

  const getPlayerColor = (player: Player) => {
    if (player.avatarColor?.startsWith('bg-')) {
      return player.avatarColor;
    }
    return 'bg-gray-400';
  };

  const handleSelectAll = () => {
    const allPlayerIds = new Set(players.map(p => p.id));
    onSelectionChange(allPlayerIds);
  };

  const handleClearAll = () => {
    onSelectionChange(new Set());
  };

  const handlePlayerClick = (playerId: number) => {
    if (mode === 'team-management') {
      // For team management mode, use add/remove actions
      const isSelected = selectedPlayerIds.has(playerId);
      if (isSelected && onRemovePlayer) {
        onRemovePlayer(playerId);
      } else if (!isSelected && onAddPlayer) {
        onAddPlayer(playerId);
      }
    } else {
      // For availability mode, toggle selection
      const newSelectedIds = new Set(selectedPlayerIds);
      if (newSelectedIds.has(playerId)) {
        newSelectedIds.delete(playerId);
      } else {
        newSelectedIds.add(playerId);
      }
      onSelectionChange(newSelectedIds);
    }
  };

  const sortedPlayers = (players || []).filter(player => player).sort((a, b) => {
    const displayNameA = a.displayName || `${a.firstName} ${a.lastName}`;
    const displayNameB = b.displayName || `${b.firstName} ${b.lastName}`;
    return displayNameA.localeCompare(displayNameB);
  });

  const selectedCount = selectedPlayerIds.size;
  const quickActionLabel = mode === 'team-management' ? 'Add All' : 'All Available';
  const clearActionLabel = mode === 'team-management' ? 'Remove All' : 'Clear All';

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
                {quickActionLabel}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearAll}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                {clearActionLabel}
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="mr-1">
            {selectedCount}
          </Badge>
          <span className="text-sm text-gray-600">
            {mode === 'team-management' ? 'Selected Players' : 'Available Players'}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className={cn(
          "grid gap-4 mt-2",
          variant === 'compact' 
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        )}>
          {sortedPlayers.map(player => {
            const playerColor = getPlayerColor(player);
            const isSelected = selectedPlayerIds.has(player.id);
            const isAdding = addingPlayerIds.has(player.id);
            const isRemoving = removingPlayerIds.has(player.id);
            const isDisabled = isAdding || isRemoving;

            return (
              <div 
                key={player.id}
                className={cn(
                  getPlayerBoxContainerClasses(isSelected),
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                style={getPlayerBoxBackgroundStyle(
                  isSelected,
                  getPlayerColorHex(playerColor),
                  getLighterColorHex(playerColor),
                  getMediumColorHex(playerColor)
                )}
                onClick={() => {
                  if (!isDisabled) {
                    handlePlayerClick(player.id);
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar 
                      player={player}
                      size={variant === 'compact' ? 'sm' : 'md'}
                    />
                    <div>
                      <div className={cn(
                        "font-medium",
                        variant === 'compact' ? "text-sm" : ""
                      )}>
                        {player.displayName}
                      </div>
                      {player.positionPreferences && player.positionPreferences.length > 0 && variant === 'detailed' && (
                        <div className="text-xs text-gray-500">
                          {player.positionPreferences.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdding && <UserPlus className="h-4 w-4 animate-spin" />}
                    {isRemoving && <UserMinus className="h-4 w-4 animate-spin" />}
                    <div 
                      {...getPlayerBoxCheckboxStyles(isSelected, getPlayerColorHex(playerColor))}
                    >
                      {isSelected && '✓'}
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

export default SelectablePlayerBox;
