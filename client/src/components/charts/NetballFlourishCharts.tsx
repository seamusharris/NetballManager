
import React from 'react';
import { FlourishChart } from './FlourishChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NetballDataProps {
  seasonData?: any;
  playerStats?: any;
  gameResults?: any;
}

export function NetballFlourishCharts({ seasonData, playerStats, gameResults }: NetballDataProps) {
  return (
    <div className="space-y-6">
      {/* Season Progress Bar Race */}
      <FlourishChart
        chartId="your-season-progress-chart-id"
        title="Season Win Rate Progress"
        height={500}
      />

      {/* Player Performance Radar */}
      <FlourishChart
        chartId="your-player-radar-chart-id"
        title="Player Performance Comparison"
        height={400}
      />

      {/* Game Results Timeline */}
      <FlourishChart
        chartId="your-timeline-chart-id"
        title="Season Results Timeline"
        height={300}
      />

      {/* Position Heat Map */}
      <FlourishChart
        chartId="your-heatmap-chart-id"
        title="Court Position Heat Map"
        height={400}
      />
    </div>
  );
}

export default NetballFlourishCharts;
