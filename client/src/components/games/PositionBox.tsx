import React from 'react';
import { StatItemBox } from './StatItemBox';

interface PositionBoxProps {
  position: string;
  playerName?: string | null;
  playerColor?: string | null;
  stats: {
    goals?: number;
    rebounds?: number;
    intercepts?: number;
    assists?: number;
  };
}

export const PositionBox = ({ position, playerName, playerColor, stats }: PositionBoxProps) => {
  return (
    <div 
      className="w-[110px] border rounded-md shadow-sm overflow-hidden"
      style={{ 
        borderColor: playerColor || '#ddd',
        borderWidth: playerName ? '2px' : '1px',
        backgroundColor: playerName ? `${playerColor}10` : 'white',
      }}
    >
      {/* Position header */}
      <div className="text-center font-medium py-1 border-b border-gray-100">
        {position}
      </div>
      
      {/* Stats content */}
      {playerName && (
        <div className="p-2 text-xs space-y-1 bg-gray-50">
          <StatItemBox label="Goals" value={stats.goals || 0} />
          <StatItemBox label="Rebounds" value={stats.rebounds || 0} />
          <StatItemBox label="Int" value={stats.intercepts || 0} />
          <StatItemBox label="Assists" value={stats.assists || 0} />
        </div>
      )}
    </div>
  );
};