import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import GamesList from '@/components/games/GamesList';
import GameForm from '@/components/games/GameForm';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Game } from '@shared/schema';
import { useLocation } from 'wouter';

export default function Games() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Immediate query invalidation when component mounts
  useEffect(() => {
    // Force a refresh of all game data and statistics
    queryClient.invalidateQueries({ queryKey: ['/api/games'] });
    queryClient.invalidateQueries({ queryKey: ['gameScores'] });
    queryClient.invalidateQueries({ queryKey: ['gameStats'] });
  }, []);
  
  // Fetch games data
  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['/api/games'],
    staleTime: 0, // Consider data stale immediately
  });
  
  // Fetch opponents data
  const { data: opponents = [], isLoading: isLoadingOpponents } = useQuery<any[]>({
    queryKey: ['/api/opponents'],
  });
  
  // Fetch seasons data
  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery<any[]>({
    queryKey: ['/api/seasons'],
  });
  
  // Fetch active season
  const { data: activeSeason, isLoading: isLoadingActiveSeason } = useQuery<any>({
    queryKey: ['/api/seasons/active'],
  });
  
  // Check for edit parameter in the URL and handle edit game loading
  useEffect(() => {
    if (games.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      // Support both editId (legacy) and edit (new) parameters
      const editId = searchParams.get('editId') || searchParams.get('edit');
      // Get the returnTo parameter if it exists
      const returnTo = searchParams.get('returnTo');
      
      if (editId) {
        const gameId = parseInt(editId);
        const gameToEdit = games.find(game => game.id === gameId);
        if (gameToEdit) {
          // Set the editing game to trigger the dialog
          setEditingGame(gameToEdit);
          
          // Store the return path if provided
          if (returnTo === 'gameDetails') {
            // We'll use this to navigate back to game details after editing
            sessionStorage.setItem('returnToGameDetails', gameId.toString());
          }
          
          // Clear the URL parameter without reloading the page
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    }
  }, [games]);
  
  const isLoading = isLoadingGames || isLoadingOpponents || isLoadingSeasons || isLoadingActiveSeason;
  
  const createMutation = useMutation({
    mutationFn: async (newGame: any) => {
      return await apiRequest('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGame)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      toast({
        title: "Success",
        description: "Game scheduled successfully",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to schedule game: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, game }: { id: number, game: any }) => {
      return await apiRequest(`/api/games/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(game)
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate games list
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      
      // Also invalidate game stats if the game was marked as completed
      if (variables.game.completed) {
        queryClient.invalidateQueries({ queryKey: ['allGameStats'] });
        queryClient.invalidateQueries({ queryKey: ['gameStats', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['gameScores', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['positionStats', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['playerStats', variables.id] });
      }
      
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
      setEditingGame(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update game: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/games/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete game: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleCreateGame = (data: any) => {
    createMutation.mutate(data);
  };
  
  const handleUpdateGame = (data: any) => {
    if (editingGame) {
      updateMutation.mutate({ id: editingGame.id, game: data });
    }
  };
  
  const handleDeleteGame = (id: number) => {
    deleteMutation.mutate(id);
  };
  
  const handleViewStats = (id: number) => {
    navigate(`/statistics?game=${id}`);
  };
  
  return (
    <>
      <Helmet>
        <title>Games | NetballManager</title>
        <meta name="description" content="Manage your netball team's game schedule, track completed games, and schedule new matches" />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-neutral-dark">Game Management</h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary hover:bg-primary-light text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Schedule Game
          </Button>
        </div>
        
        <GamesList 
          games={games} 
          opponents={opponents} 
          isLoading={isLoading} 
          onEdit={setEditingGame}
          onDelete={handleDeleteGame}
          onViewStats={handleViewStats}
        />
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogTitle className="sr-only">Schedule New Game</DialogTitle>
            <GameForm 
              opponents={opponents as any[]}
              seasons={seasons as any[]}
              activeSeason={activeSeason}
              onSubmit={handleCreateGame} 
              isSubmitting={createMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={!!editingGame} onOpenChange={(open) => {
          if (!open) {
            setEditingGame(null);
            
            // Check if we should return to game details
            const returnToGameId = sessionStorage.getItem('returnToGameDetails');
            if (returnToGameId) {
              // Clear the storage item
              sessionStorage.removeItem('returnToGameDetails');
              // Navigate back to the game details page
              navigate(`/game/${returnToGameId}`);
            }
          }
        }}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogTitle className="sr-only">Edit Game</DialogTitle>
            <GameForm 
              game={editingGame || undefined}
              opponents={opponents as any[]}
              seasons={seasons as any[]}
              activeSeason={activeSeason}
              onSubmit={handleUpdateGame} 
              isSubmitting={updateMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}