import React from 'react';
import { StatItemBox } from './StatItemBox';

interface PositionStatsBoxProps {
  position: string;
  playerStats: any;
}

export const PositionStatsBox: React.FC<PositionStatsBoxProps> = ({ position, playerStats }) => {
  // Attacker positions (GS, GA)
  if (position === 'GS' || position === 'GA') {
    return (
      <div className="space-y-2">
        <StatItemBox label="Goals" value={playerStats.stats.goals} />
        <StatItemBox label="Missed Goals" value={playerStats.stats.missedGoals} />
        <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
        
        <div className="mt-2 pt-2 border-t space-y-2">
          <StatItemBox label="Intercepts" value={playerStats.stats.intercepts} />
          <StatItemBox label="Bad Pass" value={playerStats.stats.badPass} />
          <StatItemBox label="Handling Errors" value={playerStats.stats.handlingError} />
        </div>
      </div>
    );
  }
  
  // Defender positions (GD, GK)
  if (position === 'GD' || position === 'GK') {
    return (
      <div className="space-y-2">
        <StatItemBox label="Goals Against" value={playerStats.stats.goalsAgainst} />
        <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
        <StatItemBox label="Pick Ups" value={playerStats.stats.pickUp} />
        
        <div className="mt-2 pt-2 border-t space-y-2">
          <StatItemBox label="Intercepts" value={playerStats.stats.intercepts} />
          <StatItemBox label="Bad Pass" value={playerStats.stats.badPass} />
          <StatItemBox label="Handling Errors" value={playerStats.stats.handlingError} />
        </div>
      </div>
    );
  }
  
  // Mid-court positions (WA, C, WD)
  return (
    <div className="space-y-2">
      <StatItemBox label="Pick Ups" value={playerStats.stats.pickUp} />
      <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
      <StatItemBox label="Infringements" value={playerStats.stats.infringement} />
      
      <div className="mt-2 pt-2 border-t space-y-2">
        <StatItemBox label="Intercepts" value={playerStats.stats.intercepts} />
        <StatItemBox label="Bad Pass" value={playerStats.stats.badPass} />
        <StatItemBox label="Handling Errors" value={playerStats.stats.handlingError} />
      </div>
    </div>
  );
}