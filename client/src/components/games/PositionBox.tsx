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
  return (
    <div 
      className="p-2 border rounded-md shadow-sm flex-1 flex flex-col"
      style={{ 
        backgroundColor: playerName ? `${playerColor}10` : 'white',
        border: playerName ? `2px solid ${playerColor}` : '1px solid #ddd',
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="font-semibold text-sm rounded bg-gray-100 px-1.5 py-0.5">{position}</div>
        {playerName && (
          <div 
            className="font-medium text-xs truncate ml-1 max-w-[70%]" 
            style={{ color: playerColor }}
            title={playerName}
          >
            {playerName}
          </div>
        )}
      </div>
      
      {playerName && playerStats && (
        <PositionStatsBox 
          position={position} 
          stats={playerStats.stats} 
          noWrapper={true} 
        />
      )}
    </div>
  );
};