import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RotateCcw, Trash2 } from 'lucide-react';
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

interface StatisticsFormProps {
  gameId: number;
  players: Player[];
  rosters: Roster[];
  gameStats: GameStat[];
}

export default function StatisticsForm({ gameId, players, rosters, gameStats }: StatisticsFormProps) {
  const [activeTab, setActiveTab] = useState('1');
  const [playerStats, setPlayerStats] = useState<Record<string, Record<number, Record<string, string>>>>({});
  const [resetAllDialogOpen, setResetAllDialogOpen] = useState(false);
  const [resetQuarterDialogOpen, setResetQuarterDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Initialize player stats from database values
  const initPlayerStats = () => {
    const initialStats: Record<string, Record<number, Record<string, string>>> = {
      '1': {}, '2': {}, '3': {}, '4': {}
    };
    
    // Get players by quarter
    const quarterPlayers: Record<string, number[]> = {
      '1': [], '2': [], '3': [], '4': []
    };
    
    // Group roster by quarter
    rosters.forEach(roster => {
      const quarterKey = roster.quarter.toString();
      if (quarterPlayers[quarterKey] && !quarterPlayers[quarterKey].includes(roster.playerId)) {
        quarterPlayers[quarterKey].push(roster.playerId);
      }
    });
    
    // Initialize with zero values for all players in roster
    Object.entries(quarterPlayers).forEach(([quarter, playerIds]) => {
      playerIds.forEach(playerId => {
        initialStats[quarter][playerId] = {
          goalsFor: '0',
          goalsAgainst: '0',
          missedGoals: '0',
          rebounds: '0',
          intercepts: '0',
          badPass: '0',
          handlingError: '0',
          infringement: '0'
        };
      });
    });
    
    // Populate with existing values from database
    gameStats.forEach(stat => {
      const quarter = stat.quarter.toString();
      const playerId = stat.playerId;
      
      if (initialStats[quarter] && initialStats[quarter][playerId]) {
        initialStats[quarter][playerId] = {
          goalsFor: stat.goalsFor.toString(),
          goalsAgainst: stat.goalsAgainst.toString(),
          missedGoals: stat.missedGoals.toString(),
          rebounds: stat.rebounds.toString(),
          intercepts: stat.intercepts.toString(),
          badPass: stat.badPass.toString(),
          handlingError: stat.handlingError.toString(),
          infringement: stat.infringement.toString()
        };
      }
    });
    
    return initialStats;
  };
  
  // Set initial player stats
  useState(() => {
    setPlayerStats(initPlayerStats());
  });
  
  // Handle input change
  const handleInputChange = (quarter: string, playerId: number, field: string, value: string) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    setPlayerStats(prevStats => {
      const newStats = { ...prevStats };
      
      if (!newStats[quarter]) {
        newStats[quarter] = {};
      }
      
      if (!newStats[quarter][playerId]) {
        newStats[quarter][playerId] = {
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
      
      newStats[quarter][playerId][field] = value;
      return newStats;
    });
  };
  
  // Calculate quarter totals
  const calculateQuarterTotals = () => {
    const totals: Record<string, { goalsFor: number, goalsAgainst: number }> = {
      '1': { goalsFor: 0, goalsAgainst: 0 },
      '2': { goalsFor: 0, goalsAgainst: 0 },
      '3': { goalsFor: 0, goalsAgainst: 0 },
      '4': { goalsFor: 0, goalsAgainst: 0 }
    };
    
    // Add up values from player stats
    Object.entries(playerStats).forEach(([quarter, players]) => {
      if (quarter === '1' || quarter === '2' || quarter === '3' || quarter === '4') {
        Object.values(players).forEach(stats => {
          totals[quarter].goalsFor += parseInt(stats.goalsFor || '0', 10);
          totals[quarter].goalsAgainst += parseInt(stats.goalsAgainst || '0', 10);
        });
      }
    });
    
    // Calculate game total
    const gameTotal = {
      goalsFor: totals['1'].goalsFor + totals['2'].goalsFor + totals['3'].goalsFor + totals['4'].goalsFor,
      goalsAgainst: totals['1'].goalsAgainst + totals['2'].goalsAgainst + totals['3'].goalsAgainst + totals['4'].goalsAgainst
    };
    
    return { quarters: totals, game: gameTotal };
  };
  
  // Reset all stats for current quarter
  const resetQuarterStats = () => {
    const quarter = activeTab;
    const quarterPlayerIds = getQuarterPlayers(quarter);
    
    const resetStats: Record<number, Record<string, string>> = {};
    
    // Initialize with zero values for all players in this quarter
    quarterPlayerIds.forEach(playerId => {
      resetStats[playerId] = {
        goalsFor: '0',
        goalsAgainst: '0',
        missedGoals: '0',
        rebounds: '0',
        intercepts: '0',
        badPass: '0',
        handlingError: '0',
        infringement: '0'
      };
    });
    
    // Update the player stats state
    setPlayerStats(prevStats => {
      const newStats = { ...prevStats };
      newStats[quarter] = resetStats;
      return newStats;
    });
    
    toast({
      title: "Quarter stats reset",
      description: `All statistics for Quarter ${quarter} have been reset to zero. Remember to save changes.`
    });
    
    setResetQuarterDialogOpen(false);
  };
  
  // Reset all stats for the game
  const resetAllStats = () => {
    // Initialize stats with zeroes for all quarters and players
    const newPlayerStats = initPlayerStats();
    
    // Clear all stat values
    Object.keys(newPlayerStats).forEach(quarter => {
      Object.keys(newPlayerStats[quarter]).forEach(playerIdStr => {
        const playerId = parseInt(playerIdStr);
        newPlayerStats[quarter][playerId] = {
          goalsFor: '0',
          goalsAgainst: '0',
          missedGoals: '0',
          rebounds: '0',
          intercepts: '0',
          badPass: '0',
          handlingError: '0',
          infringement: '0'
        };
      });
    });
    
    setPlayerStats(newPlayerStats);
    
    toast({
      title: "All game stats reset",
      description: "All statistics for this game have been reset to zero. Remember to save changes."
    });
    
    setResetAllDialogOpen(false);
  };
  
  // Delete stats mutation
  const deleteStatsMutation = useMutation({
    mutationFn: async (statId: number) => {
      return apiRequest('DELETE', `/api/games/${gameId}/stats/${statId}`);
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data after deletion
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
    }
  });
  
  // Save statistics mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const quarter = activeTab;
      const players = playerStats[quarter] || {};
      const promises = [];
      
      for (const playerIdStr in players) {
        const playerId = parseInt(playerIdStr);
        const playerValues = players[playerId];
        
        // Convert all values to numbers
        const statsData = {
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
          infringement: parseInt(playerValues.infringement || '0')
        };
        
        // Find existing stat record
        const existingStat = gameStats.find(
          s => s.gameId === gameId && s.playerId === playerId && s.quarter === parseInt(quarter)
        );
        
        if (existingStat) {
          // Update existing
          promises.push(apiRequest('PATCH', `/api/games/${gameId}/stats/${existingStat.id}`, statsData));
        } else {
          // Create new
          promises.push(apiRequest('POST', `/api/games/${gameId}/stats`, statsData));
        }
      }
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Statistics saved",
        description: `Quarter ${activeTab} statistics have been saved successfully.`
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
      
      // Also invalidate the main games query to update scores on the Games page
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving statistics",
        description: error.message || "There was a problem saving the statistics",
        variant: "destructive"
      });
    }
  });
  
  // Get player by ID
  const getPlayer = (playerId: number) => {
    return players.find(p => p.id === playerId);
  };
  
  // Get position for player in current quarter
  const getPosition = (quarter: string, playerId: number) => {
    const playerRoster = rosters.find(
      r => r.quarter === parseInt(quarter) && r.playerId === playerId
    );
    return playerRoster ? playerRoster.position : '';
  };
  
  // Get players for a quarter
  const getQuarterPlayers = (quarter: string) => {
    const playerIds: number[] = [];
    
    rosters.forEach(roster => {
      if (roster.quarter.toString() === quarter && !playerIds.includes(roster.playerId)) {
        playerIds.push(roster.playerId);
      }
    });
    
    return playerIds;
  };
  
  // Render quarter content
  const renderQuarterContent = (quarter: string) => {
    const playerIds = getQuarterPlayers(quarter);
    
    if (playerIds.length === 0) {
      return (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-gray-500">No players assigned for this quarter.</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {playerIds.map(playerId => {
          const player = getPlayer(playerId);
          if (!player) return null;
          
          const position = getPosition(quarter, playerId);
          const stats = playerStats[quarter]?.[playerId] || {
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
            <Card key={playerId} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{player.displayName}</h3>
                    <p className="text-sm text-gray-500">{position}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatField 
                    label="Goals For"
                    value={stats.goalsFor}
                    onChange={(value) => handleInputChange(quarter, playerId, 'goalsFor', value)}
                  />
                  <StatField 
                    label="Goals Against"
                    value={stats.goalsAgainst}
                    onChange={(value) => handleInputChange(quarter, playerId, 'goalsAgainst', value)}
                  />
                  <StatField 
                    label="Missed Goals"
                    value={stats.missedGoals}
                    onChange={(value) => handleInputChange(quarter, playerId, 'missedGoals', value)}
                  />
                  <StatField 
                    label="Rebounds"
                    value={stats.rebounds}
                    onChange={(value) => handleInputChange(quarter, playerId, 'rebounds', value)}
                  />
                  <StatField 
                    label="Intercepts"
                    value={stats.intercepts}
                    onChange={(value) => handleInputChange(quarter, playerId, 'intercepts', value)}
                  />
                  <StatField 
                    label="Bad Pass"
                    value={stats.badPass}
                    onChange={(value) => handleInputChange(quarter, playerId, 'badPass', value)}
                  />
                  <StatField 
                    label="Handling Error"
                    value={stats.handlingError}
                    onChange={(value) => handleInputChange(quarter, playerId, 'handlingError', value)}
                  />
                  <StatField 
                    label="Infringement"
                    value={stats.infringement}
                    onChange={(value) => handleInputChange(quarter, playerId, 'infringement', value)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  const totals = calculateQuarterTotals();
  
  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Game Score Summary</h3>
          
          <div className="grid grid-cols-5 gap-2 text-center font-medium mb-4">
            <div>Quarter</div>
            <div>Q1</div>
            <div>Q2</div>
            <div>Q3</div>
            <div>Q4</div>
            
            <div>Our Team</div>
            <div>{totals.quarters['1'].goalsFor}</div>
            <div>{totals.quarters['2'].goalsFor}</div>
            <div>{totals.quarters['3'].goalsFor}</div>
            <div>{totals.quarters['4'].goalsFor}</div>
            
            <div>Opponent</div>
            <div>{totals.quarters['1'].goalsAgainst}</div>
            <div>{totals.quarters['2'].goalsAgainst}</div>
            <div>{totals.quarters['3'].goalsAgainst}</div>
            <div>{totals.quarters['4'].goalsAgainst}</div>
          </div>
          
          <div className="flex justify-between items-center p-2 rounded-md bg-gray-100">
            <div className="font-medium">Final Score:</div>
            <div className="text-xl font-bold">
              {totals.game.goalsFor} - {totals.game.goalsAgainst}
            </div>
            <div className="text-sm font-medium">
              {totals.game.goalsFor > totals.game.goalsAgainst ? (
                <span className="text-primary">Win</span>
              ) : totals.game.goalsFor < totals.game.goalsAgainst ? (
                <span className="text-red-500">Loss</span>
              ) : (
                <span className="text-amber-500">Draw</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="space-x-2">
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
        </div>
        
        <Button 
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-primary hover:bg-primary-light text-white"
        >
          <Save className="w-4 h-4 mr-2" /> Save Statistics
        </Button>
      </div>
      
      {/* Reset Quarter Confirmation Dialog */}
      <AlertDialog open={resetQuarterDialogOpen} onOpenChange={setResetQuarterDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Quarter Statistics</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all statistics for Quarter {activeTab} to zero. 
              This action only affects the form and won't be saved until you click "Save Statistics".
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
              This action only affects the form and won't be saved until you click "Save Statistics".
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
      
      {/* Quarter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="1">Quarter 1</TabsTrigger>
          <TabsTrigger value="2">Quarter 2</TabsTrigger>
          <TabsTrigger value="3">Quarter 3</TabsTrigger>
          <TabsTrigger value="4">Quarter 4</TabsTrigger>
        </TabsList>
        
        <TabsContent value="1" className="mt-4">
          {renderQuarterContent('1')}
        </TabsContent>
        
        <TabsContent value="2" className="mt-4">
          {renderQuarterContent('2')}
        </TabsContent>
        
        <TabsContent value="3" className="mt-4">
          {renderQuarterContent('3')}
        </TabsContent>
        
        <TabsContent value="4" className="mt-4">
          {renderQuarterContent('4')}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple input field component
function StatField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-md p-2 w-full text-center"
      />
    </div>
  );
}