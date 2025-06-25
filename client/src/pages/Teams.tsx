import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { Plus, Activity, Users, Edit, Trash2, MoreVertical, Trophy, Calendar } from 'lucide-react';
import { useClub } from '@/contexts/ClubContext';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import TeamForm from '@/components/teams/TeamForm';
import { TEAM_NAME } from '@/lib/settings';
import { ContentSection, ActionButton } from '@/components/ui/ui-standards';
import PageTemplate from '@/components/layout/PageTemplate';

export default function Teams() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { 
    currentClub, 
    currentClubId, 
    clubTeams, 
    setCurrentTeamId,
    isLoading: clubLoading 
  } = useClub();

  // Redirect to club-scoped URL if accessing /teams without club ID
  useEffect(() => {
    if (location === '/teams' && currentClubId) {
      setLocation(`/clubs/${currentClubId}/teams`);
      return;
    }
  }, [location, currentClubId, setLocation]);

  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<any[]>({
    queryKey: ['teams', currentClubId],
    queryFn: () => apiClient.get('/api/teams'),
    enabled: !!currentClubId,
  });

  const { data: seasons = [] } = useQuery<any[]>({
    queryKey: ['/api/seasons', currentClubId],
    queryFn: () => apiClient.get('/api/seasons'),
    enabled: !!currentClubId,
  });

  const { data: activeSeason } = useQuery<any>({
    queryKey: ['/api/seasons/active', currentClubId],
    queryFn: () => apiClient.get('/api/seasons/active'),
    enabled: !!currentClubId,
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (teamId: number) => apiClient.delete(`/api/teams/${teamId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  if (clubLoading || !currentClubId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

  if (isLoadingTeams) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Teams</h2>
          <p className="text-muted-foreground">Please wait while we load your teams...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTemplate
      title="Teams"
      description={`Manage teams for ${currentClub?.name}`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Teams' }
      ]}
      actions={
        <ActionButton
          onClick={() => setShowForm(true)}
          icon={Plus}
          variant="primary"
        >
          Add Team
        </ActionButton>
      }
      status={activeSeason?.name || 'No Active Season'}
    >
      <ContentSection title="Team Management">
        {/* Team Form */}
        {showForm && (
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editingTeam ? 'Edit Team' : 'Add New Team'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TeamForm
                team={editingTeam}
                onSuccess={() => {
                  setShowForm(false);
                  setEditingTeam(null);
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTeam(null);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Teams Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors duration-300">
                      <span className="text-primary font-bold text-lg">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                        {team.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{team.division}</p>
                    </div>
                  </div>
                  <Badge variant={team.isActive ? "default" : "secondary"} className="transition-all duration-300">
                    {team.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
                      <div className="font-bold text-xl text-blue-700">
                        {team.seasonName ? seasons.find(s => s.name === team.seasonName)?.year || 'N/A' : 'N/A'}
                      </div>
                      <div className="text-xs text-blue-600">Season</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors duration-300">
                      <div className="font-bold text-xl text-green-700">
                        <Calendar className="h-5 w-5 mx-auto" />
                      </div>
                      <div className="text-xs text-green-600">Schedule</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/team/${team.id}/dashboard`)}
                      className="group-hover:border-primary group-hover:text-primary transition-all duration-300"
                    >
                      <Activity className="h-4 w-4 mr-1" />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/teams/${team.id}/players`)}
                      className="group-hover:border-blue-500 group-hover:text-blue-600 transition-all duration-300"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Players
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTeam(team);
                        setShowForm(true);
                      }}
                      className="group-hover:border-yellow-500 group-hover:text-yellow-600 transition-all duration-300"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTeamMutation.mutate(team.id)}
                      disabled={deleteTeamMutation.isPending}
                      className="group-hover:border-red-500 group-hover:text-red-600 transition-all duration-300"
                    >
                      {deleteTeamMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
          <Card className="p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first team to the club.
            </p>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add First Team
            </Button>
          </Card>
        )}
      </ContentSection>
    </PageTemplate>
  );
}