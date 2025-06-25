import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from "wouter";
import { Helmet } from 'react-helmet';
import PlayersList from '@/components/players/PlayersList';
import { useURLClub } from '@/hooks/use-url-club';
import { Badge } from '@/components/ui/badge';
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

export default function Players() {
  const params = useParams<{ clubId?: string; teamId?: string }>();
  const [location, setLocation] = useLocation();

  // ALL HOOKS MUST BE DECLARED AT THE TOP LEVEL
  const {
    clubId,
    club,
    clubTeams,
    userClubs,
    hasPermission,
    isLoading: clubLoading
  } = useURLClub();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Determine if this is team-specific or club-wide players
  const teamId = params.teamId ? parseInt(params.teamId) : null;

  // ALL STATE HOOKS
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [removingPlayerIds, setRemovingPlayerIds] = useState<Set<number>>(new Set());
  const [addingPlayerIds, setAddingPlayerIds] = useState<Set<number>>(new Set());
  const [optimisticallyRemovedPlayerIds, setOptimisticallyRemovedPlayerIds] = useState<Set<number>>(new Set());
  const [optimisticallyAddedPlayerIds, setOptimisticallyAddedPlayerIds] = useState<Set<number>>(new Set());
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());

  // ALL QUERY HOOKS
  const { data: activeSeason } = useQuery({
    queryKey: ['seasons', 'active'],
    queryFn: async () => {
      const response = await apiClient.get('/api/seasons/active');
      return response;
    },
  });

  // Get club players (only when not viewing a specific team)
  const { data: players = [], isLoading: isPlayersLoading, error: playersError } = useQuery({
    queryKey: ['players', clubId],
    queryFn: async () => {
      if (!clubId) return [];
      const response = await apiClient.get(`/api/clubs/${clubId}/players`);
      return response;
    },
    enabled: !!clubId && !teamId,
  });

  // Get team details if viewing a specific team
  const { data: teamData, isLoading: isLoadingTeam, isError: teamError } = useQuery({
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

  // ALL MUTATION HOOKS
  const createPlayer = useMutation({
    mutationFn: async (playerData: any) => {
      if (!clubId) {
        throw new Error('No club selected');
      }
      const response = await apiClient.post('/api/players', playerData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', clubId] });
      queryClient.invalidateQueries({ queryKey: ['team-players'] });
      toast({ title: 'Success', description: 'Player created successfully' });
      setIsAddPlayerDialogOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create player';
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    },
  });

  // ALL MEMO/COMPUTED VALUES
  const allTeams = clubTeams;

  const filteredPlayers = useMemo(() => {
    if (!players || selectedTeamFilter === 'all') return players;
    return players.filter(player => {
      const hasTeamAssignment = player.teamAssignments?.some(
        assignment => assignment.teamId === parseInt(selectedTeamFilter)
      );
      return hasTeamAssignment;
    });
  }, [players, selectedTeamFilter]);

  // ALL EFFECTS
  useEffect(() => {
    if (location === '/players' && userClubs.length > 0) {
      const defaultClub = userClubs.find(c => c.clubId === 54) || userClubs[0];
      setLocation(`/club/${defaultClub.clubId}/players`);
      return;
    }
  }, [location, userClubs, setLocation]);

  // NOW EARLY RETURNS ARE SAFE
  if (clubLoading || !club) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

  // CLUB VIEW RENDERING
  const pageTitle = club?.name ? `${club.name} Players` : 'Players';
  const pageSubtitle = club?.name ? `Manage players for ${club.name}` : 'Manage club players';
  const breadcrumbs = [
    { label: 'Dashboard', href: `/club/${clubId}/dashboard` },
    { label: 'Players' }
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
          </PageActions>
        }
      >
        <ContentSection variant="elevated">
          {/* Team Filter */}
          {allTeams && allTeams.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Filter by team:</label>
                <Select value={selectedTeamFilter} onValueChange={setSelectedTeamFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Players</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
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
            </div>
          )}

          {/* Players List */}
          {isPlayersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : playersError ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error loading players: {playersError.message}</p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No players found for {club?.name || 'this club'}</p>
              <p className="text-xs text-gray-500">Club: {club?.name || 'Loading...'} (ID: {clubId})</p>
              <p className="text-xs text-gray-500">Players array length: {players.length}</p>
              <p className="text-xs text-gray-500">Query enabled: {!!clubId && !teamId ? 'YES' : 'NO'}</p>
            </div>
          ) : (
            <PlayersList
              players={filteredPlayers}
              selectedPlayerIds={selectedPlayers}
              onSelectionChange={setSelectedPlayers}
              showTeamAssignments={true}
              clubTeams={allTeams}
            />
          )}
        </ContentSection>
      </PageTemplate>
    </>
  );
}