
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import ClubForm from "@/components/clubs/ClubForm";

interface Club {
  id: number;
  name: string;
  code: string;
  description?: string;
}

interface PlayerClubsManagerProps {
  player: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerClubsManager({ 
  player, 
  isOpen, 
  onClose 
}: PlayerClubsManagerProps) {
  const { toast } = useToast();
  const [selectedClubs, setSelectedClubs] = useState<number[]>([]);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch all clubs
  const { data: allClubs = [], isLoading: isClubsLoading } = useQuery<Club[]>({
    queryKey: ['/api/clubs'],
    enabled: !!player?.id,
  });
  
  // Fetch player's current clubs
  const { data: playerClubs = [], isLoading: isPlayerClubsLoading } = useQuery<Club[]>({
    queryKey: [`/api/players/${player.id}/clubs`],
    enabled: !!player?.id,
  });
  
  // Update selected clubs when player clubs are loaded
  useEffect(() => {
    if (playerClubs) {
      console.log(`Setting selected clubs for player ${player.id}:`, playerClubs.map(c => c.id));
      setSelectedClubs(playerClubs.map(club => club.id));
    } else {
      // Reset to empty if no clubs
      setSelectedClubs([]);
    }
  }, [playerClubs, player.id]);

  // Handler for club selection changes
  const handleClubToggle = (clubId: number) => {
    setSelectedClubs(current => {
      console.log(`Toggling club ${clubId}, current clubs:`, current);
      if (current.includes(clubId)) {
        const newClubs = current.filter(id => id !== clubId);
        console.log(`Removing club ${clubId}, new clubs:`, newClubs);
        return newClubs;
      } else {
        const newClubs = [...current, clubId];
        console.log(`Adding club ${clubId}, new clubs:`, newClubs);
        return newClubs;
      }
    });
  };

  // Save the selected clubs
  const handleSaveClubs = async () => {
    setIsSubmitting(true);
    
    try {
      console.log(`Updating clubs for player ${player.id}:`, selectedClubs);
      console.log('Current selected clubs state:', selectedClubs);
      
      const response = await fetch(`/api/players/${player.id}/clubs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubIds: selectedClubs })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to update clubs: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Save response:', result);
      
      // Success! Show a toast and refresh the data
      toast({
        title: "Success",
        description: "Player clubs updated successfully"
      });
      
      // Invalidate relevant queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      await queryClient.invalidateQueries({ queryKey: [`/api/players/${player.id}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/players/${player.id}/clubs`] });
      
      // Close the dialog
      onClose();
    } catch (error: any) {
      console.error("Error updating player clubs:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update player clubs",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle creating a new club
  const handleCreateClub = async (clubData: any) => {
    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create club: ${errorText}`);
      }
      
      // Success! Refresh clubs list and close create dialog
      queryClient.invalidateQueries({ queryKey: ['/api/clubs'] });
      setIsCreateClubOpen(false);
      
      toast({
        title: "Success",
        description: "Club created successfully"
      });
    } catch (error: any) {
      console.error("Error creating club:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Clubs for {player.displayName}</DialogTitle>
            <DialogDescription>
              Select the clubs this player should be associated with.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <h3 className="text-sm font-medium mb-2 w-full">Currently associated with:</h3>
              {selectedClubs.length > 0 ? (
                allClubs
                  .filter(club => selectedClubs.includes(club.id))
                  .map(club => (
                    <Badge key={club.id} variant="secondary">
                      {club.name}
                    </Badge>
                  ))
              ) : (
                <span className="text-sm text-gray-500">No clubs assigned</span>
              )}
            </div>
            
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Available clubs:</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsCreateClubOpen(true)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" /> New Club
                </Button>
              </div>
              <div className="space-y-2">
                {isClubsLoading ? (
                  <div className="text-sm text-gray-500 text-center py-2">
                    Loading clubs...
                  </div>
                ) : allClubs.length > 0 ? (
                  allClubs.map(club => (
                    <div key={club.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`club-${club.id}`}
                        checked={selectedClubs.includes(club.id)}
                        onCheckedChange={() => handleClubToggle(club.id)}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={`club-${club.id}`} className="cursor-pointer flex-1">
                        <div>
                          <div className="font-medium">{club.name}</div>
                          <div className="text-xs text-gray-500">Code: {club.code}</div>
                          {club.description && (
                            <div className="text-xs text-gray-400">{club.description}</div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-2">
                    No clubs available. Create one to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveClubs} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Club Dialog */}
      {isCreateClubOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto">
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
              onClick={() => setIsCreateClubOpen(false)}
            >
              ✕
              <span className="sr-only">Close</span>
            </button>

            <h2 className="text-xl font-semibold mb-2">Create New Club</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter the details for the new club.
            </p>

            <ClubForm 
              onSubmit={handleCreateClub}
              onCancel={() => setIsCreateClubOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
