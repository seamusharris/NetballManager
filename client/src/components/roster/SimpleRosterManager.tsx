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
    // Reset unsaved changes flag when game changes
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
    
    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);
    
    // Log for debugging
    console.log(`Position updated - Quarter: ${quarter}, Position: ${position}, Player: ${actualPlayerId}`);
    
    // Call onRosterChanged callback if provided
    if (onRosterChanged) {
      onRosterChanged(quarter, position, actualPlayerId);
    }
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
          
          // Update our new roster state
          const quarterKey = quarter.toString() as '1' | '2' | '3' | '4';
          newRosterState[quarterKey][position] = playerId;
          
          // Increment assignment count
          assignmentCounts[playerId] = (assignmentCounts[playerId] || 0) + 1;
        }
      }
    }
    
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
        for (const position of allPositions) {
          const playerId = quarterPositions[position];
          
          // Only save positions that have a player assigned
          if (playerId !== null) {
            console.log(`Creating roster entry: Game ${selectedGameId}, Q${quarterNum}, Pos: ${position}, Player: ${playerId}`);
            
            const rosterEntry = {
              gameId: selectedGameId,
              quarter: quarterNum,
              position: position,
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
      // Reset the unsaved changes flag
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
    
    // Always save when the user clicks save, regardless of state
    // This ensures all positions in the current localRosterState are saved
    if (!hasUnsavedChanges) {
      toast({
        title: "No Changes to Save",
        description: "There are no changes to save to the roster.",
      });
      return;
    }
    
    // Save the roster - this will use the entire localRosterState
    saveRosterMutation.mutate();
  };

  // Handle game change
  const handleGameChange = (gameId: string) => {
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to switch games without saving?")) {
        setSelectedGameId(Number(gameId));
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
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Roster Management</h1>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleResetAll}
            disabled={!selectedGameId || saveRosterMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Reset All
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleAutoFill}
            disabled={!selectedGameId || saveRosterMutation.isPending}
          >
            <Wand2 className="h-4 w-4 mr-1" />
            Auto-fill
          </Button>
          <Button 
            size="sm" 
            variant="default"
            onClick={handleSave}
            disabled={!selectedGameId || !hasUnsavedChanges || saveRosterMutation.isPending}
          >
            <Save className="h-4 w-4 mr-1" />
            Save {saveRosterMutation.isPending && '...'}
          </Button>
          
          {/* Export Buttons */}
          <ExportButtons 
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            disabled={saveRosterMutation.isPending}
          />
        </div>
      </div>
      
      {/* Game Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">Select Game</label>
              <Select 
                value={selectedGameId?.toString() || ""}
                onValueChange={handleGameChange}
                disabled={saveRosterMutation.isPending}
              >
                <SelectTrigger className="w-full" disabled={saveRosterMutation.isPending}>
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {allGames.map((game) => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      {formatShortDate(game.date)} - {opponents.find(o => o.id === game.opponentId)?.teamName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Display Game Details */}
            {selectedGame && selectedOpponent && (
              <div className="col-span-2">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-semibold">Date: <span className="font-normal">{formatShortDate(selectedGame.date)}</span></p>
                    <p className="text-sm font-semibold">Time: <span className="font-normal">{selectedGame.time}</span></p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Opponent: <span className="font-normal">{selectedOpponent.teamName}</span></p>
                    <p className="text-sm font-semibold">Location: <span className="font-normal">{selectedGame.location}</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Roster Management Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            // Loading state
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !selectedGameId ? (
            // No game selected state
            <div className="text-center py-6">
              <p className="text-muted-foreground">Please select a game to manage its roster</p>
            </div>
          ) : (
            // Roster table content
            <div className="space-y-6">
              {quarters.map((quarter) => (
                <div key={quarter} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Quarter {quarter}</h3>
                    <div className="flex gap-2">
                      {/* Copy to other quarters buttons */}
                      {[1, 2, 3, 4].filter(q => q !== quarter).map((targetQuarter) => (
                        <Button
                          key={targetQuarter}
                          size="xs"
                          variant="outline"
                          onClick={() => handleCopyQuarter(quarter.toString(), targetQuarter.toString())}
                          disabled={saveRosterMutation.isPending}
                          className="text-xs h-7 px-2"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy to Q{targetQuarter}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Position</TableHead>
                        <TableHead>Player</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positionOrder.map((position) => (
                        <TableRow key={position}>
                          <TableCell className="font-medium">
                            {positionLabels[position]} ({position})
                          </TableCell>
                          <TableCell>
                            <Select
                              value={(localRosterState[quarter.toString() as '1' | '2' | '3' | '4'][position] || 0).toString()}
                              onValueChange={(value) => handleAssignPlayer(quarter.toString(), position, parseInt(value))}
                              disabled={saveRosterMutation.isPending}
                            >
                              <SelectTrigger className="w-full max-w-xs">
                                <SelectValue placeholder="Select a player" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">-- No Player --</SelectItem>
                                {players
                                  .filter(player => player.active)
                                  .filter(player => player.positionPreferences.includes(position))
                                  .map((player) => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                      {player.displayName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}