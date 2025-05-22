import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Game, GameStatus, allGameStatuses } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface GameStatusButtonProps {
  game: Game;
  className?: string;
  size?: 'default' | 'sm';
  withDialog?: boolean;
}

export function getStatusClass(status: string): string {
  switch (status) {
    case 'in-progress':
      return 'bg-amber-500 hover:bg-amber-600';
    case 'completed':
      return 'bg-emerald-500 hover:bg-emerald-600';
    case 'forfeit-win':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'forfeit-loss':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-neutral hover:bg-neutral-dark';
  }
}

export function getStatusDisplay(status: string): string {
  switch (status) {
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'forfeit-win':
      return 'Forfeit (Win)';
    case 'forfeit-loss':
      return 'Forfeit (Loss)';
    case 'upcoming':
      return 'Upcoming';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function GameStatusButton({ game, className = '', size = 'default', withDialog = true }: GameStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Update selectedStatus whenever game.status changes
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>(game.status as GameStatus);
  
  // Keep selectedStatus in sync with game.status when it changes
  useEffect(() => {
    setSelectedStatus(game.status as GameStatus);
  }, [game.status]);
  
  const badgeSize = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1';
  
  const updateGameStatus = async () => {
    if (selectedStatus === game.status) {
      setIsOpen(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/games/${game.id}`, 'PATCH', {
        status: selectedStatus
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${game.id}`] });
      
      toast({
        title: 'Game status updated',
        description: `Game status has been updated to ${getStatusDisplay(selectedStatus)}.`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update game status:', error);
      toast({
        title: 'Failed to update game status',
        description: 'An error occurred while updating the game status.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Simple badge without dialog
  if (!withDialog) {
    return (
      <Badge 
        className={`${getStatusClass(game.status as string)} ${badgeSize} ${className}`}
      >
        {getStatusDisplay(game.status as string)}
      </Badge>
    );
  }
  
  // Badge with status change dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div>
          <Badge 
            className={`${getStatusClass(game.status as string)} cursor-pointer ${badgeSize} ${className}`}
          >
            {getStatusDisplay(game.status as string)}
          </Badge>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Game Status</DialogTitle>
          <DialogDescription>
            Change the status of this game.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select 
            value={selectedStatus} 
            onValueChange={(value: string) => setSelectedStatus(value as GameStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {allGameStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusDisplay(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateGameStatus} 
            disabled={isSubmitting || selectedStatus === game.status}
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}