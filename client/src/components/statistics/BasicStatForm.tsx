import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import { Player, Roster, Position, GameStat } from '@shared/schema';
import { getInitials } from '@/lib/utils';

interface BasicStatFormProps {
  gameId: number;
  players: Player[];
  rosters: Roster[];
  existingStats: GameStat[];
}

export default function BasicStatForm({ 
  gameId, 
  players, 
  rosters, 
  existingStats 
}: BasicStatFormProps) {
  const [activeQuarter, setActiveQuarter] = useState('1');
  const [statValues, setStatValues] = useState<Record<string, Record<number, Record<string, string>>>>({});
  
  // Group rosters by quarter
  const rosterByQuarter: Record<string, Record<Position, number | null>> = {
    '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
  };
  
  // Populate roster data
  rosters.forEach(roster => {
    const quarterKey = roster.quarter.toString();
    if (rosterByQuarter[quarterKey]) {
      rosterByQuarter[quarterKey][roster.position] = roster.playerId;
    }
  });
  
  // Initialize stat values from existing stats
  useEffect(() => {
    const initialValues: Record<string, Record<number, Record<string, string>>> = {
      '1': {}, '2': {}, '3': {}, '4': {}
    };
    
    // Initialize with zeros for all players in the roster
    Object.entries(rosterByQuarter).forEach(([quarterKey, positions]) => {
      Object.values(positions).forEach(playerId => {
        if (playerId !== null) {
          initialValues[quarterKey][playerId] = {
            'goalsFor': '0',
            'goalsAgainst': '0',
            'missedGoals': '0',
            'rebounds': '0',
            'intercepts': '0',
            'badPass': '0',
            'handlingError': '0',
            'infringement': '0'
          };
        }
      });
    });
    
    // Fill in existing stat values
    if (existingStats && existingStats.length > 0) {
      existingStats.forEach(stat => {
        if (!stat) return;
        
        const quarterKey = stat.quarter?.toString() || '';
        const playerId = stat.playerId;
        
        if (quarterKey && playerId && initialValues[quarterKey] && initialValues[quarterKey][playerId]) {
          const statRecord = initialValues[quarterKey][playerId];
          
          // Update with actual values, safely converting to string
          if (stat.goalsFor !== undefined) statRecord.goalsFor = String(stat.goalsFor);
          if (stat.goalsAgainst !== undefined) statRecord.goalsAgainst = String(stat.goalsAgainst);
          if (stat.missedGoals !== undefined) statRecord.missedGoals = String(stat.missedGoals);
          if (stat.rebounds !== undefined) statRecord.rebounds = String(stat.rebounds);
          if (stat.intercepts !== undefined) statRecord.intercepts = String(stat.intercepts);
          if (stat.badPass !== undefined) statRecord.badPass = String(stat.badPass);
          if (stat.handlingError !== undefined) statRecord.handlingError = String(stat.handlingError);
          if (stat.infringement !== undefined) statRecord.infringement = String(stat.infringement);
        }
      });
    }
    
    setStatValues(initialValues);
  }, [rosters, existingStats]);
  
  // Save stats mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { 
      quarterKey: string, 
      stats: Record<number, Record<string, number>>
    }) => {
      const quarter = parseInt(quarterKey);
      const savePromises = [];
      
      console.log("Saving stats for quarter", quarter, stats);
      
      // For each player in this quarter's stats
      for (const playerIdStr in stats) {
        const playerId = parseInt(playerIdStr);
        const playerStats = stats[playerId];
        
        console.log(`Saving stats for player ${playerId}:`, playerStats);
        
        // Find existing stat record
        const existingStat = existingStats.find(
          s => s.gameId === gameId && s.playerId === playerId && s.quarter === quarter
        );
        
        // Make sure to include all required fields
        const completeStats = {
          gameId,
          playerId,
          quarter,
          goalsFor: playerStats.goalsFor || 0,
          goalsAgainst: playerStats.goalsAgainst || 0,
          missedGoals: playerStats.missedGoals || 0,
          rebounds: playerStats.rebounds || 0,
          intercepts: playerStats.intercepts || 0,
          badPass: playerStats.badPass || 0,
          handlingError: playerStats.handlingError || 0,
          infringement: playerStats.infringement || 0
        };
        
        if (existingStat) {
          // Update existing stat
          console.log(`Updating existing stat ID ${existingStat.id}`);
          savePromises.push(
            apiRequest('PATCH', `/api/games/${existingStat.gameId}/stats/${existingStat.id}`, completeStats)
          );
        } else {
          // Create new stat
          console.log(`Creating new stat for player ${playerId}`);
          savePromises.push(
            apiRequest('POST', `/api/games/${completeStats.gameId}/stats`, completeStats)
          );
        }
      }
      
      return Promise.all(savePromises);
    },
    onSuccess: () => {
      toast({
        title: "Statistics saved",
        description: `Quarter ${activeQuarter} statistics updated successfully`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/stats`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving statistics",
        description: error.message || "There was a problem saving the statistics",
        variant: "destructive",
      });
    }
  });
  
  // Handle input change
  const handleChange = (quarterKey: string, playerId: number, field: string, value: string) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    setStatValues(prev => {
      const newValues = { ...prev };
      
      if (!newValues[quarterKey]) {
        newValues[quarterKey] = {};
      }
      
      if (!newValues[quarterKey][playerId]) {
        newValues[quarterKey][playerId] = {};
      }
      
      newValues[quarterKey][playerId][field] = value;
      return newValues;
    });
  };
  
  // Handle save
  const handleSave = () => {
    const quarter = activeQuarter;
    const quarterStats = statValues[quarter] || {};
    
    console.log("Saving quarter", quarter, "with stats:", quarterStats);
    
    // Convert string values to numbers
    const numericStats: Record<number, Record<string, number>> = {};
    
    Object.entries(quarterStats).forEach(([playerIdStr, fields]) => {
      const playerId = parseInt(playerIdStr);
      if (isNaN(playerId)) return;
      
      numericStats[playerId] = {};
      
      Object.entries(fields).forEach(([field, value]) => {
        const numValue = value === '' ? 0 : parseInt(value, 10);
        if (!isNaN(numValue)) {
          numericStats[playerId][field] = numValue;
        } else {
          numericStats[playerId][field] = 0;
        }
      });
    });
    
    console.log("Converted to numeric stats:", numericStats);
    
    if (Object.keys(numericStats).length > 0) {
      saveMutation.mutate({ 
        quarterKey: quarter, 
        stats: numericStats 
      });
    } else {
      toast({
        title: "No statistics to save",
        description: "There are no player statistics to save for this quarter.",
      });
    }
  };
  
  // Get player details
  const getPlayer = (playerId: number) => {
    return players.find(p => p.id === playerId);
  };
  
  // Render quarter content
  const renderQuarterContent = (quarterKey: string) => {
    const quarterRoster = rosterByQuarter[quarterKey] || {};
    const assignedPlayerIds = Object.values(quarterRoster).filter(id => id !== null) as number[];
    
    if (assignedPlayerIds.length === 0) {
      return (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-gray-500">
              No players assigned to this quarter. Please complete the roster first.
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {assignedPlayerIds.map(playerId => {
          const player = getPlayer(playerId);
          if (!player) return null;
          
          // Find position
          const position = Object.entries(quarterRoster)
            .find(([_, id]) => id === playerId)?.[0] || '';
          
          const playerStats = statValues[quarterKey]?.[playerId] || {};
          
          return (
            <Card key={playerId} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10 bg-primary text-white mr-3">
                    <span>{getInitials(player.firstName, player.lastName)}</span>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{player.displayName}</h3>
                    <p className="text-sm text-gray-500">{position}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatField 
                    label="Goals For" 
                    value={playerStats.goalsFor || '0'} 
                    onChange={(v) => handleChange(quarterKey, playerId, 'goalsFor', v)} 
                    disabled={saveMutation.isPending} 
                  />
                  <StatField 
                    label="Goals Against" 
                    value={playerStats.goalsAgainst || '0'} 
                    onChange={(v) => handleChange(quarterKey, playerId, 'goalsAgainst', v)} 
                    disabled={saveMutation.isPending} 
                  />
                  <StatField 
                    label="Missed Goals" 
                    value={playerStats.missedGoals || '0'} 
                    onChange={(v) => handleChange(quarterKey, playerId, 'missedGoals', v)} 
                    disabled={saveMutation.isPending} 
                  />
                  <StatField 
                    label="Rebounds" 
                    value={playerStats.rebounds || '0'} 
                    onChange={(v) => handleChange(quarterKey, playerId, 'rebounds', v)} 
                    disabled={saveMutation.isPending} 
                  />
                  <StatField 
                    label="Intercepts" 
                    value={playerStats.intercepts || '0'} 
                    onChange={(v) => handleChange(quarterKey, playerId, 'intercepts', v)} 
                    disabled={saveMutation.isPending} 
                  />
                  <StatField 
                    label="Bad Pass" 
                    value={playerStats.badPass || '0'} 
                    onChange={(v) => handleChange(quarterKey, playerId, 'badPass', v)} 
                    disabled={saveMutation.isPending} 
                  />
                  <StatField 
                    label="Handling Error" 
                    value={playerStats.handlingError || '0'} 
                    onChange={(v) => handleChange(quarterKey, playerId, 'handlingError', v)} 
                    disabled={saveMutation.isPending} 
                  />
                  <StatField 
                    label="Infringement" 
                    value={playerStats.infringement || '0'} 
                    onChange={(v) => handleChange(quarterKey, playerId, 'infringement', v)} 
                    disabled={saveMutation.isPending} 
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  // Calculate quarter-by-quarter totals and game summary
  const calculateQuarterTotals = () => {
      '1': { goalsFor: 0, goalsAgainst: 0 },
      '2': { goalsFor: 0, goalsAgainst: 0 },
      '3': { goalsFor: 0, goalsAgainst: 0 },
      '4': { goalsFor: 0, goalsAgainst: 0 },
    };
    
    // Calculate from existing stats
    if (existingStats && existingStats.length > 0) {
      existingStats.forEach(stat => {
        if (!stat || stat.quarter === undefined) return;
        
        const quarterKey = String(stat.quarter);
        if (quarterTotals[quarterKey]) {
          quarterTotals[quarterKey].goalsFor += (stat.goalsFor || 0);
          quarterTotals[quarterKey].goalsAgainst += (stat.goalsAgainst || 0);
        }
      });
    }
    
    // Add any unsaved changes from the form
    Object.entries(statValues).forEach(([quarterKey, playerStats]) => {
      Object.values(playerStats).forEach(stats => {
        const goalsFor = parseInt(stats.goalsFor || '0');
        const goalsAgainst = parseInt(stats.goalsAgainst || '0');
        
        if (!isNaN(goalsFor)) {
          quarterTotals[quarterKey].goalsFor += goalsFor;
        }
        
        if (!isNaN(goalsAgainst)) {
          quarterTotals[quarterKey].goalsAgainst += goalsAgainst;
        }
      });
    });
    
    // Calculate game totals
    const gameTotals = {
      goalsFor: 0,
      goalsAgainst: 0
    };
    
    Object.values(quarterTotals).forEach(quarter => {
      gameTotals.goalsFor += quarter.goalsFor;
      gameTotals.goalsAgainst += quarter.goalsAgainst;
    });
    
    return { quarterTotals, gameTotals };
  };
  
  
  return (
    <div className="space-y-6">
      {/* Game score summary */}
      <Card className="overflow-hidden bg-gray-50">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Game Score Summary</h3>
          
          <div className="grid grid-cols-5 gap-2 text-center mb-4">
            <div className="font-medium">Quarter</div>
            <div className="font-medium">Q1</div>
            <div className="font-medium">Q2</div>
            <div className="font-medium">Q3</div>
            <div className="font-medium">Q4</div>
            
            <div className="font-medium">Our Team</div>
            <div className={quarterTotals['1'].goalsFor > quarterTotals['1'].goalsAgainst ? 'font-bold text-primary' : ''}>
              {quarterTotals['1'].goalsFor}
            </div>
            <div className={quarterTotals['2'].goalsFor > quarterTotals['2'].goalsAgainst ? 'font-bold text-primary' : ''}>
              {quarterTotals['2'].goalsFor}
            </div>
            <div className={quarterTotals['3'].goalsFor > quarterTotals['3'].goalsAgainst ? 'font-bold text-primary' : ''}>
              {quarterTotals['3'].goalsFor}
            </div>
            <div className={quarterTotals['4'].goalsFor > quarterTotals['4'].goalsAgainst ? 'font-bold text-primary' : ''}>
              {quarterTotals['4'].goalsFor}
            </div>
            
            <div className="font-medium">Opponent</div>
            <div className={quarterTotals['1'].goalsAgainst > quarterTotals['1'].goalsFor ? 'font-bold text-primary' : ''}>
              {quarterTotals['1'].goalsAgainst}
            </div>
            <div className={quarterTotals['2'].goalsAgainst > quarterTotals['2'].goalsFor ? 'font-bold text-primary' : ''}>
              {quarterTotals['2'].goalsAgainst}
            </div>
            <div className={quarterTotals['3'].goalsAgainst > quarterTotals['3'].goalsFor ? 'font-bold text-primary' : ''}>
              {quarterTotals['3'].goalsAgainst}
            </div>
            <div className={quarterTotals['4'].goalsAgainst > quarterTotals['4'].goalsFor ? 'font-bold text-primary' : ''}>
              {quarterTotals['4'].goalsAgainst}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-2 rounded-md bg-gray-100">
            <div className="font-medium">Final Score:</div>
            <div className="text-xl font-bold">
              <span className={gameTotals.goalsFor > gameTotals.goalsAgainst ? 'text-primary' : ''}>
                {gameTotals.goalsFor}
              </span>
              <span className="mx-2">-</span>
              <span className={gameTotals.goalsAgainst > gameTotals.goalsFor ? 'text-primary' : ''}>
                {gameTotals.goalsAgainst}
              </span>
            </div>
            <div className="text-sm">
              {gameTotals.goalsFor > gameTotals.goalsAgainst ? 
                <span className="text-primary font-medium">Win</span> : 
                gameTotals.goalsFor < gameTotals.goalsAgainst ? 
                  <span className="text-red-500 font-medium">Loss</span> : 
                  <span className="text-amber-500 font-medium">Draw</span>
              }
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="bg-primary hover:bg-primary-light text-white"
        >
          <Save className="w-4 h-4 mr-2" /> Save Statistics
        </Button>
      </div>
      
      <Tabs defaultValue="1" value={activeQuarter} onValueChange={setActiveQuarter}>
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
  onChange, 
  disabled 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  disabled: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="border border-gray-300 rounded-md p-2 w-full text-center"
      />
    </div>
  );
}