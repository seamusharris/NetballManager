import React from 'react';
import { StatItemBox } from './StatItemBox';

// New component that renders the appropriate stats based on position
interface RenderPositionStatsProps {
  position: string;
  playerStats: any;
}

const RenderPositionStats: React.FC<RenderPositionStatsProps> = ({ position, playerStats }) => {
  // Attackers (GS, GA)
  if (position === 'GS' || position === 'GA') {
    return (
      <div className="flex flex-col space-y-2 text-sm">
        {/* Attacker-specific stats */}
        <div className="space-y-2">
          <StatItemBox label="Goals" value={playerStats.stats.goals} />
          <StatItemBox label="Missed Goals" value={playerStats.stats.missedGoals} />
          <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
        </div>
        
        {/* Common stats */}
        <div className="space-y-2 mt-2 pt-2 border-t">
          <StatItemBox label="Intercepts" value={playerStats.stats.intercepts} />
          <StatItemBox label="Bad Pass" value={playerStats.stats.badPass} />
          <StatItemBox label="Handling Errors" value={playerStats.stats.handlingError} />
        </div>
      </div>
    );
  }
  
  // Defenders (GD, GK)
  if (position === 'GD' || position === 'GK') {
    return (
      <div className="flex flex-col space-y-2 text-sm">
        {/* Defender-specific stats */}
        <div className="space-y-2">
          <StatItemBox label="Goals Against" value={playerStats.stats.goalsAgainst} />
          <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
          <StatItemBox label="Pick Ups" value={playerStats.stats.pickUp} />
        </div>
        
        {/* Common stats */}
        <div className="space-y-2 mt-2 pt-2 border-t">
          <StatItemBox label="Intercepts" value={playerStats.stats.intercepts} />
          <StatItemBox label="Bad Pass" value={playerStats.stats.badPass} />
          <StatItemBox label="Handling Errors" value={playerStats.stats.handlingError} />
        </div>
      </div>
    );
  }
  
  // Mid-court (WA, C, WD)
  return (
    <div className="flex flex-col space-y-2 text-sm">
      {/* Mid-court-specific stats */}
      <div className="space-y-2">
        <StatItemBox label="Pick Ups" value={playerStats.stats.pickUp} />
        <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
        <StatItemBox label="Infringements" value={playerStats.stats.infringement} />
      </div>
      
      {/* Common stats */}
      <div className="space-y-2 mt-2 pt-2 border-t">
        <StatItemBox label="Intercepts" value={playerStats.stats.intercepts} />
        <StatItemBox label="Bad Pass" value={playerStats.stats.badPass} />
        <StatItemBox label="Handling Errors" value={playerStats.stats.handlingError} />
      </div>
    </div>
  );
};

export default RenderPositionStats;