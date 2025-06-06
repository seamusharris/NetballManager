import React, { useState, useEffect } from 'react';
import { useStandardQuery } from '@/hooks/use-standard-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/ui/crud-dialog';
import TeamForm from '@/components/teams/TeamForm';
import { TeamsList } from '@/components/teams/TeamsList';
import { Plus } from 'lucide-react';
import { Team, Season } from '@shared/schema';
import { useLocation } from 'wouter';
import { BackButton } from '@/components/ui/back-button';
import { useClub } from '@/contexts/ClubContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

export default function Teams() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { currentClubId, currentClub } = useClub();
  const queryClient = useQueryClient();

  // Fetch teams for current club using same pattern as players
  const { data: teams = [], isLoading: isLoadingTeams, error } = useStandardQuery<(Team & { seasonName?: string; seasonYear?: number })[]>({
    endpoint: '/api/teams',
    queryKey: ['teams', currentClubId]
  });

  // Fetch seasons for the form using same pattern
  const { data: seasons = [] } = useStandardQuery<Season[]>({
    endpoint: '/api/seasons'
  });

  const { toast } = useToast();

  // Direct mutations like Seasons - no useCrudMutations to avoid 404 handling issues
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/teams', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({
        title: "Success",
        description: "Team created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.patch(`/api/teams/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({
        title: "Success",
        description: "Team updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team",
        variant: "destructive",
      });
    },
  });

  // Delete mutation handled separately like Seasons to avoid 404 issues
  const deleteMutation = useMutation({
    mutationFn: (teamId: number) => apiClient.delete(`/api/teams/${teamId}`),
    onSuccess: () => {
      // Invalidate and refetch teams query to update the list
      queryClient.invalidateQueries({ queryKey: ['teams', currentClubId] });

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        variant: "destructive",
      });
    },
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => setIsDialogOpen(false)
    });
  };

  const handleUpdate = (data: any) => {
    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, ...data }, {
        onSuccess: () => setEditingTeam(null)
      });
    }
  };

  const handleDelete = (teamId: number) => {
    if (deleteMutation.isPending) return; // Prevent duplicate calls
    if (confirm('Are you sure you want to delete this team?')) {
      deleteMutation.mutate(teamId);
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
              teams={teams.filter(team => team.name !== 'BYE')}
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
          clubId={currentClub?.id}
          onSubmit={handleCreate}
          onCancel={() => setIsDialogOpen(false)}
          isSubmitting={createMutation.isPending}
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
          clubId={currentClub?.id}
          onSubmit={handleUpdate}
          onCancel={() => setEditingTeam(null)}
          isSubmitting={updateMutation.isPending}
        />
      </CrudDialog>
    </>
  );
}