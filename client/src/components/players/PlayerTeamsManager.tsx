
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface PlayerTeamsManagerProps {
  player: any;
  isOpen: boolean;
  onClose: () => void;
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

export default function PlayerTeamsManager({ 
  player, 
  isOpen, 
  onClose 
}: PlayerTeamsManagerProps) {
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch player's current teams
      if (!response.ok) {
        throw new Error('Failed to fetch player teams');
      }
      return response.json();
    },
    enabled: !!player?.id,
  });
  
  // Fetch all available teams
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      return response.json();
    },
    enabled: !!player?.id,
  });
  
  // Update selected teams when player teams are loaded
  useEffect(() => {
    if (playerTeams && playerTeams.length > 0) {
      console.log(`Setting selected teams for player ${player.id}:`, playerTeams.map(t => t.id));
      setSelectedTeams(playerTeams.map(team => team.id));
    } else {
      setSelectedTeams([]);
    }
  }, [playerTeams, player.id]);

  // Handler for team selection changes
  const handleTeamToggle = (teamId: number) => {
    setSelectedTeams(current => {
      if (current.includes(teamId)) {
        return current.filter(id => id !== teamId);
      } else {
        return [...current, teamId];
      }
    });
  };

  // Save the selected teams
  const handleSaveTeams = async () => {
    setIsSubmitting(true);
    
    try {
      console.log(`Updating teams for player ${player.id}:`, selectedTeams);
      
      // Get current team IDs
      const currentTeamIds = playerTeams.map(team => team.id);
      
      // Find teams to add and remove
      const teamsToAdd = selectedTeams.filter(teamId => !currentTeamIds.includes(teamId));
      const teamsToRemove = currentTeamIds.filter(teamId => !selectedTeams.includes(teamId));
      
      // Add player to new teams
      for (const teamId of teamsToAdd) {
          method: 'POST',
          body: JSON.stringify({ 
            playerId: player.id,
            isRegular: true 
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to add player to team ${teamId}: ${errorText}`);
        }
      }
      
      // Remove player from teams
      for (const teamId of teamsToRemove) {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to remove player from team ${teamId}: ${errorText}`);
        }
      }
      
      // Success! Show a toast and refresh the data
      toast({
        title: "Success",
        description: "Player teams updated successfully"
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['players', player.id] });
      queryClient.invalidateQueries({ queryKey: ['players', player.id, 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', 'all'] });
      
      // Close the dialog
      onClose();
    } catch (error: any) {
      console.error("Error updating player teams:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update player teams",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Teams for {player.displayName}</DialogTitle>
          <DialogDescription>
            Select the teams this player should be assigned to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Current teams display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Currently assigned to:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTeams.length > 0 ? (
                allTeams
                  .filter(team => selectedTeams.includes(team.id))
                  .map(team => (
                    <Badge key={team.id} variant="secondary" className="bg-blue-100 text-blue-800">
                      {team.name}
                      {team.division && (
                        <span className="ml-1 text-xs">({team.division})</span>
                      )}
                    </Badge>
                  ))
              ) : (
                <span className="text-sm text-gray-500">No teams assigned</span>
              )}
            </div>
          </div>
          
          {/* Team selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Available teams:</h3>
            {console.log('PlayerTeamsManager - allTeams:', allTeams, 'isLoading:', isLoadingAllTeams)}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {isLoadingAllTeams ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  Loading teams...
                </div>
              ) : allTeams.length > 0 ? (
                allTeams.map(team => (
                  <div key={team.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-100">
                    <Checkbox 
                      id={`team-${team.id}`}
                      checked={selectedTeams.includes(team.id)}
                      onCheckedChange={() => handleTeamToggle(team.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={`team-${team.id}`} className="cursor-pointer">
                        <div className="font-medium text-sm">{team.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {team.division} • {team.seasonName} • {team.clubName}
                        </div>
                      </Label>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No teams available
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSaveTeams} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
