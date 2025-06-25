
import React from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/apiClient';
import PlayerBox from '@/components/ui/player-box';
import PageTemplate from '@/components/layout/PageTemplate';
import { useClub } from '@/contexts/ClubContext';

interface TeamPlayer {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
  positionPreferences: string[];
  active: boolean;
  avatarColor: string;
  isRegular: boolean;
}

interface Team {
  id: number;
  name: string;
  division: string;
  seasonName: string;
}

export default function TeamPlayers() {
  const params = useParams();
  const { currentClub } = useClub();
  const teamId = params.teamId ? parseInt(params.teamId as string) : null;

  // Get team details
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) throw new Error('Team ID is required');
      return await apiRequest('GET', `/api/teams/${teamId}`) as Team;
    },
    enabled: !!teamId,
  });

  // Get team players
  const { data: players = [], isLoading: playersLoading, error } = useQuery({
    queryKey: ['team-players', teamId],
    queryFn: async () => {
      if (!teamId) throw new Error('Team ID is required');
      return await apiRequest('GET', `/api/teams/${teamId}/players`) as TeamPlayer[];
    },
    enabled: !!teamId,
  });

  const isLoading = teamLoading || playersLoading;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Teams', href: '/teams' },
    { label: team?.name || 'Team', href: `/teams/${teamId}` },
    { label: 'Players' }
  ];

  const actions = (
    <Button
      variant="outline"
      onClick={() => window.history.back()}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Team
    </Button>
  );

  if (isLoading) {
    return (
      <PageTemplate
        title="Team Players"
        subtitle="Loading team players..."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate
        title="Team Players"
        subtitle="Error loading team players"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Failed to load team players. Please try again.</p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`${team?.name || 'Team'} Players`}
      subtitle={`Manage players for ${team?.name || 'this team'} in ${team?.seasonName || 'the current season'}`}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Team Roster</CardTitle>
              <Badge variant="secondary">
                {players.length} Player{players.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {team && (
              <div className="text-sm text-gray-600">
                {team.division} • {team.seasonName}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Players Assigned</h3>
              <p className="text-gray-600 mb-4">
                This team doesn't have any players assigned yet.
              </p>
              <Button onClick={() => window.location.href = `/teams/${teamId}`}>
                Manage Team
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {players.map((player) => (
                <div key={player.id} className="relative">
                  <PlayerBox
                    player={player}
                    size="md"
                    showPositions={true}
                    className="hover:shadow-lg transition-shadow"
                  />
                  {player.isRegular && (
                    <Badge 
                      variant="default" 
                      className="absolute top-2 right-2 text-xs"
                    >
                      Regular
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
