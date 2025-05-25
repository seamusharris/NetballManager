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
import { Player, Season } from '@shared/schema';
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
      // Create a copy of the player data to avoid modifying the original
      const playerData = { ...newPlayer };
      
      // Validate season IDs when creating a player too
      if (playerData.seasonIds) {
        // Get a list of valid season IDs
        const validSeasonIds = seasons.map(season => season.id);
        
        // Filter to only include valid season IDs
        playerData.seasonIds = playerData.seasonIds
          .map((id: any) => typeof id === 'number' ? id : parseInt(id, 10))
          .filter((id: number) => !isNaN(id) && validSeasonIds.includes(id));
        
        console.log("Creating player with valid season IDs:", playerData.seasonIds);
      }
      
      const res = await apiRequest('POST', '/api/players', playerData);
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
  
  // Query to get valid season IDs for validation
  const { data: seasons = [] } = useQuery<Season[]>({
    queryKey: ['/api/seasons'],
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, player }: { id: number, player: any }) => {
      console.log("Sending update request for player:", id, player);
      
      // Detailed logging of the submitted player data
      console.log("Player ID:", id);
      console.log("Player data:", JSON.stringify(player, null, 2));
      console.log("Season IDs in request:", player.seasonIds);
      
      // Create a copy of the player data to avoid modifying the original
      const playerData = { ...player };
      
      // Get a list of valid season IDs from our seasons data
      const validSeasonIds = seasons.map(season => season.id);
      
      // Ensure seasonIds is an array of valid season IDs
      if (playerData.seasonIds) {
        // First normalize to numbers
        const normalizedIds = playerData.seasonIds
          .map((id: any) => typeof id === 'number' ? id : parseInt(id, 10))
          .filter((id: number) => !isNaN(id));
        
        // Then filter to only include valid season IDs and exclude any player IDs
        playerData.seasonIds = normalizedIds.filter((id: number) => {
          // Check if this ID is actually a valid season ID
          const isValidSeason = validSeasonIds.includes(id);
          
          if (!isValidSeason) {
            console.warn(`Removing invalid season ID from update request: ${id}`);
          }
          
          return isValidSeason;
        });
        
        console.log("Valid season IDs from API:", validSeasonIds);
        console.log("Selected seasons before filtering:", normalizedIds);
        console.log("Final filtered season IDs for player:", playerData.seasonIds);
      } else {
        // Provide an empty array if seasonIds is undefined
        playerData.seasonIds = [];
      }
      
      try {
        // Log request details for debugging
        console.log("Making API request to:", `/api/players/${id}`);
        console.log("Request method:", "PATCH");
        console.log("Request body:", JSON.stringify(playerData, null, 2));
        
        // Make the API request with proper headers
        const response = await fetch(`/api/players/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(playerData)
        });
        
        // Log the response status
        console.log("Response status:", response.status);
        
        // Get response text before checking if it was ok
        const responseText = await response.text();
        console.log("Response text:", responseText);
        
        if (!response.ok) {
          console.error(`API error: ${response.status} - ${responseText}`);
          console.error("Request data that caused error:", playerData);
          console.error("Request URL:", `/api/players/${id}`);
          console.error("Request headers:", { 'Content-Type': 'application/json' });
          throw new Error(`Failed to update player: ${response.status} - ${responseText}`);
        }
        
        // Parse the response JSON from the text we already received
        let updatedPlayer;
        try {
          updatedPlayer = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse response JSON:", parseError);
          throw new Error(`Failed to parse response: ${parseError.message}`);
        }
        
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
