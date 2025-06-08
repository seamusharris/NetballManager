import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from "wouter";
import { Helmet } from 'react-helmet';
import PlayersList from '@/components/players/PlayersList';
import { useClub } from '@/contexts/ClubContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlayerForm from '@/components/players/PlayerForm';
import { User, UserMinus, UserPlus, Loader2, Calendar, Users } from 'lucide-react';
import { PlayerBox } from '@/components/ui/player-box';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiClient } from '@/lib/apiClient';
import { useCrudMutations } from '@/hooks/use-crud-mutations';

// Import new UI standards
import { PageTemplate } from '@/components/layout/PageTemplate';
import { ContentSection } from '@/components/layout/ContentSection';
import { ActionButton } from '@/components/ui/ActionButton';
import { PageActions } from '@/components/layout/PageActions';

export default function Players() {
  const { currentClub, hasPermission, isLoading: clubLoading, switchToClub } = useClub();

  // Don't render anything until club context is fully loaded
  if (clubLoading || !currentClub) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }
  const params = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Handle club ID from URL parameter
  useEffect(() => {
    const clubIdFromUrl = params.clubId;
    if (clubIdFromUrl && !isNaN(Number(clubIdFromUrl))) {
      const targetClubId = Number(clubIdFromUrl);
      if (currentClub?.id !== targetClubId) {
        switchToClub(targetClubId);
      }
    }
  }, [params.clubId, currentClub?.id, switchToClub]);

  // Determine if this is team-specific or club-wide players
  const teamId = params.teamId ? parseInt(params.teamId) : null;
  const currentClubId = currentClub?.id;

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
    queryKey: ['teams', currentClub?.id],
    queryFn: async () => {
      if (!currentClub?.id) return [];
      const response = await apiClient.get(`/api/teams`);
      return response;
    },
    enabled: !!currentClub?.id,
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
    queryKey: ['team-players', teamId, currentClubId],
    queryFn: () => {
      const headers: Record<string, string> = {};
      if (currentClubId) {
        headers['x-current-club-id'] = currentClubId.toString();
      }
      return apiClient.get(`/api/teams/${teamId}/players`, { headers });
    },
    enabled: !!teamId && !!currentClubId,
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

  // Get players for non-team view
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players', currentClub?.id],
    queryFn: async () => {
      if (!currentClub?.id) return [];
      const response = await apiClient.get(`/api/clubs/${currentClub.id}/players`);
      return response;
    },
    enabled: !!currentClub?.id && !teamId,
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

  // Add player to team mutation
  const addPlayerToTeam = useMutation({
    mutationFn: async (playerId: number) => {
      // Add player to adding set
      setAddingPlayerIds(prev => new Set([...prev, playerId]));

      const response = await apiClient.post(`/api/teams/${teamId}/players`, {
        playerId,
        isRegular: true
      });
      return { playerId, response };
    },
    onSuccess: (data) => {
      // Remove player from adding set
      setAddingPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.playerId);
        return newSet;
      });

      // Invalidate relevant queries with consistent keys
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-players', activeSeason?.id] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-players'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['clubs', currentClub?.id, 'players'] });

      // Force refetch to ensure immediate UI update
      queryClient.refetchQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });

      toast({ title: 'Success', description: 'Player added to team' });
    },
    onError: (error, playerId) => {
      // Remove player from adding set on error
      setAddingPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });

      console.error('Error adding player to team:', error);
      toast({ title: 'Error', description: 'Failed to add player to team', variant: 'destructive' });
    },
  });

  // Standardized player creation mutation that handles both club and team contexts
  const createPlayer = useMutation({
    mutationFn: async (playerData: any) => {
      if (!currentClub?.id) {
        throw new Error('No club selected');
      }

      // Prepare headers with club context and optional team context
      const headers: Record<string, string> = {
        'x-current-club-id': currentClub.id.toString()
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
      queryClient.invalidateQueries({ queryKey: ['clubs', currentClub?.id, 'players'] });
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
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);

  // Remove player from team using simple mutation (matches add pattern)
  const removePlayerFromTeam = useMutation({
    mutationFn: async (playerId: number) => {
      // Add player to removing set
      setRemovingPlayerIds(prev => new Set([...prev, playerId]));

      const response = await apiClient.delete(`/api/teams/${teamId}/players/${playerId}`);
      return { playerId, response };
    },
    onSuccess: (data) => {
      // Remove player from removing set
      setRemovingPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.playerId);
        return newSet;
      });

      // Comprehensive cache invalidation to refresh both team players and available players
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-players', activeSeason?.id] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-players'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['clubs', currentClub?.id, 'players'] });

      // Force refetch of available players to ensure UI updates immediately
      queryClient.refetchQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });

      toast({ title: 'Success', description: 'Player removed from team' });
    },
    onError: (error, playerId) => {
      // Remove player from removing set on error
      setRemovingPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });

      // Handle 404 errors gracefully (React Strict Mode double execution)
      const errorMessage = error.message?.toLowerCase() || '';
      const is404Error = errorMessage.includes("not found") || 
                         errorMessage.includes("404") || 
                         (error as any).status === 404 ||
                         (error as any).response?.status === 404;

      if (is404Error) {
        // Player was already removed, treat as success and refresh all relevant data
        toast({ title: 'Success', description: 'Player removed from team' });

        // Comprehensive cache invalidation to ensure available players list updates
        queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
        queryClient.invalidateQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });
        queryClient.invalidateQueries({ queryKey: ['unassigned-players', activeSeason?.id] });
        queryClient.invalidateQueries({ queryKey: ['unassigned-players'] });
        queryClient.invalidateQueries({ queryKey: ['players'] });
        queryClient.invalidateQueries({ queryKey: ['clubs', currentClub?.id, 'players'] });

        // Force refetch of available players
        queryClient.refetchQueries({ queryKey: ['team-available-players', teamId, activeSeason?.id] });
      } else {
        toast({ title: 'Error', description: 'Failed to remove player from team', variant: 'destructive' });
      }
    },
  });

  const isLoading = teamId 
    ? isLoadingTeamPlayers || isLoadingAvailablePlayers || isLoadingTeam
    : isLoadingPlayers;

  // Rename the teamPlayersData to teamPlayers
  const teamPlayers = teamPlayersData;

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
            <PageActions>
              <div className="w-64">
                <Select
                  value={teamId?.toString() || ""}
                  onValueChange={(value) => {
                    const newTeamId = parseInt(value);
                    navigate(`/teams/${newTeamId}/players`);
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
            </PageActions>
          }
        >
          {/* Current Team Players */}
          <ContentSection 
            title="Current Team Players"
            actions={<Badge variant="secondary">{teamPlayers?.length || 0} players</Badge>}
            variant="elevated"
          >
            {!teamPlayers || teamPlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No players assigned to this team yet.</p>
            ) : (
              <div className="grid gap-3">
                {teamPlayers.map((player) => (
                  <PlayerBox
                    key={player.id}
                    player={player}
                    stats={[
                      { label: 'Games', value: Math.floor(Math.random() * 15) + 5 },
                      { label: 'Goals', value: Math.floor(Math.random() * 25) + 2 },
                      { label: 'Rating', value: (Math.random() * 4 + 6).toFixed(1) }
                    ]}
                    actions={
                      <ActionButton
                        action="delete"
                        size="sm"
                        onClick={() => removePlayerFromTeam.mutate(player.id)}
                        disabled={removingPlayerIds.has(player.id)}
                      >
                        {removingPlayerIds.has(player.id) ? 'Removing...' : 'Remove'}
                      </ActionButton>
                    }
                  />
                ))}
              </div>
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
                      clubId={currentClubId}
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
                <Badge variant="outline">{availablePlayers.length} available</Badge>
              </PageActions>
            }
            variant="elevated"
          >
            {availablePlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No unassigned players available. All active players are already assigned to teams this season.
                <br />
                <span className="text-sm">Use "Add New Player" to create a new player for this team.</span>
              </p>
            ) : (
              <div className="grid gap-3">
                {availablePlayers.map((player) => (
                  <PlayerBox
                    key={player.id}
                    player={player}
                    actions={
                      <ActionButton
                        action="create"
                        size="sm"
                        onClick={() => addPlayerToTeam.mutate(player.id)}
                        disabled={addingPlayerIds.has(player.id)}
                        icon={UserPlus}
                      >
                        {addingPlayerIds.has(player.id) ? 'Adding...' : 'Add to Team'}
                      </ActionButton>
                    }
                  />
                ))}
              </div>
            )}
          </ContentSection>
        </PageTemplate>
      </>
    );
  }

  // Regular club players view
  const pageTitle = 'Players';
  const pageSubtitle = `Manage your club's players - ${currentClub?.name}`;
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
          <PageActions>
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
                  clubId={currentClubId}
                  teamId={undefined}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['players'] });
                    queryClient.invalidateQueries({ queryKey: ['clubs', currentClub?.id, 'players'] });
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
        <ContentSection variant="elevated">
          <PlayersList
            players={filteredPlayers}
            isLoading={isLoading}
            onEdit={() => {}} // Placeholder function - edit functionality handled by navigation
            onDelete={() => {}} // Placeholder function - delete functionality handled elsewhere
          />
        </ContentSection>
      </PageTemplate>
    </>
  );
}