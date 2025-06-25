import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from "wouter";
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageTemplate from '@/components/layout/PageTemplate';
import PlayerForm from '@/components/players/PlayerForm';
import { SelectablePlayerBox } from '@/components/ui/selectable-player-box';
import { ContentSection } from '@/components/layout/ContentSection';
import { ActionButton } from '@/components/ui/ActionButton';
import { PageActions } from '@/components/layout/PageActions';
import { apiClient } from '@/lib/apiClient';

export default function TeamPlayers() {
  const params = useParams<{ teamId?: string }>();
  const teamId = params.teamId ? parseInt(params.teamId) : null;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for UI interactions
  const [removingPlayerIds, setRemovingPlayerIds] = useState<Set<number>>(new Set());
  const [addingPlayerIds, setAddingPlayerIds] = useState<Set<number>>(new Set());
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);

  // Get active season
  const { data: activeSeason } = useQuery({
    queryKey: ['seasons', 'active'],
    queryFn: async () => {
      const response = await apiClient.get('/api/seasons/active');
      return response;
    },
  });

  // Get team details
  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      console.log(`Fetching team data for team ${teamId}`);
      const response = await apiClient.get(`/api/teams/${teamId}`);
      console.log(`Team ${teamId} data:`, response);
      return response;
    },
    enabled: !!teamId,
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  // Get team players
  const { data: teamPlayersData = [], isLoading: isLoadingTeamPlayers } = useQuery<any[]>({
    queryKey: ['team-players', teamId],
    queryFn: async () => {
      console.log(`Fetching team players for team ${teamId}`);
      const response = await apiClient.get(`/api/teams/${teamId}/players`);
      console.log(`Team ${teamId} players response:`, response);
      return response;
    },
    enabled: !!teamId,
    retry: 3,
  });

  // Get available players for team assignment
  const { data: availablePlayersForTeam = [], isLoading: isLoadingAvailablePlayers } = useQuery<any[]>({
    queryKey: ['team-available-players', teamId, activeSeason?.id],
    queryFn: async () => {
      console.log(`Fetching available players for team ${teamId}, season ${activeSeason?.id}`);
      const response = await apiClient.get(`/api/teams/${teamId}/available-players?seasonId=${activeSeason?.id}`);
      console.log(`Available players for team ${teamId}:`, response);
      return response;
    },
    enabled: !!teamId && !!activeSeason?.id,
  });

  // Mutation to add player to team
  const addPlayerToTeam = useMutation({
    mutationFn: (playerId: number) => apiClient.post(`/api/teams/${teamId}/players`, { playerId }),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Player added to team' });
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add player to team',
        variant: 'destructive',
      });
    },
  });

  // Mutation to remove player from team
  const removePlayerFromTeam = useMutation({
    mutationFn: (playerId: number) => apiClient.delete(`/api/teams/${teamId}/players/${playerId}`),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Player removed from team' });
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove player from team',
        variant: 'destructive',
      });
    },
  });

  // Loading states
  if (isLoadingTeam) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (!teamId || !teamData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Team not found</p>
      </div>
    );
  }

  // Event handlers
  const handleRemovePlayer = (playerId: number) => {
    setRemovingPlayerIds(prev => new Set([...prev, playerId]));
    removePlayerFromTeam.mutate(playerId, {
      onSettled: () => {
        setRemovingPlayerIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(playerId);
          return newSet;
        });
      }
    });
  };

  const handleAddPlayer = (playerId: number) => {
    setAddingPlayerIds(prev => new Set([...prev, playerId]));
    addPlayerToTeam.mutate(playerId, {
      onSettled: () => {
        setAddingPlayerIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(playerId);
          return newSet;
        });
      }
    });
  };

  const pageTitle = `${teamData.name} Players`;
  const pageSubtitle = `Manage players for ${teamData.name} (${teamData.division})`;
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Teams', href: '/teams' },
    { label: teamData.name }
  ];

  return (
    <>
      <Helmet>
        <title>{pageTitle} | Team Manager</title>
      </Helmet>

      <PageTemplate
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumbs={breadcrumbs}
        actions={
          <PageActions>
            <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
              <DialogTrigger asChild>
                <ActionButton action="create" icon={UserPlus}>
                  Add New Player
                </ActionButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Player</DialogTitle>
                </DialogHeader>
                <PlayerForm
                  clubId={teamData.club_id}
                  teamId={teamId}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
                    queryClient.invalidateQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });
                    toast({ title: 'Success', description: 'Player created successfully' });
                    setIsAddPlayerDialogOpen(false);
                  }}
                  onCancel={() => setIsAddPlayerDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </PageActions>
        }
      >
        <ContentSection 
          title="Current Team Players"
          variant="elevated"
        >
          {isLoadingTeamPlayers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading team players...</span>
            </div>
          ) : !teamPlayersData || teamPlayersData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No players assigned to this team yet.</p>
          ) : (
            <SelectablePlayerBox
              players={teamPlayersData}
              selectedPlayerIds={new Set(teamPlayersData.map(p => p.id))}
              onSelectionChange={() => {}}
              title="Current Team Players"
              showQuickActions={false}
              mode="team-management"
              onRemovePlayer={handleRemovePlayer}
              removingPlayerIds={removingPlayerIds}
              variant="detailed"
            />
          )}
        </ContentSection>

        <ContentSection 
          title="Available Players"
          variant="elevated"
        >
          {isLoadingAvailablePlayers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading available players...</span>
            </div>
          ) : availablePlayersForTeam.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No unassigned players available. All active players are already assigned to teams this season.
              <br />
              <span className="text-sm">Use "Add New Player" to create a new player for this team.</span>
            </p>
          ) : (
            <SelectablePlayerBox
              players={availablePlayersForTeam}
              selectedPlayerIds={new Set()}
              onSelectionChange={(selectedIds) => {
                selectedIds.forEach(playerId => {
                  handleAddPlayer(playerId);
                });
              }}
              title="Available Players"
              showQuickActions={false}
              mode="selection"
              addingPlayerIds={addingPlayerIds}
              variant="detailed"
            />
          )}
        </ContentSection>
      </PageTemplate>
    </>
  );
}