import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [formValues, setFormValues] = useState<Record<string, Record<number, Record<string, string>>>>({});
  const { toast } = useToast();
  
  // Initialize form values
  useEffect(() => {
    try {
      // Create default empty values
      const initialValues: Record<string, Record<number, Record<string, string>>> = {
        '1': {},
        '2': {},
        '3': {},
        '4': {}
      };
      
      // Group rosters by quarter
      const quarterPlayers: Record<string, number[]> = {
        '1': [],
        '2': [],
        '3': [],
        '4': []
      };
      
      // Get players for each quarter
      rosters.forEach(roster => {
        if (roster && roster.quarter) {
          const quarter = String(roster.quarter);
          if (quarterPlayers[quarter] && !quarterPlayers[quarter].includes(roster.playerId)) {
            quarterPlayers[quarter].push(roster.playerId);
          }
        }
      });
      
      // Initialize with zeroes
      Object.entries(quarterPlayers).forEach(([quarter, playerIds]) => {
        playerIds.forEach(playerId => {
          if (!initialValues[quarter][playerId]) {
            initialValues[quarter][playerId] = {
              goalsFor: '0',
              goalsAgainst: '0'
            };
          }
        });
      });
      
      // Fill in with existing values
      if (gameStats && gameStats.length > 0) {
        gameStats.forEach(stat => {
          if (!stat) return;
          
          const quarter = String(stat.quarter);
          const playerId = stat.playerId;
          
          if (initialValues[quarter] && playerId) {
            if (!initialValues[quarter][playerId]) {
              initialValues[quarter][playerId] = {};
            }
            
            initialValues[quarter][playerId].goalsFor = String(stat.goalsFor || '0');
            initialValues[quarter][playerId].goalsAgainst = String(stat.goalsAgainst || '0');
            initialValues[quarter][playerId].missedGoals = String(stat.missedGoals || '0');
            initialValues[quarter][playerId].rebounds = String(stat.rebounds || '0');
            initialValues[quarter][playerId].intercepts = String(stat.intercepts || '0');
            initialValues[quarter][playerId].badPass = String(stat.badPass || '0');
            initialValues[quarter][playerId].handlingError = String(stat.handlingError || '0');
            initialValues[quarter][playerId].infringement = String(stat.infringement || '0');
          }
        });
      }
      
      setFormValues(initialValues);
    } catch (error) {
      console.error("Error initializing form values:", error);
    }
  }, [rosters, gameStats]);
  
  // Handle input change
  const handleChange = (quarter: string, playerId: number, field: string, value: string) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    setFormValues(prev => {
      try {
        const newValues = { ...prev };
        
        if (!newValues[quarter]) {
          newValues[quarter] = {};
        }
        
        if (!newValues[quarter][playerId]) {
          newValues[quarter][playerId] = {
            goalsFor: '0',
            goalsAgainst: '0'
          };
        }
        
        newValues[quarter][playerId][field] = value;
        return newValues;
      } catch (error) {
        console.error("Error updating form values:", error);
        return prev;
      }
    });
  };
  
  // Save stats mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const quarter = activeQuarter;
      const quarterValues = formValues[quarter] || {};
      const promises = [];
      
      for (const playerIdStr in quarterValues) {
        const playerId = parseInt(playerIdStr);
        if (isNaN(playerId)) continue;
        
        const playerValues = quarterValues[playerId];
        
        // Convert values to numbers
        const goalsFor = parseInt(playerValues.goalsFor || '0');
        const goalsAgainst = parseInt(playerValues.goalsAgainst || '0');
        
        // Find existing stat
        const existingStat = gameStats.find(
          s => s && s.gameId === gameId && s.playerId === playerId && s.quarter === parseInt(quarter)
        );
        
        // Parse all values from form
        const missedGoals = parseInt(playerValues.missedGoals || '0');
        const rebounds = parseInt(playerValues.rebounds || '0');
        const intercepts = parseInt(playerValues.intercepts || '0');
        const badPass = parseInt(playerValues.badPass || '0');
        const handlingError = parseInt(playerValues.handlingError || '0');
        const infringement = parseInt(playerValues.infringement || '0');
        
        const statData = {
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
          infringement
        };
        
        if (existingStat) {
          // Update existing
          promises.push(apiRequest('PATCH', `/api/gamestats/${existingStat.id}`, statData));
        } else {
          // Create new
          promises.push(apiRequest('POST', '/api/gamestats', statData));
        }
      }
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Statistics saved",
        description: `Quarter ${activeQuarter} statistics have been saved successfully.`
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
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
        Object.values(players).forEach(values => {
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
      r => r && r.quarter === parseInt(quarter) && r.playerId === playerId
    );
    return quarterRoster ? quarterRoster.position : '';
  };
  
  // Get players for a quarter, ordered by position (GS, GA, WA, C, WD, GD, GK)
  const getPlayersForQuarter = (quarter: string) => {
    // Define position order
    const positionOrder = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
    
    // Get all roster entries for this quarter
    const quarterRosters = rosters.filter(
      roster => roster && roster.quarter === parseInt(quarter)
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
    const values = formValues[quarter]?.[playerId] || { goalsFor: '0', goalsAgainst: '0' };
    
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
            <input
              type="text"
              value={values.goalsFor || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'goalsFor', e.target.value)}
              className="w-full p-2 border rounded-md text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Goals Against</label>
            <input
              type="text"
              value={values.goalsAgainst || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'goalsAgainst', e.target.value)}
              className="w-full p-2 border rounded-md text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Missed Goals</label>
            <input
              type="text"
              value={values.missedGoals || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'missedGoals', e.target.value)}
              className="w-full p-2 border rounded-md text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Rebounds</label>
            <input
              type="text"
              value={values.rebounds || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'rebounds', e.target.value)}
              className="w-full p-2 border rounded-md text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Intercepts</label>
            <input
              type="text"
              value={values.intercepts || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'intercepts', e.target.value)}
              className="w-full p-2 border rounded-md text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bad Pass</label>
            <input
              type="text"
              value={values.badPass || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'badPass', e.target.value)}
              className="w-full p-2 border rounded-md text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Handling Error</label>
            <input
              type="text"
              value={values.handlingError || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'handlingError', e.target.value)}
              className="w-full p-2 border rounded-md text-center"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Infringement</label>
            <input
              type="text"
              value={values.infringement || '0'}
              onChange={(e) => handleChange(quarter, playerId, 'infringement', e.target.value)}
              className="w-full p-2 border rounded-md text-center"
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Render quarter content
  const renderQuarterContent = (quarter: string) => {
    const players = getPlayersForQuarter(quarter);
    
    if (players.length === 0) {
      return (
        <div className="text-center p-4">
          <p className="text-gray-500">No players assigned to this quarter.</p>
        </div>
      );
    }
    
    return (
      <div>
        {players.map(playerId => renderPlayerForm(quarter, playerId))}
      </div>
    );
  };
  
  const summary = calculateSummary();
  
  return (
    <div className="space-y-6">
      {/* Game Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Game Score Summary</h3>
          
          <div className="grid grid-cols-5 gap-2 text-center mb-4">
            <div className="font-medium">Quarter</div>
            <div className="font-medium">Q1</div>
            <div className="font-medium">Q2</div>
            <div className="font-medium">Q3</div>
            <div className="font-medium">Q4</div>
            
            <div className="font-medium">Our Team</div>
            <div>{summary.quarters['1'].team}</div>
            <div>{summary.quarters['2'].team}</div>
            <div>{summary.quarters['3'].team}</div>
            <div>{summary.quarters['4'].team}</div>
            
            <div className="font-medium">Opponent</div>
            <div>{summary.quarters['1'].opponent}</div>
            <div>{summary.quarters['2'].opponent}</div>
            <div>{summary.quarters['3'].opponent}</div>
            <div>{summary.quarters['4'].opponent}</div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
            <div className="font-medium">Final Score:</div>
            <div className="text-xl font-bold">{summary.game.team} - {summary.game.opponent}</div>
            <div>
              {summary.game.team > summary.game.opponent ? (
                <span className="text-primary font-medium">Win</span>
              ) : summary.game.team < summary.game.opponent ? (
                <span className="text-red-500 font-medium">Loss</span>
              ) : (
                <span className="text-amber-500 font-medium">Draw</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-primary text-white"
        >
          <Save className="w-4 h-4 mr-2" /> Save Statistics
        </Button>
      </div>
      
      {/* Quarter Tabs */}
      <Tabs value={activeQuarter} onValueChange={setActiveQuarter}>
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