import React from 'react';
import { AttackerStatsBox } from './AttackerStatsBox';
import { MidCourtStatsBox } from './MidCourtStatsBox';
import { DefenderStatsBox } from './DefenderStatsBox';

interface PositionStatsBoxProps {
  position: string;
  playerStats: any;
}

export const PositionStatsBox: React.FC<PositionStatsBoxProps> = ({ position, playerStats }) => {
  // Return different stat boxes based on the position
  if (position === 'GS' || position === 'GA') {
    return <AttackerStatsBox stats={playerStats.stats} />;
  } else if (position === 'WA' || position === 'C' || position === 'WD') {
    return <MidCourtStatsBox stats={playerStats.stats} />;
  } else if (position === 'GD' || position === 'GK') {
    return <DefenderStatsBox stats={playerStats.stats} />;
  }
  
  // Fallback for unknown positions
  return <div className="text-sm text-gray-500">No stats available</div>;
};