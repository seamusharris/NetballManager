import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { 
  Game, 
  GameStat, 
  Player, 
  Opponent, 
  Roster,
  Position
} from '@shared/schema';
import { formatShortDate } from '@/lib/utils';

interface GameStatisticsProps {
  game: Game;
  opponent: Opponent | undefined;
  players: Player[];
  gameStats: GameStat[];
  rosters: Roster[];
  isLoading: boolean;
}

export default function GameStatistics({ 
  game, 
  opponent, 
  players, 
  gameStats, 
  rosters,
  isLoading
}: GameStatisticsProps) {
  const [activeQuarter, setActiveQuarter] = useState('1');
  const { toast } = useToast();
  const pendingChangesRef = React.useRef<Record<number, Record<number, Record<string, any>>>>({});
  
  // Transform rosters to more usable format
  const rosterByQuarterAndPosition: Record<string, Record<Position, number | null>> = {
    '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
  };
  
  // Process roster data to fill the positions
  if (Array.isArray(rosters)) {
    console.log("Processing roster data:", rosters);
    
    // First check if we accidentally got a game object instead of roster entries
    // This happens sometimes due to API path confusion
    if (rosters.length > 0 && 'date' in rosters[0] && 'opponentId' in rosters[0]) {
      console.log("WARNING: Received game object instead of roster entries");
    } else {
      // Process actual roster entries
      rosters.forEach(roster => {
        // Check if this is a roster entry with all needed fields
        if (roster && 
            typeof roster === 'object' &&
            'quarter' in roster && 
            'position' in roster && 
            'playerId' in roster) {
          
          console.log("Found valid roster entry:", roster);
          const quarterKey = roster.quarter.toString();
          if (rosterByQuarterAndPosition[quarterKey]) {
            rosterByQuarterAndPosition[quarterKey][roster.position as Position] = roster.playerId;
          }
        }
      });
    }
    
    console.log("Final quarter roster assignments:", rosterByQuarterAndPosition);
  }
  
  // Helper function to get position for a player in a specific quarter
  const getPositionForPlayerInQuarter = (playerId: number, quarter: number): Position | undefined => {
    const quarterKey = quarter.toString();
    const quarterRoster = rosterByQuarterAndPosition[quarterKey];
    
    // Find the position this player was assigned to in this quarter
    for (const [position, id] of Object.entries(quarterRoster)) {
      if (id === playerId) {
        return position as Position;
      }
    }
    
    // If not found in roster, return undefined
    return undefined;
  };
  
  // Group stats by quarter and player
  const statsByQuarterAndPlayer: Record<string, Record<number, GameStat>> = {
    '1': {},
    '2': {},
    '3': {},
    '4': {},
    'total': {}
  };
  
  // Calculate totals for each player
  const playerTotals: Record<number, GameStat> = {};
  
  // Initialize empty stats for all positions in the roster
  Object.entries(rosterByQuarterAndPosition).forEach(([quarter, positions]) => {
    Object.values(positions).forEach(playerId => {
      if (playerId !== null) {
        if (!statsByQuarterAndPlayer[quarter][playerId]) {
          statsByQuarterAndPlayer[quarter][playerId] = {
            id: 0,
            gameId: game.id,
            quarter: parseInt(quarter),
            position: getPositionForPlayerInQuarter(playerId, parseInt(quarter)) || 'GS', // Fallback position
            goalsFor: 0,
            goalsAgainst: 0,
            missedGoals: 0,
            rebounds: 0,
            intercepts: 0,
            badPass: 0,
            handlingError: 0,
            pickUp: 0,
            infringement: 0,
            rating: null
          };
        }
        
        if (!playerTotals[playerId]) {
          playerTotals[playerId] = {
            id: 0,
            gameId: game.id,
            quarter: 0, // 0 for totals
            position: getPositionForPlayerInQuarter(playerId, 1) || 'GS', // Use position from first quarter
            goalsFor: 0,
            goalsAgainst: 0,
            missedGoals: 0,
            rebounds: 0,
            intercepts: 0,
            badPass: 0,
            handlingError: 0,
            pickUp: 0,
            infringement: 0,
            rating: null
          };
        }
      }
    });
  });
  
  // Fill in actual stats where they exist - using position-based approach
  gameStats.forEach(stat => {
    if (stat && stat.quarter !== undefined && stat.position) {
      const quarterKey = stat.quarter.toString();
      // Find player for this position and quarter from roster
      const playerId = rosterByQuarterAndPosition[quarterKey][stat.position as Position];
      
      // Only process if we found a player in the roster for this position
      if (playerId !== null && quarterKey in statsByQuarterAndPlayer) {
        // Update the player's stats for this quarter
        if (!statsByQuarterAndPlayer[quarterKey][playerId]) {
          // Initialize if needed
          statsByQuarterAndPlayer[quarterKey][playerId] = {
            id: stat.id,
            gameId: game.id,
            quarter: stat.quarter,
            position: stat.position,
            goalsFor: 0,
            goalsAgainst: 0,
            missedGoals: 0,
            rebounds: 0,
            intercepts: 0,
            badPass: 0,
            handlingError: 0,
            pickUp: 0,
            infringement: 0,
            rating: null
          };
        }
        
        // Set the stat values from the position-based record
        statsByQuarterAndPlayer[quarterKey][playerId] = {
          ...statsByQuarterAndPlayer[quarterKey][playerId],
          goalsFor: stat.goalsFor,
          goalsAgainst: stat.goalsAgainst,
          missedGoals: stat.missedGoals,
          rebounds: stat.rebounds,
          intercepts: stat.intercepts,
          badPass: stat.badPass,
          handlingError: stat.handlingError,
          pickUp: stat.pickUp,
          infringement: stat.infringement,
          rating: stat.rating
        };
        
        // Also accumulate player totals
        if (!playerTotals[playerId]) {
          playerTotals[playerId] = {
            id: 0,
            gameId: game.id,
            quarter: 0,
            position: stat.position,
            goalsFor: 0,
            goalsAgainst: 0,
            missedGoals: 0,
            rebounds: 0,
            intercepts: 0,
            badPass: 0,
            handlingError: 0,
            pickUp: 0,
            infringement: 0,
            rating: null
          };
        }
        
        // Add to player totals
        playerTotals[playerId].goalsFor += (stat.goalsFor || 0);
        playerTotals[playerId].goalsAgainst += (stat.goalsAgainst || 0);
        playerTotals[playerId].missedGoals += (stat.missedGoals || 0);
        playerTotals[playerId].rebounds += (stat.rebounds || 0);
        playerTotals[playerId].intercepts += (stat.intercepts || 0);
        playerTotals[playerId].badPass += (stat.badPass || 0);
        playerTotals[playerId].handlingError += (stat.handlingError || 0);
        playerTotals[playerId].pickUp += (stat.pickUp || 0);
        playerTotals[playerId].infringement += (stat.infringement || 0);
      }
    }
  });
  
  statsByQuarterAndPlayer['total'] = playerTotals;
  
  // Calculate quarter scores
  const quarterScores = {
    '1': { teamScore: 0, opponentScore: 0 },
    '2': { teamScore: 0, opponentScore: 0 },
    '3': { teamScore: 0, opponentScore: 0 },
    '4': { teamScore: 0, opponentScore: 0 },
    'total': { teamScore: 0, opponentScore: 0 }
  };
  
  // Sum goals for each quarter
  Object.entries(statsByQuarterAndPlayer).forEach(([quarter, playerStats]) => {
    if (quarter === 'total') return; // Skip totals for now
    
    // Make sure quarterScores has this quarter defined
    if (quarterScores[quarter as '1'|'2'|'3'|'4']) {
      Object.values(playerStats).forEach(stat => {
        quarterScores[quarter as '1'|'2'|'3'|'4'].teamScore += stat.goalsFor;
        quarterScores[quarter as '1'|'2'|'3'|'4'].opponentScore += stat.goalsAgainst;
        
        // Also add to totals
        quarterScores['total'].teamScore += stat.goalsFor;
        quarterScores['total'].opponentScore += stat.goalsAgainst;
      });
    }
  });
  
  // Perform an additional check to ensure we have valid roster entries
  const hasValidRosterEntries = Array.isArray(rosters) && 
    rosters.length > 0 && 
    rosters.some(r => 'position' in r && 'playerId' in r && 'quarter' in r);
  
  // Mark roster as complete if we have any valid entries
  const isRosterComplete = hasValidRosterEntries;
  
  // Old individual save mutation - no longer used directly
  // Instead we now batch save changes only when the save button is clicked
  const saveStatsMutation = useMutation({
    mutationFn: async ({
      playerId,
      quarter,
      stats
    }: {
      playerId: number;
      quarter: number;
      stats: Partial<GameStat>;
    }) => {
      // Get the position for this player in this quarter
      const position = getPositionForPlayerInQuarter(playerId, quarter);
      
      if (!position) {
        console.error(`No position found for player ${playerId} in quarter ${quarter}`);
        throw new Error(`No position found for player ${playerId} in quarter ${quarter}`);
      }
      
      // Find if there's an existing stat entry for this position and quarter
      const existingStat = gameStats.find(s => 
        s.gameId === game.id && 
        s.position === position && 
        s.quarter === quarter
      );
      
      if (existingStat) {
        // Update existing stats
        return await apiRequest(`/api/gamestats/${existingStat.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stats)
        });
      } else {
        // Create new stats
        return await apiRequest(`/api/gamestats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: game.id,
            position,
            quarter,
            goalsFor: 0,
            goalsAgainst: 0,
            missedGoals: 0,
            rebounds: 0,
            intercepts: 0,
            badPass: 0,
            handlingError: 0,
            pickUp: 0,
            infringement: 0,
            rating: null,
            ...stats // Override with actual values being updated
          })
        });
      }
    },
    onSuccess: (data) => {
      // Force immediate refresh of game stats
      queryClient.invalidateQueries({ queryKey: ['/api/games', game.id, 'stats'] });
      
      // Show success toast after a short delay to ensure data is refreshed
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Statistics updated successfully",
        });
      }, 300);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update statistics: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Store stat change in memory, don't save to backend yet
  const handleStatChange = (
    playerId: number, 
    quarter: number, 
    statName: keyof GameStat, 
    value: number
  ) => {
    console.log(`Updating stat: Player ${playerId}, Quarter ${quarter}, ${statName} = ${value}`);
    
    // Get the position this player is playing in this quarter
    const position = getPositionForPlayerInQuarter(playerId, quarter);
    if (!position) {
      console.warn(`Player ${playerId} has no position assignment for quarter ${quarter}`);
      return;
    }
    
    // Initialize nested objects if they don't exist
    if (!pendingChangesRef.current[playerId]) {
      pendingChangesRef.current[playerId] = {};
    }
    if (!pendingChangesRef.current[playerId][quarter]) {
      pendingChangesRef.current[playerId][quarter] = {};
    }
    
    // Store the pending change
    pendingChangesRef.current[playerId][quarter][statName] = value;
    
    // Make a deep copy of the current state
    const quarterStats = { ...statsByQuarterAndPlayer[quarter.toString()] };
    
    // Create a new player stats object if it doesn't exist
    if (!quarterStats[playerId]) {
      quarterStats[playerId] = {
        id: 0,
        gameId: game.id,
        quarter,
        position,
        goalsFor: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0,
        rating: null
      };
    }
    
    // Update the stat value
    quarterStats[playerId] = {
      ...quarterStats[playerId],
      [statName]: value
    };
    
    // Force update the UI state
    statsByQuarterAndPlayer[quarter.toString()] = quarterStats;
    
    // Force a re-render by setting a state
    setActiveQuarter(prev => {
      // This is a trick to force re-render without changing the actual tab
      const current = prev;
      // Toggle and then toggle back to force React to detect a change
      setTimeout(() => setActiveQuarter(current), 0);
      return current;
    });
  };
  
  // Mutation for batch saving stats using position-based approach
  const batchSaveStatsMutation = useMutation({
    mutationFn: async () => {
      const pendingChanges = pendingChangesRef.current;
      const savePromises = [];
      
      // For each player that has changes
      for (const playerId in pendingChanges) {
        const playerQuarters = pendingChanges[playerId];
        
        // For each quarter that has changes for this player
        for (const quarter in playerQuarters) {
          const quarterChanges = playerQuarters[quarter];
          const quarterNum = Number(quarter);
          const playerIdNum = Number(playerId);
          
          // Get the position for this player in this quarter
          const position = getPositionForPlayerInQuarter(playerIdNum, quarterNum);
          
          if (!position) {
            console.warn(`No position found for player ${playerId} in quarter ${quarter}`);
            continue; // Skip if no position assigned
          }
          
          // Find if there's an existing stat entry for this position and quarter
          const existingStat = gameStats.find(s => 
            s.gameId === game.id && 
            s.position === position && 
            s.quarter === quarterNum
          );
          
          if (existingStat) {
            // Update existing stats - position-based
            savePromises.push(
              apiRequest(`/api/gamestats/${existingStat.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quarterChanges)
              })
            );
          } else {
            // Create new stats with defaults - position-based
            savePromises.push(
              apiRequest(`/api/gamestats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  gameId: game.id,
                  position, // Position is primary identifier, no player ID needed
                  quarter: quarterNum,
                  goalsFor: 0,
                  goalsAgainst: 0,
                  missedGoals: 0,
                  rebounds: 0,
                  intercepts: 0,
                  badPass: 0,
                  handlingError: 0,
                  pickUp: 0,
                  infringement: 0,
                  rating: null,
                  ...quarterChanges // Override with actual values being updated
                })
              })
            );
          }
        }
      }
      
      // Execute all save promises
      await Promise.all(savePromises);
      
      // Clear pending changes
      pendingChangesRef.current = {};
      
      return { success: true, count: savePromises.length };
    },
    onSuccess: () => {
      // Refresh the game stats data
      queryClient.invalidateQueries({ queryKey: ['/api/games', game.id, 'stats'] });
      
      toast({
        title: "Statistics Saved",
        description: "All statistics have been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save statistics: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Bulk save all stats when save button is clicked
  const handleSaveAllStats = () => {
    // Check if there are any changes to save
    const hasChanges = Object.keys(pendingChangesRef.current).length > 0;
    
    if (hasChanges) {
      batchSaveStatsMutation.mutate();
    } else {
      toast({
        title: "No Changes",
        description: "No changes to save",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-neutral-dark">Game Statistics</h2>
          <p className="text-gray-500">
            vs. {opponent?.teamName || 'Unknown Team'} • {game.date ? formatShortDate(game.date) : 'No date'} • {game.time || 'No time'}
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary-light text-white"
          onClick={handleSaveAllStats}
          disabled={batchSaveStatsMutation.isPending}
        >
          <Save className="w-4 h-4 mr-1" /> Save Stats
        </Button>
      </div>
      
      {!isRosterComplete && (
        <Card className="bg-warning/10 border-warning">
          <CardContent className="p-4">
            <p className="text-warning font-medium">
              Warning: The roster for this game is incomplete. Please complete the roster before entering statistics.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Score by Quarter */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-heading font-semibold text-neutral-dark mb-4">
            Score by Quarter
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Team</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-primary/10 rounded p-2">
                  <div className="font-heading font-bold text-primary">Our Team</div>
                  <div className="text-2xl font-bold text-neutral-dark">
                    {quarterScores.total.teamScore}
                  </div>
                </div>
                <div className="bg-gray-200 rounded p-2">
                  <div className="font-heading font-bold text-gray-700">{opponent?.teamName}</div>
                  <div className="text-2xl font-bold text-neutral-dark">
                    {quarterScores.total.opponentScore}
                  </div>
                </div>
              </div>
            </div>
            
            {['1', '2', '3', '4'].map(quarter => (
              <div key={quarter} className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Q{quarter}</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-primary/10 rounded p-2">
                    <div className="text-xl font-bold text-neutral-dark">
                      {quarterScores[quarter as '1'|'2'|'3'|'4'].teamScore}
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded p-2">
                    <div className="text-xl font-bold text-neutral-dark">
                      {quarterScores[quarter as '1'|'2'|'3'|'4'].opponentScore}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quarter tabs for stats */}
          <Tabs value={activeQuarter} onValueChange={setActiveQuarter}>
            <TabsList className="mb-4 w-full grid grid-cols-5">
              <TabsTrigger value="1">Quarter 1</TabsTrigger>
              <TabsTrigger value="2">Quarter 2</TabsTrigger>
              <TabsTrigger value="3">Quarter 3</TabsTrigger>
              <TabsTrigger value="4">Quarter 4</TabsTrigger>
              <TabsTrigger value="total">Game Totals</TabsTrigger>
            </TabsList>
            
            {['1', '2', '3', '4', 'total'].map(quarter => (
              <TabsContent key={quarter} value={quarter}>
                <QuarterStatistics 
                  quarter={quarter}
                  players={players}
                  rosters={quarter !== 'total' ? rosterByQuarterAndPosition[quarter] : null}
                  stats={statsByQuarterAndPlayer[quarter]}
                  onStatChange={(playerId, statName, value) => 
                    quarter !== 'total' && handleStatChange(playerId, parseInt(quarter), statName, value)
                  }
                  isEditable={quarter !== 'total'}
                  isPending={saveStatsMutation.isPending}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
