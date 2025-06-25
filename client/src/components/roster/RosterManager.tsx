import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Wand2, Copy, Save, Trash2 } from 'lucide-react';
import QuarterRoster from './QuarterRoster';
import ExportButtons from '@/components/common/ExportButtons';
import { Player, Game, Opponent, Roster, Position } from '@shared/schema';
import { formatShortDate, allPositions, positionLabels } from '@/lib/utils';
import { exportRosterToPDF, exportRosterToExcel } from '@/lib/exportUtils';

interface RosterManagerProps {
  players: Player[];
  games: Game[];
  opponents: Opponent[];
  rosters: Roster[];
  selectedGameId: number | null;
  setSelectedGameId: (id: number | null) => void;
  isLoading: boolean;
  onRosterSaved?: () => void; // Optional callback when roster is saved
  onRosterChanged?: (quarter: string, position: string, playerId: number | null) => void; // Callback for local changes
  localRosterState?: Record<string, Record<string, number | null>>; // Local state from parent component
}

export default function RosterManager({ 
  players, 
  games, 
  opponents, 
  rosters, 
  selectedGameId, 
  setSelectedGameId, 
  isLoading,
  onRosterSaved,
  onRosterChanged,
  localRosterState
}: RosterManagerProps) {
  // Get team context from URL or headers if available
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
  
  useEffect(() => {
    // Try to get team ID from URL params or other context
    const urlParams = new URLSearchParams(window.location.search);
    const teamParam = urlParams.get('teamId');
    if (teamParam) {
      setCurrentTeamId(parseInt(teamParam, 10));
    }
  }, []);
  const [activeQuarter, setActiveQuarter] = useState('1');
  const [quarterToCopy, setQuarterToCopy] = useState<string | null>(null);
  
  // Show all games, not just upcoming ones
  const allGames = games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const selectedGame = games.find(game => game.id === selectedGameId);
  const selectedOpponent = opponents.find(opponent => 
    selectedGame?.opponentId === opponent.id
  );
  
  // Organize existing roster assignments by quarter and position
  const [rosterByQuarter, setRosterByQuarter] = useState<Record<string, Record<Position, number | null>>>({
    '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
  });
  
  // Update roster data when rosters prop changes or selectedGameId changes
  useEffect(() => {
    // Check if we should use the parent-provided local state
    if (localRosterState) {
      setRosterByQuarter(localRosterState as Record<string, Record<Position, number | null>>);
      return;
    }
    
    if (selectedGameId) {
      console.log(`Loading roster data for game ${selectedGameId}, found ${rosters.length} roster entries`);
      
      // Create empty roster map
      const newRosterByQuarter = {
        '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
        '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
        '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
        '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
      };
      
      // Fill with roster data from API
      rosters.forEach(roster => {
        if (roster && roster.gameId === selectedGameId && roster.quarter !== undefined) {
          const quarterKey = roster.quarter.toString() as '1' | '2' | '3' | '4';
          if (roster.position && allPositions.includes(roster.position as Position)) {
            newRosterByQuarter[quarterKey][roster.position as Position] = roster.playerId;
          }
        }
      });
      
      // Update state with new roster data
      setRosterByQuarter(newRosterByQuarter);
    }
  }, [rosters, selectedGameId, localRosterState]);
  
  // Calculate roster completion percentage
  const totalPositions = Object.keys(rosterByQuarter).length * allPositions.length;
  const filledPositions = Object.values(rosterByQuarter).reduce((count, positions) => {
    return count + Object.values(positions).filter(playerId => playerId !== null).length;
  }, 0);
  
  const completionPercentage = Math.round((filledPositions / totalPositions) * 100);
  
  // Get count of positions filled by quarter
  const positionsFilledByQuarter = Object.entries(rosterByQuarter).reduce((acc, [quarter, positions]) => {
    acc[quarter] = Object.values(positions).filter(pos => pos !== null).length;
    return acc;
  }, {} as Record<string, number>);
  
  // Create/update roster position assignment
  const saveRosterMutation = useMutation({
    mutationFn: async ({ 
      quarter, 
      position, 
      playerId 
    }: { 
      quarter: number;
      position: Position;
      playerId: number;
    }) => {
      if (!selectedGameId) throw new Error("No game selected");
      
      // Find all existing roster assignments for this position and quarter
      const existingRosters = rosters.filter(r => 
        r.gameId === selectedGameId && 
        r.quarter === quarter && 
        r.position === position
      );
      
      // If there are multiple entries, we need to clean them up
      if (existingRosters.length > 1) {
        console.log(`Found ${existingRosters.length} duplicate roster entries for Q${quarter} ${position}, cleaning up...`);
        
        // Sort by ID descending to keep the newest entry
        existingRosters.sort((a, b) => b.id - a.id);
        
        // Delete the older duplicate entries (keep only the first/newest one)
        for (let i = 1; i < existingRosters.length; i++) {
          await apiRequest('DELETE', `/api/rosters/${existingRosters[i].id}`);
        }
        
        // Update the newest entry
        const res = await apiRequest('PATCH', `/api/rosters/${existingRosters[0].id}`, {
          playerId
        });
        return res.json();
      }
      // Just one existing entry, update it
      else if (existingRosters.length === 1) {
        // Update existing roster assignment
        const res = await apiRequest('PATCH', `/api/rosters/${existingRosters[0].id}`, {
          playerId
        });
        return res.json();
      } 
      // No existing entries, create a new one
      else {
        // Create new roster assignment
        const res = await apiRequest('POST', '/api/rosters', {
          gameId: selectedGameId,
          quarter,
          position,
          playerId
        });
        return res.json();
      }
    },
    onSuccess: (data) => {
      // Invalidate the roster query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
      
      // Call the parent callback to trigger roster summary update if provided
      if (onRosterSaved) {
        onRosterSaved();
      }
      
      // Manually update our local state for immediate UI update
      const newRosterByQuarter = { ...rosterByQuarter };
      const quarterKey = data.quarter.toString();
      
      if (quarterKey in newRosterByQuarter) {
        // TypeScript type assertion to help with quarter keys
        const key = quarterKey as '1' | '2' | '3' | '4';
        
        // Create a new quarter object to trigger state update
        newRosterByQuarter[key] = {
          ...newRosterByQuarter[key],
          [data.position as Position]: data.playerId
        };
        
        // Update the state
        setRosterByQuarter(newRosterByQuarter);
      }
      
      toast({
        title: "Success",
        description: "Roster position updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update roster: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Get player assignments for a specific quarter
  const getQuarterAssignments = (quarter: string) => {
    return rosterByQuarter[quarter] || {};
  };
  
  // Find players that are available for a given position in a quarter
  const getAvailablePlayers = (quarter: string, currentPosition: Position, currentPlayerId: number | null) => {
    const quarterAssignments = getQuarterAssignments(quarter);
    
    // Get all player IDs currently assigned in this quarter (except the current position)
    const assignedPlayerIds = Object.entries(quarterAssignments)
      .filter(([position, _]) => position !== currentPosition)
      .map(([_, playerId]) => playerId)
      .filter(id => id !== null) as number[];
    
    // Return players who are either:
    // 1. Not assigned to any other position in this quarter
    // 2. Currently assigned to this position
    return players.filter(player => 
      !assignedPlayerIds.includes(player.id) || player.id === currentPlayerId
    );
  };
  
  // Create query client instance for cache invalidation
  const queryClientInstance = useQueryClient();
  
  // State for loading indicators
  const [isResetting, setIsResetting] = useState(false);
  const [isSaving, setSaving] = useState(false);
  
  // Handle reset all positions
  const handleResetPositions = async () => {
    if (!selectedGameId) {
      toast({
        title: "Error",
        description: "Please select a game first",
        variant: "destructive",
      });
      return;
    }
    
    // Reset roster assignments for all quarters
    const emptyRoster = {
      '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
    };
    
    // Update loading state
    setIsResetting(true);
    
    // For immediate UI update
    setRosterByQuarter(emptyRoster);
    
    // Clear pending changes
    setPendingChanges([]);
    
    // Mark as having unsaved changes (we'll need to explicitly save the reset)
    setHasUnsavedChanges(true);
    
    // Notify parent component about the changes
    if (onRosterChanged) {
      // Notify for each quarter and position that it's been cleared
      ['1', '2', '3', '4'].forEach(quarter => {
        allPositions.forEach(position => {
          onRosterChanged(quarter, position, null);
        });
      });
    }
    
    setIsResetting(false);
    
    toast({
      title: "Positions Reset Locally",
      description: "All positions have been cleared. Click Save Roster to make these changes permanent.",
    });
  };
  
  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Keep track of local changes that haven't been saved yet
  const [pendingChanges, setPendingChanges] = useState<Array<{
    quarter: number;
    position: Position;
    playerId: number;
  }>>([]);
  
  // Handle player assignment to position (only updates local state)
  const handleAssignPlayer = (quarter: string, position: Position, playerId: number) => {
    if (!selectedGameId) return;
    
    // Update our local state for immediate UI update
    const newRosterByQuarter = { ...rosterByQuarter };
    const quarterKey = quarter as '1' | '2' | '3' | '4';
    
    if (quarterKey in newRosterByQuarter) {
      // Check if this is a "clear position" action (value of 0 indicates clearing)
      const actualPlayerId = playerId === 0 ? null : playerId;
      
      // Create a new quarter object to trigger state update
      newRosterByQuarter[quarterKey] = {
        ...newRosterByQuarter[quarterKey],
        [position]: actualPlayerId
      };
      
      // Update the state
      setRosterByQuarter(newRosterByQuarter);
      
      // Only add to pending changes if it's an actual assignment (not clearing)
      if (actualPlayerId !== null) {
        const quarterNum = parseInt(quarter);
        setPendingChanges(prev => [
          ...prev.filter(change => 
            !(change.quarter === quarterNum && change.position === position)
          ),
          { quarter: quarterNum, position, playerId }
        ]);
      } else {
        // For clearing, just mark that the position is cleared in pending changes
        const quarterNum = parseInt(quarter);
        setPendingChanges(prev => 
          prev.filter(change => !(change.quarter === quarterNum && change.position === position))
        );
      }
      
      // Mark that we have unsaved changes
      setHasUnsavedChanges(true);
      
      // Notify parent component about the change for real-time summary updates
      if (onRosterChanged) {
        console.log(`Calling parent onRosterChanged: Q${quarter}, ${position}, Player ${actualPlayerId}`);
        onRosterChanged(quarter, position, actualPlayerId);
      }
    }
  };
  
  // Auto-fill roster based on player position preferences with equal playing time distribution
  const handleAutoFill = async () => {
    if (!selectedGameId) return;
    
    toast({
      title: "Auto-fill Starting",
      description: "Preparing roster assignments...",
    });
    
    try {
      // Delete all existing roster assignments for this game
      await apiRequest('DELETE', `/api/games/${selectedGameId}/rosters`);
      
      // Sort players by active status (active first)
      const activePlayers = [...players].filter(p => p.active);
      
      if (activePlayers.length === 0) {
        toast({
          title: "Auto-fill Failed",
          description: "No active players available to assign",
          variant: "destructive",
        });
        return;
      }
      
      // Calculate required quarters per player for maximum playing time
      const positionsPerQuarter = allPositions.length; // 7 positions per quarter
      const totalPositions = positionsPerQuarter * 4; // 28 total slots in a game
      const idealQuartersPerPlayer = Math.min(4, Math.floor(totalPositions / activePlayers.length));
      
      console.log(`Ideal quarters per player: ${idealQuartersPerPlayer} with ${activePlayers.length} active players`);
      
      // No player should sit out more than 1 quarter if possible
      const minQuartersPerPlayer = Math.max(3, idealQuartersPerPlayer);
      console.log(`Min quarters per player: ${minQuartersPerPlayer}`);
      
      // Set up tracking for player assignments
      const playerAssignmentCount = {};
      activePlayers.forEach(player => {
        playerAssignmentCount[player.id] = 0;
      });
      
      // Create assignments for all quarters
      const assignments = [];
      const quarters = [1, 2, 3, 4];
      
      // Create a tracking object to track which players are assigned in each quarter
      const playerAssignedInQuarter = {};
      quarters.forEach(quarter => {
        playerAssignedInQuarter[quarter] = {};
      });
      
      // First pass: Assign players to their preferred positions, ensuring equal playing time
      quarters.forEach(quarter => {
        allPositions.forEach(position => {
          // Get players not already assigned in this quarter
          const availablePlayers = activePlayers.filter(player => 
            !playerAssignedInQuarter[quarter][player.id]
          );
          
          if (availablePlayers.length === 0) {
            console.warn(`No available players for quarter ${quarter}, position ${position}!`);
            return; // Skip this position if no players available
          }
          
          // First, prioritize players who:
          // 1. Are under their minimum quarters target
          // 2. Have this position in their preferences
          const playersWithPreference = availablePlayers
            .filter(player => {
              const prefs = player.positionPreferences as Position[];
              return prefs.includes(position);
            })
            .sort((a, b) => {
              // First sort by how many quarters under the minimum they are
              const aAssignments = playerAssignmentCount[a.id] || 0;
              const bAssignments = playerAssignmentCount[b.id] || 0;
              const aUnder = Math.max(0, minQuartersPerPlayer - aAssignments);
              const bUnder = Math.max(0, minQuartersPerPlayer - bAssignments);
              
              if (bUnder !== aUnder) return bUnder - aUnder;
              
              // Then by preference order
              const aPrefs = a.positionPreferences as Position[];
              const bPrefs = b.positionPreferences as Position[];
              const aIndex = aPrefs.indexOf(position);
              const bIndex = bPrefs.indexOf(position);
              
              if (aIndex !== bIndex) return aIndex - bIndex;
              
              // Finally by total assignments
              return aAssignments - bAssignments;
            });
          
          // Sort all available players by quarters under minimum
          const allAvailablePlayersSorted = [...availablePlayers]
            .sort((a, b) => {
              const aAssignments = playerAssignmentCount[a.id] || 0;
              const bAssignments = playerAssignmentCount[b.id] || 0;
              const aUnder = Math.max(0, minQuartersPerPlayer - aAssignments);
              const bUnder = Math.max(0, minQuartersPerPlayer - bAssignments);
              
              // Prioritize players who need more quarters to meet minimum
              if (bUnder !== aUnder) return bUnder - aUnder;
              
              // Then sort by fewest assignments
              return aAssignments - bAssignments;
            });
          
          // Choose first player with preference, or any player if none have preference
          const selectedPlayer = playersWithPreference.length > 0 
            ? playersWithPreference[0] 
            : allAvailablePlayersSorted[0];
          
          // Add to assignments
          assignments.push({
            gameId: selectedGameId,
            quarter: quarter,
            position: position,
            playerId: selectedPlayer.id
          });
          
          // Mark this player as assigned in this quarter
          playerAssignedInQuarter[quarter][selectedPlayer.id] = true;
          
          // Update overall assignment count for this player
          playerAssignmentCount[selectedPlayer.id] = (playerAssignmentCount[selectedPlayer.id] || 0) + 1;
        });
      });
      
      // Log assignment distribution
      console.log("Final player assignment counts:");
      Object.entries(playerAssignmentCount).forEach(([playerId, count]) => {
        const player = activePlayers.find(p => p.id === parseInt(playerId));
        console.log(`${player?.displayName}: ${count} quarters`);
      });
      
      // Create batch of all assignments
      toast({
        title: "Auto-fill In Progress",
        description: "Creating roster assignments...",
      });
      
      // Create all the assignments in batch
      const savePromises = [];
      
      for (const assignment of assignments) {
        const savePromise = apiRequest('POST', '/api/rosters', assignment).then(res => res.json());
        savePromises.push(savePromise);
      }
      
      // Wait for all assignments to be created
      const createdAssignments = await Promise.all(savePromises);
      
      // Update the local state with our new assignments
      const newRosterByQuarter = {
        '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
        '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
        '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
        '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
      };
      
      // Update with the new assignments
      createdAssignments.forEach(roster => {
        const quarterKey = roster.quarter.toString() as '1' | '2' | '3' | '4';
        newRosterByQuarter[quarterKey][roster.position as Position] = roster.playerId;
      });
      
      // Update component state
      setRosterByQuarter(newRosterByQuarter);
      
      // Refresh the roster data after all assignments are complete
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
      
      toast({
        title: "Auto-fill Complete",
        description: `Successfully assigned ${createdAssignments.length} positions across all quarters with balanced playing time`,
      });
    } catch (error) {
      console.error("Error during auto-fill:", error);
      toast({
        title: "Auto-fill Error",
        description: "There was an error assigning players. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Copy roster from one quarter to another
  const handleCopyQuarter = async () => {
    if (!selectedGameId || !quarterToCopy || quarterToCopy === activeQuarter) return;
    
    const sourceQuarterAssignments = getQuarterAssignments(quarterToCopy);
    
    // Create a new object for the updated quarter
    const newQuarterAssignments = { ...rosterByQuarter };
    const targetQuarterKey = activeQuarter as '1' | '2' | '3' | '4';
    
    // First, update the local state immediately for UI responsiveness
    newQuarterAssignments[targetQuarterKey] = {
      ...sourceQuarterAssignments
    };
    
    // Update the state with the copied assignments
    setRosterByQuarter(newQuarterAssignments);
    
    // Now save all the updated assignments to the server
    try {
      // Clear existing roster entries for this quarter
      const toDeletePromises = [];
      for (const roster of rosters) {
        if (roster.gameId === selectedGameId && roster.quarter === parseInt(activeQuarter)) {
          toDeletePromises.push(apiRequest('DELETE', `/api/rosters/${roster.id}`, {}));
        }
      }
      
      // Wait for all deletes to complete
      await Promise.all(toDeletePromises);
      
      // For each position in the source quarter, create new assignments
      const savePromises = [];
      
      Object.entries(sourceQuarterAssignments).forEach(([position, playerId]) => {
        if (playerId !== null) {
          // Create promise for each save operation
          const savePromise = apiRequest('POST', '/api/rosters', {
            gameId: selectedGameId,
            quarter: parseInt(activeQuarter),
            position: position as Position,
            playerId
          });
          
          savePromises.push(savePromise);
        }
      });
      
      // Wait for all save operations to complete
      await Promise.all(savePromises);
      
      // Refresh the roster data
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
      
      // Also invalidate stats data since position changes affect stats calculations
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'stats'] });
      
      // Invalidate player game stats and performance data
      queryClient.invalidateQueries({ queryKey: ['playerGameStats'] });
      queryClient.invalidateQueries({ queryKey: ['playerPerformance'] });
      
      toast({
        title: "Quarter Copied",
        description: `Positions from Quarter ${quarterToCopy} copied to Quarter ${activeQuarter}`,
      });
    } catch (error) {
      console.error("Error copying quarter:", error);
      toast({
        title: "Copy Error",
        description: "There was an error copying the quarter. Please try again.",
        variant: "destructive",
      });
    }
    
    setQuarterToCopy(null);
  };
  
  // Save all roster assignments
  const handleSaveRoster = async () => {
    if (!selectedGameId) return;
    
    // If no unsaved changes, show message and return
    if (!hasUnsavedChanges) {
      toast({
        title: "No Changes",
        description: "No changes to save",
      });
      return;
    }
    
    // Update loading state
    setSaving(true);
    
    toast({
      title: "Saving Roster",
      description: "Saving all roster assignments...",
    });
    
    try {
      // Delete all existing roster entries first
      await apiRequest('DELETE', `/api/games/${selectedGameId}/rosters`, {});
      console.log(`Deleted all existing roster entries for game ${selectedGameId}`);
      
      // Create roster entries in batches
      let successCount = 0;
      const savePromises = [];
      
      // Loop through all quarters and positions
      for (const quarter of ['1', '2', '3', '4']) {
        for (const position of allPositions) {
          const playerId = rosterByQuarter[quarter][position];
          
          // Only create entries for positions with players assigned
          if (playerId !== null) {
            console.log(`Creating roster entry: Game ${selectedGameId}, Q${quarter}, Pos: ${position}, Player: ${playerId}`);
            
            // Create promise but don't await yet
            const savePromise = apiRequest('POST', '/api/rosters', {
              gameId: selectedGameId,
              quarter: parseInt(quarter),
              position: position as Position,
              playerId: playerId
            }).then(() => {
              successCount++;
            }).catch(err => {
              console.error(`Error creating position ${position} in quarter ${quarter}:`, err);
            });
            
            savePromises.push(savePromise);
          }
        }
      }
      
      // Wait for all the save operations to complete
      await Promise.all(savePromises);
      
      // Invalidate and refetch queries to ensure UI is up-to-date
      queryClientInstance.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
      queryClientInstance.refetchQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
      
      // Notify parent component that roster has been saved
      if (onRosterSaved) {
        onRosterSaved();
      }
      
      // Clear the unsaved changes state
      setHasUnsavedChanges(false);
      setPendingChanges([]);
      
      toast({
        title: "Roster Saved",
        description: `Successfully saved ${successCount} roster assignments`,
      });
    } catch (error) {
      console.error("Error saving roster:", error);
      toast({
        title: "Save Error",
        description: "There was an error saving the roster. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-neutral-dark">Roster Management</h2>
        </div>
        <Skeleton className="h-12 w-52" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-neutral-dark">Roster Management</h2>
        <div className="flex space-x-3">
          <Select value={selectedGameId?.toString() || ''} onValueChange={(value) => setSelectedGameId(Number(value))}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Game" />
            </SelectTrigger>
            <SelectContent>
              {allGames.length === 0 ? (
                <SelectItem value="no-games" disabled>No games available</SelectItem>
              ) : (
                [...allGames]
                  .sort((a, b) => (a.round || 0) - (b.round || 0))
                  .map(game => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      Round {game.round} - {opponents.find(o => o.id === game.opponentId)?.teamName} {game.completed ? "(Past)" : ""}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
          
          {/* No buttons here - Save Roster button is next to Auto-Fill */}
        </div>
      </div>
      
      {selectedGameId && selectedGame && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-heading font-semibold text-neutral-dark text-xl">
                  Round {selectedGame.round} vs. {selectedOpponent?.teamName}
                </h3>
                <p className="text-gray-500 text-sm">
                  {formatShortDate(selectedGame.date)} • {selectedGame.time}
                </p>
                
                {/* Export Buttons */}
                {selectedOpponent && (
                  <ExportButtons
                    onExportPDF={() => {
                      exportRosterToPDF(
                        selectedGame,
                        selectedOpponent,
                        rosters.filter(r => r.gameId === selectedGameId),
                        players
                      );
                      toast({
                        title: "Success",
                        description: "Roster has been exported to PDF",
                      });
                    }}
                    onExportExcel={() => {
                      exportRosterToExcel(
                        selectedGame,
                        selectedOpponent,
                        rosters.filter(r => r.gameId === selectedGameId),
                        players
                      );
                      toast({
                        title: "Success",
                        description: "Roster has been exported to Excel",
                      });
                    }}
                    className="mt-2"
                  />
                )}
              </div>
              <div className="flex space-x-3">
                {/* Copy Quarter dropdown */}
                <div className="flex items-center space-x-2">
                  <Select value={quarterToCopy || ''} onValueChange={setQuarterToCopy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Copy Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Quarter 1</SelectItem>
                      <SelectItem value="2">Quarter 2</SelectItem>
                      <SelectItem value="3">Quarter 3</SelectItem>
                      <SelectItem value="4">Quarter 4</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Copy button */}
                  <Button
                    variant="outline"
                    className="border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={handleCopyQuarter}
                    disabled={!quarterToCopy || quarterToCopy === activeQuarter || saveRosterMutation.isPending}
                  >
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                </div>
                
                {/* Reset button */}
                <Button
                  variant="outline"
                  className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  onClick={handleResetPositions}
                  disabled={saveRosterMutation.isPending || isResetting}
                >
                  {isResetting ? (
                    <span className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      Resetting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Trash2 className="w-4 h-4 mr-1" /> Reset All
                    </span>
                  )}
                </Button>
                
                {/* Auto-Fill button */}
                <Button
                  variant="outline"
                  className="border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
                  onClick={handleAutoFill}
                  disabled={saveRosterMutation.isPending}
                >
                  <Wand2 className="w-4 h-4 mr-1" /> Auto-Fill
                </Button>
                
                {/* Save Roster button */}
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary/90 text-white transition-colors"
                  onClick={handleSaveRoster}
                  disabled={saveRosterMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-1" /> Save Roster
                </Button>
              </div>
            </div>
            
            {/* Roster status card */}
            <div className="mb-6 bg-gray-50 rounded-lg p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h4 className="text-xl font-bold mb-3 text-neutral-dark">Roster Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    <div className="bg-white p-3 rounded border border-gray-100">
                      <div className="text-sm text-gray-500">Quarter 1</div>
                      <div className="font-semibold">{positionsFilledByQuarter['1'] || 0}/7 positions</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-100">
                      <div className="text-sm text-gray-500">Quarter 2</div>
                      <div className="font-semibold">{positionsFilledByQuarter['2'] || 0}/7 positions</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-100">
                      <div className="text-sm text-gray-500">Quarter 3</div>
                      <div className="font-semibold">{positionsFilledByQuarter['3'] || 0}/7 positions</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-100">
                      <div className="text-sm text-gray-500">Quarter 4</div>
                      <div className="font-semibold">{positionsFilledByQuarter['4'] || 0}/7 positions</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center mt-4 md:mt-0">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.round(completionPercentage)}%
                  </div>
                  <Progress value={completionPercentage} className="h-2 w-24 mb-2" />
                  <p className="text-xs text-gray-500">{filledPositions}/{totalPositions} positions filled</p>
                </div>
              </div>
            </div>
            
            {/* Quarter tabs */}
            <Tabs value={activeQuarter} onValueChange={setActiveQuarter}>
              <TabsList className="mb-4 w-full grid grid-cols-4">
                <TabsTrigger value="1">Quarter 1</TabsTrigger>
                <TabsTrigger value="2">Quarter 2</TabsTrigger>
                <TabsTrigger value="3">Quarter 3</TabsTrigger>
                <TabsTrigger value="4">Quarter 4</TabsTrigger>
              </TabsList>
              
              {/* Quarter content */}
              {['1', '2', '3', '4'].map(quarter => (
                <TabsContent key={quarter} value={quarter}>
                  <QuarterRoster 
                    quarter={quarter}
                    players={players}
                    positions={allPositions}
                    positionLabels={positionLabels}
                    assignments={getQuarterAssignments(quarter)}
                    availablePlayersForPosition={(position, currentPlayerId) => 
                      getAvailablePlayers(quarter, position, currentPlayerId)
                    }
                    onAssignPlayer={(position, playerId) => 
                      handleAssignPlayer(quarter, position, playerId)
                    }
                    isPending={saveRosterMutation.isPending}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {!selectedGameId && (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <h3 className="text-xl font-semibold mb-4">Select a Game to Manage Roster</h3>
          <p className="text-gray-500 mb-4">
            Please select a game from the dropdown above to start managing your team roster
          </p>
          {allGames.filter(game => !game.completed).length === 0 && (
            <Button className="bg-primary hover:bg-primary-light text-white" onClick={() => window.location.href = '/games'}>
              Schedule a Game
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
