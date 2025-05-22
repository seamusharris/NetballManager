import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { apiRequest } from '@/lib/queryClient';
import { Game, GameStatus, allGameStatuses } from '@shared/schema';

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
  const { toast } = useToast();
  
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
      const response = await fetch(`/api/games/${game.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: selectedStatus,
          completed: isCompleted
        })
      });
      
      // Force refresh all data
      queryClient.invalidateQueries();
      
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
          className={`${getStatusClass(game.status as GameStatus)} px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all duration-200 border border-gray-200`}
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
              {allGameStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusDisplay(status)}
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