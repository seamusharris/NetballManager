import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, Trophy, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/apiClient';
import { TEAM_NAME } from '@/lib/settings';
import { ContentSection, ActionButton } from '@/components/ui/ui-standards';
import PageTemplate from '@/components/layout/PageTemplate';

export default function Teams() {
  const params = useParams<{ clubId?: string }>();
  const [location, setLocation] = useLocation();
  const clubId = params.clubId ? Number(params.clubId) : null;

  const { data: club, isLoading: clubLoading } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}`),
    enabled: !!clubId,
  });

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['clubs', clubId, 'teams'],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}/teams`),
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (location === '/teams' && clubId) {
      setLocation(`/clubs/${clubId}/teams`);
      return;
    }
  }, [location, clubId, setLocation]);

  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const queryClient = useQueryClient();

  if (!clubId) {
    return (
      <PageTemplate title="Teams" subtitle="Select a club to view teams">
        <div>Please select a club to view teams.</div>
      </PageTemplate>
    );
  }

  if (clubLoading || isLoading) {
    return (
      <PageTemplate title="Teams" subtitle="Loading...">
        <div>Loading teams...</div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={`${club?.name || 'Club'} Teams`}
      subtitle={`Manage teams for ${club?.name || 'this club'}`}
      breadcrumbs={[
        { label: 'Dashboard', href: `/club/${clubId}` },
        { label: 'Teams' }
      ]}
      actions={
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team: any) => (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant={team.isActive ? 'default' : 'secondary'}>
                  {team.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Division: {team.division || 'Not set'}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Players
                  </span>
                  <span>{team.playersCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Games
                  </span>
                  <span>{team.gamesCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    Wins
                  </span>
                  <span>{team.wins || 0}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLocation(`/team/${team.id}`)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLocation(`/team/${team.id}/roster`)}
                >
                  Roster
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {teams.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No teams yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first team for this club.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Team
          </Button>
        </div>
      )}
    </PageTemplate>
  );
}