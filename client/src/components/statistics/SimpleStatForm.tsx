import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Player, GameStat, Position } from '@shared/schema';

interface SimpleStatFormProps {
  gameId: number;
  quarter: number;
  players: Player[];
  rosters: Record<Position, number | null>;
  onSaveStats: (stats: Record<number, Record<string, number>>) => void;
  isPending: boolean;
}

export default function SimpleStatForm({
  gameId,
  quarter,
  players,
  rosters,
  onSaveStats,
  isPending
}: SimpleStatFormProps) {
  // Local state to track form values
  const [statValues, setStatValues] = useState<Record<number, Record<string, string>>>({});
  
  // Find players in the roster for this quarter
  const playersInRoster = Object.entries(rosters)
    .filter(([_, playerId]) => playerId !== null)
    .map(([_, playerId]) => playerId as number);
  
  // Initialize form with empty values
  useEffect(() => {
    const initialValues: Record<number, Record<string, string>> = {};
    
    playersInRoster.forEach(playerId => {
      initialValues[playerId] = {
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
    
    setStatValues(initialValues);
  }, [playersInRoster]);
  
  // Handle input change
  const handleChange = (playerId: number, field: string, value: string) => {
    // Only allow numbers and empty string
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    setStatValues(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value
      }
    }));
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Convert string values to numbers
    const numericValues: Record<number, Record<string, number>> = {};
    
    Object.entries(statValues).forEach(([playerIdStr, fields]) => {
      const playerId = Number(playerIdStr);
      numericValues[playerId] = {};
      
      Object.entries(fields).forEach(([field, value]) => {
        numericValues[playerId][field] = value === '' ? 0 : Number(value);
      });
    });
    
    onSaveStats(numericValues);
  };
  
  // Get player details
  const getPlayerName = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.displayName : 'Unknown';
  };
  
  // Get position for player
  const getPlayerPosition = (playerId: number) => {
    const position = Object.entries(rosters).find(([_, id]) => id === playerId);
    return position ? position[0] : '';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleSubmit} 
          disabled={isPending}
          className="bg-primary hover:bg-primary-light text-white"
        >
          <Save className="w-4 h-4 mr-1" /> Save Stats
        </Button>
      </div>
      
      {playersInRoster.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-gray-500">
            No players assigned to this quarter. Please complete the roster.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {playersInRoster.map(playerId => (
            <Card key={playerId} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Avatar className="h-8 w-8 bg-primary text-white flex items-center justify-center mr-2">
                    {getPlayerInitials(playerId)}
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{getPlayerName(playerId)}</h3>
                    <p className="text-sm text-gray-500">{getPlayerPosition(playerId)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatField 
                    label="Goals For" 
                    value={statValues[playerId]?.goalsFor || '0'} 
                    onChange={(value) => handleChange(playerId, 'goalsFor', value)} 
                    disabled={isPending}
                  />
                  <StatField 
                    label="Goals Against" 
                    value={statValues[playerId]?.goalsAgainst || '0'} 
                    onChange={(value) => handleChange(playerId, 'goalsAgainst', value)} 
                    disabled={isPending}
                  />
                  <StatField 
                    label="Missed Goals" 
                    value={statValues[playerId]?.missedGoals || '0'} 
                    onChange={(value) => handleChange(playerId, 'missedGoals', value)} 
                    disabled={isPending}
                  />
                  <StatField 
                    label="Rebounds" 
                    value={statValues[playerId]?.rebounds || '0'} 
                    onChange={(value) => handleChange(playerId, 'rebounds', value)} 
                    disabled={isPending}
                  />
                  <StatField 
                    label="Intercepts" 
                    value={statValues[playerId]?.intercepts || '0'} 
                    onChange={(value) => handleChange(playerId, 'intercepts', value)} 
                    disabled={isPending}
                  />
                  <StatField 
                    label="Bad Pass" 
                    value={statValues[playerId]?.badPass || '0'} 
                    onChange={(value) => handleChange(playerId, 'badPass', value)} 
                    disabled={isPending}
                  />
                  <StatField 
                    label="Handling Error" 
                    value={statValues[playerId]?.handlingError || '0'} 
                    onChange={(value) => handleChange(playerId, 'handlingError', value)} 
                    disabled={isPending}
                  />
                  <StatField 
                    label="Infringement" 
                    value={statValues[playerId]?.infringement || '0'} 
                    onChange={(value) => handleChange(playerId, 'infringement', value)} 
                    disabled={isPending}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


function getPlayerInitials(playerId: number) {
  const player = players.find(p => p.id === playerId);
  if (!player) return '??';
  return getInitials(player.firstName, player.lastName);
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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full p-2 border border-gray-300 rounded-md text-center"
      />
    </div>
  );
}