
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayerBox } from './player-box';
import { Player } from '@shared/schema';
import { Zap, RotateCcw, UserPlus, UserMinus } from 'lucide-react';

interface EnhancedSelectablePlayerBoxProps {
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

export function EnhancedSelectablePlayerBox({
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
}: EnhancedSelectablePlayerBoxProps) {
  const handleSelectAll = () => {
    const allPlayerIds = new Set(players.map(p => p.id));
    onSelectionChange(allPlayerIds);
  };

  const handleClearAll = () => {
    onSelectionChange(new Set());
  };

  const handlePlayerSelection = (playerId: number, isSelected: boolean) => {
    if (mode === 'team-management') {
      // For team management mode, use add/remove actions
      if (isSelected && onAddPlayer) {
        onAddPlayer(playerId);
      } else if (!isSelected && onRemovePlayer) {
        onRemovePlayer(playerId);
      }
    } else {
      // For availability mode, toggle selection
      const newSelectedIds = new Set(selectedPlayerIds);
      if (isSelected) {
        newSelectedIds.add(playerId);
      } else {
        newSelectedIds.delete(playerId);
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
              >
                <Zap className="h-4 w-4 mr-1" />
                {quickActionLabel}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearAll}
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
        <div className="grid gap-4 mt-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {sortedPlayers.map(player => {
            const isSelected = selectedPlayerIds.has(player.id);
            const isAdding = addingPlayerIds.has(player.id);
            const isRemoving = removingPlayerIds.has(player.id);
            const isDisabled = isAdding || isRemoving;

            return (
              <PlayerBox
                key={player.id}
                player={player}
                size={variant === 'compact' ? 'sm' : 'md'}
                isSelectable={true}
                isSelected={isSelected}
                onSelectionChange={handlePlayerSelection}
                availabilityMode="selection"
                isLoading={isAdding || isRemoving}
                isDisabled={isDisabled}
                className="transition-all duration-200 hover:shadow-lg"
                quickActions={
                  <div className="flex items-center gap-2">
                    {isAdding && <UserPlus className="h-4 w-4 animate-spin" />}
                    {isRemoving && <UserMinus className="h-4 w-4 animate-spin" />}
                  </div>
                }
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedSelectablePlayerBox;
