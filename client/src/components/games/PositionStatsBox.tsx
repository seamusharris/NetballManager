import React from 'react';
import { Position } from '@shared/schema';
import { StatItemBox } from './StatItemBox';
import { primaryPositionStats, secondaryPositionStats, statLabels, StatCategory } from '@/lib/positionStats';

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
  // Get the primary and secondary stats for this position
  const primaryStats = primaryPositionStats[position];
  const secondaryStats = secondaryPositionStats[position];
  
  // Render just the stats content if noWrapper is true
  const content = (
    <div className="flex flex-col space-y-2 text-sm">
      {/* Primary stats column */}
      <div className="space-y-2">
        {primaryStats.map((statKey) => (
          <StatItemBox 
            key={statKey}
            label={statLabels[statKey as StatCategory]} 
            value={stats[statKey] || 0} 
          />
        ))}
      </div>
      
      {/* Secondary stats column */}
      <div className="space-y-2 mt-2 pt-2 border-t">
        {secondaryStats.map((statKey) => (
          <StatItemBox 
            key={statKey}
            label={statLabels[statKey as StatCategory]} 
            value={stats[statKey] || 0} 
          />
        ))}
      </div>
    </div>
  );
  
  // Return either wrapped or unwrapped content
  return noWrapper ? content : (
    <div className={`mt-1 bg-gray-50 p-3 rounded-md border border-gray-100 ${className}`}>
      {content}
    </div>
  );
};