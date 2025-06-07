
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
  const { toast } = useToast();
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  
  // Fetch player's current teams
  const { data: playerTeams = [], isLoading: isTeamsLoading } = useQuery<Team[]>({
    queryKey: [`/api/players/${player.id}/teams`],
    enabled: !!player?.id, // Always fetch when player ID is available
  });
  
  // Fetch all available teams
  const { data: allTeams = [], isLoading: isLoadingAllTeams } = useQuery<Team[]>({
    queryKey: ['/api/teams/all'],
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const response = await fetch(`/api/teams/${teamId}/players`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        const response = await fetch(`/api/teams/${teamId}/players/${player.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: [`/api/players/${player.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/players/${player.id}/teams`] });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      
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
          <div className="flex flex-wrap gap-2 mb-4">
            <h3 className="text-sm font-medium mb-2 w-full">Currently assigned to:</h3>
            {selectedTeams.length > 0 ? (
              allTeams
                .filter(team => selectedTeams.includes(team.id))
                .map(team => (
                  <Badge key={team.id} variant="secondary">
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
          
          <div className="border rounded-md p-3">
            <h3 className="text-sm font-medium mb-2">Available teams:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {isLoadingAllTeams ? (
                <div className="text-sm text-gray-500 text-center py-2">
                  Loading teams...
                </div>
              ) : allTeams.length > 0 ? (
                allTeams.map(team => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`team-${team.id}`}
                      checked={selectedTeams.includes(team.id)}
                      onCheckedChange={() => handleTeamToggle(team.id)}
                    />
                    <Label htmlFor={`team-${team.id}`} className="cursor-pointer flex-1">
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-xs text-gray-500">
                          {team.division} • {team.seasonName} • {team.clubName}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">
                  No teams available
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
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
