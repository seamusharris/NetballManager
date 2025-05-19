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
  localRosterState
}: SimpleRosterManagerProps) {
  const [pendingChanges, setPendingChanges] = useState<Array<{quarter: number, position: Position, playerId: number}>>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Show all games, not just upcoming ones
  const allGames = games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const selectedGame = games.find(game => game.id === selectedGameId);
  const selectedOpponent = opponents.find(opponent => selectedGame?.opponentId === opponent.id);
  
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
    
    // Notify parent component about the change for real-time summary updates
    if (onRosterChanged) {
      console.log(`Calling parent onRosterChanged: Q${quarter}, ${position}, Player ${actualPlayerId}`);
      onRosterChanged(quarter, position, actualPlayerId);
    }
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
          assignments.push({
            quarter,
            position,
            playerId
          });
          
          // Increment assignment count
          assignmentCounts[playerId] = (assignmentCounts[playerId] || 0) + 1;
        }
      }
    }
    
    // Apply the generated assignments
    setPendingChanges(assignments);
    
    // Update the UI state
    assignments.forEach(assignment => {
      if (onRosterChanged) {
        onRosterChanged(
          assignment.quarter.toString(),
          assignment.position,
          assignment.playerId
        );
      }
    });
    
    setHasUnsavedChanges(true);
    
    toast({
      title: "Auto-fill Complete",
      description: "Roster has been auto-filled based on player preferences. Don't forget to save!",
    });
  };

  // Handle copying roster from one quarter to another
  const handleCopyQuarter = (sourceQuarter: string, targetQuarter: string) => {
    if (!selectedGameId || !localRosterState) return;

    const sourceKey = sourceQuarter as '1' | '2' | '3' | '4';
    const targetKey = targetQuarter as '1' | '2' | '3' | '4';
    
    // Skip if trying to copy to the same quarter
    if (sourceKey === targetKey) return;
    
    const sourcePositions = localRosterState[sourceKey];
    const targetPositions = { ...localRosterState[targetKey] };
    
    // Copy each position from source to target
    Object.entries(sourcePositions).forEach(([position, playerId]) => {
      // Update local UI state via callback
      if (onRosterChanged) {
        onRosterChanged(targetKey, position, playerId);
      }
      
      // Add to pending changes if not null
      if (playerId !== null) {
        const pos = position as Position;
        setPendingChanges(prev => [
          ...prev.filter(change => 
            !(change.quarter === parseInt(targetKey) && change.position === pos)
          ),
          { quarter: parseInt(targetKey), position: pos, playerId }
        ]);
      } else {
        // Remove from pending changes if playerId is null
        const pos = position as Position;
        setPendingChanges(prev => 
          prev.filter(change => 
            !(change.quarter === parseInt(targetKey) && change.position === pos)
          )
        );
      }
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
      
      for (const change of pendingChanges) {
        console.log(`Creating roster entry: Game ${selectedGameId}, Q${change.quarter}, Pos: ${change.position}, Player: ${change.playerId}`);
        
        const rosterEntry = {
          gameId: selectedGameId,
          quarter: change.quarter,
          position: change.position,
          playerId: change.playerId
        };
        
        savePromises.push(apiRequest('POST', '/api/rosters', rosterEntry));
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
    if (!localRosterState) return new Set<number>();
    
    const selectedPlayers = new Set<number>();
    Object.values(localRosterState[quarterKey] || {}).forEach(playerId => {
      if (playerId !== null) {
        selectedPlayers.add(playerId);
      }
    });
    
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
              {formatShortDate(selectedGame.date)} - {selectedGame.time} vs {selectedOpponent.teamName}
            </h3>
          </div>
        )}
        
        {!selectedGameId && (
          <div className="text-center py-8">
            <p className="text-gray-500">Please select a game to manage the roster</p>
          </div>
        )}
        
        {selectedGameId && (
          <>
            {/* Copy Quarter Controls */}
            <div className="mb-4 flex gap-4 flex-wrap">
              {quarters.map(sourceQuarter => (
                <div key={`copy-from-${sourceQuarter}`} className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Find the next quarter (or wrap to 1)
                      const targetQuarter = (sourceQuarter % 4) + 1;
                      handleCopyQuarter(sourceQuarter.toString(), targetQuarter.toString());
                    }}
                    className="flex items-center gap-1"
                  >
                    <Copy size={14} /> Copy Q{sourceQuarter} to Q{(sourceQuarter % 4) + 1}
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Roster Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-24 font-bold">Position</TableHead>
                    {quarters.map(q => (
                      <TableHead key={q} className="text-center font-semibold">Quarter {q}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionOrder.map(position => {
                    // Get eligible players for this position
                    const eligiblePlayers = getEligiblePlayers(position);
                    
                    return (
                      <TableRow key={position} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{positionLabels[position]}</TableCell>
                        
                        {quarters.map(quarter => {
                          const quarterKey = quarter.toString();
                          // Get players already selected in this quarter
                          const selectedPlayers = getSelectedPlayersInQuarter(quarterKey);
                          // Get current player in this position for this quarter
                          const currentPlayerId = localRosterState?.[quarterKey]?.[position] || null;
                          
                          return (
                            <TableCell key={`${position}-${quarter}`} className="p-1 min-w-40">
                              <Select
                                value={currentPlayerId ? currentPlayerId.toString() : "0"}
                                onValueChange={(value) => handleAssignPlayer(
                                  quarterKey, 
                                  position, 
                                  value === "0" ? null : parseInt(value)
                                )}
                              >
                                <SelectTrigger className="w-full h-9">
                                  <SelectValue placeholder="Select player" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">— None —</SelectItem>
                                  {eligiblePlayers.map(player => (
                                    <SelectItem 
                                      key={player.id} 
                                      value={player.id.toString()}
                                      disabled={selectedPlayers.has(player.id) && player.id !== currentPlayerId}
                                    >
                                      {player.displayName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Roster Summary Section */}
            <div className="mt-6 mb-2">
              <h3 className="text-lg font-semibold mb-3">Roster Summary</h3>
              <div className="bg-slate-50 p-4 rounded-md">
                {selectedGame && localRosterState && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold">Position</TableHead>
                          <TableHead className="font-bold">Player</TableHead>
                          <TableHead className="font-bold">Quarters</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positionOrder.map(position => {
                          // Get all players assigned to this position across quarters
                          const assignedPlayerIds = new Set<number>();
                          quarters.forEach(quarter => {
                            const playerId = localRosterState[quarter.toString()]?.[position];
                            if (playerId !== null && playerId !== undefined) {
                              assignedPlayerIds.add(playerId);
                            }
                          });
                          
                          // For each player assigned to this position, show their quarters
                          return Array.from(assignedPlayerIds).map(playerId => {
                            const player = playerMap[playerId];
                            if (!player) return null;
                            
                            // Get quarters this player is assigned to this position
                            const assignedQuarters = quarters.filter(quarter => 
                              localRosterState[quarter.toString()]?.[position] === playerId
                            );
                            
                            return (
                              <TableRow key={`${position}-${playerId}`}>
                                <TableCell className="font-medium">{positionLabels[position]}</TableCell>
                                <TableCell>{player.displayName}</TableCell>
                                <TableCell>
                                  {assignedQuarters.map(q => `Q${q}`).join(', ')}
                                </TableCell>
                              </TableRow>
                            );
                          });
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
            
            {/* Save button at bottom */}
            <div className="mt-4 flex justify-end">
              <Button 
                disabled={!selectedGameId || saveRosterMutation.isPending}
                onClick={handleSave}
                className={`flex items-center gap-1 ${hasUnsavedChanges ? 'bg-blue-100' : ''}`}
              >
                <Save size={16} /> Save Roster
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}