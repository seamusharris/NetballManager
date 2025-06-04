import React from 'react';
import { CourtDisplay } from '@/components/ui/court-display';
import { POSITIONS } from '@shared/schema';

interface CourtViewProps {
  quarter: number;
  roster: any[];
  players: any[];
}

export const CourtView = ({ quarter, roster, players }: CourtViewProps) => {
  // Group roster by quarter and position for the position list
  const rosterByQuarter = React.useMemo(() => {
    return roster.reduce((acc: any, entry: any) => {
      if (!acc[entry.quarter]) acc[entry.quarter] = {};
      acc[entry.quarter][entry.position] = entry;
      return acc;
    }, {});
  }, [roster]);

  // Helper to get player display name
  const getPlayerName = (playerId: number | null) => {
    if (!players || !playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : null;
  };

  // Function to get player color
  const getPlayerColor = (playerId: number | null) => {
    if (!players || !playerId) return '#cccccc';
    const player = players.find(p => p.id === playerId);

    if (!player || !player.avatarColor || player.avatarColor === '#FFFFFF' || player.avatarColor === '#ffffff') {
      const defaultColors = [
        '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0', 
        '#33FFF0', '#F0FF33', '#8C33FF', '#FF8C33', '#33FF8C'
      ];
      return defaultColors[playerId % defaultColors.length];
    }

    if (player.avatarColor.startsWith('bg-')) {
      return player.avatarColor; // Keep as is for now
    }

    return player.avatarColor;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Court diagram */}
      <div className="flex-1">
        <CourtDisplay
          roster={roster}
          players={players}
          quarter={quarter}
          layout="vertical"
          showPositionLabels={true}
        />
      </div>

      {/* Roster position buttons */}
      <div className="flex-1">
        <div className="flex flex-col space-y-8">
          {/* Top third - GS, GA */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">Attack Third</h3>
            {POSITIONS.slice(0, 2).map(position => {
              const entry = rosterByQuarter[quarter]?.[position];
              const playerName = getPlayerName(entry?.playerId);
              const playerColor = getPlayerColor(entry?.playerId);

              return (
                <div 
                  key={position} 
                  className="p-3 border rounded-md shadow-sm flex flex-col"
                  style={{ 
                    backgroundColor: playerName ? `${playerColor}20` : 'white',
                    border: playerName ? `2px solid ${playerColor}` : '1px solid #ddd',
                  }}
                >
                  <div className="font-bold">{position}</div>
                  <div 
                    className={playerName ? 'text-gray-900 font-medium' : 'text-red-500 italic'}
                    style={{ color: playerName ? playerColor : undefined }}
                  >
                    {playerName || 'Unassigned'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Middle third - WA, C, WD */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">Mid Court</h3>
            {POSITIONS.slice(2, 5).map(position => {
              const entry = rosterByQuarter[quarter]?.[position];
              const playerName = getPlayerName(entry?.playerId);
              const playerColor = getPlayerColor(entry?.playerId);

              return (
                <div 
                  key={position} 
                  className="p-3 border rounded-md shadow-sm flex flex-col"
                  style={{ 
                    backgroundColor: playerName ? `${playerColor}20` : 'white',
                    border: playerName ? `2px solid ${playerColor}` : '1px solid #ddd',
                  }}
                >
                  <div className="font-bold">{position}</div>
                  <div 
                    className={playerName ? 'text-gray-900 font-medium' : 'text-red-500 italic'}
                    style={{ color: playerName ? playerColor : undefined }}
                  >
                    {playerName || 'Unassigned'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom third - GD, GK */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">Defense Third</h3>
            {POSITIONS.slice(5).map(position => {
              const entry = rosterByQuarter[quarter]?.[position];
              const playerName = getPlayerName(entry?.playerId);
              const playerColor = getPlayerColor(entry?.playerId);

              return (
                <div 
                  key={position} 
                  className="p-3 border rounded-md shadow-sm flex flex-col"
                  style={{ 
                    backgroundColor: playerName ? `${playerColor}20` : 'white',
                    border: playerName ? `2px solid ${playerColor}` : '1px solid #ddd',
                  }}
                >
                  <div className="font-bold">{position}</div>
                  <div 
                    className={playerName ? 'text-gray-900 font-medium' : 'text-red-500 italic'}
                    style={{ color: playerName ? playerColor : undefined }}
                  >
                    {playerName || 'Unassigned'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};