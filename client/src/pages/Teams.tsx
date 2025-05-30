import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCrudMutations } from '@/hooks/use-crud-mutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { TeamForm } from '@/components/teams/TeamForm';
import { TeamsList } from '@/components/teams/TeamsList';
import { Plus } from 'lucide-react';
import { Team, Season } from '@shared/schema';
import { useLocation } from 'wouter';
import { BackButton } from '@/components/ui/back-button';
import { useClub } from '@/contexts/ClubContext';
import { apiRequest } from '@/lib/apiClient';

export default function Teams() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { currentClubId } = useClub();

  // Fetch teams for current club
  const { data: teams = [], isLoading: isLoadingTeams, error } = useQuery<(Team & { seasonName?: string; seasonYear?: number })[]>({
    queryKey: ['teams', 'club', currentClubId],
    queryFn: () => {
      console.log(`Teams page: About to call /api/teams for club ${currentClubId}`);
      return apiRequest('GET', `/api/teams`);
    },
    enabled: !!currentClubId,
    staleTime: 0, // Force fresh data
    refetchOnMount: 'always', // Always refetch
  });

  // Debug logging
  console.log('Teams query state:', {
    currentClubId,
    isLoading: isLoadingTeams,
    teamsCount: teams.length,
    error: error?.message,
    enabled: !!currentClubId
  });

  // Fetch seasons for the form
  const { data: seasons = [] } = useQuery<Season[]>({
    queryKey: ['seasons'],
    queryFn: () => apiRequest('GET', '/api/seasons'),
  });

  const { createMutation, updateMutation, deleteMutation } = useCrudMutations({
    entityName: 'Team',
    baseEndpoint: '/api/teams',
    invalidatePatterns: [['teams']],
    onSuccess: (data, variables, context) => {
      if (context === 'create') {
        setIsDialogOpen(false);
      } else if (context === 'update') {
        setEditingTeam(null);
      }
    },
  });

  const handleDelete = (teamId: number) => {
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