import React from 'react';
import { Position, POSITIONS } from '@shared/schema';
import { convertTailwindToHex } from '@/lib/utils';

interface CourtViewProps {
  quarter: number;
  roster: any[];
  players: any[];
}

export const CourtView = ({ quarter, roster, players }: CourtViewProps) => {
  // Group roster by quarter and position
  const rosterByQuarter = React.useMemo(() => {
    return roster.reduce((acc: any, entry: any) => {
      if (!acc[entry.quarter]) acc[entry.quarter] = {};
      acc[entry.quarter][entry.position] = entry;
      return acc;
    }, {});
  }, [roster]);

  // Helper to get position coordinates on court diagram
  const getPositionCoordinates = (position: Position) => {
    const positionMap = {
      'GS': 'top-12 left-1/2 transform -translate-x-1/2',
      'GA': 'top-28 right-16',
      'WD': 'top-1/2 right-14', // Swapped WD and WA
      'C': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'WA': 'bottom-1/2 left-14', // Swapped WA and WD
      'GD': 'bottom-28 left-16',
      'GK': 'bottom-12 left-1/2 transform -translate-x-1/2',
    };

    return positionMap[position] || '';
  };

  // Helper to get player display name
  const getPlayerName = (playerId: number | null) => {
    if (!players || !playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : null;
  };

  // Function to get player color, converting from Tailwind class names to hex
  const getPlayerColor = (playerId: number | null) => {
    if (!players || !playerId) return '#cccccc';
    const player = players.find(p => p.id === playerId);

    // First, check if we need to use a default color
    if (!player || !player.avatarColor || player.avatarColor === '#FFFFFF' || player.avatarColor === '#ffffff') {
      // Use a default color
      const defaultColors = [
        '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0', 
        '#33FFF0', '#F0FF33', '#8C33FF', '#FF8C33', '#33FF8C'
      ];
      return defaultColors[playerId % defaultColors.length];
    }

    // Check if the avatarColor is a Tailwind class (starts with 'bg-')
    if (player.avatarColor.startsWith('bg-')) {
      return convertTailwindToHex(player.avatarColor);
    }

    // If it's already a hex color, return it
    return player.avatarColor;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Court diagram */}
      <div className="flex-1">
        <div className="relative w-full max-w-md mx-auto aspect-[2/3] bg-green-100 rounded-lg border border-green-300">
          {/* Court markings - three equal sections */}
          <div className="absolute inset-0 flex flex-col">
            <div className="h-1/3 border-b border-white"></div>
            <div className="h-1/3 border-b border-white"></div>
            <div className="h-1/3"></div>
          </div>

          {/* Position markers */}
          {POSITIONS.map(position => {
            const entry = rosterByQuarter[quarter]?.[position];
            const playerName = getPlayerName(entry?.playerId);
            const playerColor = getPlayerColor(entry?.playerId);

            // Use the player's avatar color for the background
            const bgColor = playerName ? playerColor : 'white';

            // Use white text for player positions, red for unassigned
            const textColor = playerName ? 'white' : '#ef4444'; // Red color for unassigned

            return (
              <div key={position} className={`absolute ${getPositionCoordinates(position)}`}>
                <div 
                  style={{ 
                    backgroundColor: bgColor,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                    border: playerName ? '3px solid white' : '2px solid red',
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0.25rem'
                  }}
                >
                  <div className="font-bold text-center text-base md:text-lg" style={{ color: textColor }}>{position}</div>
                  {playerName && (
                    <div className="text-xs md:text-sm text-center font-medium leading-tight mx-1" style={{ color: textColor }}>{playerName}</div>
                  )}
                  {!playerName && (
                    <div className="text-xs text-red-500 text-center">Unassigned</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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