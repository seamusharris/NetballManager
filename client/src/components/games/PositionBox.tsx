import React from 'react';
import { Position } from '../../../../shared/schema';
import { PositionStatsBox } from './PositionStatsBox';

interface PositionBoxProps {
  position: Position;
  playerName: string | null;
  playerColor: string;
  playerStats: any;
}

export const PositionBox: React.FC<PositionBoxProps> = ({
  position,
  playerName,
  playerColor,
  playerStats
}) => {
  // Always use red for unassigned positions
  const unassignedColor = '#e11d48'; // red-600
  
  // Use player color if player assigned, otherwise use red for unassigned
  const displayColor = playerName ? playerColor : unassignedColor;
  
  return (
    <div 
      className="p-2 border rounded-md shadow-sm flex-1 flex flex-col"
      style={{ 
        backgroundColor: `${displayColor}10`,
        border: `2px solid ${displayColor}`,
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="font-semibold text-sm rounded bg-gray-100 px-1.5 py-0.5">{position}</div>
        <div 
          className="font-medium text-xs truncate ml-1 max-w-[70%]" 
          style={{ color: displayColor }}
          title={playerName || 'Unassigned'}
        >
          {playerName || 'Unassigned'}
        </div>
      </div>
      
      {playerStats && playerStats.stats && (
        <PositionStatsBox 
          position={position} 
          stats={playerStats.stats} 
          noWrapper={true} 
        />
      )}
    </div>
  );
};