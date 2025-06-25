import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Season } from "@shared/schema";

interface PlayerSeasonsManagerProps {
  player: any;
  seasons: any[];
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerSeasonsManager({ 
  player, 
  seasons, 
  isOpen, 
  onClose 
}: PlayerSeasonsManagerProps) {
  
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>([]);
  
  // Fetch player's current seasons
    enabled: !!player?.id, // Always fetch when player ID is available
  });
  
  // Update selected seasons when player seasons are loaded
  useEffect(() => {
    if (playerSeasons && playerSeasons.length > 0) {
      console.log(`Setting selected seasons for player ${player.id}:`, playerSeasons.map(s => s.id));
      setSelectedSeasons(playerSeasons.map(season => season.id));
    }
  }, [playerSeasons]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler for season selection changes
  const handleSeasonToggle = (seasonId: number) => {
    setSelectedSeasons(current => {
      if (current.includes(seasonId)) {
        return current.filter(id => id !== seasonId);
      } else {
        return [...current, seasonId];
      }
    });
  };

  // Save the selected seasons
  const handleSaveSeasons = async () => {
    setIsSubmitting(true);
    
    try {
      console.log(`Updating seasons for player ${player.id}:`, selectedSeasons);
      
        method: 'POST',
        body: JSON.stringify({ seasonIds: selectedSeasons })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update seasons: ${errorText}`);
      }
      
      // Success! Show a toast and refresh the data
      toast({
        title: "Success",
        description: "Player seasons updated successfully"
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: [`/api/players/${player.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/players/${player.id}/seasons`] });
      
      // Close the dialog
      onClose();
    } catch (error: any) {
      console.error("Error updating player seasons:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update player seasons",
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
          <DialogTitle>Manage Seasons for {player.displayName}</DialogTitle>
          <DialogDescription>
            Select the seasons this player should be assigned to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <h3 className="text-sm font-medium mb-2 w-full">Currently assigned to:</h3>
            {selectedSeasons.length > 0 ? (
              seasons
                .filter(season => selectedSeasons.includes(season.id))
                .map(season => (
                  <Badge key={season.id} variant="secondary">
                    {season.name}
                  </Badge>
                ))
            ) : (
              <span className="text-sm text-gray-500">No seasons assigned</span>
            )}
          </div>
          
          <div className="border rounded-md p-3">
            <h3 className="text-sm font-medium mb-2">Available seasons:</h3>
            <div className="space-y-2">
              {seasons.map(season => (
                <div key={season.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`season-${season.id}`}
                    checked={selectedSeasons.includes(season.id)}
                    onCheckedChange={() => handleSeasonToggle(season.id)}
                  />
                  <Label htmlFor={`season-${season.id}`} className="cursor-pointer">
                    {season.name}
                    {season.isActive && (
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSaveSeasons} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}