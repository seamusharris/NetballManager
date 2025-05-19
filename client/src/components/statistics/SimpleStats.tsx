import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
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
    
    // Initialize player totals
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
    
    // Sum up stats across all quarters
    Object.keys(formValues).forEach(quarter => {
      const quarterData = formValues[quarter];
      Object.keys(quarterData).forEach(playerIdStr => {
        const playerId = parseInt(playerIdStr);
        if (isNaN(playerId)) return;
        
        const playerData = quarterData[playerId];
        if (!playerData) return;
        
        // Sum up values for this player across quarters
        Object.keys(playerData).forEach(stat => {
          const value = parseInt(playerData[stat] || '0');
          if (!isNaN(value)) {
            totals[playerId][stat] += value;
          }
        });
      });
    });
    
    return totals;
  };
  
  // Initialize form values when component mounts or gameStats/rosters change
  useEffect(() => {
    console.log("Initializing SimpleStats form with", gameStats?.length, "stats");
    
    // Create default empty values
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
          
          // Convert to strings and handle null values
          initialValues[quarter][playerId].goalsFor = String(latestStat.goalsFor || 0);
          initialValues[quarter][playerId].goalsAgainst = String(latestStat.goalsAgainst || 0);
          initialValues[quarter][playerId].missedGoals = String(latestStat.missedGoals || 0);
          initialValues[quarter][playerId].rebounds = String(latestStat.rebounds || 0);
          initialValues[quarter][playerId].intercepts = String(latestStat.intercepts || 0);
          initialValues[quarter][playerId].badPass = String(latestStat.badPass || 0);
          initialValues[quarter][playerId].handlingError = String(latestStat.handlingError || 0);
          initialValues[quarter][playerId].pickUp = String(latestStat.pickUp || 0);
          initialValues[quarter][playerId].infringement = String(latestStat.infringement || 0);
          
          // Store rating information for quarter 1 stats
          if (quarter === '1' && latestStat.rating !== undefined && latestStat.rating !== null) {
            firstQuarterRatings[playerId] = { 
              rating: latestStat.rating, 
              statId: latestStat.id 
            };
          }
        });
      });
      
      // Extract player ratings from quarter 1 stats
      const playerRatingMap: Record<number, number> = {};
      
      // Set player ratings from the first quarter stats
      Object.entries(firstQuarterRatings).forEach(([playerIdStr, data]) => {
        const playerId = parseInt(playerIdStr);
        playerRatingMap[playerId] = data.rating;
        console.log(`Setting rating for player ${playerId} to ${data.rating} from quarter 1 (stat ID: ${data.statId})`);
      });
      
      // Log all the ratings we found
      console.log("Found player ratings:", Object.entries(playerRatingMap).map(([id, rating]) => `Player ${id}: ${rating}`).join(", "));
      
      // Set the player ratings in the component state
      setPlayerRatings(playerRatingMap);
    }
    
    setFormValues(initialValues);
  }, [gameStats, rosters]);
  
  // Handle input change
  const handleChange = (quarter: string, playerId: number, field: string, value: string) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    setFormValues(prev => {
      const newValues = { ...prev };
      
      if (!newValues[quarter]) {
        newValues[quarter] = {};
      }
      
      if (!newValues[quarter][playerId]) {
        newValues[quarter][playerId] = {
          goalsFor: '0',
          goalsAgainst: '0',
          missedGoals: '0',
          rebounds: '0',
          intercepts: '0',
          badPass: '0',
          handlingError: '0',
          infringement: '0'
        };
      }
      
      newValues[quarter][playerId][field] = value;
      return newValues;
    });
  };
  
  // Update game totals whenever form values change
  useEffect(() => {
    const totals = calculateGameTotals();
    setGameTotals(totals);
  }, [formValues]);
  
  // Save stats mutation for ALL quarters
  const saveMutation = useMutation({
    mutationFn: async () => {
      console.log("STARTING SAVE OPERATION");
      console.log("Current player ratings:", JSON.stringify(playerRatings));
      
      const quarters = ['1', '2', '3', '4'];
      const promises: Promise<any>[] = [];
      
      // CRITICAL: We MUST save ratings first to ensure they're included in the database
      // We'll do this by directly updating the quarter 1 stats with ratings
      const ratingPromises: Promise<any>[] = [];
      
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
          
          // Special case: If a player doesn't have quarter 1 stats (like Abbey N), 
          // create a new stat record for them in quarter 1 with the rating
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
          if (!playerValues) continue;
          
          // Convert form values to numbers
          const goalsFor = parseInt(playerValues.goalsFor || '0');
          const goalsAgainst = parseInt(playerValues.goalsAgainst || '0');
          const missedGoals = parseInt(playerValues.missedGoals || '0');
          const rebounds = parseInt(playerValues.rebounds || '0');
          const intercepts = parseInt(playerValues.intercepts || '0');
          const badPass = parseInt(playerValues.badPass || '0');
          const handlingError = parseInt(playerValues.handlingError || '0');
          const pickUp = parseInt(playerValues.pickUp || '0');
          const infringement = parseInt(playerValues.infringement || '0');
          
          // Find the most recent stat for this player and quarter
          const latestStat = gameStats
            .filter(s => s.quarter === parseInt(quarter) && s.playerId === playerId)
            .sort((a, b) => b.id - a.id)[0];
          
          // Basic stat data common to all quarters
          const statData: any = {
            gameId,
            playerId,
            quarter: parseInt(quarter),
            goalsFor,
            goalsAgainst,
            missedGoals,
            rebounds,
            intercepts,
            badPass,
            handlingError,
            pickUp,
            infringement
          };
          
          // If this is quarter 1, and we have a player rating, include it
          // This ensures new stats created for quarter 1 also get ratings
          if (quarter === '1' && playerRatings[playerId] !== undefined) {
            statData.rating = playerRatings[playerId];
            console.log(`Adding rating ${playerRatings[playerId]} to quarter 1 stats for player ${playerId}`);
          }
          
          if (latestStat) {
            // Update the existing stat
            promises.push(apiRequest('PATCH', `/api/gamestats/${latestStat.id}`, statData));
            console.log(`Updating existing stat ID ${latestStat.id} for player ${playerId}, quarter ${quarter}`);
          } else {
            // Create a new stat record
            promises.push(apiRequest('POST', '/api/gamestats', statData));
            console.log(`Creating new stat for player ${playerId}, quarter ${quarter}`);
          }
        }
      }
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "All Statistics Saved",
        description: `Statistics for all quarters have been saved successfully.`
      });
      
      // Refresh ALL game stats data to ensure the dashboard gets the latest data
      fetch(`/api/games/${gameId}/stats?_t=${Date.now()}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' } 
      })
        .then(res => res.json())
        .then(data => {
          console.log(`Refreshed ${data.length} game stat entries`);
          
          // Force React Query cache refresh - this makes sure all components re-fetch data
          setTimeout(() => {
            // Invalidate cached queries to ensure fresh data everywhere
            queryClient.invalidateQueries();
            console.log("Invalidated React Query cache to ensure data consistency");
            
            // Do another forced fetch to be absolutely sure the dashboard will update
            fetch(`/api/games/${gameId}/stats?_t=${Date.now()}`, { cache: 'no-store' })
              .catch(e => console.error("Error refreshing data:", e));
          }, 200);
          
          // Create new initial values
          const initialValues: Record<string, Record<number, Record<string, string>>> = {
            '1': {}, '2': {}, '3': {}, '4': {}
          };
          
          // Fill with roster players
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
                  infringement: '0'
                };
              }
            }
          });
          
          // Fill with refreshed stats
          data.forEach(stat => {
            if (!stat) return;
            
            const quarter = String(stat.quarter);
            const playerId = stat.playerId;
            
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
                infringement: '0'
              };
            }
            
            initialValues[quarter][playerId].goalsFor = String(stat.goalsFor || 0);
            initialValues[quarter][playerId].goalsAgainst = String(stat.goalsAgainst || 0);
            initialValues[quarter][playerId].missedGoals = String(stat.missedGoals || 0);
            initialValues[quarter][playerId].rebounds = String(stat.rebounds || 0);
            initialValues[quarter][playerId].intercepts = String(stat.intercepts || 0);
            initialValues[quarter][playerId].badPass = String(stat.badPass || 0);
            initialValues[quarter][playerId].handlingError = String(stat.handlingError || 0);
            initialValues[quarter][playerId].infringement = String(stat.infringement || 0);
          });
          
          setFormValues(initialValues);
        })
        .catch(err => {
          console.error("Error refreshing game stats:", err);
        });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving statistics",
        description: error.message || "There was a problem saving the statistics",
        variant: "destructive"
      });
    }
  });
  
  // Calculate score summary 
  const calculateSummary = () => {
    const quarterTotals = {
      '1': { team: 0, opponent: 0 },
      '2': { team: 0, opponent: 0 },
      '3': { team: 0, opponent: 0 },
      '4': { team: 0, opponent: 0 }
    };
    
    // Calculate from current form values
    Object.entries(formValues).forEach(([quarter, players]) => {
      if (quarter === '1' || quarter === '2' || quarter === '3' || quarter === '4') {
        Object.entries(players).forEach(([_, values]) => {
          const goalsFor = parseInt(values.goalsFor || '0');
          const goalsAgainst = parseInt(values.goalsAgainst || '0');
          
          if (!isNaN(goalsFor)) {
            quarterTotals[quarter].team += goalsFor;
          }
          
          if (!isNaN(goalsAgainst)) {
            quarterTotals[quarter].opponent += goalsAgainst;
          }
        });
      }
    });
    
    // Calculate game totals
    const gameTotals = {
      team: 0,
      opponent: 0
    };
    
    Object.values(quarterTotals).forEach(quarter => {
      gameTotals.team += quarter.team;
      gameTotals.opponent += quarter.opponent;
    });
    
    return { quarters: quarterTotals, game: gameTotals };
  };
  
  // Get position for a player
  const getPlayerPosition = (quarter: string, playerId: number) => {
    const quarterRoster = rosters.find(
      r => r.quarter === parseInt(quarter) && r.playerId === playerId
    );
    return quarterRoster ? quarterRoster.position : '';
  };
  
  // Get players for a quarter, ordered by position (GS, GA, WA, C, WD, GD, GK)
  const getPlayersForQuarter = (quarter: string) => {
    // Define position order
    const positionOrder = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
    
    // Get all roster entries for this quarter
    const quarterRosters = rosters.filter(
      roster => roster.quarter === parseInt(quarter)
    );
    
    // Sort by position according to defined order
    quarterRosters.sort((a, b) => {
      const posA = positionOrder.indexOf(a.position);
      const posB = positionOrder.indexOf(b.position);
      return posA - posB;
    });
    
    // Extract player IDs in correct order
    return quarterRosters.map(roster => roster.playerId);
  };
  
  // Get player by ID
  const getPlayerById = (playerId: number) => {
    return players.find(p => p.id === playerId);
  };
  
  // Render player form
  const renderPlayerForm = (quarter: string, playerId: number) => {
    const player = getPlayerById(playerId);
    if (!player) return null;
    
    const position = getPlayerPosition(quarter, playerId);
    const values = formValues[quarter]?.[playerId] || { 
      goalsFor: '0', 
      goalsAgainst: '0',
      missedGoals: '0',
      rebounds: '0',
      intercepts: '0',
      badPass: '0',
      handlingError: '0',
      infringement: '0'
    };
    
    return (
      <div className="p-4 border rounded-md mb-4" key={`${quarter}-${playerId}`}>
        <div className="flex justify-between mb-4">
          <div>
            <span className="font-medium">{player.displayName}</span>
            <span className="ml-2 text-gray-500">{position}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Goals For</label>
            <Input
              type="text"
              value={values.goalsFor || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'goalsFor', e.target.value)}
              className="text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Goals Against</label>
            <Input
              type="text"
              value={values.goalsAgainst || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'goalsAgainst', e.target.value)}
              className="text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Missed Goals</label>
            <Input
              type="text"
              value={values.missedGoals || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'missedGoals', e.target.value)}
              className="text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Rebounds</label>
            <Input
              type="text"
              value={values.rebounds || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'rebounds', e.target.value)}
              className="text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Intercepts</label>
            <Input
              type="text"
              value={values.intercepts || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'intercepts', e.target.value)}
              className="text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bad Pass</label>
            <Input
              type="text"
              value={values.badPass || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'badPass', e.target.value)}
              className="text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Handling Error</label>
            <Input
              type="text"
              value={values.handlingError || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'handlingError', e.target.value)}
              className="text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Infringement</label>
            <Input
              type="text"
              value={values.infringement || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'infringement', e.target.value)}
              className="text-center"
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Render score summary
  const renderScoreSummary = () => {
    const summary = calculateSummary();
    
    // Calculate running totals
    const runningTotals = {
      '1': { team: summary.quarters['1'].team, opponent: summary.quarters['1'].opponent },
      '2': { team: 0, opponent: 0 },
      '3': { team: 0, opponent: 0 },
      '4': { team: 0, opponent: 0 }
    };
    
    // Calculate cumulative totals
    for (let i = 2; i <= 4; i++) {
      runningTotals[i].team = runningTotals[i-1].team + summary.quarters[i].team;
      runningTotals[i].opponent = runningTotals[i-1].opponent + summary.quarters[i].opponent;
    }
    
    const getResultClass = () => {
      if (summary.game.team > summary.game.opponent) return "text-green-600 font-bold";
      if (summary.game.team < summary.game.opponent) return "text-red-600 font-bold";
      return "text-yellow-600 font-bold";
    };
    
    const getResultText = () => {
      if (summary.game.team > summary.game.opponent) return "Win";
      if (summary.game.team < summary.game.opponent) return "Loss";
      return "Draw";
    };
    
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Game Score Summary</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Quarter</th>
                  <th className="border p-2 text-center">Team</th>
                  <th className="border p-2 text-center">Opponent</th>
                  <th className="border p-2 text-center">Running Total (Team)</th>
                  <th className="border p-2 text-center">Running Total (Opponent)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.quarters).map(([quarter, scores]) => (
                  <tr key={quarter}>
                    <td className="border p-2 font-medium">Quarter {quarter}</td>
                    <td className="border p-2 text-center">{scores.team}</td>
                    <td className="border p-2 text-center">{scores.opponent}</td>
                    <td className="border p-2 text-center">{runningTotals[quarter].team}</td>
                    <td className="border p-2 text-center">{runningTotals[quarter].opponent}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="border p-2">Final Score</td>
                  <td className="border p-2 text-center">{summary.game.team}</td>
                  <td className="border p-2 text-center">{summary.game.opponent}</td>
                  <td className="border p-2 text-center">{summary.game.team}</td>
                  <td className="border p-2 text-center">{summary.game.opponent}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-right">
            <span className="mr-2">Result:</span>
            <span className={getResultClass()}>{getResultText()}</span>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      {renderScoreSummary()}
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <h3 className="text-xl font-semibold">Game Statistics</h3>
        <Button 
          onClick={() => saveMutation.mutate()} 
          disabled={saveMutation.isPending}
          className="bg-primary text-white hover:bg-primary-dark"
        >
          <Save className="mr-2 h-4 w-4" />
          Save All Statistics
        </Button>
      </div>
      
      <Tabs defaultValue="1" value={activeQuarter} onValueChange={setActiveQuarter}>
        <TabsList className="mb-4">
          <TabsTrigger value="1">Q1</TabsTrigger>
          <TabsTrigger value="2">Q2</TabsTrigger>
          <TabsTrigger value="3">Q3</TabsTrigger>
          <TabsTrigger value="4">Q4</TabsTrigger>
          <TabsTrigger value="total">Game Totals</TabsTrigger>
        </TabsList>
        
        {['1', '2', '3', '4'].map(quarter => (
          <TabsContent key={quarter} value={quarter}>
            <div className="space-y-4">
              {getPlayersForQuarter(quarter).length > 0 ? (
                getPlayersForQuarter(quarter).map(playerId => (
                  renderPlayerForm(quarter, playerId)
                ))
              ) : (
                <Card className="p-4">
                  <p className="text-center text-gray-500">No players in roster for this quarter.</p>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
        
        <TabsContent value="total">
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Game Totals</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Goals</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Goals Against</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Missed</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rebounds</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Intercepts</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bad Pass</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Handling</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pick Up</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Infringement</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating (0-10)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.keys(gameTotals).length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                          No statistics recorded yet
                        </td>
                      </tr>
                    ) : (
                      // Show all players who are in any roster for this game
                      players
                        // Don't filter - show all players who are in this game's rosters
                        .map(player => {
                          // Check if this player played in any quarter
                          const positions = [];
                          let playerWasInRoster = false;
                          
                          for (let q = 1; q <= 4; q++) {
                            const pos = getPlayerPosition(String(q), player.id);
                            if (pos) {
                              playerWasInRoster = true;
                              if (!positions.includes(pos)) {
                                positions.push(pos);
                              }
                            }
                          }
                          
                          // Skip players who didn't play in any quarter
                          if (!playerWasInRoster) {
                            return null;
                          }
                          
                          // If player has no stats, initialize with zeros
                          const stats = gameTotals[player.id] || {
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
                          
                          return (
                            <tr key={player.id}>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <div className="text-sm font-medium text-gray-900">{player.displayName}</div>
                                  <div className="text-xs text-gray-500">{positions.join(', ')}</div>
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.goalsFor || 0}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.goalsAgainst || 0}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.missedGoals || 0}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.rebounds || 0}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.intercepts || 0}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.badPass || 0}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.handlingError || 0}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.pickUp || 0}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.infringement || 0}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={playerRatings[player.id] ?? 0}
                                  onChange={(e) => {
                                    const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                                    console.log(`Setting new rating for player ${player.id}: ${value}`);
                                    
                                    // Update the rating in playerRatings state for this player
                                    const updatedRatings = {
                                      ...playerRatings,
                                      [player.id]: value
                                    };
                                    
                                    // Make sure we have ratings for ALL players in the game
                                    // This is critical - any player who plays should have a rating
                                    rosters.forEach(roster => {
                                      const playerId = roster.playerId;
                                      if (playerId && !(playerId in updatedRatings)) {
                                        // If this player doesn't have a rating yet, set a default of 5
                                        updatedRatings[playerId] = 5;
                                        console.log(`Adding default rating 5 for player ${playerId} who didn't have one`);
                                      }
                                    });
                                    
                                    // Log the updated ratings
                                    console.log("Updated ratings:", Object.entries(updatedRatings)
                                      .map(([id, rating]) => `Player ${id}: ${rating}`)
                                      .join(", "));
                                      
                                    setPlayerRatings(updatedRatings);
                                  }}
                                  className="w-16 text-center mx-auto"
                                />
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}