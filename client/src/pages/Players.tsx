import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import PlayersList from '@/components/players/PlayersList';
import { useClub } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlayerForm from '@/components/players/PlayerForm';
import { User, UserMinus, UserPlus, Loader2, Calendar, Users } from 'lucide-react';
import { SelectablePlayerBox } from '@/components/ui/selectable-player-box';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiClient } from '@/lib/apiClient';
import { useCrudMutations } from '@/hooks/use-crud-mutations';
import PageTemplate from '@/components/layout/PageTemplate';
import { ContentSection } from '@/components/layout/ContentSection';
import { ActionButton } from '@/components/ui/ActionButton';
import { PageActions } from '@/components/layout/PageActions';

export default function Players() {
  const params = useParams<{ clubId?: string; teamId?: string }>();
  const [location, setLocation] = useLocation();
  
  // Extract IDs directly from URL parameters
  const clubId = params.clubId ? Number(params.clubId) : null;
  const teamId = params.teamId ? Number(params.teamId) : null;

  // Redirect to club-scoped URL if accessing /players without club ID
  useEffect(() => {
    if (location === '/players') {
      // Default to club 54 (Warrandyte) for backward compatibility
      setLocation('/club/54/players');
      return;
    }
  }, [location, setLocation]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set());

  // Fetch club details directly from URL parameter
  const { data: club } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}`),
    enabled: !!clubId,
  });

  // Get active season for team assignments
  const { data: activeSeason } = useQuery({
    queryKey: ['seasons', 'active'],
    queryFn: async () => {
      const response = await apiClient.get('/api/seasons/active');
      return response;
    },
  });

  // Get all teams for the dropdown
  const { data: allTeams = [] } = useQuery({
    queryKey: ['teams', clubId],
    queryFn: async () => {
      if (!clubId) return [];
      const response = await apiClient.get(`/api/clubs/${clubId}/teams`);
      return response;
    },
    enabled: !!clubId,
  });

  // Get team details if viewing a specific team
  const { data: teamData, isLoading: isLoadingTeam, isError: teamError } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/teams/${teamId}`);
      return response;
    },
    enabled: !!teamId,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: teamPlayersData = [], isLoading: isLoadingTeamPlayers } = useQuery<any[]>({
    queryKey: ['team-players', teamId, clubId],
    queryFn: () => {
      return apiClient.get(`/api/teams/${teamId}/players`);
    },
    enabled: !!teamId && !!clubId,
  });

  const { data: availablePlayersForTeam = [], isLoading: isLoadingAvailablePlayers } = useQuery<any[]>({
    queryKey: ['team-available-players', teamId, activeSeason?.id],
    queryFn: () => {
      return apiClient.get(`/api/teams/${teamId}/available-players?seasonId=${activeSeason?.id}`);
    },
    enabled: !!teamId && !!activeSeason?.id,
  });

  // Team filter state for main players view
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

  // Get players for non-team view using URL-based club ID
  const { data: players = [], isLoading: isPlayersLoading, error: playersError } = useQuery({
    queryKey: ['players', clubId],
    queryFn: async () => {
      console.log('Players query: fetching for club', clubId);
      const response = await apiClient.get(`/api/clubs/${clubId}/players`);
      console.log('Players query: received', response?.length, 'players');
      return response;
    },
    enabled: !!clubId && !teamId,
  });

  // Filter players based on team selection
  const filteredPlayers = useMemo(() => {
    if (!players || selectedTeamFilter === 'all') return players;

    return players.filter(player => {
      // Check if player has team assignments in current season
      const hasTeamAssignment = player.teamAssignments?.some(
        assignment => assignment.teamId === parseInt(selectedTeamFilter)
      );
      return hasTeamAssignment;
    });
  }, [players, selectedTeamFilter]);

  const addPlayerToTeam = useMutation({
    mutationFn: (playerId: number) => apiClient.post(`/api/teams/${teamId}/players`, { playerId }),
    onMutate: async (playerId: number) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['team-players', teamId, clubId] });
      await queryClient.cancelQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });

      // Snapshot previous values
      const previousTeamPlayers = queryClient.getQueryData(['team-players', teamId, clubId]);
      const previousAvailablePlayers = queryClient.getQueryData(['team-available-players', teamId, activeSeason?.id]);

      // Find the player being added
      const playerToAdd = availablePlayersForTeam?.find(p => p.id === playerId);

      if (playerToAdd && previousTeamPlayers && previousAvailablePlayers) {
        // Optimistically update team players
        queryClient.setQueryData(['team-players', teamId, clubId], (old: any[]) => [...old, playerToAdd]);

        // Optimistically update available players
        queryClient.setQueryData(['team-available-players', teamId, activeSeason?.id], (old: any[]) => 
          old.filter(p => p.id !== playerId)
        );
      }

      return { previousTeamPlayers, previousAvailablePlayers };
    },
    onSuccess: (data, playerId) => {
      // Clear any optimistic state since the real update happened
      setOptimisticallyAddedPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
      setOptimisticallyRemovedPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
      toast({ title: 'Success', description: 'Player added to team' });
    },
    onError: (error: any, variables, context) => {
      // Clear optimistic state and revert cache
      setOptimisticallyAddedPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables);
        return newSet;
      });

      // Revert optimistic updates
      if (context?.previousTeamPlayers) {
        queryClient.setQueryData(['team-players', teamId, clubId], context.previousTeamPlayers);
      }
      if (context?.previousAvailablePlayers) {
        queryClient.setQueryData(['team-available-players', teamId, activeSeason?.id], context.previousAvailablePlayers);
      }

      toast({
        title: 'Error',
        description: error.message || 'Failed to add player to team',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Invalidate to ensure eventual consistency
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId, clubId] });
      queryClient.invalidateQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });
    },
  });

  // Standardized player creation mutation that handles both club and team contexts
  const createPlayer = useMutation({
    mutationFn: async (playerData: any) => {
      if (!club?.id) {
        throw new Error('No club selected');
      }

      // Prepare headers with club context and optional team context
      const headers: Record<string, string> = {
        'x-current-club-id': club.id.toString()
      };

      // Add team context if we're in team-specific view
      if (teamId) {
        headers['x-current-team-id'] = teamId.toString();
      }

      // Create the player with both club and optional team context
      const response = await apiClient.post('/api/players', playerData, { headers });

      return response;
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-players'] });
      queryClient.invalidateQueries({ queryKey: ['players', clubId] });
      queryClient.invalidateQueries({ queryKey: ['team-players'] });

      toast({ title: 'Success', description: 'Player created successfully' });
      setIsAddPlayerDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Player creation failed:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create player';
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    },
  });

  // Track which players are being removed/added
  const [removingPlayerIds, setRemovingPlayerIds] = useState<Set<number>>(new Set());
  const [addingPlayerIds, setAddingPlayerIds] = useState<Set<number>>(new Set());

  // Optimistic updates for immediate UI feedback
  const [optimisticallyRemovedPlayerIds, setOptimisticallyRemovedPlayerIds] = useState<Set<number>>(new Set());
  const [optimisticallyAddedPlayerIds, setOptimisticallyAddedPlayerIds] = useState<Set<number>>(new Set());
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);

  const removePlayerFromTeam = useMutation({
    mutationFn: (playerId: number) => apiClient.delete(`/api/teams/${teamId}/players/${playerId}`),
    onMutate: async (playerId: number) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['team-players', teamId, clubId] });
      await queryClient.cancelQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });

      // Snapshot previous values
      const previousTeamPlayers = queryClient.getQueryData(['team-players', teamId, clubId]);
      const previousAvailablePlayers = queryClient.getQueryData(['team-available-players', teamId, activeSeason?.id]);

      // Find the player being removed
      const playerToRemove = teamPlayersData?.find(p => p.id === playerId);

      if (playerToRemove && previousTeamPlayers && previousAvailablePlayers) {
        // Optimistically update team players
        queryClient.setQueryData(['team-players', teamId, clubId], (old: any[]) => 
          old.filter(p => p.id !== playerId)
        );

        // Optimistically update available players
        queryClient.setQueryData(['team-available-players', teamId, activeSeason?.id], (old: any[]) => 
          [...old, playerToRemove].sort((a, b) => a.displayName.localeCompare(b.displayName))
        );
      }

      return { previousTeamPlayers, previousAvailablePlayers };
    },
    onSuccess: (data, playerId) => {
      // Clear any optimistic state since the real update happened
      setOptimisticallyRemovedPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
      setOptimisticallyAddedPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
      toast({ title: 'Success', description: 'Player removed from team' });
    },
    onError: (error: any, variables, context) => {
      // Clear optimistic state and revert cache
      setOptimisticallyRemovedPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables);
        return newSet;
      });

      // Revert optimistic updates
      if (context?.previousTeamPlayers) {
        queryClient.setQueryData(['team-players', teamId, clubId], context.previousTeamPlayers);
      }
      if (context?.previousAvailablePlayers) {
        queryClient.setQueryData(['team-available-players', teamId, activeSeason?.id], context.previousAvailablePlayers);
      }

      toast({
        title: 'Error',
        description: error.message || 'Failed to remove player from team',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Invalidate to ensure eventual consistency
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId, clubId] });
      queryClient.invalidateQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });
    },
  });

  // Direct mutations following clubs/teams pattern - avoids CRUD hook 404 issues
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/players', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', clubId] });
      queryClient.invalidateQueries({ queryKey: ['clubs', clubId, 'players'] });
      toast({
        title: "Success",
        description: "Player created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create player",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.patch(`/api/players/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', clubId] });
      queryClient.invalidateQueries({ queryKey: ['clubs', clubId, 'players'] });
      toast({
        title: "Success",
        description: "Player updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update player",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (playerId: number) => apiClient.delete(`/api/players/${playerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', clubId] });
      queryClient.invalidateQueries({ queryKey: ['clubs', clubId, 'players'] });
      toast({
        title: "Success",
        description: "Player deleted successfully",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message?.toLowerCase() || '';

      if (errorMessage.includes('constraint') || errorMessage.includes('foreign key')) {
        toast({
          title: "Cannot Delete Player",
          description: "This player has game statistics or other records. Please remove those first.",
          variant: "destructive",
        });
      } else if (!errorMessage.includes('not found') && !errorMessage.includes('404')) {
        // Only show error for real errors, not 404s from double execution
        toast({
          title: "Error",
          description: `Failed to delete player: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  });

  const isLoading = isPlayersLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Rename the teamPlayersData to teamPlayers
  const teamPlayers = teamPlayersData;

  // Handle remove player function now
  const handleRemovePlayer = (playerId: number) => {
    removePlayerFromTeam.mutate(playerId);
  };
    // Handle add player function now
  const handleAddPlayer = (playerId: number) => {
    addPlayerToTeam.mutate(playerId);
  };

  if (teamId) {
    // Team-specific view with management capabilities
    const availablePlayers = teamId ? availablePlayersForTeam : [];

    // Generate page context for team view
    const pageTitle = teamData?.name ? `Players - ${teamData.name}` : 'Team Players';
    const pageSubtitle = teamData?.division 
      ? `Manage players for ${teamData.name} (${teamData.division})`
      : 'Manage team players';

    const breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Teams', href: '/teams' },
      { label: teamData?.name || 'Team' }
    ];

    return (
      <>
        <Helmet>
          <title>Team Players | Team Manager</title>
        </Helmet>

        <PageTemplate
          title={pageTitle}
          subtitle={pageSubtitle}
          breadcrumbs={breadcrumbs}
          actions={
          <>
            <div className="w-64">
              <Select
                value={teamId?.toString() || ""}
                onValueChange={(value) => {
                  const newTeamId = parseInt(value);
                  navigate(`/team/${newTeamId}/players`);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Switch Team" />
                </SelectTrigger>
                <SelectContent>
                  {allTeams
                    .filter(team => team.name !== 'BYE')
                    .map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} {team.division && `(${team.division})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </>
        }
        >
          {/* Current Team Players */}
          <ContentSection 
            title="Current Team Players"
            variant="elevated"
          >
            {!teamPlayers || teamPlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No players assigned to this team yet.</p>
            ) : (
              <SelectablePlayerBox
                players={teamPlayers}
                selectedPlayerIds={new Set(teamPlayers.filter(p => !optimisticallyRemovedPlayerIds.has(p.id)).map(p => p.id))}
                onSelectionChange={(selectedIds) => {
                  // In team management mode, when a player is deselected from current team,
                  // remove them from the team with optimistic update
                  const currentTeamPlayerIds = new Set(teamPlayers.filter(p => !optimisticallyRemovedPlayerIds.has(p.id)).map(p => p.id));
                  const removedPlayerIds = [...currentTeamPlayerIds].filter(id => !selectedIds.has(id));

                  removedPlayerIds.forEach(playerId => {
                    // Immediate optimistic update
                    setOptimisticallyRemovedPlayerIds(prev => new Set([...prev, playerId]));
                    handleRemovePlayer(playerId);
                  });
                }}
                title="Current Team Players"
                showQuickActions={false}
                mode="team-management"
                onRemovePlayer={handleRemovePlayer}
                removingPlayerIds={removingPlayerIds}
                variant="detailed"
              />
            )}
          </ContentSection>

          {/* Available Players to Add */}
          <ContentSection 
            title="Available Players"
            actions={
              <PageActions spacing="tight">
                <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
                  <DialogTrigger asChild>
                    <ActionButton action="create" size="sm" icon={UserPlus}>
                      Add New Player
                    </ActionButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Player</DialogTitle>
                    </DialogHeader>
                    <PlayerForm
                      clubId={clubId}
                      teamId={teamId}
                      onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
                        queryClient.invalidateQueries({ queryKey: ['unassigned-players', activeSeason?.id] });
                        toast({ title: 'Success', description: 'Player created successfully' });
                        setIsAddPlayerDialogOpen(false);
                      }}
                      onCancel={() => setIsAddPlayerDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

              </PageActions>
            }
            variant="elevated"
          >
            {availablePlayers.filter(p => !optimisticallyAddedPlayerIds.has(p.id)).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No unassigned players available. All active players are already assigned to teams this season.
                <br />
                <span className="text-sm">Use "Add New Player" to create a new player for this team.</span>
              </p>
            ) : (
              <SelectablePlayerBox
                players={availablePlayers.filter(p => !optimisticallyAddedPlayerIds.has(p.id))}
                selectedPlayerIds={new Set()}
                onSelectionChange={(selectedIds) => {
                  // Handle optimistic add when players are selected from available list
                  const availablePlayerIds = new Set(availablePlayers.filter(p => !optimisticallyAddedPlayerIds.has(p.id)).map(p => p.id));
                  const addedPlayerIds = [...selectedIds].filter(id => availablePlayerIds.has(id));

                  addedPlayerIds.forEach(playerId => {
                    // Immediate optimistic update
                    setOptimisticallyAddedPlayerIds(prev => new Set([...prev, playerId]));
                    handleAddPlayer(playerId);
                  });
                }}
                title="Available Players"
                showQuickActions={false}
                mode="team-management"
                onAddPlayer={(playerId) => {
                  // Immediate optimistic update for manual add
                  setOptimisticallyAddedPlayerIds(prev => new Set([...prev, playerId]));
                  handleAddPlayer(playerId);
                }}
                addingPlayerIds={addingPlayerIds}
                variant="detailed"
              />
            )}
          </ContentSection>
        </PageTemplate>
      </>
    );
  }

  // Regular club players view
  const pageTitle = 'Players';
  const pageSubtitle = club?.name ? `Manage your club's players - ${club.name}` : 'Manage your club\'s players';
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Players' }
  ];

  return (
    <>
      <Helmet>
        <title>Players | Team Manager</title>
      </Helmet>

      <PageTemplate
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            {/* Team Filter Dropdown */}
            <div className="w-64">
              <Select
                value={selectedTeamFilter}
                onValueChange={setSelectedTeamFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {allTeams
                    .filter(team => team.name !== 'BYE')
                    .map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} {team.division && `(${team.division})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
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
                  clubId={clubId}
                  teamId={undefined}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['players', clubId] });
                    toast({ title: 'Success', description: 'Player created successfully' });
                    setIsAddPlayerDialogOpen(false);
                  }}
                  onCancel={() => setIsAddPlayerDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        }
      >
        <ContentSection variant="elevated">
          {isPlayersLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Loading players...</p>
            </div>
          ) : playersError ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error loading players: {playersError.message}</p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No players found for this club</p>
              <p className="text-xs text-gray-500">Club: {club?.name} (ID: {clubId})</p>
              <p className="text-xs text-gray-500">Players array length: {players.length}</p>
              <p className="text-xs text-gray-500">Query enabled: {!!clubId && !teamId ? 'YES' : 'NO'}</p>
            </div>
          ) : (
            <PlayersList
              players={filteredPlayers}
              isLoading={isLoading}
              onEdit={() => {}} // Placeholder function - edit functionality handled by navigation
              onDelete={() => {}} // Placeholder function - delete functionality handled elsewhere
            />
          )}</ContentSection>
      </PageTemplate>
    </>
  );
}