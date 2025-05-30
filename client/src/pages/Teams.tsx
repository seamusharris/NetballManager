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
    mutationFn: (teamData: any) => {
      console.log('Creating team with data:', teamData);
      return apiRequest('POST', '/api/teams', teamData);
    },
    onSuccess: (data) => {
      console.log('Team created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['clubs', currentClubId, 'teams'] });
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Team created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team.',
        variant: 'destructive',
      });
    },
  });

  const updateTeam = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      console.log('Updating team with data:', { id, data });
      return apiRequest('PATCH', `/api/teams/${id}`, data);
    },
    onSuccess: (data) => {
      console.log('Team updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['clubs', currentClubId, 'teams'] });
      setEditingTeam(null);
      toast({
        title: 'Success',
        description: 'Team updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating team:', error);
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
    console.log('handleCreate called with:', teamData);
    console.log('Current club ID from context:', currentClubId);

    if (!currentClubId) {
      console.error('No current club ID available');
      toast({
        title: 'Error',
        description: 'No club selected. Please select a club first.',
        variant: 'destructive',
      });
      return;
    }

    const teamDataWithClub = {
      ...teamData,
      clubId: currentClubId
    };

    createTeam.mutate(teamDataWithClub);
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
        onClose={() => setIsDialogOpen(false)}
        title="Create Team"
      >
        <TeamForm
          seasons={seasons}
          clubId={currentClubId}
          onSuccess={() => setIsDialogOpen(false)}
          onCancel={() => setIsDialogOpen(false)}
        />
      </CrudDialog>

      <CrudDialog
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        title="Edit Team"
      >
        <TeamForm
          team={editingTeam || undefined}
          seasons={seasons}
          clubId={currentClubId}
          onSuccess={() => setEditingTeam(null)}
          onCancel={() => setEditingTeam(null)}
        />
      </CrudDialog>
    </>
  );
}