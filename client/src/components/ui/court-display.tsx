
import React from 'react';
import { Position, POSITIONS } from '@shared/schema';
import { convertTailwindToHex } from '@/lib/utils';

interface Player {
  id: number;
  displayName?: string;
  firstName: string;
  lastName: string;
  avatarColor?: string;
}

interface CourtDisplayProps {
  roster: Array<{
    quarter: number;
    position: Position;
    playerId: number | null;
  }>;
  players: Player[];
  quarter: number;
  layout?: 'vertical' | 'horizontal';
  showStats?: boolean;
  showPositionLabels?: boolean;
  className?: string;
}

export const CourtDisplay = ({
  roster,
  players,
  quarter,
  layout = 'vertical',
  showStats = false,
  showPositionLabels = true,
  className = ''
}: CourtDisplayProps) => {
  // Group roster by quarter and position
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

  // Function to get player color, converting from Tailwind class names to hex
  const getPlayerColor = (playerId: number | null) => {
    if (!players || !playerId) return '#cccccc';
    const player = players.find(p => p.id === playerId);

    // First, check if we need to use a default color
    if (!player || !player.avatarColor || player.avatarColor === '#FFFFFF' || player.avatarColor === '#ffffff') {
      // Use default colors
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

  // Position coordinates for vertical court layout
  const getVerticalPositionCoordinates = (position: Position) => {
    const positionMap = {
      'GS': 'top-12 left-1/2 transform -translate-x-1/2',
      'GA': 'top-28 right-16',
      'WD': 'top-1/2 right-14',
      'C': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'WA': 'bottom-1/2 left-14',
      'GD': 'bottom-28 left-16',
      'GK': 'bottom-12 left-1/2 transform -translate-x-1/2',
    };
    return positionMap[position] || '';
  };

  // Position coordinates for horizontal court layout
  const getHorizontalPositionCoordinates = (position: Position) => {
    const positionMap = {
      'GS': 'top-[25%] left-[10%] -translate-x-1/2 -translate-y-1/2',
      'GA': 'top-[75%] left-[23%] -translate-x-1/2 -translate-y-1/2',
      'WA': 'top-[25%] left-[43%] -translate-x-1/2 -translate-y-1/2',
      'C': 'top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2',
      'WD': 'top-[75%] left-[57%] -translate-x-1/2 -translate-y-1/2',
      'GD': 'top-[25%] left-[77%] -translate-x-1/2 -translate-y-1/2',
      'GK': 'top-[75%] left-[90%] -translate-x-1/2 -translate-y-1/2',
    };
    return positionMap[position] || '';
  };

  const getPositionCoordinates = layout === 'horizontal' 
    ? getHorizontalPositionCoordinates 
    : getVerticalPositionCoordinates;

  const courtAspectRatio = layout === 'horizontal' ? 'aspect-[2/1]' : 'aspect-[1/2]';
  const courtHeight = layout === 'horizontal' ? 'h-96' : 'h-auto';

  return (
    <div className={`relative w-full mx-auto ${courtAspectRatio} ${courtHeight} bg-green-100 rounded-lg border border-green-300 ${className}`}>
      {/* Court markings */}
      <div className="absolute inset-0 flex flex-col">
        {layout === 'horizontal' ? (
          // Horizontal layout - three vertical sections
          <div className="absolute inset-0 flex flex-row">
            <div className="w-1/3 border-r border-green-500"></div>
            <div className="w-1/3 border-r border-green-500"></div>
            <div className="w-1/3"></div>
          </div>
        ) : (
          // Vertical layout - three horizontal sections
          <>
            <div className="h-1/3 border-b border-white"></div>
            <div className="h-1/3 border-b border-white"></div>
            <div className="h-1/3"></div>
          </>
        )}
      </div>

      {/* Position markers */}
      {POSITIONS.map(position => {
        const entry = rosterByQuarter[quarter]?.[position];
        const playerName = getPlayerName(entry?.playerId);
        const playerColor = getPlayerColor(entry?.playerId);

        // Use the player's avatar color for the background
        const bgColor = playerName ? playerColor : 'white';

        // Use white text for player positions, red for unassigned
        const textColor = playerName ? 'white' : '#ef4444';

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
              {showPositionLabels && (
                <div className="font-bold text-center text-base md:text-lg" style={{ color: textColor }}>
                  {position}
                </div>
              )}
              {playerName && (
                <div className="text-xs md:text-sm text-center font-medium leading-tight mx-1" style={{ color: textColor }}>
                  {playerName}
                </div>
              )}
              {!playerName && (
                <div className="text-xs text-red-500 text-center">Unassigned</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
