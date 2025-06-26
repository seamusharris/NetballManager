import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@shared/schema';
import { PlayerBox } from '@/components/ui/player-box';
import { cn } from '@/lib/utils';

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
  const { toast } = useToast();

  const handleSelectAll = () => {
    const allPlayerIds = new Set(players.map(p => p.id));
    onSelectionChange(allPlayerIds);
  };

  const handleClearAll = () => {
    onSelectionChange(new Set());
  };

  const handlePlayerSelectionChange = (playerId: number, isSelected: boolean) => {
    const newSelectedIds = new Set(selectedPlayerIds);

    if (isSelected) {
      newSelectedIds.add(playerId);
    } else {
      newSelectedIds.delete(playerId);
    }

    onSelectionChange(newSelectedIds);
  };

  const sortedPlayers = (players || []).filter(player => player).sort((a, b) => {
    const displayNameA = a.displayName || `${a.firstName} ${a.lastName}`;
    const displayNameB = b.displayName || `${b.firstName} ${b.lastName}`;
    return displayNameA.localeCompare(displayNameB);
  });

  const selectedCount = selectedPlayerIds.size;

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
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearAll}
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
            {selectedCount}
          </Badge>
          <span className="text-sm text-gray-600">Selected Players</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className={cn(
          "grid gap-4 mt-2",
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        )}>
          {sortedPlayers.map(player => {
            const isSelected = selectedPlayerIds.has(player.id);
            const isLoading = addingPlayerIds.has(player.id) || removingPlayerIds.has(player.id) || isSaving;

            return (
              <PlayerBox
                key={player.id}
                player={player}
                isSelectable={true}
                isSelected={isSelected}
                onSelectionChange={handlePlayerSelectionChange}
                size={variant === 'compact' ? 'sm' : 'md'}
                showPositions={variant === 'detailed'}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default SelectablePlayerBox;