import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import PlayersList from '@/components/players/PlayersList';
import PlayerForm from '@/components/players/PlayerForm';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Player } from '@shared/schema';

export default function Players() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const { toast } = useToast();
  
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['/api/players'],
  });
  
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
      const res = await apiRequest('PATCH', `/api/players/${id}`, player);
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
    createMutation.mutate(data);
  };
  
  const handleUpdatePlayer = (data: any) => {
    if (editingPlayer) {
      updateMutation.mutate({ id: editingPlayer.id, player: data });
    }
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
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <h2 className="text-lg font-semibold mt-2">Add New Player</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Fill out the form below to add a new player to the team.
            </p>
            <PlayerForm 
              onSubmit={handleCreatePlayer} 
              isSubmitting={createMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
          <DialogContent className="sm:max-w-[550px]">
            <h2 className="text-lg font-semibold mt-2">Edit Player</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Make changes to the player details below.
            </p>
            <PlayerForm 
              player={editingPlayer || undefined}
              onSubmit={handleUpdatePlayer} 
              isSubmitting={updateMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
