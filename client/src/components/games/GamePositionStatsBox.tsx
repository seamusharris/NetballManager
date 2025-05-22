import React from 'react';
import { Position } from '@shared/schema';
import { StatItemBox } from './StatItemBox';
import { primaryPositionStats, secondaryPositionStats, statLabels, StatCategory } from '@/lib/positionStats';

interface GamePositionStatsBoxProps {
  position: Position;
  playerName: string | null;
  playerColor: string;
  playerStats: any;
}

export const GamePositionStatsBox: React.FC<GamePositionStatsBoxProps> = ({ 
  position, 
  playerName, 
  playerColor,
  playerStats 
}) => {
  // Get the primary and secondary stats for this position
  const primaryStats = primaryPositionStats[position];
  const secondaryStats = secondaryPositionStats[position];
  
  return (
    <div 
      key={position} 
      className="p-3 border rounded-md shadow-sm flex-1 flex flex-col"
      style={{ 
        backgroundColor: playerName ? `${playerColor}10` : 'white',
        border: playerName ? `2px solid ${playerColor}` : '1px solid #ddd',
      }}
    >
      <div className="flex justify-between items-center">
        <div className="font-semibold text-lg">{position}</div>
        {playerName && (
          <div className="font-medium text-sm" style={{ color: playerColor }}>
            {playerName}
          </div>
        )}
      </div>
      
      {playerName && playerStats && (
        <div className="mt-1 bg-gray-50 p-3 rounded-md border border-gray-100">
          <div className="flex flex-col space-y-2 text-sm">
            {/* Primary stats column */}
            <div className="space-y-2">
              {primaryStats.map((statKey) => (
                <StatItemBox 
                  key={statKey}
                  label={statLabels[statKey as StatCategory]} 
                  value={playerStats.stats[statKey] || 0} 
                />
              ))}
            </div>
            
            {/* Secondary stats column */}
            <div className="space-y-2 mt-2 pt-2 border-t">
              {secondaryStats.map((statKey) => (
                <StatItemBox 
                  key={statKey}
                  label={statLabels[statKey as StatCategory]} 
                  value={playerStats.stats[statKey] || 0} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};