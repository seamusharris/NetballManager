import { useState } from 'react';
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
  const rosterByQuarter: Record<string, Record<Position, number | null>> = {
    '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
  };
  
  // Fill roster assignments from API data
  rosters.forEach(roster => {
    if (roster && roster.quarter !== undefined) {
      const quarterKey = roster.quarter.toString();
      if (rosterByQuarter[quarterKey] && roster.position && allPositions.includes(roster.position as Position)) {
        rosterByQuarter[quarterKey][roster.position as Position] = roster.playerId;
      }
    }
  });
  
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
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
  
  // Find players that are not assigned in a given quarter
  const getAvailablePlayers = (quarter: string, currentPosition: Position, currentPlayerId: number | null) => {
    const quarterAssignments = getQuarterAssignments(quarter);
    const assignedPlayerIds = Object.values(quarterAssignments);
    
    // Players who are either not assigned or currently assigned to this position
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
    
    // Sort players by active status (active first)
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      return 0;
    });
    
    // For each quarter and position, assign the best available player
    Object.keys(rosterByQuarter).forEach(quarter => {
      allPositions.forEach(position => {
        // Skip if already assigned
        if (rosterByQuarter[quarter][position] !== null) return;
        
        // Get players who are available for this quarter/position
        const availablePlayers = getAvailablePlayers(quarter, position, null);
        
        // Find the best player for this position (based on preferences)
        let bestPlayer = null;
        let bestPreferenceRank = Infinity;
        
        for (const player of availablePlayers) {
          const preferences = player.positionPreferences as Position[];
          const preferenceRank = preferences.indexOf(position);
          
          if (preferenceRank !== -1 && preferenceRank < bestPreferenceRank) {
            bestPlayer = player;
            bestPreferenceRank = preferenceRank;
          }
        }
        
        // Assign the best player if found
        if (bestPlayer) {
          saveRosterMutation.mutate({
            quarter: parseInt(quarter),
            position,
            playerId: bestPlayer.id
          });
        }
      });
    });
    
    toast({
      title: "Auto-fill Complete",
      description: "Players have been assigned based on their position preferences",
    });
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
            
            {/* Netball court background with roster status */}
            <div className="mb-6 relative h-48 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560089000-7433a4ebbd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300" 
                alt="Netball court during game" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent flex items-center p-8">
                <div className="text-white max-w-md">
                  <h4 className="text-xl font-bold mb-2">Roster Status</h4>
                  <p className="text-sm mb-4">
                    Quarter 1: {positionsFilledByQuarter['1'] || 0}/7 positions filled<br />
                    Quarter 2: {positionsFilledByQuarter['2'] || 0}/7 positions filled<br />
                    Quarter 3: {positionsFilledByQuarter['3'] || 0}/7 positions filled<br />
                    Quarter 4: {positionsFilledByQuarter['4'] || 0}/7 positions filled
                  </p>
                  <Progress value={completionPercentage} className="h-2 bg-white/30" />
                  <p className="text-xs mt-2">{filledPositions}/{totalPositions} positions filled</p>
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
