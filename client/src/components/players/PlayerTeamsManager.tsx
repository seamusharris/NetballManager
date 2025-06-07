
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Users } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface PlayerTeamsManagerProps {
  playerId: number;
}

interface Team {
  id: number;
  name: string;
  division: string;
  clubId: number;
  seasonId: number;
  seasonName: string;
  clubName: string;
}

interface TeamAssignment {
  teamId: number;
  playerId: number;
  isRegular: boolean;
  joinedDate: string;
}

export function PlayerTeamsManager({ playerId }: PlayerTeamsManagerProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get player's current team assignments
  const { data: playerTeams = [], isLoading: isLoadingPlayerTeams } = useQuery({
    queryKey: ['player-teams', playerId],
    queryFn: async () => {
      const response = await apiClient.get(`/players/${playerId}/teams`);
      return response.data;
    }
  });

  // Get all available teams
  const { data: allTeams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', 'all'],
    queryFn: async () => {
      const response = await apiClient.get('/teams/all');
      return response.data;
    }
  });

  // Add player to team mutation
  const addToTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      const response = await apiClient.post(`/teams/${teamId}/players/${playerId}`, {
        isRegular: true
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-teams', playerId] });
      queryClient.invalidateQueries({ queryKey: ['team-players'] });
      toast({
        title: "Success",
        description: "Player added to team successfully"
      });
      setSelectedTeamId('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add player to team",
        variant: "destructive"
      });
    }
  });

  // Remove player from team mutation
  const removeFromTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      const response = await apiClient.delete(`/teams/${teamId}/players/${playerId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-teams', playerId] });
      queryClient.invalidateQueries({ queryKey: ['team-players'] });
      toast({
        title: "Success",
        description: "Player removed from team successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove player from team",
        variant: "destructive"
      });
    }
  });

  const handleAddToTeam = () => {
    if (selectedTeamId) {
      addToTeamMutation.mutate(parseInt(selectedTeamId));
    }
  };

  const handleRemoveFromTeam = (teamId: number) => {
    removeFromTeamMutation.mutate(teamId);
  };

  // Filter available teams (exclude teams player is already on)
  const assignedTeamIds = playerTeams.map((team: Team) => team.id);
  const availableTeams = allTeams.filter((team: Team) => !assignedTeamIds.includes(team.id));

  if (isLoadingPlayerTeams || isLoadingTeams) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            Loading team assignments...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current team assignments */}
        <div>
          <h4 className="font-medium mb-2">Current Teams</h4>
          {playerTeams.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team assignments</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {playerTeams.map((team: Team) => (
                <Badge key={team.id} variant="secondary" className="flex items-center gap-1">
                  {team.name} ({team.division})
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveFromTeam(team.id)}
                    disabled={removeFromTeamMutation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Add to team */}
        {availableTeams.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Add to Team</h4>
            <div className="flex gap-2">
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a team..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((team: Team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.clubName} - {team.name} ({team.division}) - {team.seasonName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddToTeam}
                disabled={!selectedTeamId || addToTeamMutation.isPending}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
