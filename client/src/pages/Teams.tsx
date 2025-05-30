
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { TeamForm } from '@/components/teams/TeamForm';
import { TeamsList } from '@/components/teams/TeamsList';
import { Plus } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { Team, Season } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { BackButton } from '@/components/ui/back-button';
import { useClub } from '@/contexts/ClubContext';

export default function Teams() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { currentClubId } = useClub();

  // Fetch teams for current club
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<(Team & { seasonName?: string; seasonYear?: number })[]>({
    queryKey: ['clubs', currentClubId, 'teams'],
    queryFn: () => apiRequest('GET', `/api/clubs/${currentClubId}/teams`),
    enabled: !!currentClubId,
  });

  // Fetch seasons for the form
  const { data: seasons = [] } = useQuery<Season[]>({
    queryKey: ['seasons'],
    queryFn: () => apiRequest('GET', '/api/seasons'),
  });

  const createTeam = useMutation({
    mutationFn: (teamData: any) => apiRequest('POST', '/api/teams', teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs', currentClubId, 'teams'] });
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Team created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create team.',
        variant: 'destructive',
      });
    },
  });

  const updateTeam = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest('PATCH', `/api/teams/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs', currentClubId, 'teams'] });
      setEditingTeam(null);
      toast({
        title: 'Success',
        description: 'Team updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update team.',
        variant: 'destructive',
      });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: (teamId: number) => apiRequest('DELETE', `/api/teams/${teamId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs', currentClubId, 'teams'] });
      toast({
        title: 'Success',
        description: 'Team deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete team.',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = (teamData: any) => {
    createTeam.mutate(teamData);
  };

  const handleUpdate = (teamData: any) => {
    if (!editingTeam) return;
    updateTeam.mutate({ id: editingTeam.id, data: teamData });
  };

  const handleDelete = (teamId: number) => {
    if (confirm('Are you sure you want to delete this team?')) {
      deleteTeam.mutate(teamId);
    }
  };

  const handleManagePlayers = (teamId: number) => {
    setLocation(`/teams/${teamId}/players`);
  };

  return (
    <>
      <div className="container mx-auto p-6">
        <BackButton fallbackPath="/dashboard" className="mb-4">
          Back to Dashboard
        </BackButton>
        
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>
              Manage your club's teams across different seasons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end pb-4">
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </div>
            
            <TeamsList
              teams={teams}
              onEdit={setEditingTeam}
              onDelete={handleDelete}
              onManagePlayers={handleManagePlayers}
              isLoading={isLoadingTeams}
            />
          </CardContent>
        </Card>
      </div>

      <CrudDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        title="Create Team"
        onSubmit={handleCreate}
      >
        <TeamForm
          seasons={seasons}
          clubId={currentClubId}
          onSubmit={handleCreate}
        />
      </CrudDialog>

      <CrudDialog
        isOpen={!!editingTeam}
        setIsOpen={() => setEditingTeam(null)}
        title="Edit Team"
        onSubmit={handleUpdate}
      >
        <TeamForm
          team={editingTeam || undefined}
          seasons={seasons}
          clubId={currentClubId}
          onSubmit={handleUpdate}
        />
      </CrudDialog>
    </>
  );
}
