import React from 'react';
import { StatItemBox } from './StatItemBox';

interface MidCourtStatsBoxProps {
  stats: any;
}

export const MidCourtStatsBox: React.FC<MidCourtStatsBoxProps> = ({ stats }) => {
  return (
    <div className="flex flex-col space-y-2 text-sm">
      {/* Position-specific stats for mid-court positions (WA, C, WD) */}
      <div className="space-y-2">
        <StatItemBox label="Pick Ups" value={stats.pickUp} />
        <StatItemBox label="Rebounds" value={stats.rebounds} />
        <StatItemBox label="Infringements" value={stats.infringement} />
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