import React, { useState, useEffect } from 'react';
import { useStandardQuery } from '@/hooks/use-standard-query';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/ui/crud-dialog';
import TeamForm from '@/components/teams/TeamForm';
import { TeamsList } from '@/components/teams/TeamsList';
import { Plus } from 'lucide-react';
import { Team, Season } from '@shared/schema';
import { useLocation } from 'wouter';
import { useClub } from '@/contexts/ClubContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

// Import new UI standards
import { PageTemplate, ContentSection, ActionButton } from '@/components/ui/ui-standards';

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

  // Generate page context
  const pageTitle = 'Teams';
  const pageSubtitle = `Manage your club's teams across different seasons - ${currentClub?.name}`;
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Teams' }
  ];

  return (
    <>
      <PageTemplate
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumbs={breadcrumbs}
        actions={
          <ActionButton action="create" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </ActionButton>
        }
      >
        <ContentSection 
          title="Active Teams"
          description="Manage your club's teams and their players"
        >
          <TeamsList
            teams={teams.filter(team => team.name !== 'BYE')}
            onEdit={setEditingTeam}
            onDelete={handleDelete}
            onManagePlayers={handleManagePlayers}
            isLoading={isLoadingTeams}
          />
        </ContentSection>
      </PageTemplate>

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