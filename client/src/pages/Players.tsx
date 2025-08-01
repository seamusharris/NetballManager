import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageTemplate from '@/components/layout/PageTemplate';
import PlayerForm from '@/components/players/PlayerForm';
import PlayersList from '@/components/players/PlayersList';
import { ContentSection } from '@/components/layout/ContentSection';
import { ActionButton } from '@/components/ui/ActionButton';
import { PageActions } from '@/components/layout/PageActions';
import { apiClient } from '@/lib/apiClient';
import { useURLClub } from '@/hooks/use-url-club';
import { useOptimizedPlayers } from '@/hooks/use-optimized-queries';
import { Player } from '@shared/schema';

export default function Players() {
  const params = useParams<{ clubId?: string }>();
  const clubId = params.clubId ? parseInt(params.clubId) : null;
  
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get club context
  const { club, isLoading: clubLoading } = useURLClub();
  
  // Get players data
  const { data: players = [], isLoading: isPlayersLoading } = useOptimizedPlayers(clubId);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (playerId: number) => {
      return apiClient.delete(`/api/players/${playerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clubs/${clubId}/players`] });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: ['players', clubId] });
      toast({ title: 'Player deleted successfully' });
      setPlayerToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting player',
        description: error.message || 'Failed to delete player',
        variant: 'destructive',
      });
      setPlayerToDelete(null);
    },
  });

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
  };

  const handleDelete = (playerId: number) => {
    setPlayerToDelete(playerId);
  };

  const confirmDelete = () => {
    if (playerToDelete) {
      deleteMutation.mutate(playerToDelete);
    }
  };

  const handleFormSuccess = () => {
    setIsAddPlayerDialogOpen(false);
    setEditingPlayer(null);
  };

  const handleFormCancel = () => {
    setIsAddPlayerDialogOpen(false);
    setEditingPlayer(null);
  };

  if (clubLoading || !club || !clubId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

  const pageTitle = `${club.name} Players`;
  const pageSubtitle = `Manage players for ${club.name}`;
  const playerToDeleteName = players.find(p => p.id === playerToDelete)?.displayName;

  return (
    <>
      <Helmet>
        <title>{pageTitle} | Team Manager</title>
      </Helmet>

      <PageTemplate
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={
          <PageActions>
            <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
              <DialogTrigger asChild>
                <ActionButton action="create" icon={UserPlus}>
                  Add New Player
                </ActionButton>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Player</DialogTitle>
                </DialogHeader>
                <PlayerForm
                  clubId={clubId}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </DialogContent>
            </Dialog>
          </PageActions>
        }
      >
        <ContentSection variant="elevated">
          <PlayersList
            players={players}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isPlayersLoading}
          />
        </ContentSection>
      </PageTemplate>

      {/* Edit Player Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <PlayerForm
              player={editingPlayer}
              clubId={clubId}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {playerToDeleteName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Player'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}