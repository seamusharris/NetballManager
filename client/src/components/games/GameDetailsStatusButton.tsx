import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
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
import { apiClient } from '@/lib/apiClient';
import { Game, GameStatus } from '@shared/schema';
import { clearGameCache } from '@/lib/scoresCache';

// Helper function to get appropriate styling for game status
export function getStatusClass(status: GameStatus | string | null): string {
  switch (status) {
    case 'in-progress':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'forfeit-win':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'forfeit-loss':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default: // upcoming
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  }
}

// Helper function to get display text for game status
export function getStatusDisplay(status: GameStatus | string | null): string {
  switch (status) {
    case 'upcoming':
      return 'Upcoming';
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'forfeit-win':
      return 'Forfeit (Win)';
    case 'forfeit-loss':
      return 'Forfeit (Loss)';
    default:
      return 'Unknown';
  }
}

// Dialog component for changing game status
export function GameDetailsStatusButton({ 
  game,
  onStatusChanged
}: { 
  game: Game,
  onStatusChanged: (newStatus: GameStatus) => void
}) {
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | null>(game.status as GameStatus || 'upcoming');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
    queryKey: ['game-statuses'],
    queryFn: () => apiClient.get('/api/game-statuses'),
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast({
        title: 'Error',
        description: 'Please select a status',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine if this status means the game is completed
      const completedStatuses = ['completed', 'forfeit-win', 'forfeit-loss'];
      const isCompleted = completedStatuses.includes(selectedStatus);

      // Send the update request with both status and completed field
      const response = await apiRequest('PATCH', `/api/games/${game.id}`, {
        status: selectedStatus,
        completed: isCompleted
      });

      // Clear game-specific caches immediately
      clearGameCache(game.id);

      // Only invalidate queries specific to this game
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey.some(key => 
            (typeof key === 'string' && key.includes(`/api/games/${game.id}`)) ||
            (typeof key === 'number' && key === game.id) ||
            (Array.isArray(queryKey) && queryKey.includes('gameScores') && queryKey.includes(game.id))
          );
        }
      });

      // Also invalidate the main games list to reflect status change
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });

      // Call the callback with the new status
      onStatusChanged(selectedStatus);

      toast({
        title: 'Game status updated',
        description: `Game status has been updated to ${getStatusDisplay(selectedStatus)}.`,
      });

      // Close dialog
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update game status.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div 
          className={`${getStatusClass(game.status as GameStatus)} px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all duration-200 border border-gray-200 flex items-center justify-center`}
        >
          {getStatusDisplay(game.status as GameStatus)}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Game Status</DialogTitle>
          <DialogDescription>
            Change the status of this game
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Select
            value={selectedStatus || undefined}
            onValueChange={(value) => setSelectedStatus(value as GameStatus)}
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

          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}