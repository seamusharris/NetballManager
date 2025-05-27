import React, { useState, useEffect } from 'react';
import { Game, GAME_STATUSES, GameStatus } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface GameStatusDialogProps {
  game: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GameStatusDialog({
  game,
  open,
  onOpenChange,
  onSuccess
}: GameStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | ''>('');
  const queryClient = useQueryClient();

  // Reset selected status when dialog opens with a new game
  useEffect(() => {
    if (game) {
      setSelectedStatus(game.status || 'upcoming');
    }
  }, [game]);

  // Update game status mutation
  const updateGameStatus = useMutation({
    mutationFn: async () => {
      if (!game || !selectedStatus) return null;
      
      // Prepare update data with new status
      const updateData = {
        status: selectedStatus,
        // Also update the completed field for backward compatibility
        completed: selectedStatus === 'completed' || 
                  selectedStatus === 'forfeit-win' || 
                  selectedStatus === 'forfeit-loss'
      };
      
      return apiRequest('PATCH', `/api/games/${game.id}`, updateData);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games', game?.id?.toString()] });
      
      // Invalidate batch stats queries for any status change to ensure
      // scores and caching behavior are properly updated
      queryClient.invalidateQueries({ queryKey: ['batchGameStats'] });
      // Also clear any individual game stats cache
      queryClient.invalidateQueries({ queryKey: ['/api/games', game?.id, 'stats'] });
      
      // Show success toast
      toast({
        title: 'Game status updated',
        description: `Game status has been updated to ${selectedStatus}.`,
      });
      
      // Close dialog and call success callback
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error updating game status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update game status. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Status change handler
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as GameStatus);
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGameStatus.mutate();
  };

  // Get friendly status display name
  const getStatusDisplayName = (status: string) => {
    switch(status) {
      case 'upcoming': return 'Upcoming';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'forfeit': return 'Forfeit';
      case 'forfeit-win': return 'Forfeit (Win)';
      case 'forfeit-loss': return 'Forfeit (Loss)';
      case 'bye': return 'BYE Round';
      case 'abandoned': return 'Abandoned';
      default: return status;
    }
  };

  // Special status explanation
  const getStatusDescription = (status: string) => {
    switch(status) {
      case 'forfeit-win':
        return 'Opponent forfeited the game. Score will be recorded as 10-0 in our favor.';
      case 'forfeit-loss':
        return 'Our team forfeited the game. Score will be recorded as 0-10.';
      case 'in-progress':
        return 'Game is currently being played and will allow live stat entry.';
      case 'bye':
        return 'BYE round - no game scheduled. Points awarded as per competition rules.';
      case 'abandoned':
        return 'Game cancelled due to weather or other circumstances. Points awarded as per competition rules.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change Game Status</DialogTitle>
            <DialogDescription>
              Update the status of this game.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Game Status
              </label>
              
              <Select
                value={selectedStatus}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select game status" />
                </SelectTrigger>
                <SelectContent>
                  {GAME_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusDisplayName(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {getStatusDescription(selectedStatus) && (
                <p className="text-sm text-muted-foreground">
                  {getStatusDescription(selectedStatus)}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!selectedStatus || (game?.status === selectedStatus) || updateGameStatus.isPending}
            >
              {updateGameStatus.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}