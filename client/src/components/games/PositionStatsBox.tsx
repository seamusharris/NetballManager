import React from 'react';
import { Position } from '@shared/schema';
import { StatItemBox } from './StatItemBox';
import { positionStats, statLabels, StatCategory } from '@/lib/positionStats';

interface PositionStatsBoxProps {
  position: Position;
  stats: Record<string, any>;
  className?: string; // Allow custom styling
  noWrapper?: boolean; // Allow using without the wrapper div
}

export const PositionStatsBox: React.FC<PositionStatsBoxProps> = ({ 
  position, 
  stats,
  className = "",
  noWrapper = false
}) => {
  // Get the stats for this position
  const statsToShow = positionStats[position] || [];
  
  // Create a more compact grid layout by splitting stats into columns
  const content = (
    <div className="mt-1 bg-gray-50 p-2 rounded-md border border-gray-100">
      <div className="grid grid-cols-1 gap-y-1 text-xs">
        {statsToShow.map((statKey) => (
          <StatItemBox 
            key={statKey}
            label={statLabels[statKey as StatCategory]} 
            value={stats[statKey] || 0}
            compact={true}
          />
        ))}
      </div>
    </div>
  );
  
  if (noWrapper) {
    return content;
  }
  
  return (
    <div className={`p-2 border rounded-md shadow-sm flex-1 flex flex-col ${className}`}>
      <div className="font-semibold text-sm">{position}</div>
      {content}
    </div>
  );
};