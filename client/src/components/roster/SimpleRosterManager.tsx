import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2, Copy, Save, Trash2 } from 'lucide-react';
import { Player, Game, Opponent, Position } from '@shared/schema';
import { formatShortDate, positionLabels, allPositions } from '@/lib/utils';
import ExportButtons from '@/components/common/ExportButtons';
import { exportRosterToPDF, exportRosterToExcel } from '@/lib/exportUtils';
import { Roster as RosterType } from '@shared/schema';

interface SimpleRosterManagerProps {
  players: Player[];
  games: Game[];
  opponents: Opponent[];
  selectedGameId: number | null;
  setSelectedGameId: (id: number | null) => void;
  isLoading: boolean;
  onRosterSaved?: () => void;
  onRosterChanged?: (quarter: string, position: string, playerId: number | null) => void;
  localRosterState?: Record<string, Record<string, number | null>>;
}

export default function SimpleRosterManager({
  players,
  games,
  opponents,
  selectedGameId,
  setSelectedGameId,
  isLoading,
  onRosterSaved,
  onRosterChanged,
  localRosterState: initialRosterState
}: SimpleRosterManagerProps) {
  const [pendingChanges, setPendingChanges] = useState<Array<{quarter: number, position: Position, playerId: number}>>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Define type for the roster state
  type RosterStateType = {
    '1': Record<string, number | null>;
    '2': Record<string, number | null>;
    '3': Record<string, number | null>;
    '4': Record<string, number | null>;
  };
  
  // Initialize the local roster state with empty values
  const [localRosterState, setLocalRosterState] = useState<RosterStateType>({
    '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter out BYE games since they don't have rosters
  const gamesWithoutByes = games.filter(game => !game.isBye);
  
  // Show all valid games, not just upcoming ones
  const allGames = gamesWithoutByes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const selectedGame = games.find(game => game.id === selectedGameId);
  const selectedOpponent = opponents.find(opponent => selectedGame?.opponentId === opponent.id);
  
  // Effect to load existing roster when game selection changes
  useEffect(() => {
    // Reset the pending changes when game changes
    setPendingChanges([]);
    setHasUnsavedChanges(false);
    
    // Reset local roster state to empty
    setLocalRosterState({
      '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
    });
    
    // If we have a selected game, fetch its roster and update local state
    if (selectedGameId) {
      const fetchRoster = async () => {
        try {
          const response = await fetch(`/api/games/${selectedGameId}/rosters`);
          if (response.ok) {
            const rosters: RosterType[] = await response.json();
            
            // Update local state with fetched roster
            const newRosterState: RosterStateType = {
              '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
              '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
              '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
              '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
            };
            
            // Populate with loaded data
            rosters.forEach(roster => {
              const quarterKey = roster.quarter.toString() as '1' | '2' | '3' | '4';
              if (quarterKey === '1' || quarterKey === '2' || quarterKey === '3' || quarterKey === '4') {
                newRosterState[quarterKey][roster.position] = roster.playerId;
              }
            });
            
            setLocalRosterState(newRosterState);
            console.log("Loaded roster data:", newRosterState);
          }
        } catch (error) {
          console.error("Error loading roster:", error);
        }
      };
      
      fetchRoster();
    }
  }, [selectedGameId]);
  
  // Type for quarters
  type Quarter = 1 | 2 | 3 | 4;
  const quarters: Quarter[] = [1, 2, 3, 4];
  
  // Positions in the order they should be displayed
  const positionOrder: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

  // Create a map for quick player lookups
  const playerMap: Record<number, Player> = {};
  players.forEach(player => {
    playerMap[player.id] = player;
  });

  // Handle player assignment to position
  const handleAssignPlayer = (quarter: string, position: Position, playerId: number | null) => {
    if (!selectedGameId) return;
    
    // Check if this is a "clear position" action (value of 0 indicates clearing)
    const actualPlayerId = playerId === 0 ? null : playerId;
    
    // Update our local state directly
    setLocalRosterState(prev => {
      // Create a new state object to avoid direct mutation
      const newState = {
        '1': {...prev['1']},
        '2': {...prev['2']},
        '3': {...prev['3']},
        '4': {...prev['4']}
      };
      
      // Update the specified position
      if (quarter === '1' || quarter === '2' || quarter === '3' || quarter === '4') {
        newState[quarter][position] = actualPlayerId;
      }
      
      return newState;
    });
    
    // Only add to pending changes if it's an actual assignment (not clearing)
    if (actualPlayerId !== null) {
      const quarterNum = parseInt(quarter);
      setPendingChanges(prev => [
        ...prev.filter(change => 
          !(change.quarter === quarterNum && change.position === position)
        ),
        { quarter: quarterNum, position, playerId: actualPlayerId }
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
    
    // Log for debugging
    console.log(`Position updated - Quarter: ${quarter}, Position: ${position}, Player: ${actualPlayerId}`);
  };

  // Handle resetting all positions in all quarters
  const handleResetAll = () => {
    if (!selectedGameId) return;
    
    // Confirm with the user before clearing all positions
    if (!confirm("Are you sure you want to reset ALL positions in ALL quarters? This cannot be undone.")) {
      return;
    }
    
    // Reset the local roster state to empty
    setLocalRosterState({
      '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
    });
    
    // Clear all pending changes
    setPendingChanges([]);
    
    // Mark that we have unsaved changes (since we'll need to save this cleared state)
    setHasUnsavedChanges(true);
    
    toast({
      title: "All Positions Reset",
      description: "All positions in all quarters have been reset. Don't forget to save to apply these changes!",
    });
  };

  // Auto-fill roster based on player position preferences with equal playing time distribution
  const handleAutoFill = () => {
    if (!selectedGameId || players.length === 0) return;
    
    // Get only active players
    const activePlayers = players.filter(player => player.active);
    
    // Find players for each position based on their preferences
    const playersByPosition: Record<Position, number[]> = {
      'GS': [], 'GA': [], 'WA': [], 'C': [], 'WD': [], 'GD': [], 'GK': []
    };
    
    // Populate players by position preferences
    activePlayers.forEach(player => {
      player.positionPreferences.forEach(position => {
        playersByPosition[position].push(player.id);
      });
    });
    
    // Track assignments to ensure balanced playing time
    const assignmentCounts: Record<number, number> = {};
    activePlayers.forEach(player => {
      assignmentCounts[player.id] = 0;
    });
    
    // Generate assignments for each quarter
    const assignments: Array<{quarter: number, position: Position, playerId: number}> = [];
    
    // Initialize new roster state
    const newRosterState: RosterStateType = {
      '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
    };
    
    // For each position in each quarter
    for (let quarter = 1; quarter <= 4; quarter++) {
      for (const position of allPositions) {
        // Get players who can play this position
        const eligiblePlayers = playersByPosition[position];
        
        // Sort by number of assignments (fewer first)
        const sortedPlayers = [...eligiblePlayers].sort((a, b) => 
          (assignmentCounts[a] || 0) - (assignmentCounts[b] || 0)
        );
        
        // Assign the player with fewest assignments
        if (sortedPlayers.length > 0) {
          const playerId = sortedPlayers[0];
          
          // Add to assignments
          assignments.push({
            quarter,
            position,
            playerId
          });
          
          // Update our new roster state
          const quarterKey = quarter.toString() as '1' | '2' | '3' | '4';
          newRosterState[quarterKey][position] = playerId;
          
          // Increment assignment count
          assignmentCounts[playerId] = (assignmentCounts[playerId] || 0) + 1;
        }
      }
    }
    
    // Apply the generated assignments to pendingChanges
    setPendingChanges(assignments);
    
    // Update the local state
    setLocalRosterState(newRosterState);
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
    
    toast({
      title: "Auto-fill Complete",
      description: "Roster has been auto-filled based on player preferences. Don't forget to save!",
    });
  };

  // Handle copying roster from one quarter to another
  const handleCopyQuarter = (sourceQuarter: string, targetQuarter: string) => {
    if (!selectedGameId) return;

    const sourceKey = sourceQuarter as '1' | '2' | '3' | '4';
    const targetKey = targetQuarter as '1' | '2' | '3' | '4';
    
    // Skip if trying to copy to the same quarter
    if (sourceKey === targetKey) return;
    
    // Get source quarter positions
    const sourcePositions = localRosterState[sourceKey];
    if (!sourcePositions) return;
    
    // Update the local state by copying the positions
    setLocalRosterState(prev => {
      const newState = {...prev};
      newState[targetKey] = {...sourcePositions};
      return newState;
    });
    
    // Update pending changes for database saving
    const updatedPendingChanges = [...pendingChanges];
    
    // Remove existing assignments for this quarter
    const filteredChanges = updatedPendingChanges.filter(change => 
      change.quarter !== parseInt(targetKey)
    );
    
    // Add new assignments from copied quarter
    Object.entries(sourcePositions).forEach(([position, playerId]) => {
      if (playerId !== null) {
        const pos = position as Position;
        filteredChanges.push({
          quarter: parseInt(targetKey),
          position: pos,
          playerId
        });
      }
    });
    
    // Update pending changes
    setPendingChanges(filteredChanges);
    
    // Mark that there are unsaved changes
    setHasUnsavedChanges(true);
    
    toast({
      title: "Quarter Copied",
      description: `Quarter ${sourceQuarter} positions copied to Quarter ${targetQuarter}. Don't forget to save!`,
    });
  };

  // Save roster to database
  const saveRosterMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGameId) return;
      
      // First delete existing roster entries
      console.log(`Deleting all existing roster entries for game ${selectedGameId}`);
      await apiRequest('DELETE', `/api/games/${selectedGameId}/rosters`);
      
      // Create all the new entries
      const savePromises = [];
      
      // Save ALL roster positions from the entire localRosterState
      for (const quarterKey of ['1', '2', '3', '4']) {
        const quarterPositions = localRosterState[quarterKey as '1'|'2'|'3'|'4'];
        const quarterNum = parseInt(quarterKey);
        
        // Go through all positions in this quarter
        for (const [position, playerId] of Object.entries(quarterPositions)) {
          // Only save positions that have a player assigned
          if (playerId !== null) {
            console.log(`Creating roster entry: Game ${selectedGameId}, Q${quarterNum}, Pos: ${position}, Player: ${playerId}`);
            
            const rosterEntry = {
              gameId: selectedGameId,
              quarter: quarterNum,
              position: position as Position,
              playerId: playerId
            };
            
            savePromises.push(apiRequest('POST', '/api/rosters', rosterEntry));
          }
        }
      }
      
      await Promise.all(savePromises);
      return true;
    },
    onSuccess: () => {
      // Clear pending changes and reset state
      setPendingChanges([]);
      setHasUnsavedChanges(false);
      
      // Show success toast
      toast({
        title: "Roster Saved",
        description: "Your roster changes have been saved successfully.",
      });
      
      // Notify parent component about save
      if (onRosterSaved) {
        onRosterSaved();
      }
    },
    onError: (error) => {
      console.error("Error saving roster:", error);
      toast({
        title: "Error Saving Roster",
        description: "There was a problem saving your roster. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle save button click
  const handleSave = () => {
    if (!selectedGameId) return;
    
    // Don't save if there are no pending changes
    if (pendingChanges.length === 0 && hasUnsavedChanges) {
      toast({
        title: "No Changes to Save",
        description: "There are no changes to save to the roster.",
      });
      setHasUnsavedChanges(false);
      return;
    }
    
    // Save the roster
    saveRosterMutation.mutate();
  };

  // Handle game change
  const handleGameChange = (gameId: string) => {
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to switch games without saving?")) {
        setSelectedGameId(Number(gameId));
        setPendingChanges([]);
        setHasUnsavedChanges(false);
      }
    } else {
      setSelectedGameId(Number(gameId));
    }
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    if (!selectedGame || !selectedOpponent || !localRosterState) return;
    
    // Call our export function with the correct parameters
    exportRosterToPDF(
      selectedGame, 
      selectedOpponent, 
      players, 
      localRosterState
    );
    
    toast({
      title: "Export Complete",
      description: "Roster has been exported to PDF.",
    });
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    if (!selectedGame || !selectedOpponent || !localRosterState) return;
    
    // Call our export function with the correct parameters
    exportRosterToExcel(
      selectedGame, 
      selectedOpponent, 
      players, 
      localRosterState
    );
    
    toast({
      title: "Export Complete",
      description: "Roster has been exported to Excel.",
    });
  };

  // Helper to determine if a player has a certain position preference
  const hasPositionPreference = (player: Player, position: Position): boolean => {
    return player.positionPreferences.includes(position);
  };

  // Get players eligible for a position
  const getEligiblePlayers = (position: Position): Player[] => {
    return players.filter(player => 
      player.active && player.positionPreferences.includes(position)
    );
  };

  // Create a map to track which players are already selected in a quarter
  const getSelectedPlayersInQuarter = (quarterKey: string) => {
    const selectedPlayers = new Set<number>();
    
    if (quarterKey === '1') {
      Object.values(localRosterState['1']).forEach(playerId => {
        if (playerId !== null) {
          selectedPlayers.add(playerId);
        }
      });
    } else if (quarterKey === '2') {
      Object.values(localRosterState['2']).forEach(playerId => {
        if (playerId !== null) {
          selectedPlayers.add(playerId);
        }
      });
    } else if (quarterKey === '3') {
      Object.values(localRosterState['3']).forEach(playerId => {
        if (playerId !== null) {
          selectedPlayers.add(playerId);
        }
      });
    } else if (quarterKey === '4') {
      Object.values(localRosterState['4']).forEach(playerId => {
        if (playerId !== null) {
          selectedPlayers.add(playerId);
        }
      });
    }
    
    return selectedPlayers;
  };

  // Check if loading
  if (isLoading) {
    return (
      <Card className="mb-6 shadow-md">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Loading Roster...</h3>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 shadow-md">
      <CardContent className="pt-6">
        {/* Game Selection and Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="w-full md:w-1/3">
            <label className="text-sm font-medium mb-2 block">Select Game</label>
            <Select
              value={selectedGameId?.toString() || ""}
              onValueChange={handleGameChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {allGames.map((game) => (
                  <SelectItem key={game.id} value={game.id.toString()}>
                    {formatShortDate(game.date)} - {opponents.find(o => o.id === game.opponentId)?.teamName || "Unknown Opponent"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 items-end">
            <Button 
              variant="outline" 
              onClick={handleAutoFill}
              disabled={!selectedGameId}
              className="flex items-center gap-1"
            >
              <Wand2 size={16} /> Auto-Fill
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleResetAll}
              disabled={!selectedGameId}
              className="flex items-center gap-1 border-red-200 hover:bg-red-50"
            >
              <Trash2 size={16} /> Reset All
            </Button>
            
            <Button 
              variant="outline" 
              disabled={!selectedGameId || saveRosterMutation.isPending}
              onClick={handleSave}
              className={`flex items-center gap-1 ${hasUnsavedChanges ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <Save size={16} /> Save Roster
            </Button>
            
            <ExportButtons 
              onExportPDF={handleExportPDF} 
              onExportExcel={handleExportExcel} 
              disabled={!selectedGameId}
            />
          </div>
        </div>
        
        {/* Selected Game Info */}
        {selectedGame && selectedOpponent && (
          <div className="mb-4 p-3 bg-slate-50 rounded-md">
            <h3 className="font-semibold">
              Game: {formatShortDate(selectedGame.date)} {selectedGame.time} vs {selectedOpponent.teamName}
            </h3>
          </div>
        )}
        
        {/* Quarter Copying Controls */}
        {selectedGameId && (
          <div className="mb-4 flex gap-2 flex-wrap">
            <Select
              onValueChange={(value) => handleCopyQuarter('1', value)}
              disabled={saveRosterMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Copy Q1 to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Quarter 2</SelectItem>
                <SelectItem value="3">Quarter 3</SelectItem>
                <SelectItem value="4">Quarter 4</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              onValueChange={(value) => handleCopyQuarter('2', value)}
              disabled={saveRosterMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Copy Q2 to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Quarter 1</SelectItem>
                <SelectItem value="3">Quarter 3</SelectItem>
                <SelectItem value="4">Quarter 4</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              onValueChange={(value) => handleCopyQuarter('3', value)}
              disabled={saveRosterMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Copy Q3 to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Quarter 1</SelectItem>
                <SelectItem value="2">Quarter 2</SelectItem>
                <SelectItem value="4">Quarter 4</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              onValueChange={(value) => handleCopyQuarter('4', value)}
              disabled={saveRosterMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Copy Q4 to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Quarter 1</SelectItem>
                <SelectItem value="2">Quarter 2</SelectItem>
                <SelectItem value="3">Quarter 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Table of positions by quarter */}
        <div className="mt-4">
          {selectedGameId ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-24 font-bold"></TableHead>
                    {quarters.map(q => (
                      <TableHead key={q} className="text-center font-semibold">Q{q}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Position rows */}
                  {positionOrder.map(position => (
                    <TableRow key={position} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{position}</TableCell>
                      
                      {quarters.map(quarter => {
                        const quarterKey = quarter.toString();
                        // Get players already selected in this quarter
                        const selectedPlayers = getSelectedPlayersInQuarter(quarterKey);
                        // Get current player in this position for this quarter
                        const currentPlayerId = 
                          quarterKey === '1' ? localRosterState['1'][position] :
                          quarterKey === '2' ? localRosterState['2'][position] :
                          quarterKey === '3' ? localRosterState['3'][position] :
                          quarterKey === '4' ? localRosterState['4'][position] : null;
                        
                        return (
                          <TableCell key={`${position}-${quarter}`} className="p-1 min-w-[160px]">
                            <Select
                              value={currentPlayerId !== null ? currentPlayerId.toString() : "0"}
                              onValueChange={(value) => handleAssignPlayer(
                                quarterKey, 
                                position, 
                                value === "0" ? null : parseInt(value)
                              )}
                              disabled={saveRosterMutation.isPending}
                            >
                              <SelectTrigger className="w-full" disabled={saveRosterMutation.isPending}>
                                <SelectValue placeholder="Select Player" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">-- None --</SelectItem>
                                {getEligiblePlayers(position)
                                  .filter(player => !selectedPlayers.has(player.id) || player.id === currentPlayerId)
                                  .map(player => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                      {player.displayName}
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                  
                  {/* Off players row - in the same table with a top border */}
                  <TableRow className="border-t-2 border-slate-200">
                    <TableCell className="font-medium">Off</TableCell>
                    
                    {quarters.map(quarter => {
                      const quarterKey = quarter.toString() as '1'|'2'|'3'|'4';
                      const playersNotInQuarter = players
                        .filter(player => player.active)
                        .filter(player => !Object.values(localRosterState[quarterKey]).includes(player.id));
                      
                      return (
                        <TableCell key={`off-${quarter}`} className="p-1 min-w-[160px]">
                          <div className="flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm">
                            {playersNotInQuarter.length > 0 ? (
                              <div className="truncate my-auto">
                                {playersNotInQuarter.map(player => player.displayName).join(', ')}
                              </div>
                            ) : (
                              <div className="text-muted-foreground my-auto">-</div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Please select a game to manage the roster
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}