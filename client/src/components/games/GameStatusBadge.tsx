import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Game, GameStatus } from '@shared/schema';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
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
function getStatusClass(status: string): string {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'in-progress':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'completed':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'forfeit-win':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'forfeit-loss':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'bye':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'abandoned':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function getStatusDisplay(status: string): string {
  switch (status) {
    case 'upcoming': return 'Upcoming';
    case 'in-progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'forfeit-win': return 'Forfeit Win';
    case 'forfeit-loss': return 'Forfeit Loss';
    case 'bye': return 'BYE';
    case 'abandoned': return 'Abandoned';
    default: return status;
  }
}

// Simple status badge component
interface GameStatusBadgeProps {
  status: string;
  displayName?: string;
  onClick?: () => void;
  className?: string;
  size?: 'default' | 'sm';
}

export function GameStatusBadge({ 
  status, 
  displayName,
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
      {displayName || getStatusDisplay(status)}
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
  const [selectedStatus, setSelectedStatus] = React.useState<GameStatus>(game.gameStatus?.name as GameStatus || 'upcoming');
  const queryClient = useQueryClient();
  const { data: gameStatuses = [] } = useQuery({
    queryKey: ['game-statuses'],
    queryFn: () => apiClient.get('/api/game-statuses'),
    staleTime: 5 * 60 * 1000,
  });

  // Keep selectedStatus in sync with game.gameStatus when it changes
  React.useEffect(() => {
    setSelectedStatus(game.gameStatus?.name as GameStatus || 'upcoming');
  }, [game.gameStatus?.name]);

  const updateGameStatus = async () => {
    if (selectedStatus === game.gameStatus?.name) {
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // Send the update request
      await apiRequest('PATCH', `/api/games/${game.id}`, {
        status: selectedStatus
      });

      // Force refresh all data
      queryClient.invalidateQueries();

      // Force immediate refetch of this specific game
      queryClient.fetchQuery({
        queryKey: [`/api/games/${game.id}`]
      });

      // Force immediate refetch of all games list
      queryClient.fetchQuery({
        queryKey: ['/api/games']
      });

      // Update the local game object directly for immediate UI feedback
      setSelectedStatus(prev => {
        const statusDisplay = getStatusDisplay(prev);
        toast({
          title: "Status temporarily updated",
          description: `Local UI updated to ${statusDisplay}. Refreshing data from server...`,
        });
        return prev;
      });

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
    return <GameStatusBadge status={game.gameStatus?.name as GameStatus || 'upcoming'} size={size} className={className} />;
  }

  // Badge with status change dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div data-status-button>
          <GameStatusBadge 
            status={game.gameStatus?.name as GameStatus || 'upcoming'} 
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
              {gameStatuses?.filter(s => s.isActive).map((statusObj) => (
                <SelectItem key={statusObj.name} value={statusObj.name}>
                  {statusObj.displayName}
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
            disabled={isSubmitting || selectedStatus === game.gameStatus?.name}
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}