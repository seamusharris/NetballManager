import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Player, Position } from '@shared/schema';
import { getInitials } from '@/lib/utils';
import { Save } from 'lucide-react';

interface SimplifiedStatsFormProps {
  players: Player[];
  gameId: number;
  quarter: number;
  rosters: Record<Position, number | null>;
  onSave: (stats: any[]) => void;
}

export default function SimplifiedStatsForm({
  players,
  gameId,
  quarter,
  rosters,
  onSave
}: SimplifiedStatsFormProps) {
  // Get players from roster
  const rosterPlayers = Object.entries(rosters)
    .filter(([_, playerId]) => playerId !== null)
    .map(([position, playerId]) => ({
      playerId: playerId as number,
      position
    }));
  
  // State for stats values
  const [values, setValues] = useState<Record<number, Record<string, string>>>({});
  
  // Handle input change
  const handleChange = (playerId: number, field: string, value: string) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    setValues(prev => {
      const newValues = { ...prev };
      if (!newValues[playerId]) {
        newValues[playerId] = {};
      }
      newValues[playerId][field] = value;
      return newValues;
    });
  };
  
  // Handle save
  const handleSave = () => {
    const stats = [];
    
    for (const playerId in values) {
      const playerStats = values[Number(playerId)];
      
      // Create a stat object for this player
      const stat = {
        gameId,
        playerId: Number(playerId),
        quarter,
        goalsFor: parseInt(playerStats.goalsFor || '0'),
        goalsAgainst: parseInt(playerStats.goalsAgainst || '0'),
        missedGoals: parseInt(playerStats.missedGoals || '0'),
        rebounds: parseInt(playerStats.rebounds || '0'),
        intercepts: parseInt(playerStats.intercepts || '0'),
        badPass: parseInt(playerStats.badPass || '0'),
        handlingError: parseInt(playerStats.handlingError || '0'),
        infringement: parseInt(playerStats.infringement || '0')
      };
      
      stats.push(stat);
    }
    
    onSave(stats);
  };
  
  // Find player details
  const getPlayer = (playerId: number) => {
    return players.find(p => p.id === playerId);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button onClick={handleSave} className="bg-primary text-white">
          <Save className="w-4 h-4 mr-2" /> Save Statistics
        </Button>
      </div>
      
      {rosterPlayers.length === 0 ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-gray-500">No players assigned to this quarter.</p>
          </CardContent>
        </Card>
      ) : (
        rosterPlayers.map(({ playerId, position }) => {
          const player = getPlayer(playerId);
          if (!player) return null;
          
          return (
            <Card key={playerId} className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Avatar className="bg-primary text-white h-10 w-10 mr-3">
                    <span>{getInitials(player.firstName, player.lastName)}</span>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{player.displayName}</h3>
                    <p className="text-sm text-gray-500">{position}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatInput 
                    label="Goals For"
                    value={values[playerId]?.goalsFor || '0'}
                    onChange={(value) => handleChange(playerId, 'goalsFor', value)}
                  />
                  <StatInput 
                    label="Goals Against"
                    value={values[playerId]?.goalsAgainst || '0'}
                    onChange={(value) => handleChange(playerId, 'goalsAgainst', value)}
                  />
                  <StatInput 
                    label="Missed Goals"
                    value={values[playerId]?.missedGoals || '0'}
                    onChange={(value) => handleChange(playerId, 'missedGoals', value)}
                  />
                  <StatInput 
                    label="Rebounds"
                    value={values[playerId]?.rebounds || '0'}
                    onChange={(value) => handleChange(playerId, 'rebounds', value)}
                  />
                  <StatInput 
                    label="Intercepts"
                    value={values[playerId]?.intercepts || '0'}
                    onChange={(value) => handleChange(playerId, 'intercepts', value)}
                  />
                  <StatInput 
                    label="Bad Pass"
                    value={values[playerId]?.badPass || '0'}
                    onChange={(value) => handleChange(playerId, 'badPass', value)}
                  />
                  <StatInput 
                    label="Handling Error"
                    value={values[playerId]?.handlingError || '0'}
                    onChange={(value) => handleChange(playerId, 'handlingError', value)}
                  />
                  <StatInput 
                    label="Infringement"
                    value={values[playerId]?.infringement || '0'}
                    onChange={(value) => handleChange(playerId, 'infringement', value)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

// Simple input field component
function StatInput({ 
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
        className="stats-input border border-input rounded-md px-2 py-1 w-full text-center"
      />
    </div>
  );
}