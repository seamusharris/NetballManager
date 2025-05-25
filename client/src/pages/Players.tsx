import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PlayersList from '@/components/players/PlayersList';
import PlayerForm from '@/components/players/PlayerForm';
import SimplePlayerForm from '@/components/players/SimplePlayerForm';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Player } from '@shared/schema';
import { useLocation } from 'wouter';

export default function Players() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
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
  
  const createMutation = useMutation({
    mutationFn: async (newPlayer: any) => {
      const res = await apiRequest('POST', '/api/players', newPlayer);
      return res.json();
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
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, player }: { id: number, player: any }) => {
      console.log("Sending update request for player:", id, player);
      
      // Ensure seasonIds is an array of numbers
      if (player.seasonIds) {
        player.seasonIds = player.seasonIds.map((id: any) => 
          typeof id === 'number' ? id : parseInt(id, 10)
        ).filter((id: number) => !isNaN(id));
      }
      
      try {
        // Make the API request with proper headers
        const response = await fetch(`/api/players/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(player)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update player: ${response.status} - ${errorText}`);
        }
        
        const updatedPlayer = await response.json();
        console.log("Update response:", updatedPlayer);
        return updatedPlayer;
      } catch (err) {
        console.error("Player update request failed:", err);
        throw err;
      }
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
      console.error("Update player error:", error);
      toast({
        title: "Error",
        description: `Failed to update player: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/players/${id}`);
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
  
  const handleCreatePlayer = (data: any) => {
    console.log("Creating player with data:", data);
    
    // Debug validation - make sure all required fields are present
    if (!data.displayName) {
      toast({
        title: "Error",
        description: "Display name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.firstName) {
      toast({
        title: "Error",
        description: "First name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.lastName) {
      toast({
        title: "Error",
        description: "Last name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.positionPreferences || data.positionPreferences.length === 0) {
      toast({
        title: "Error",
        description: "At least one position preference is required",
        variant: "destructive",
      });
      return;
    }
    
    // If validation passes, create the player
    createMutation.mutate(data);
  };
  
  const handleUpdatePlayer = (data: any) => {
    console.log("Updating player with data:", data);
    
    if (!editingPlayer) {
      console.error("No player being edited");
      return;
    }
    
    // Make sure we're sending valid player data including seasonIds
    const validPlayerData = {
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth || null,
      positionPreferences: data.positionPreferences,
      active: data.active,
      seasonIds: data.seasonIds || [] // Include the season IDs in the update
    };
    
    console.log("Sending update request with:", { id: editingPlayer.id, player: validPlayerData });
    updateMutation.mutate({ 
      id: editingPlayer.id, 
      player: validPlayerData 
    });
  };
  
  const handleDeletePlayer = (id: number) => {
    deleteMutation.mutate(id);
  };
  
  return (
    <>
      <Helmet>
        <title>Players | NetballManager</title>
        <meta name="description" content="Manage your netball team players, positions, and preferences" />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-neutral-dark">Player Management</h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary hover:bg-primary-light text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Player
          </Button>
        </div>
        
        <PlayersList 
          players={players} 
          isLoading={isLoading}
          onEdit={setEditingPlayer}
          onDelete={handleDeletePlayer}
        />
        
        {isAddDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <button 
                className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                ✕
                <span className="sr-only">Close</span>
              </button>
              
              <h2 className="text-xl font-semibold mb-2">Add New Player</h2>
              <p className="text-sm text-gray-500 mb-4">
                Fill out the form below to add a new player to the team.
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
      </div>
    </>
  );
}
