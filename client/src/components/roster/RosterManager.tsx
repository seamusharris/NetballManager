import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { Wand2, Copy, Save } from 'lucide-react';
import QuarterRoster from './QuarterRoster';
import { Player, Game, Opponent, Roster, Position } from '@shared/schema';
import { formatShortDate, allPositions, positionLabels } from '@/lib/utils';

interface RosterManagerProps {
  players: Player[];
  games: Game[];
  opponents: Opponent[];
  rosters: Roster[];
  selectedGameId: number | null;
  setSelectedGameId: (id: number | null) => void;
  isLoading: boolean;
}

export default function RosterManager({ 
  players, 
  games, 
  opponents, 
  rosters, 
  selectedGameId, 
  setSelectedGameId, 
  isLoading 
}: RosterManagerProps) {
  const [activeQuarter, setActiveQuarter] = useState('1');
  const [quarterToCopy, setQuarterToCopy] = useState<string | null>(null);
  const { toast } = useToast();
  
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
  
  // Update roster data when rosters prop changes
  useEffect(() => {
    // Create empty roster map
    const newRosterByQuarter = {
      '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
    };
    
    // Fill with roster data from API
    rosters.forEach(roster => {
      if (roster && roster.quarter !== undefined) {
        const quarterKey = roster.quarter.toString();
        if (roster.position && allPositions.includes(roster.position as Position)) {
          newRosterByQuarter[quarterKey][roster.position as Position] = roster.playerId;
        }
      }
    });
    
    // Update state
    setRosterByQuarter(newRosterByQuarter);
  }, [rosters]);
  
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
      
      // Check if there's an existing roster assignment for this position and quarter
      const existingRoster = rosters.find(r => 
        r.gameId === selectedGameId && 
        r.quarter === quarter && 
        r.position === position
      );
      
      if (existingRoster) {
        // Update existing roster assignment
        const res = await apiRequest('PATCH', `/api/rosters/${existingRoster.id}`, {
          playerId
        });
        return res.json();
      } else {
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
  
  // Handle player assignment to position
  const handleAssignPlayer = (quarter: string, position: Position, playerId: number) => {
    saveRosterMutation.mutate({
      quarter: parseInt(quarter),
      position,
      playerId
    });
  };
  
  // Auto-fill roster based on player position preferences
  const handleAutoFill = () => {
    if (!selectedGameId) return;
    
    // Start with a clean copy of all roster assignments
    const newRoster = {
      '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
    };
    
    // Keep any existing assignments
    Object.keys(rosterByQuarter).forEach(quarter => {
      Object.entries(rosterByQuarter[quarter]).forEach(([position, playerId]) => {
        if (playerId !== null) {
          newRoster[quarter][position as Position] = playerId;
        }
      });
    });
    
    // Set up player tracking for fair distribution
    // Track how many quarters each player is assigned
    const playerAssignmentCount: Record<number, number> = {};
    players.forEach(player => {
      playerAssignmentCount[player.id] = 0;
    });
    
    // Sort players by active status (active first) and then by position preference ranking
    const sortedPlayers = [...players].sort((a, b) => {
      // Active players come first
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      return 0;
    });
    
    // First pass: Try to assign players to their primary position preference
    // This ensures players get their preferred positions first when possible
    allPositions.forEach(position => {
      // Get players who prefer this position (ordered by preference rank)
      const playersForPosition = sortedPlayers
        .filter(player => player.active && (player.positionPreferences as Position[]).includes(position))
        .sort((a, b) => {
          const aRank = (a.positionPreferences as Position[]).indexOf(position);
          const bRank = (b.positionPreferences as Position[]).indexOf(position);
          return aRank - bRank; // Lower index (higher preference) comes first
        });
        
      // Try to assign each player to their preferred position in a quarter
      for (const player of playersForPosition) {
        // Try to assign to a quarter if they're not already assigned in that quarter
        for (const quarter of ['1', '2', '3', '4']) {
          // Check if player is already assigned in this quarter
          const isPlayerAssignedInQuarter = Object.values(newRoster[quarter]).includes(player.id);
          
          // Check if position is available in this quarter
          const isPositionAvailable = newRoster[quarter][position] === null;
          
          if (!isPlayerAssignedInQuarter && isPositionAvailable) {
            newRoster[quarter][position] = player.id;
            playerAssignmentCount[player.id]++;
            break;  // Only assign once per player in this pass
          }
        }
      }
    });
    
    // Second pass: Fill in any remaining positions
    // Process each quarter
    ['1', '2', '3', '4'].forEach(quarter => {
      // Process each position in the quarter
      allPositions.forEach(position => {
        // Skip if already assigned
        if (newRoster[quarter][position] !== null) return;
        
        // Get players who aren't assigned in this quarter
        const assignedPlayerIdsInQuarter = Object.values(newRoster[quarter]).filter(id => id !== null) as number[];
        const availablePlayers = sortedPlayers.filter(player => 
          player.active && !assignedPlayerIdsInQuarter.includes(player.id)
        );
        
        // Sort available players by:
        // 1. Position preference (players who can play this position come first)
        // 2. How many quarters they're already assigned (fewer assignments first)
        const rankedPlayers = availablePlayers.sort((a, b) => {
          // Get position preference ranks (-1 means they don't prefer this position)
          const aPreferences = a.positionPreferences as Position[];
          const bPreferences = b.positionPreferences as Position[];
          const aRank = aPreferences.indexOf(position);
          const bRank = bPreferences.indexOf(position);
          
          // Both players have a preference for this position
          if (aRank >= 0 && bRank >= 0) {
            // Sort by preference rank first
            if (aRank !== bRank) return aRank - bRank;
            
            // If same preference rank, sort by assignment count
            return playerAssignmentCount[a.id] - playerAssignmentCount[b.id];
          }
          
          // Only player A has a preference for this position
          if (aRank >= 0) return -1;
          
          // Only player B has a preference for this position
          if (bRank >= 0) return 1;
          
          // Neither player prefers this position, sort by assignment count
          return playerAssignmentCount[a.id] - playerAssignmentCount[b.id];
        });
        
        // Assign the best player for this position if available
        if (rankedPlayers.length > 0) {
          const bestPlayer = rankedPlayers[0];
          newRoster[quarter][position] = bestPlayer.id;
          playerAssignmentCount[bestPlayer.id]++;
        }
      });
    });
    
    // Final pass: If we still have unassigned positions and not enough players, 
    // allow players to play in multiple positions within a quarter
    ['1', '2', '3', '4'].forEach(quarter => {
      allPositions.forEach(position => {
        // Skip if already assigned
        if (newRoster[quarter][position] !== null) return;
        
        // Find player with fewest assignments who can play this position
        const candidatePlayers = sortedPlayers
          .filter(player => player.active && 
            (player.positionPreferences as Position[]).includes(position))
          .sort((a, b) => playerAssignmentCount[a.id] - playerAssignmentCount[b.id]);
        
        // If no players available with this preference, just take any active player
        const playerPool = candidatePlayers.length > 0 ? 
          candidatePlayers : 
          sortedPlayers.filter(player => player.active)
            .sort((a, b) => playerAssignmentCount[a.id] - playerAssignmentCount[b.id]);
        
        if (playerPool.length > 0) {
          const bestPlayer = playerPool[0];
          newRoster[quarter][position] = bestPlayer.id;
          playerAssignmentCount[bestPlayer.id]++;
        }
      });
    });
    
    // Convert to a flat array of all assignments to make sequentially
    const assignments: {quarter: number, position: Position, playerId: number}[] = [];
    
    Object.entries(newRoster).forEach(([quarter, positions]) => {
      Object.entries(positions).forEach(([position, playerId]) => {
        if (playerId !== null) {
          assignments.push({
            quarter: parseInt(quarter),
            position: position as Position,
            playerId: playerId
          });
        }
      });
    });
    
    // Create a function to process assignments sequentially with a slight delay
    const processAssignments = async () => {
      toast({
        title: "Auto-fill In Progress",
        description: "Assigning players to positions...",
      });
      
      for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        
        // Check if there's an existing roster assignment for this position and quarter
        const existingRoster = rosters.find(r => 
          r.gameId === selectedGameId && 
          r.quarter === assignment.quarter && 
          r.position === assignment.position
        );
        
        if (existingRoster) {
          // Update existing roster assignment
          await apiRequest('PATCH', `/api/rosters/${existingRoster.id}`, {
            playerId: assignment.playerId
          });
        } else {
          // Create new roster assignment
          await apiRequest('POST', '/api/rosters', {
            gameId: selectedGameId,
            quarter: assignment.quarter,
            position: assignment.position,
            playerId: assignment.playerId
          });
        }
        
        // Update our local state for immediate UI update
        const newRosterByQuarter = { ...rosterByQuarter };
        const quarterKey = assignment.quarter.toString() as '1' | '2' | '3' | '4';
        
        newRosterByQuarter[quarterKey] = {
          ...newRosterByQuarter[quarterKey],
          [assignment.position]: assignment.playerId
        };
        
        setRosterByQuarter(newRosterByQuarter);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      
      // Refresh the roster data after all assignments are complete
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
      
      toast({
        title: "Auto-fill Complete",
        description: `Successfully assigned ${assignments.length} positions across all quarters`,
      });
    };
    
    // Start processing assignments
    processAssignments();
  };
  
  // Copy roster from one quarter to another
  const handleCopyQuarter = () => {
    if (!selectedGameId || !quarterToCopy || quarterToCopy === activeQuarter) return;
    
    const sourceQuarterAssignments = getQuarterAssignments(quarterToCopy);
    
    // For each position in the source quarter, copy to active quarter
    Object.entries(sourceQuarterAssignments).forEach(([position, playerId]) => {
      if (playerId !== null) {
        saveRosterMutation.mutate({
          quarter: parseInt(activeQuarter),
          position: position as Position,
          playerId
        });
      }
    });
    
    toast({
      title: "Quarter Copied",
      description: `Positions from Quarter ${quarterToCopy} copied to Quarter ${activeQuarter}`,
    });
    
    setQuarterToCopy(null);
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
                allGames.map(game => (
                  <SelectItem key={game.id} value={game.id.toString()}>
                    vs. {opponents.find(o => o.id === game.opponentId)?.teamName} - {formatShortDate(game.date)} {game.completed ? "(Past)" : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          {selectedGameId && (
            <Button
              className="bg-primary hover:bg-primary-light text-white"
              disabled={saveRosterMutation.isPending}
            >
              <Save className="w-4 h-4 mr-1" /> Save Roster
            </Button>
          )}
        </div>
      </div>
      
      {selectedGameId && selectedGame && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-heading font-semibold text-neutral-dark text-xl">
                  vs. {selectedOpponent?.teamName}
                </h3>
                <p className="text-gray-500 text-sm">
                  {formatShortDate(selectedGame.date)} • {selectedGame.time}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
                  onClick={handleAutoFill}
                  disabled={saveRosterMutation.isPending}
                >
                  <Wand2 className="w-4 h-4 mr-1" /> Auto-Fill
                </Button>
                
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
                  
                  <Button
                    variant="outline"
                    className="border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={handleCopyQuarter}
                    disabled={!quarterToCopy || quarterToCopy === activeQuarter || saveRosterMutation.isPending}
                  >
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                </div>
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
