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

export const PlayerTeamsManager: React.FC<PlayerTeamsManagerProps> = ({ playerId }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  // Fetch player's current teams
  const { data: playerTeams = [], isLoading: isLoadingPlayerTeams } = useQuery({
    queryKey: ['player-teams', playerId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/players/${playerId}/teams`);
      return response;
    }
  });

  // Fetch all available teams
  const { data: allTeams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', 'all'],
    queryFn: async () => {
      const response = await apiClient.get('/api/teams/all');
      return response;
    }
  });

  // Add player to team mutation
  const addToTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      const response = await apiClient.post(`/api/teams/${teamId}/players`, {
        playerId: playerId,
        isRegular: true
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-teams', playerId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({
        title: "Success",
        description: "Player added to team successfully",
      });
      setSelectedTeamId('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add player to team",
        variant: "destructive",
      });
    },
  });

  // Remove player from team mutation
  const removeFromTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      const response = await apiClient.delete(`/api/teams/${teamId}/players/${playerId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-teams', playerId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({
        title: "Success",
        description: "Player removed from team successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove player from team",
        variant: "destructive",
      });
    },
  });

  const handleAddToTeam = () => {
    if (selectedTeamId && !addToTeamMutation.isPending) {
      addToTeamMutation.mutate(parseInt(selectedTeamId));
    }
  };

  const handleRemoveFromTeam = (teamId: number) => {
    if (!removeFromTeamMutation.isPending) {
      removeFromTeamMutation.mutate(teamId);
    }
  };

  // Get teams not assigned to player
  const availableTeams = allTeams.filter(team => 
    !playerTeams.some(playerTeam => playerTeam.id === team.id)
  );

  if (isLoadingPlayerTeams || isLoadingTeams) {
    return (
      <div className="text-center py-4">Loading teams...</div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <h3 className="text-sm font-medium mb-2 w-full">Currently assigned to:</h3>
        {playerTeams.length > 0 ? (
          playerTeams.map((team) => (
            <Badge key={team.id} variant="secondary" className="flex items-center gap-1">
              {team.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveFromTeam(team.id)}
                disabled={removeFromTeamMutation.isPending}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        ) : (
          <span className="text-sm text-gray-500">No teams assigned</span>
        )}
      </div>

      <div className="border rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Available teams:</h3>
        </div>
        <div className="space-y-2">
          {isLoadingTeams ? (
            <div className="text-sm text-gray-500 text-center py-2">
              Loading teams...
            </div>
          ) : availableTeams.length > 0 ? (
            <div className="flex gap-2">
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-xs text-gray-500">
                          {team.division} • {team.seasonName}
                        </div>
                      </div>
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
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">
              No teams available. All teams are already assigned.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};