import React from 'react';
import { StatItemBox } from './StatItemBox';

interface DefenderStatsBoxProps {
  stats: any;
}

  return (
    <div className="flex flex-col space-y-2 text-sm">
      {/* Position-specific stats for defenders (GD, GK) */}
      <div className="space-y-2">
        <StatItemBox label="Goals Against" value={stats.goalsAgainst} />
        <StatItemBox label="Rebounds" value={stats.rebounds} />
        <StatItemBox label="Pick Ups" value={stats.pickUp} />
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