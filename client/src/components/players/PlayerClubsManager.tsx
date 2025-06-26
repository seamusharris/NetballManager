import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";


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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all available clubs for assignment
  const { data: allClubs = [], isLoading: isClubsLoading } = useQuery<Club[]>({
    queryKey: ['clubs', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/clubs');
      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }
      const clubs = await response.json();
      return clubs.map((club: any) => ({
        id: club.id,
        name: club.name,
        code: club.code,
        description: club.description
      }));
    },
    enabled: !!player?.id,
  });

  // Fetch player's current clubs
  const { data: playerClubs = [], isLoading: isPlayerClubsLoading, refetch: refetchPlayerClubs } = useQuery<Club[]>({
    queryKey: [`/api/players/${player?.id}/clubs`],
    queryFn: async () => {
      if (!player?.id) return [];
      const response = await fetch(`/api/players/${player.id}/clubs`);
      if (!response.ok) {
        if (response.status === 404) {
          return []; // Player has no club associations
        }
        throw new Error('Failed to fetch player clubs');
      }
      return response.json();
    },
    enabled: !!player?.id,
  });

  // Update selected clubs when player clubs are loaded or player changes
  useEffect(() => {
    if (player?.id) {
      if (Array.isArray(playerClubs) && playerClubs.length > 0) {
        console.log(`Setting selected clubs for player ${player.id}:`, playerClubs.map(c => c.id));
        setSelectedClubs(playerClubs.map(club => club.id));
      } else {
        console.log(`No clubs found for player ${player.id}, setting empty array`);
        setSelectedClubs([]);
      }
    }
  }, [playerClubs, player?.id]);

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
    if (!player?.id) {
      toast({
        title: "Error",
        description: "No player selected",
        variant: "destructive"
      });
      return;
    }

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
        description: `Player clubs updated successfully. ${result.clubsAdded || 0} clubs added.`
      });

      // Refresh player clubs data
      await refetchPlayerClubs();

      // Invalidate relevant queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      await queryClient.invalidateQueries({ queryKey: [`/api/players/${player.id}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/players/${player.id}/clubs`] });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['player', player.id] });
      queryClient.invalidateQueries({ queryKey: ['players'] });

      // Invalidate all club-specific player queries since club associations changed
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && 
                 (queryKey.includes('/api/players') || 
                  (queryKey.includes('/api/clubs/') && queryKey.includes('/players')) ||
                  queryKey.includes(`/api/players/${player.id}/clubs`));
        }
      });

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
                      {club.name} ({club.code})
                    </Badge>
                  ))
              ) : (
                <span className="text-sm text-gray-500">No clubs assigned</span>
              )}
            </div>

            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Available clubs:</h3>
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


    </>
  );
}