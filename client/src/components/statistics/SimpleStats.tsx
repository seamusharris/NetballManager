import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Player, Roster, GameStat } from '@shared/schema';

interface SimpleStatsProps {
  gameId: number;
  players: Player[];
  rosters: Roster[];
  gameStats: GameStat[];
}

export default function SimpleStats({ gameId, players, rosters, gameStats }: SimpleStatsProps) {
  const [activeQuarter, setActiveQuarter] = useState('1');
  const [formValues, setFormValues] = useState<Record<string, Record<number, Record<string, string>>>>({
    '1': {}, '2': {}, '3': {}, '4': {}
  });
  // Add a state to store calculated game totals
  const [gameTotals, setGameTotals] = useState<Record<number, Record<string, number>>>({});
  // Add state for player ratings in the Game Totals tab
  const [playerRatings, setPlayerRatings] = useState<Record<number, number>>({});
  const { toast } = useToast();
  
  // Function to calculate game totals across all quarters
  const calculateGameTotals = () => {
    const totals: Record<number, Record<string, number>> = {};
    
    // Initialize totals for all players
    players.forEach(player => {
      totals[player.id] = {
        goalsFor: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0
      };
    });
    
    // Sum up values across quarters
    for (const quarter of ['1', '2', '3', '4']) {
      const quarterValues = formValues[quarter] || {};
      
      for (const playerIdStr in quarterValues) {
        const playerId = parseInt(playerIdStr);
        if (isNaN(playerId)) continue;
        
        const playerValues = quarterValues[playerId];
        
        if (playerValues && totals[playerId]) {
          for (const stat in playerValues) {
            const value = parseInt(playerValues[stat]) || 0;
            totals[playerId][stat] = (totals[playerId][stat] || 0) + value;
          }
        }
      }
    }
    
    setGameTotals(totals);
  };
  
  // Initialize form with existing data
  useEffect(() => {
    const initialValues: Record<string, Record<number, Record<string, string>>> = {
      '1': {}, '2': {}, '3': {}, '4': {}
    };
    
    // Keep track of player ratings and their stat IDs 
    const firstQuarterRatings: Record<number, { rating: number, statId: number }> = {};
    
    // Initialize with zeros for all players in each quarter
    rosters.forEach(roster => {
      const quarter = String(roster.quarter);
      const playerId = roster.playerId;
      
      if (quarter && playerId) {
        if (!initialValues[quarter][playerId]) {
          initialValues[quarter][playerId] = {
            goalsFor: '0',
            goalsAgainst: '0',
            missedGoals: '0',
            rebounds: '0',
            intercepts: '0',
            badPass: '0',
            handlingError: '0',
            pickUp: '0',
            infringement: '0'
          };
        }
      }
    });
    
    // Fill in with existing values
    if (gameStats && gameStats.length > 0) {
      console.log("Loading game stats:", gameStats.slice(0, 3));
      
      // Group all stats by quarter and player for easier processing
      const statsByQuarterAndPlayer: Record<string, Record<number, GameStat[]>> = {
        '1': {}, '2': {}, '3': {}, '4': {}
      };
      
      // Group stats by quarter and player
      gameStats.forEach(stat => {
        if (!stat) return;
        
        const quarter = String(stat.quarter);
        const playerId = stat.playerId;
        
        if (!statsByQuarterAndPlayer[quarter][playerId]) {
          statsByQuarterAndPlayer[quarter][playerId] = [];
        }
        
        statsByQuarterAndPlayer[quarter][playerId].push(stat);
      });
      
      // For each quarter and player, get the latest stat
      Object.entries(statsByQuarterAndPlayer).forEach(([quarter, playerStats]) => {
        Object.entries(playerStats).forEach(([playerIdStr, stats]) => {
          const playerId = parseInt(playerIdStr);
          
          // Sort by ID descending to get the most recent stat first
          const sortedStats = [...stats].sort((a, b) => b.id - a.id);
          if (sortedStats.length === 0) return;
          
          const latestStat = sortedStats[0];
          console.log(`Processing stat for quarter ${quarter}, player ${playerId}:`, latestStat);
          
          if (!initialValues[quarter]) {
            initialValues[quarter] = {};
          }
          
          if (!initialValues[quarter][playerId]) {
            initialValues[quarter][playerId] = {
              goalsFor: '0',
              goalsAgainst: '0',
              missedGoals: '0',
              rebounds: '0',
              intercepts: '0',
              badPass: '0',
              handlingError: '0',
              pickUp: '0',
              infringement: '0'
            };
          }
          
          // Update with the latest values
          initialValues[quarter][playerId] = {
            goalsFor: String(latestStat.goalsFor || 0),
            goalsAgainst: String(latestStat.goalsAgainst || 0),
            missedGoals: String(latestStat.missedGoals || 0),
            rebounds: String(latestStat.rebounds || 0),
            intercepts: String(latestStat.intercepts || 0),
            badPass: String(latestStat.badPass || 0),
            handlingError: String(latestStat.handlingError || 0),
            pickUp: String(latestStat.pickUp || 0),
            infringement: String(latestStat.infringement || 0)
          };
          
          // Store player ratings from the first quarter
          if (quarter === '1') {
            firstQuarterRatings[playerId] = { 
              rating: latestStat.rating || 5, 
              statId: latestStat.id 
            };
          }
        });
      });
      
      // Set initial player ratings from first quarter stats
      const initialRatings: Record<number, number> = {};
      
      Object.entries(firstQuarterRatings).forEach(([playerIdStr, data]) => {
        const playerId = parseInt(playerIdStr);
        if (!isNaN(playerId)) {
          initialRatings[playerId] = data.rating;
        }
      });
      
      setPlayerRatings(initialRatings);
    }
    
    setFormValues(initialValues);
    
    // Calculate initial game totals
    const totals: Record<number, Record<string, number>> = {};
    
    players.forEach(player => {
      totals[player.id] = {
        goalsFor: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0
      };
      
      // Sum up values across quarters
      ['1', '2', '3', '4'].forEach(quarter => {
        const quarterValues = initialValues[quarter]?.[player.id] || {};
        
        for (const stat in quarterValues) {
          const value = parseInt(quarterValues[stat]) || 0;
          totals[player.id][stat] = (totals[player.id][stat] || 0) + value;
        }
      });
    });
    
    setGameTotals(totals);
  }, [gameId, gameStats, players, rosters]);
  
  // Function to handle input changes
  const handleInputChange = (quarter: string, playerId: number, field: string, value: string) => {
    setFormValues(prev => {
      // Convert to number for validation
      let numValue = Number(value);
      
      // Ensure the value is non-negative
      if (isNaN(numValue) || numValue < 0) {
        numValue = 0;
      }
      
      const newValues = { ...prev };
      
      if (!newValues[quarter]) {
        newValues[quarter] = {};
      }
      
      if (!newValues[quarter][playerId]) {
        newValues[quarter][playerId] = {};
      }
      
      newValues[quarter][playerId] = {
        ...newValues[quarter][playerId],
        [field]: String(numValue)
      };
      
      return newValues;
    });
    
    // Recalculate game totals when an input changes
    calculateGameTotals();
  };
  
  // Increment or decrement a stat value
  const adjustStatValue = (quarter: string, playerId: number, field: string, amount: number) => {
    const currentValue = parseInt(formValues[quarter]?.[playerId]?.[field] || '0');
    // Ensure value doesn't go below 0
    const newValue = Math.max(0, currentValue + amount);
    handleInputChange(quarter, playerId, field, String(newValue));
  };
  
  // Function to handle rating changes
  const handleRatingChange = (playerId: number, value: string) => {
    const rating = parseInt(value);
    if (isNaN(rating) || rating < 0 || rating > 10) return;
    
    setPlayerRatings(prev => ({
      ...prev,
      [playerId]: rating
    }));
  };
  
  // Save stats mutation
  const saveStatsMutation = useMutation({
    mutationFn: async () => {
      const quarters = ['1', '2', '3', '4'];
      const savePromises = [];
      const ratingPromises = [];
      
      // First handle player ratings update
      
      // First, identify the latest quarter 1 stats for each player
      const quarter1StatsByPlayer: Record<number, GameStat> = {};
      
      // Find the most recent quarter 1 stats for each player
      gameStats.forEach(stat => {
        if (stat.quarter === 1) {
          // Only keep the latest stat record for each player in quarter 1
          if (!quarter1StatsByPlayer[stat.playerId] || stat.id > quarter1StatsByPlayer[stat.playerId].id) {
            quarter1StatsByPlayer[stat.playerId] = stat;
          }
        }
      });
      
      // Process rating updates for all players in the first quarter
      Object.entries(playerRatings).forEach(([playerIdStr, rating]) => {
        const playerId = parseInt(playerIdStr);
        if (isNaN(playerId)) return;
        
        // Find the player's quarter 1 stat record
        const stat = quarter1StatsByPlayer[playerId];
        
        if (stat) {
          console.log(`UPDATING RATING: Player ${playerId} - changing from ${stat.rating} to ${rating} (stat ID: ${stat.id})`);
          
          // Update only the rating field
          const ratingUpdatePromise = apiRequest('PATCH', `/api/gamestats/${stat.id}`, {
            rating: rating
          });
          
          ratingPromises.push(ratingUpdatePromise);
        } else {
          console.log(`WARNING: No quarter 1 stat found for player ${playerId}, creating new stat with rating ${rating}`);
          
          // Create a new stat record for quarter 1 with the rating
          const newStatData = {
            gameId,
            playerId,
            quarter: 1,
            goalsFor: 0,
            goalsAgainst: 0,
            missedGoals: 0,
            rebounds: 0,
            intercepts: 0,
            badPass: 0,
            handlingError: 0,
            pickUp: 0,
            infringement: 0,
            rating: rating
          };
          
          // Create a new stat record for quarter 1 with the rating
          const createRatingPromise = apiRequest('POST', '/api/gamestats', newStatData);
          ratingPromises.push(createRatingPromise);
        }
      });
      
      // Wait for all rating updates to complete before updating other stats
      await Promise.all(ratingPromises);
      console.log("Successfully updated all player ratings");
      
      // Now update all the regular stats for all players and quarters
      for (const quarter of quarters) {
        const quarterValues = formValues[quarter] || {};
        
        for (const playerIdStr in quarterValues) {
          const playerId = parseInt(playerIdStr);
          if (isNaN(playerId)) continue;
          
          const playerValues = quarterValues[playerId];
          
          // Skip empty sets of values
          if (!playerValues) continue;
          
          // Skip players who have all zeros
          const allZeros = Object.values(playerValues).every(v => parseInt(v) === 0);
          
          // Only create/update stats if there's meaningful data
          if (allZeros) {
            console.log(`Skipping player ${playerId} in quarter ${quarter} - all values are zero`);
            continue;
          }
          
          // Convert string values to numbers for saving
          const statValues = {
            gameId,
            playerId,
            quarter: parseInt(quarter),
            goalsFor: parseInt(playerValues.goalsFor || '0'),
            goalsAgainst: parseInt(playerValues.goalsAgainst || '0'),
            missedGoals: parseInt(playerValues.missedGoals || '0'),
            rebounds: parseInt(playerValues.rebounds || '0'),
            intercepts: parseInt(playerValues.intercepts || '0'),
            badPass: parseInt(playerValues.badPass || '0'),
            handlingError: parseInt(playerValues.handlingError || '0'),
            pickUp: parseInt(playerValues.pickUp || '0'),
            infringement: parseInt(playerValues.infringement || '0'),
            // Keep existing rating or default to 5
            rating: quarter === '1' ? (playerRatings[playerId] || 5) : undefined
          };
          
          // Find if this player already has stats for this quarter
          const existingStat = gameStats.find(
            stat => stat.gameId === gameId && 
                   stat.playerId === playerId && 
                   stat.quarter === parseInt(quarter)
          );
          
          if (existingStat) {
            console.log(`Updating stats for player ${playerId} in quarter ${quarter}`);
            const updatePromise = apiRequest('PATCH', `/api/gamestats/${existingStat.id}`, statValues);
            savePromises.push(updatePromise);
          } else {
            console.log(`Creating new stats for player ${playerId} in quarter ${quarter}`);
            const createPromise = apiRequest('POST', '/api/gamestats', statValues);
            savePromises.push(createPromise);
          }
        }
      }
      
      await Promise.all(savePromises);
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Game statistics saved successfully.",
      });
      
      // Invalidate the relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/stats`] });
    },
    onError: (error) => {
      console.error("Error saving stats:", error);
      toast({
        title: "Error",
        description: "Failed to save game statistics. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Group players by the quarter they played in
  const playersByQuarter = (quarter: string): Player[] => {
    return rosters
      .filter(roster => String(roster.quarter) === quarter)
      .map(roster => {
        const player = players.find(p => p.id === roster.playerId);
        return player || null;
      })
      .filter((player): player is Player => player !== null)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  };
  
  // Get stat fields grouped by category
  const statCategories = [
    {
      name: 'Shooting',
      fields: [
        { id: 'goalsFor', label: 'Goals For' },
        { id: 'goalsAgainst', label: 'Goals Against' },
        { id: 'missedGoals', label: 'Missed Goals' }
      ]
    },
    {
      name: 'Defense',
      fields: [
        { id: 'intercepts', label: 'Intercepts' },
        { id: 'rebounds', label: 'Rebounds' },
        { id: 'pickUp', label: 'Pick Ups' }
      ]
    },
    {
      name: 'Errors',
      fields: [
        { id: 'badPass', label: 'Bad Passes' },
        { id: 'handlingError', label: 'Handling Errors' },
        { id: 'infringement', label: 'Infringements' }
      ]
    }
  ];
  
  // Helper function to get player's position in a specific quarter
  const getPlayerPosition = (playerId: number, quarter: string): string => {
    const quarterNum = parseInt(quarter);
    const roster = rosters.find(r => r.quarter === quarterNum && r.playerId === playerId);
    return roster ? roster.position : '';
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <Tabs defaultValue="1" onValueChange={setActiveQuarter}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="1">Quarter 1</TabsTrigger>
              <TabsTrigger value="2">Quarter 2</TabsTrigger>
              <TabsTrigger value="3">Quarter 3</TabsTrigger>
              <TabsTrigger value="4">Quarter 4</TabsTrigger>
              <TabsTrigger value="totals">Game Totals</TabsTrigger>
            </TabsList>
            
            <Button 
              variant="default" 
              onClick={() => saveStatsMutation.mutate()}
              disabled={saveStatsMutation.isPending}
              className="ml-2"
            >
              <Save className="w-4 h-4 mr-2" /> Save Stats
            </Button>
          </div>
          
          {/* Quarter tabs */}
          {['1', '2', '3', '4'].map(quarter => (
            <TabsContent key={quarter} value={quarter} className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="min-w-[150px]">Player</TableHead>
                      <TableHead className="text-center w-10"></TableHead>
                      
                      {/* Stat category headers */}
                      {statCategories.map((category) => (
                        <TableHead 
                          key={category.name} 
                          colSpan={category.fields.length}
                          className="text-center bg-blue-50 border-l border-r"
                        >
                          {category.name}
                        </TableHead>
                      ))}
                    </TableRow>
                    
                    {/* Stat field headers */}
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      
                      {statCategories.map((category) => (
                        category.fields.map((field) => (
                          <TableHead key={field.id} className="text-center px-1 py-2 min-w-[80px]">
                            {field.label}
                          </TableHead>
                        ))
                      ))}
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {playersByQuarter(quarter).map(player => (
                      <TableRow key={player.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          {player.displayName}
                        </TableCell>
                        
                        <TableCell className="text-center font-medium">
                          {getPlayerPosition(player.id, quarter)}
                        </TableCell>
                        
                        {/* Stat inputs by category */}
                        {statCategories.map((category) => (
                          category.fields.map((field) => (
                            <TableCell key={field.id} className="p-1 text-center">
                              <div className="flex flex-col items-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 mb-1" 
                                  onClick={() => adjustStatValue(quarter, player.id, field.id, 1)}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  className="h-9 w-16 text-center"
                                  value={formValues[quarter]?.[player.id]?.[field.id] || '0'}
                                  onChange={(e) => handleInputChange(quarter, player.id, field.id, e.target.value)}
                                />
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 mt-1" 
                                  onClick={() => adjustStatValue(quarter, player.id, field.id, -1)}
                                  disabled={parseInt(formValues[quarter]?.[player.id]?.[field.id] || '0') <= 0}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          ))
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
          
          {/* Game Totals tab */}
          <TabsContent value="totals">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="min-w-[200px]">Player</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    
                    {/* Stat category headers for totals */}
                    {statCategories.map((category) => (
                      <TableHead 
                        key={category.name} 
                        colSpan={category.fields.length}
                        className="text-center bg-blue-50 border-l border-r"
                      >
                        {category.name}
                      </TableHead>
                    ))}
                  </TableRow>
                  
                  {/* Stat field headers */}
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    
                    {statCategories.map((category) => (
                      category.fields.map((field) => (
                        <TableHead key={field.id} className="text-center px-1 py-2 min-w-[80px]">
                          {field.label}
                        </TableHead>
                      ))
                    ))}
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {players.map(player => (
                    <TableRow key={player.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">
                        {player.displayName}
                      </TableCell>
                      
                      <TableCell className="p-1 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          className="h-9 w-16 text-center mx-auto"
                          value={playerRatings[player.id] || '5'}
                          onChange={(e) => handleRatingChange(player.id, e.target.value)}
                        />
                      </TableCell>
                      
                      {/* Game totals display by category */}
                      {statCategories.map((category) => (
                        category.fields.map((field) => (
                          <TableCell key={field.id} className="text-center">
                            <div className="bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                              {gameTotals[player.id]?.[field.id] || 0}
                            </div>
                          </TableCell>
                        ))
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}