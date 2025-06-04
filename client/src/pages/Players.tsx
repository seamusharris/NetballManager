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
import { SimplePlayerForm } from '@/components/players/SimplePlayerForm';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      const response = await fetch('/api/seasons/active');
      if (!response.ok) throw new Error('Failed to fetch active season');
      return response.json();
    },
  });

  // Get team players if viewing a specific team
  const { data: teamPlayers = [], isLoading: isLoadingTeamPlayers } = useQuery({
    queryKey: ['team-players', teamId],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/players`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!teamId,
  });

  const { data: availablePlayersForTeam = [], isLoading: isLoadingAvailablePlayers } = useQuery({
    queryKey: ['available-players', teamId, activeSeason?.id],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/available-players?seasonId=${activeSeason?.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!teamId && !!activeSeason?.id,
  });

  // Get players for non-team view
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players', currentClub?.id],
    queryFn: async () => {
      if (!currentClub?.id) return [];
      const response = await fetch(`/api/clubs/${currentClub.id}/players`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!currentClub?.id && !teamId,
  });

  // Add player to team mutation
  const addPlayerToTeam = useMutation({
    mutationFn: async (playerId: number) => {
      const response = await fetch(`/api/teams/${teamId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, isRegular: true }),
      });
      if (!response.ok) throw new Error('Failed to add player to team');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
      queryClient.invalidateQueries({ queryKey: ['available-players', teamId, activeSeason?.id] });
      toast({ title: 'Success', description: 'Player added to team' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add player to team', variant: 'destructive' });
    },
  });

  // Remove player from team mutation
  const removePlayerFromTeam = useMutation({
    mutationFn: async (playerId: number) => {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove player from team');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
      queryClient.invalidateQueries({ queryKey: ['available-players', teamId, activeSeason?.id] });
      toast({ title: 'Success', description: 'Player removed from team' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove player from team', variant: 'destructive' });
    },
  });

  const isLoading = teamId 
    ? isLoadingTeamPlayers || isLoadingAvailablePlayers
    : isLoadingPlayers;

  if (teamId) {
    // Team-specific view with management capabilities
    const availablePlayers = availablePlayersForTeam;

    return (
      <>
        <Helmet>
          <title>Team Players | Team Manager</title>
        </Helmet>

        <div className="space-y-6">
          {/* Current Team Players */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Team Players</span>
                <Badge variant="secondary">{teamPlayers.length} players</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamPlayers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No players assigned to this team yet.</p>
              ) : (
                <div className="grid gap-3">
                  {teamPlayers.map((player) => (
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
                        variant="outline"
                        size="sm"
                        onClick={() => removePlayerFromTeam.mutate(player.id)}
                        disabled={removePlayerFromTeam.isPending}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Players to Add */}
          <Card>
            <CardHeader>
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
                      <SimplePlayerForm 
                        clubId={currentClub?.id} 
                        onSuccess={() => {
                          queryClient.invalidateQueries({ queryKey: ['players', currentClub?.id] });
                          queryClient.invalidateQueries({ queryKey: ['available-players', teamId, activeSeason?.id] });
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <Badge variant="outline">{availablePlayers.length} available</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
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

      <PlayersList
        players={players}
        isLoading={isLoading}
        onEdit={() => {}} // Placeholder function - edit functionality handled by navigation
        onDelete={() => {}} // Placeholder function - delete functionality handled elsewhere
      />
    </>
  );
}