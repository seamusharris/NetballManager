import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Game, GameStatus, allGameStatuses } from '@shared/schema';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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
import { Button } from '@/components/ui/button';

/**
 * Get the CSS class for a game status
 */
export function getStatusClass(status: string): string {
  switch (status) {
    case 'in-progress':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'forfeit-win':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'forfeit-loss':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  }
}

/**
 * Get the display text for a game status
 */
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

// Simple status badge component
interface GameStatusBadgeProps {
  status: GameStatus;
  onClick?: () => void;
  className?: string;
  size?: 'default' | 'sm';
}

export function GameStatusBadge({ 
  status, 
  onClick, 
  className,
  size = 'default'
}: GameStatusBadgeProps) {
  const badgeSize = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1';
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        badgeSize,
        'rounded-full transition-colors', 
        getStatusClass(status),
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {getStatusDisplay(status)}
    </Badge>
  );
}

// Full status button with dialog component
interface GameStatusButtonProps {
  game: Game;
  className?: string;
  size?: 'default' | 'sm';
  withDialog?: boolean;
}

export function GameStatusButton({ 
  game, 
  className = '', 
  size = 'default', 
  withDialog = true 
}: GameStatusButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<GameStatus>(game.status as GameStatus);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Keep selectedStatus in sync with game.status when it changes
  React.useEffect(() => {
    setSelectedStatus(game.status as GameStatus);
  }, [game.status]);
  
  const updateGameStatus = async () => {
    if (selectedStatus === game.status) {
      setIsOpen(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Send the update request
      await apiRequest(`/api/games/${game.id}`, 'PATCH', {
        status: selectedStatus
      });
      
      // Force refresh games data specifically
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      
      // Specifically target this game's data for immediate refresh
      queryClient.invalidateQueries({ queryKey: [`/api/games/${game.id}`] });
      
      // Force all queries to refetch (this ensures any derived data also refreshes)
      queryClient.refetchQueries();
      
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
    return <GameStatusBadge status={game.status as GameStatus} size={size} className={className} />;
  }
  
  // Badge with status change dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div data-status-button>
          <GameStatusBadge 
            status={game.status as GameStatus} 
            size={size} 
            className={className} 
            onClick={() => setIsOpen(true)}
          />
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
          
          {selectedStatus && (
            <div className="text-sm text-muted-foreground mt-2">
              {selectedStatus === 'forfeit-win' && (
                <p>Opponent forfeited the game. Score will be recorded as 10-0 in our favor.</p>
              )}
              {selectedStatus === 'forfeit-loss' && (
                <p>Our team forfeited the game. Score will be recorded as 0-10.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
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