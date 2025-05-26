import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PlayersList from '@/components/players/PlayersList';
import PlayerForm from '@/components/players/PlayerForm';
import SimplePlayerForm from '@/components/players/SimplePlayerForm';
import PlayerSeasonsManager from '@/components/players/PlayerSeasonsManager';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { LoadingState } from '@/components/ui/loading-state';
import { useCrudMutations } from '@/hooks/use-crud-mutations';
import { usePlayersQuery, useStandardQuery } from '@/hooks/use-standard-query';
import { Player, Season } from '@shared/schema';
import { useLocation } from 'wouter';

export default function Players() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [seasonManagementPlayer, setSeasonManagementPlayer] = useState<Player | null>(null);
  const [location] = useLocation();
  
  // Parse URL params to check for edit parameter
  const params = new URLSearchParams(location.split('?')[1] || '');
  const editId = params.get('edit');
  
  const { data: players = [], isLoading, error } = usePlayersQuery();
  const { data: seasons = [] } = useStandardQuery<Season[]>({
    endpoint: '/api/seasons'
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
  
  // Use standardized CRUD mutations
  const { createMutation, updateMutation, deleteMutation } = useCrudMutations<Player>({
    entityName: 'Player',
    baseEndpoint: '/api/players',
    invalidatePatterns: ['/api/players'],
    onSuccess: (data) => {
      if (createMutation.isSuccess) {
        setIsAddDialogOpen(false);
      }
      if (updateMutation.isSuccess) {
        setEditingPlayer(null);
      }
    }
  });
  
  // Handlers
  const handleCreatePlayer = (playerData: any) => {
    createMutation.mutate(playerData);
  };
  
  const handleUpdatePlayer = (playerData: any) => {
    if (editingPlayer) {
      updateMutation.mutate({ id: editingPlayer.id, ...playerData });
    }
  };
  
  const handleDeletePlayer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      if (!deleteMutation.isPending) {
        deleteMutation.mutate(id);
      }
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
        
        <LoadingState isLoading={isLoading} error={error}>
          <PlayersList 
            players={players} 
            isLoading={isLoading} 
            onEdit={(player) => setEditingPlayer(player)}
            onDelete={handleDeletePlayer}
            onManageSeasons={(player) => setSeasonManagementPlayer(player)}
            seasons={seasons}
          />
        </LoadingState>
        
        {/* Add Player Dialog */}
        <CrudDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          title="Add New Player"
          description="Enter the details for the new player."
        >
          <SimplePlayerForm 
            onSubmit={handleCreatePlayer} 
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={createMutation.isPending} 
          />
        </CrudDialog>
        
        {/* Edit Player Dialog */}
        <CrudDialog
          isOpen={!!editingPlayer}
          onClose={() => setEditingPlayer(null)}
          title="Edit Player"
          description="Make changes to the player details below."
          maxWidth="max-w-lg"
        >
          {editingPlayer && (
            <PlayerForm 
              player={editingPlayer}
              onSubmit={handleUpdatePlayer} 
              isSubmitting={updateMutation.isPending} 
            />
          )}
        </CrudDialog>
        
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