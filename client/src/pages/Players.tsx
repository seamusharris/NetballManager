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
      console.log("========== UPDATE PLAYER REQUEST ==========");
      console.log("Player ID:", id);
      console.log("Raw player data:", JSON.stringify(player, null, 2));
      
      // Create a clean copy of the player data
      const playerData = {
        displayName: player.displayName || '',
        firstName: player.firstName || '',
        lastName: player.lastName || '',
        dateOfBirth: player.dateOfBirth || null,
        positionPreferences: Array.isArray(player.positionPreferences) ? player.positionPreferences : [],
        active: !!player.active, // Ensure boolean
        seasonIds: [] // Default empty array, we'll process this next
      };
      
      // Process season IDs more carefully
      if (player.seasonIds) {
        // Ensure it's an array
        const seasonIdsArray = Array.isArray(player.seasonIds) 
          ? player.seasonIds 
          : [player.seasonIds];
        
        // Normalize to valid number values
        const processedIds = seasonIdsArray
          .map((sid: any) => {
            if (typeof sid === 'string') {
              const parsed = parseInt(sid, 10);
              return isNaN(parsed) ? null : parsed;
            }
            return typeof sid === 'number' ? sid : null;
          })
          .filter((id): id is number => id !== null);
        
        playerData.seasonIds = processedIds;
        
        console.log("Processed season IDs:", processedIds);
      }
      
      // FIRST - Update the basic player information
      try {
        console.log("1. Updating player base information...");
        console.log("Request URL:", `/api/players/${id}`);
        
        // Create a copy without seasonIds for the first update
        const playerBasicData = {...playerData};
        delete playerBasicData.seasonIds;
        
        console.log("Basic player data for update:", JSON.stringify(playerBasicData, null, 2));
        
        // First update just the player record
        const playerResponse = await fetch(`/api/players/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerBasicData),
          credentials: 'include'
        });
        
        if (!playerResponse.ok) {
          throw new Error(`Player update failed: ${playerResponse.status}`);
        }
        
        // SECOND - Update the player-season relationships separately
        console.log("2. Updating player-season relationships...");
        console.log("Season IDs to update:", playerData.seasonIds);
        
        const seasonResponse = await fetch(`/api/players/${id}/seasons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seasonIds: playerData.seasonIds }),
          credentials: 'include'
        });
        
        if (!seasonResponse.ok) {
          console.warn("Season relationship update failed, but player data was updated");
          // Try to get detailed error information
          try {
            const errorData = await seasonResponse.json();
            console.error("Season update error details:", errorData);
            
            // Show error toast with detailed information
            toast({
              title: "Season Update Failed",
              description: `Error: ${JSON.stringify(errorData)}`,
              variant: "destructive",
            });
          } catch (e) {
            console.error("Could not parse season update error response:", e);
            console.error("Status code:", seasonResponse.status);
            console.error("Status text:", seasonResponse.statusText);
            
            // Try to get text response
            try {
              const textResponse = await seasonResponse.text();
              console.error("Error response text:", textResponse);
              
              // Show error toast with status information
              toast({
                title: "Season Update Failed",
                description: `Status: ${seasonResponse.status} - ${seasonResponse.statusText}. Response: ${textResponse}`,
                variant: "destructive",
              });
            } catch (textError) {
              console.error("Could not get text response:", textError);
              
              // Show basic error toast
              toast({
                title: "Season Update Failed",
                description: `Status: ${seasonResponse.status} - ${seasonResponse.statusText}`,
                variant: "destructive",
              });
            }
          }
        } else {
          console.log("Season relationships updated successfully");
          toast({
            title: "Success",
            description: "Player and season relationships updated successfully",
          });
        }
        
        // Get the updated player with seasons
        const playerWithSeasons = await fetch(`/api/players/${id}`, {
          credentials: 'include'
        }).then(res => res.json());
        
        console.log("Update successful:", playerWithSeasons);
        console.log("========== UPDATE PLAYER COMPLETED ==========");
        return playerWithSeasons;
      } catch (err) {
        console.error("========== UPDATE PLAYER FAILED ==========");
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
  
  // Function to directly update just the player's seasons
  const updatePlayerSeasons = (playerId: number, seasonIds: number[]) => {
    console.log(`Directly updating seasons for player ${playerId}:`, seasonIds);
    
    return fetch(`/api/players/${playerId}/seasons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seasonIds })
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to update seasons");
      return response.json();
    })
    .then(() => {
      toast({
        title: "Success", 
        description: "Player seasons updated successfully"
      });
      queryClient.invalidateQueries({queryKey: ['/api/players']});
    })
    .catch(error => {
      toast({
        title: "Error",
        description: `Failed to update seasons: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    });
  };
  
  // Function to update just the basic player info
  const updatePlayerInfo = (playerId: number, playerData: any) => {
    console.log(`Directly updating info for player ${playerId}:`, playerData);
    
    return fetch(`/api/players/${playerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playerData)
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to update player information");
      return response.json();
    })
    .then(() => {
      toast({
        title: "Success", 
        description: "Player information updated successfully"
      });
      queryClient.invalidateQueries({queryKey: ['/api/players']});
    })
    .catch(error => {
      toast({
        title: "Error",
        description: `Failed to update player: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    });
  };
  
  // Main update handler
  const handleUpdatePlayer = (data: any) => {
    if (!editingPlayer) {
      console.error("No player being edited");
      toast({
        title: "Error",
        description: "No player is currently being edited",
        variant: "destructive"
      });
      return;
    }
    
    // First handle the basic player info update
    const playerInfo = {
      displayName: data.displayName || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      positionPreferences: Array.isArray(data.positionPreferences) ? data.positionPreferences : [],
      active: Boolean(data.active)
    };
    
    // Two-step approach to isolate issues
    updatePlayerInfo(editingPlayer.id, playerInfo)
      .then(() => {
        // Now that player info is updated, proceed with updating seasons
        if (Array.isArray(data.seasonIds)) {
          return updatePlayerSeasons(editingPlayer.id, data.seasonIds);
        }
      })
      .then(() => {
        // Final success - close the dialog
        setEditingPlayer(null);
      })
      .catch(error => {
        console.error("Update failed:", error);
        // Error handling already done in the individual functions
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
          <div className="flex space-x-2">
            {/* Season management button */}
            <Button
              onClick={() => {
                // Find the first player
                if (players.length > 0) {
                  setSeasonManagementPlayer(players[0]);
                } else {
                  toast({
                    title: "No players available",
                    description: "Create a player first before managing seasons",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Manage Seasons
            </Button>
            
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary-light text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Player
            </Button>
          </div>
        </div>
        
        <PlayersList 
          players={players} 
          isLoading={isLoading}
          onEdit={setEditingPlayer}
          onDelete={handleDeletePlayer}
          onManageSeasons={setSeasonManagementPlayer}
        />
        
        {/* Add Player Dialog */}
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
