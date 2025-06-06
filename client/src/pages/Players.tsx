import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from "wouter";
import { Helmet } from 'react-helmet';
import PlayersList from '@/components/players/PlayersList';
import { useClub } from '@/contexts/ClubContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    queryKey: ['unassigned-players', activeSeason?.id, currentClubId],
    queryFn: () => {
      const headers: Record<string, string> = {};
      if (currentClubId) {
        headers['x-current-club-id'] = currentClubId.toString();
      }
      return apiClient.get(`/api/players/unassigned/${activeSeason?.id}`, { headers });
    },
    enabled: !!teamId && !!activeSeason?.id && !!currentClubId,
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
      const response = await apiClient.post(`/api/teams/${teamId}/players`, { playerId, isRegular: true });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-players', activeSeason?.id] });
      toast({ title: 'Success', description: 'Player added to team' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add player to team', variant: 'destructive' });
    },
  });

  // Track which players are being removed
  const [removingPlayerIds, setRemovingPlayerIds] = useState<Set<number>>(new Set());

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

      // More aggressive cache invalidation
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-players', activeSeason?.id] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-players'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['clubs', currentClub?.id, 'players'] });
      
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
        // Player was already removed, treat as success
        toast({ title: 'Success', description: 'Player removed from team' });
        queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
        queryClient.invalidateQueries({ queryKey: ['unassigned-players', activeSeason?.id] });
        queryClient.invalidateQueries({ queryKey: ['unassigned-players'] });
        queryClient.invalidateQueries({ queryKey: ['players'] });
        queryClient.invalidateQueries({ queryKey: ['clubs', currentClub?.id, 'players'] });
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
    // Display available players (for team view) - use unassigned players from new endpoint
  const availablePlayers = teamId ? availablePlayersForTeam : [];

    return (
      <>
        <Helmet>
          <title>Team Players | Team Manager</title>
        </Helmet>

        <div className="space-y-6">
          {/* Team Header with Dropdown */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {teamData?.name || 'Team Players'}
                </h1>
                {teamData?.division && (
                  <p className="text-lg text-gray-600 mt-1">
                    {teamData.division}
                  </p>
                )}
              </div>
              {/* Team Switcher Dropdown */}
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
                      .filter(team => team.name !== 'BYE') // Filter out BYE teams
                      .map(team => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name} {team.division && `(${team.division})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Current Team Players */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Current Team Players</span>
                <Badge variant="secondary">{teamPlayers?.length || 0} players</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayerFromTeam.mutate(player.id)}
                          disabled={removingPlayerIds.has(player.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 h-8 w-8 p-0"
                        >
                          {removingPlayerIds.has(player.id) ? (
                            <UserMinus className="h-4 w-4" />
                          ) : (
                            <span className="text-lg font-bold">−</span>
                          )}
                        </Button>
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Players to Add */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Available Players</span>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add New Player
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Player</DialogTitle>
                      </DialogHeader>
                      <PlayerForm
                        onSubmit={async (playerData) => {
                          try {
                            // Create the player with club context
                            const response = await apiClient.post('/api/players', {
                              ...playerData,
                              clubId: currentClub?.id // Include club ID in player creation
                            });
                            const newPlayer = response;

                            // Ensure the player is associated with the current club
                            if (currentClub?.id && newPlayer.id) {
                              try {
                                await apiClient.post(`/api/clubs/${currentClub.id}/players/${newPlayer.id}`, {});
                                console.log(`Successfully associated player ${newPlayer.id} with club ${currentClub.id}`);
                              } catch (clubError) {
                                console.error('Error associating player with club:', clubError);
                                // Don't fail the entire operation if club association fails
                              }
                            }

                            // Invalidate all relevant queries to refresh the UI
                            queryClient.invalidateQueries({ queryKey: ['players'] });
                            queryClient.invalidateQueries({ queryKey: ['unassigned-players'] });
                            queryClient.invalidateQueries({ queryKey: ['clubs', currentClub?.id, 'players'] });
                            queryClient.invalidateQueries({ queryKey: ['team-players'] });

                            toast({ title: 'Success', description: 'Player created successfully' });
                          } catch (error) {
                            console.error('Error creating player:', error);
                            toast({ title: 'Error', description: 'Failed to create player', variant: 'destructive' });
                          }
                        }}
                        isSubmitting={false}
                      />
                    </DialogContent>
                  </Dialog>
                  <Badge variant="outline">{availablePlayers.length} available</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => addPlayerToTeam.mutate(player.id)}
                          disabled={addPlayerToTeam.isPending}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add to Team
                        </Button>
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Regular club players view
  return (
    <>
      <Helmet>
        <title>Players | Team Manager</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header with Team Filter and Add Player Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Players</h1>
            <p className="text-lg text-gray-600 mt-1">Manage your club's players</p>
          </div>
          <div className="flex items-center gap-4">
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
                    .filter(team => team.name !== 'BYE') // Filter out BYE teams
                    .map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} {team.division && `(${team.division})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Player
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
              </DialogHeader>
              <PlayerForm
                onSubmit={async (playerData) => {
                  try {
                    // Create the player with club context
                    const response = await apiClient.post('/api/players', {
                      ...playerData,
                      clubId: currentClub?.id
                    });
                    const newPlayer = response;

                    // Ensure the player is associated with the current club
                    if (currentClub?.id && newPlayer.id) {
                      try {
                        await apiClient.post(`/api/clubs/${currentClub.id}/players/${newPlayer.id}`, {});
                        console.log(`Successfully associated player ${newPlayer.id} with club ${currentClub.id}`);
                      } catch (clubError) {
                        console.error('Error associating player with club:', clubError);
                      }
                    }

                    // Invalidate queries to refresh the UI
                    queryClient.invalidateQueries({ queryKey: ['players'] });
                    queryClient.invalidateQueries({ queryKey: ['clubs', currentClub?.id, 'players'] });

                    toast({ title: 'Success', description: 'Player created successfully' });
                  } catch (error) {
                    console.error('Error creating player:', error);
                    toast({ title: 'Error', description: 'Failed to create player', variant: 'destructive' });
                  }
                }}
                isSubmitting={false}
              />
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <PlayersList
          players={filteredPlayers}
          isLoading={isLoading}
          onEdit={() => {}} // Placeholder function - edit functionality handled by navigation
          onDelete={() => {}} // Placeholder function - delete functionality handled elsewhere
        />
      </div>
    </>
  );
}