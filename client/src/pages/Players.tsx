import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PlayersList from '@/components/players/PlayersList';
import PlayerForm from '@/components/players/PlayerForm';
import SimplePlayerForm from '@/components/players/SimplePlayerForm';
import PlayerSeasonsManager from '@/components/players/PlayerSeasonsManager';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Player, Season } from '@shared/schema';
import { useLocation } from 'wouter';

export default function Players() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [seasonManagementPlayer, setSeasonManagementPlayer] = useState<Player | null>(null);
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Parse URL params to check for edit parameter
  const params = new URLSearchParams(location.split('?')[1] || '');
  const editId = params.get('edit');
  
  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });
  
  // Find the player to edit if an edit ID is provided in the URL
  useEffect(() => {
    if (editId && players.length > 0) {
      const playerToEdit = players.find(p => p.id === parseInt(editId));
      if (playerToEdit) {
        setEditingPlayer(playerToEdit);
      }
    }
  }, [editId, players]);
  
  // Query to get seasons
  const { data: seasons = [] } = useQuery<Season[]>({
    queryKey: ['/api/seasons'],
  });
  
  // Create new player mutation
  const createMutation = useMutation({
    mutationFn: async (newPlayer: any) => {
      console.log("Creating player:", newPlayer);
      // Send the player data directly in the format expected by the server
      // apiRequest already returns the parsed JSON response
      return await apiRequest('POST', '/api/players', newPlayer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Success",
        description: "Player created successfully",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create player: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Update player mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...playerData }: { id: number, [key: string]: any }) => {
      console.log("Updating player:", id, playerData);
      const res = await apiRequest('PATCH', `/api/players/${id}`, playerData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Success",
        description: "Player updated successfully",
      });
      setEditingPlayer(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update player: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete player mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // DELETE requests typically don't return a response body
      return await apiRequest('DELETE', `/api/players/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Success",
        description: "Player deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete player: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleCreatePlayer = (playerData: any) => {
    console.log("Creating player:", playerData);
    createMutation.mutate(playerData);
  };
  
  const handleUpdatePlayer = (playerData: any) => {
    if (editingPlayer) {
      console.log("Updating player:", playerData);
      updateMutation.mutate({ id: editingPlayer.id, ...playerData });
    }
  };
  
  const handleDeletePlayer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Players | Team Manager</title>
      </Helmet>
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Players</h1>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Player
          </Button>
        </div>
        
        <PlayersList 
          players={players} 
          isLoading={isLoading} 
          onEdit={(player) => setEditingPlayer(player)}
          onDelete={handleDeletePlayer}
          onManageSeasons={(player) => setSeasonManagementPlayer(player)}
          seasons={seasons}
        />
        
        {/* Add Player Dialog */}
        {isAddDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full">
              <button 
                className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                ✕
                <span className="sr-only">Close</span>
              </button>
              
              <h2 className="text-xl font-semibold mb-2">Add New Player</h2>
              <p className="text-sm text-gray-500 mb-4">
                Enter the details for the new player.
              </p>
              
              {/* Using SimplePlayerForm instead of PlayerForm */}
              <SimplePlayerForm 
                onSubmit={handleCreatePlayer} 
                onCancel={() => setIsAddDialogOpen(false)}
                isSubmitting={createMutation.isPending} 
              />
            </div>
          </div>
        )}
        
        {/* Edit Player Dialog */}
        {!!editingPlayer && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <button 
                className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
                onClick={() => setEditingPlayer(null)}
              >
                ✕
                <span className="sr-only">Close</span>
              </button>
              
              <h2 className="text-xl font-semibold mb-2">Edit Player</h2>
              <p className="text-sm text-gray-500 mb-4">
                Make changes to the player details below.
              </p>
              
              <PlayerForm 
                player={editingPlayer}
                onSubmit={handleUpdatePlayer} 
                isSubmitting={updateMutation.isPending} 
              />
            </div>
          </div>
        )}
        
        {/* Season Management Dialog */}
        {!!seasonManagementPlayer && (
          <PlayerSeasonsManager
            player={seasonManagementPlayer}
            seasons={seasons}
            isOpen={!!seasonManagementPlayer}
            onClose={() => setSeasonManagementPlayer(null)}
          />
        )}
      </div>
    </>
  );
}