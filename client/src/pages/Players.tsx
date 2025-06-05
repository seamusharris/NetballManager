import { useState, useEffect } from 'react';
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

  // Get team players if viewing a specific team
  const { data: teamPlayersData, isLoading: isLoadingTeamPlayers } = useQuery({
    queryKey: ['team-players', teamId, currentClub?.id],
    queryFn: async () => {
      if (!currentClub?.id) return [];
      const response = await apiClient.get(`/api/teams/${teamId}/players`);
      return response;
    },
    enabled: !!teamId && !!currentClub?.id,
  });

  const { data: availablePlayersForTeam = [], isLoading: isLoadingAvailablePlayers } = useQuery({
    queryKey: ['unassigned-players', activeSeason?.id, currentClub?.id],
    queryFn: async () => {
      if (!activeSeason?.id || !currentClub?.id) return [];
      const response = await apiClient.get(`/api/seasons/${activeSeason.id}/unassigned-players`);
      return response;
    },
    enabled: !!activeSeason?.id && !!currentClub?.id,
  });

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

  // Remove player from team using best practice CRUD mutations with enhanced settings
  const { deleteMutation: removePlayerFromTeam } = useCrudMutations({
    entityName: 'Player',
    baseEndpoint: `/api/teams/${teamId}/players`,
    invalidatePatterns: [
      ['team-players', teamId],
      ['unassigned-players', activeSeason?.id],
      ['players', currentClub?.id]
    ],
    mutationOptions: {
      // Enhanced React Query options for better duplicate prevention
      retry: false, // Don't retry failed requests to prevent duplicates
      cacheTime: 0, // Don't cache mutation results
      networkMode: 'online', // Only execute when online
      // Add mutation key for better tracking
      mutationKey: (id: number) => ['remove-player-from-team', teamId, id],
    },
    // Enhanced error handling for 404s
    onDeleteError: (error: any) => {
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        toast({ title: 'Success', description: 'Player was already removed from team' });
        // Still invalidate queries to update UI
        queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
        queryClient.invalidateQueries({ queryKey: ['unassigned-players', activeSeason?.id] });
        queryClient.invalidateQueries({ queryKey: ['players', currentClub?.id] });
      } else {
        toast({ 
          title: 'Error', 
          description: `Failed to remove player: ${error.message}`, 
          variant: 'destructive' 
        });
      }
    }
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
                      actions={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePlayerFromTeam.mutate(player.id)}
                          disabled={removePlayerFromTeam.isPending}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          {removePlayerFromTeam.isPending ? 'Removing...' : 'Remove'}
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
                    <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm ${player.avatarColor || 'bg-gray-500'}`}>
                          {player.firstName?.[0]}{player.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium">{player.displayName}</div>
                          <div className="text-sm text-gray-500">
                            {Array.isArray(player.positionPreferences) && player.positionPreferences.length > 0 
                              ? player.positionPreferences.join(', ') 
                              : 'No position preferences'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => addPlayerToTeam.mutate(player.id)}
                        disabled={addPlayerToTeam.isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add to Team
                      </Button>
                    </div>
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
        {/* Add Player Button for main players view */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Players</h1>
            <p className="text-lg text-gray-600 mt-1">Manage your club's players</p>
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

        <PlayersList
          players={players}
          isLoading={isLoading}
          onEdit={() => {}} // Placeholder function - edit functionality handled by navigation
          onDelete={() => {}} // Placeholder function - delete functionality handled elsewhere
        />
      </div>
    </>
  );
}