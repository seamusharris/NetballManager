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
  const { toast } = useToast();
  
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
      const { quarterKey, stats } = data;
      const quarter = parseInt(quarterKey);
      const savePromises = [];
      
      // For each player in this quarter's stats
      for (const playerIdStr in stats) {
        const playerId = parseInt(playerIdStr);
        const playerStats = stats[playerId];
        
        // Find existing stat record
        const existingStat = existingStats.find(
          s => s.gameId === gameId && s.playerId === playerId && s.quarter === quarter
        );
        
        if (existingStat) {
          // Update existing stat
          savePromises.push(
            apiRequest('PATCH', `/api/gamestats/${existingStat.id}`, playerStats)
          );
        } else {
          // Create new stat
          savePromises.push(
            apiRequest('POST', '/api/gamestats', {
              gameId,
              playerId,
              quarter,
              ...playerStats
            })
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
      queryClient.invalidateQueries({ queryKey: ['/api/gamestats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamestats', gameId] });
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
    
    // Convert string values to numbers
    const numericStats: Record<number, Record<string, number>> = {};
    
    Object.entries(quarterStats).forEach(([playerIdStr, fields]) => {
      const playerId = parseInt(playerIdStr);
      numericStats[playerId] = {};
      
      Object.entries(fields).forEach(([field, value]) => {
        numericStats[playerId][field] = value === '' ? 0 : parseInt(value, 10);
      });
    });
    
    saveMutation.mutate({ 
      quarterKey: quarter, 
      stats: numericStats 
    });
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
  
  return (
    <div className="space-y-6">
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