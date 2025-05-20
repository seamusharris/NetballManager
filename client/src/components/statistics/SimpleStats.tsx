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
import { Save, ChevronDown, ChevronUp, RotateCcw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  // Add state for sorting the Game Totals table
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'} | null>(null);
  // State for reset confirmation dialogs
  const [resetQuarterDialogOpen, setResetQuarterDialogOpen] = useState(false);
  const [resetAllDialogOpen, setResetAllDialogOpen] = useState(false);
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
      
      // We need to update the game totals after the state is updated
      setTimeout(() => calculateGameTotals(), 0);
      
      return newValues;
    });
  };
  
  // Increment or decrement a stat value
  const adjustStatValue = (quarter: string, playerId: number, field: string, amount: number) => {
    const currentValue = parseInt(formValues[quarter]?.[playerId]?.[field] || '0');
    // Ensure value doesn't go below 0
    const newValue = Math.max(0, currentValue + amount);
    handleInputChange(quarter, playerId, field, String(newValue));
  };
  
  // Reset all stats for current quarter
  const resetQuarterStats = () => {
    const quarter = activeQuarter;
    
    // Get all players in this quarter
    const playersInQuarter: number[] = [];
    rosters.forEach(roster => {
      if (roster.quarter.toString() === quarter && !playersInQuarter.includes(roster.playerId)) {
        playersInQuarter.push(roster.playerId);
      }
    });
    
    // Reset stats for all players in this quarter
    setFormValues(prev => {
      const newValues = { ...prev };
      
      playersInQuarter.forEach(playerId => {
        if (!newValues[quarter]) {
          newValues[quarter] = {};
        }
        
        newValues[quarter][playerId] = {
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
      });
      
      return newValues;
    });
    
    // Recalculate game totals
    setTimeout(() => calculateGameTotals(), 0);
    
    toast({
      title: "Quarter stats reset",
      description: `All statistics for Quarter ${quarter} have been reset to zero. Remember to save changes.`
    });
    
    setResetQuarterDialogOpen(false);
  };
  
  // Reset all stats for the game
  const resetAllStats = () => {
    // Get all players in all quarters
    const playersByQuarter: Record<string, number[]> = {
      '1': [], '2': [], '3': [], '4': []
    };
    
    rosters.forEach(roster => {
      const quarter = roster.quarter.toString();
      if (!playersByQuarter[quarter].includes(roster.playerId)) {
        playersByQuarter[quarter].push(roster.playerId);
      }
    });
    
    // Reset all stats for all quarters
    setFormValues(prev => {
      const newValues = { ...prev };
      
      Object.entries(playersByQuarter).forEach(([quarter, playerIds]) => {
        if (!newValues[quarter]) {
          newValues[quarter] = {};
        }
        
        playerIds.forEach(playerId => {
          newValues[quarter][playerId] = {
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
        });
      });
      
      return newValues;
    });
    
    // Recalculate game totals
    setTimeout(() => calculateGameTotals(), 0);
    
    toast({
      title: "All game stats reset",
      description: "All statistics for this game have been reset to zero. Remember to save changes."
    });
    
    setResetAllDialogOpen(false);
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
      const savePromises: Promise<any>[] = [];
      const ratingPromises: Promise<any>[] = [];
      
      // First handle player ratings update
      
      // Process rating updates for all players in the first quarter
      Object.entries(playerRatings).forEach(([playerIdStr, rating]) => {
        const playerId = parseInt(playerIdStr);
        if (isNaN(playerId)) return;
        
        // Find all existing stats for this player in quarter 1
        const existingQuarter1Stats = gameStats.filter(stat => 
          stat.gameId === gameId && 
          stat.playerId === playerId && 
          stat.quarter === 1
        );
        
        // If there are multiple entries, handle duplicates
        if (existingQuarter1Stats.length > 1) {
          // Sort by ID descending (newest first)
          existingQuarter1Stats.sort((a, b) => b.id - a.id);
          
          // Keep the newest one
          const newestStat = existingQuarter1Stats[0];
          
          // Delete older duplicates - handle possible 404 errors if records were already deleted
          for (let i = 1; i < existingQuarter1Stats.length; i++) {
            const deletePromise = apiRequest('DELETE', `/api/gamestats/${existingQuarter1Stats[i].id}`)
              .catch(err => {
                console.log(`Stat record ${existingQuarter1Stats[i].id} already deleted, continuing...`);
                return null;
              });
            ratingPromises.push(deletePromise);
          }
          
          // Update the newest stat with the new rating
          console.log(`UPDATING RATING: Player ${playerId} - changing from ${newestStat.rating} to ${rating} (and deleting ${existingQuarter1Stats.length - 1} duplicates)`);
          const ratingUpdatePromise = apiRequest('PATCH', `/api/gamestats/${newestStat.id}`, {
            rating: rating
          });
          ratingPromises.push(ratingUpdatePromise);
        }
        // Just one existing stat, update it
        else if (existingQuarter1Stats.length === 1) {
          console.log(`UPDATING RATING: Player ${playerId} - changing from ${existingQuarter1Stats[0].rating} to ${rating}`);
          const ratingUpdatePromise = apiRequest('PATCH', `/api/gamestats/${existingQuarter1Stats[0].id}`, {
            rating: rating
          });
          ratingPromises.push(ratingUpdatePromise);
        }
        // No existing stats, create a new one
        else {
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
          
          const createRatingPromise = apiRequest('POST', '/api/gamestats', newStatData);
          ratingPromises.push(createRatingPromise);
        }
      });
      
      // Then save all stats for all quarters
      quarters.forEach(quarter => {
        const quarterData = formValues[quarter];
        
        for (const playerIdStr in quarterData) {
          const playerId = parseInt(playerIdStr);
          if (isNaN(playerId)) continue;
          
          // Find the player's stats for this quarter and game
          const existingStats = gameStats.filter(stat => 
            stat.gameId === gameId && 
            stat.playerId === playerId && 
            stat.quarter.toString() === quarter
          );
          
          // Get the form values for this player and quarter
          const formData = quarterData[playerId];
          
          // Create the stat data object
          const statData = {
            gameId,
            playerId, 
            quarter: parseInt(quarter),
            goalsFor: parseInt(formData.goalsFor) || 0,
            goalsAgainst: parseInt(formData.goalsAgainst) || 0,
            missedGoals: parseInt(formData.missedGoals) || 0,
            rebounds: parseInt(formData.rebounds) || 0,
            intercepts: parseInt(formData.intercepts) || 0,
            badPass: parseInt(formData.badPass) || 0,
            handlingError: parseInt(formData.handlingError) || 0,
            pickUp: parseInt(formData.pickUp) || 0,
            infringement: parseInt(formData.infringement) || 0,
            // Only include rating for quarter 1
            ...(quarter === '1' ? { rating: playerRatings[playerId] || 5 } : {})
          };
          
          // If there are multiple entries, handle duplicates
          if (existingStats.length > 1) {
            // Sort by ID descending (newest first)
            existingStats.sort((a, b) => b.id - a.id);
            
            // Keep the newest one
            const newestStat = existingStats[0];
            
            // Delete older duplicates
            for (let i = 1; i < existingStats.length; i++) {
              const deletePromise = apiRequest('DELETE', `/api/gamestats/${existingStats[i].id}`)
                .catch(err => {
                  console.log(`Stat record ${existingStats[i].id} already deleted, continuing...`);
                  return null;
                });
              savePromises.push(deletePromise);
            }
            
            // Update the newest stat with new values
            const updatePromise = apiRequest('PATCH', `/api/gamestats/${newestStat.id}`, statData);
            savePromises.push(updatePromise);
          }
          // Just one existing stat, update it
          else if (existingStats.length === 1) {
            const updatePromise = apiRequest('PATCH', `/api/gamestats/${existingStats[0].id}`, statData);
            savePromises.push(updatePromise);
          }
          // No existing stats, create a new one
          else {
            const createPromise = apiRequest('POST', '/api/gamestats', statData);
            savePromises.push(createPromise);
          }
        }
      });
      
      // Wait for all promises to complete
      await Promise.all([...ratingPromises, ...savePromises]);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Statistics saved",
        description: "All player statistics have been saved successfully."
      });
      
      // Invalidate the game stats query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/gamestats', gameId] });
    },
    onError: (error: any) => {
      console.error("Error saving stats:", error);
      toast({
        title: "Error saving statistics",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Define stat categories and fields
  const statCategories = [
    { 
      label: 'Shooting', 
      fields: [
        { id: 'goalsFor', label: 'Goals' },
        { id: 'goalsAgainst', label: 'Against' },
        { id: 'missedGoals', label: 'Missed' },
      ]
    },
    { 
      label: 'Defense', 
      fields: [
        { id: 'rebounds', label: 'Rebounds' },
        { id: 'intercepts', label: 'Intercepts' },
        { id: 'pickUp', label: 'Pick Ups' },
      ]
    },
    { 
      label: 'Errors', 
      fields: [
        { id: 'badPass', label: 'Bad Pass' },
        { id: 'handlingError', label: 'Handling' },
        { id: 'infringement', label: 'Infringement' },
      ]
    }
  ];
  
  // Get players in the current quarter, ordered by position
  const getPlayersInQuarter = (quarter: string) => {
    // Map players to their roster info
    const playersWithRoster = players
      .map(player => {
        const rosterEntry = rosters.find(
          r => r.playerId === player.id && r.quarter.toString() === quarter
        );
        
        return {
          player,
          roster: rosterEntry,
          position: rosterEntry?.position || 'Unknown'
        };
      })
      .filter(item => item.roster) // Only include players who have a roster entry for this quarter
      .sort((a, b) => {
        // Define position order: GS, GA, WA, C, WD, GD, GK
        const posOrder = { GS: 1, GA: 2, WA: 3, C: 4, WD: 5, GD: 6, GK: 7, Unknown: 8 };
        return posOrder[a.position as keyof typeof posOrder] - posOrder[b.position as keyof typeof posOrder];
      });
    
    return playersWithRoster;
  };
  
  // Get all players for the game totals view, also ordered by first quarter position
  const getAllPlayers = () => {
    // Get unique players from all quarters
    const uniquePlayerIds = new Set<number>();
    rosters.forEach(roster => uniquePlayerIds.add(roster.playerId));
    
    // Map player IDs to player objects with their quarter 1 position
    return Array.from(uniquePlayerIds)
      .map(playerId => {
        const player = players.find(p => p.id === playerId);
        if (!player) return null;
        
        // Find their position in quarter 1 (or earliest appearance)
        const playerRosters = rosters
          .filter(r => r.playerId === playerId)
          .sort((a, b) => a.quarter - b.quarter);
        
        const firstRoster = playerRosters[0];
        
        return {
          player,
          position: firstRoster?.position || 'Unknown',
          sortOrder: firstRoster?.quarter || 5 // Sort by earliest appearance, then position
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => {
        if (!a || !b) return 0;
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        
        // Define position order: GS, GA, WA, C, WD, GD, GK
        const posOrder = { GS: 1, GA: 2, WA: 3, C: 4, WD: 5, GD: 6, GK: 7, Unknown: 8 };
        return posOrder[a.position as keyof typeof posOrder] - posOrder[b.position as keyof typeof posOrder];
      })
      .map(item => item?.player) as Player[];
  };
  
  // Function to sort the players in game totals view
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Get sorted players for the game totals view
  const getSortedPlayersForTotals = () => {
    const allPlayers = getAllPlayers();
    
    // If no sorting config is set, return players sorted by position
    if (!sortConfig) {
      // Define position order: GS, GA, WA, C, WD, GD, GK
      const posOrder = { GS: 1, GA: 2, WA: 3, C: 4, WD: 5, GD: 6, GK: 7, Unknown: 8 };
      
      return [...allPlayers].sort((a, b) => {
        // Find their position in quarter 1 (or earliest appearance)
        const aRoster = rosters.find(r => r.playerId === a.id);
        const bRoster = rosters.find(r => r.playerId === b.id);
        
        const aPos = aRoster?.position || 'Unknown';
        const bPos = bRoster?.position || 'Unknown';
        
        return posOrder[aPos as keyof typeof posOrder] - posOrder[bPos as keyof typeof posOrder];
      });
    }
    
    // Otherwise sort by the selected column
    return [...allPlayers].sort((a, b) => {
      // Special case for player names
      if (sortConfig.key === 'name') {
        const aName = `${a.firstName} ${a.lastName}`;
        const bName = `${b.firstName} ${b.lastName}`;
        return sortConfig.direction === 'ascending' 
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
      
      // Get values for comparison
      const aValue = sortConfig.key === 'rating' 
        ? playerRatings[a.id] || 0
        : gameTotals[a.id]?.[sortConfig.key] || 0;
        
      const bValue = sortConfig.key === 'rating'
        ? playerRatings[b.id] || 0
        : gameTotals[b.id]?.[sortConfig.key] || 0;
      
      if (sortConfig.direction === 'ascending') {
        return aValue - bValue;
      }
      
      return bValue - aValue;
    });
  };
  
  return (
    <>
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
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setResetQuarterDialogOpen(true)}
                  variant="outline"
                  className="border-red-200 hover:bg-red-50 text-red-600"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset Quarter
                </Button>
                
                <Button 
                  onClick={() => setResetAllDialogOpen(true)}
                  variant="outline"
                  className="border-red-200 hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Reset All Stats
                </Button>
                
                <Button
                  variant="default" 
                  onClick={() => saveStatsMutation.mutate()}
                  disabled={saveStatsMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" /> Save Stats
                </Button>
              </div>
            </div>
            
            {/* Quarter tabs */}
            {['1', '2', '3', '4'].map(quarter => (
              <TabsContent key={quarter} value={quarter}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-36 border-r">Player</TableHead>
                        
                        {/* Create header cells for each stat category */}
                        {statCategories.map((category, categoryIndex) => (
                          <React.Fragment key={categoryIndex}>
                            {category.fields.map((field, fieldIndex) => {
                              // Add right border to last column in each category
                              const isLastInCategory = fieldIndex === category.fields.length - 1;
                              return (
                                <TableHead 
                                  key={field.id} 
                                  className={`text-center w-[100px] ${isLastInCategory ? 'border-r' : ''}`}
                                >
                                  {field.label}
                                </TableHead>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPlayersInQuarter(quarter).map(({ player, position }) => (
                        <TableRow key={player.id}>
                          <TableCell className="border-r font-medium">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full mr-2 flex items-center justify-center" 
                                style={{ backgroundColor: player.avatarColor || '#0ea5e9' }}>
                                <span className="text-xs text-white font-bold">
                                  {position}
                                </span>
                              </div>
                              <div className="truncate">
                                {player.displayName || `${player.firstName} ${player.lastName}`}
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* Stat fields */}
                          {statCategories.map((category, categoryIndex) => (
                            category.fields.map((field, fieldIndex) => {
                              // Add right border to last column in each category
                              const isLastInCategory = fieldIndex === category.fields.length - 1;
                              
                              return (
                                <TableCell 
                                  key={field.id} 
                                  className={`text-center w-[100px] ${isLastInCategory ? 'border-r' : ''}`}
                                >
                                  <div className="flex flex-col items-center justify-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 mb-1 hover:bg-transparent"
                                      onClick={() => {
                                        adjustStatValue(quarter, player.id, field.id, 1);
                                      }}
                                    >
                                      <ChevronUp className="h-4 w-4 text-blue-500" />
                                    </Button>
                                    
                                    <Input
                                      type="number"
                                      min="0"
                                      className="h-8 w-14 text-center"
                                      value={formValues[quarter]?.[player.id]?.[field.id] || '0'}
                                      onChange={(e) => {
                                        handleInputChange(quarter, player.id, field.id, e.target.value);
                                      }}
                                    />
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 mt-1 hover:bg-transparent"
                                      onClick={() => {
                                        adjustStatValue(quarter, player.id, field.id, -1);
                                      }}
                                      disabled={!formValues[quarter]?.[player.id]?.[field.id] || formValues[quarter][player.id][field.id] === '0'}
                                    >
                                      <ChevronDown className="h-4 w-4 text-blue-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              );
                            })
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
                <Table className="min-w-full">
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead 
                        className="w-40 border-r cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('name')}
                      >
                        Player
                        {sortConfig?.key === 'name' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </TableHead>
                      
                      <TableHead 
                        className="w-[100px] text-center border-r cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('rating')}
                      >
                        Rating
                        {sortConfig?.key === 'rating' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </TableHead>
                      
                      {/* Create header cells for each stat category */}
                      {statCategories.map((category, categoryIndex) => (
                        <React.Fragment key={categoryIndex}>
                          <TableHead className="text-center bg-gray-50 font-bold" colSpan={category.fields.length}>
                            {category.label}
                          </TableHead>
                        </React.Fragment>
                      ))}
                    </TableRow>
                    
                    <TableRow>
                      <TableHead className="w-40 border-r"></TableHead>
                      <TableHead className="w-[100px] text-center border-r"></TableHead>
                      
                      {/* Create header cells for each stat field */}
                      {statCategories.map((category, categoryIndex) => (
                        <React.Fragment key={categoryIndex}>
                          {category.fields.map((field, fieldIndex) => {
                            // Add right border to last column in each category
                            const isLastInCategory = fieldIndex === category.fields.length - 1;
                            
                            return (
                              <TableHead 
                                key={field.id} 
                                className={`text-center w-[100px] cursor-pointer hover:bg-gray-100 ${isLastInCategory ? 'border-r' : ''}`}
                                onClick={() => requestSort(field.id)}
                              >
                                {field.label}
                                {sortConfig?.key === field.id && (
                                  <span className="ml-1">
                                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                  </span>
                                )}
                              </TableHead>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {getSortedPlayersForTotals().map(player => (
                      <TableRow key={player.id}>
                        <TableCell className="border-r font-medium">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full mr-2 flex items-center justify-center" 
                              style={{ backgroundColor: player.avatarColor || '#0ea5e9' }}>
                              <span className="text-xs text-white font-bold">
                                {rosters.find(r => r.playerId === player.id)?.position || ''}
                              </span>
                            </div>
                            <div className="truncate">
                              {player.displayName || `${player.firstName} ${player.lastName}`}
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Player rating cell - this is editable */}
                        <TableCell className="border-r">
                          <div className="flex flex-col items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 mb-1 hover:bg-transparent"
                              onClick={() => {
                                const currentRating = playerRatings[player.id] || 5;
                                const newRating = Math.min(10, currentRating + 1);
                                setPlayerRatings(prev => ({...prev, [player.id]: newRating}));
                              }}
                              disabled={playerRatings[player.id] >= 10}
                            >
                              <ChevronUp className="h-4 w-4 text-blue-500" />
                            </Button>
                            
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              className="h-8 w-14 text-center"
                              value={playerRatings[player.id] || 5}
                              onChange={(e) => {
                                handleRatingChange(player.id, e.target.value);
                              }}
                            />
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 mt-1 hover:bg-transparent"
                              onClick={() => {
                                const currentRating = playerRatings[player.id] || 5;
                                const newRating = Math.max(0, currentRating - 1);
                                setPlayerRatings(prev => ({...prev, [player.id]: newRating}));
                              }}
                              disabled={playerRatings[player.id] <= 0}
                            >
                              <ChevronDown className="h-4 w-4 text-blue-500" />
                            </Button>
                          </div>
                        </TableCell>
                        
                        {/* Game totals display by category */}
                        {statCategories.map((category, categoryIndex) => (
                          category.fields.map((field, fieldIndex) => {
                            // Add right border to last column in each category
                            const isLastInCategory = fieldIndex === category.fields.length - 1;
                            return (
                              <TableCell 
                                key={field.id} 
                                className={`text-center w-[100px] ${isLastInCategory ? 'border-r' : ''}`}
                              >
                                <div className="bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                                  {gameTotals[player.id]?.[field.id] || 0}
                                </div>
                              </TableCell>
                            );
                          })
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
      
      {/* Reset Quarter Confirmation Dialog */}
      <AlertDialog open={resetQuarterDialogOpen} onOpenChange={setResetQuarterDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Quarter Statistics</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all statistics for Quarter {activeQuarter} to zero. 
              This action only affects the form and won&apos;t be saved until you click &quot;Save Stats&quot;.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={resetQuarterStats}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Reset Quarter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reset All Stats Confirmation Dialog */}
      <AlertDialog open={resetAllDialogOpen} onOpenChange={setResetAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Game Statistics</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all statistics for the entire game to zero.
              This action only affects the form and won&apos;t be saved until you click &quot;Save Stats&quot;.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={resetAllStats}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Reset All Statistics
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}