import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GameForm from '@/components/games/GameForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Game, Opponent } from '@shared/schema';

interface EditGameDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game;
  opponents: Opponent[];
  gameId: number;
}

export function EditGameDialog({ isOpen, onOpenChange, game, opponents, gameId }: EditGameDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for updating the game
  const updateGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      return await apiRequest(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData)
      });
    },
    onSuccess: () => {
      // Refresh game data after successful update
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      
      // Show success message
      toast({
        title: "Game updated",
        description: "The game details have been updated successfully",
      });
      
      // Close the dialog
      onOpenChange(false);
    },
    onError: (error: any) => {
      // Show error message
      toast({
        title: "Update failed",
        description: `Failed to update game: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Handler for game form submission
  const handleGameSubmit = (formData: any) => {
    updateGameMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
        </DialogHeader>
        <GameForm 
          game={game} 
          opponents={opponents} 
          onSubmit={handleGameSubmit}
          isSubmitting={updateGameMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}