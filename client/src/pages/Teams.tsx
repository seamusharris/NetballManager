import React, { useState, useEffect } from 'react';
import { useCrudMutations } from '@/hooks/use-crud-mutations';
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
import { apiRequest } from '@shared/api-request';
import { toast } from '@/components/ui/use-toast';

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

  const { createMutation, updateMutation } = useCrudMutations({
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (teamId: number) => apiRequest('DELETE', `/api/teams/${teamId}`),
    onSuccess: (data: any) => {
      // Invalidate and refetch teams query to update the list
      queryClient.invalidateQueries({ queryKey: ['teams', currentClubId] });

      toast({
        title: "Success",
        description: data?.message || "Team deleted successfully",
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
          clubId={currentClub?.id}
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
          clubId={currentClub?.id}
          onSuccess={() => setEditingTeam(null)}
          onCancel={() => setEditingTeam(null)}
        />
      </CrudDialog>
    </>
  );
}
```