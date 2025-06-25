import React from 'react';
import { StatItemBox } from './StatItemBox';

interface AttackerStatsBoxProps {
  stats: any;
}

  return (
    <div className="flex flex-col space-y-2 text-sm">
      {/* Position-specific stats for attackers (GS, GA) */}
      <div className="space-y-2">
        <StatItemBox label="Goals" value={stats.goals} />
        <StatItemBox label="Missed Goals" value={stats.missedGoals} />
        <StatItemBox label="Rebounds" value={stats.rebounds} />
      </div>
      
      {/* Common stats for all positions */}
      <div className="space-y-2 mt-2 pt-2 border-t">
        <StatItemBox label="Intercepts" value={stats.intercepts} />
        <StatItemBox label="Bad Pass" value={stats.badPass} />
        <StatItemBox label="Handling Errors" value={stats.handlingError} />
      </div>
    </div>
  );
};