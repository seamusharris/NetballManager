import React from 'react';
import { usePlayerPerformance } from './hooks/usePlayerPerformance';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Position, allPositions } from '@shared/schema';

interface PlayerStatsCardProps {
  playerId: number;
  playerName: string;
  gameIds?: number[];
  showPositionBreakdown?: boolean;
}

export function PlayerStatsCard({ 
  playerId, 
  playerName, 
  gameIds, 
  showPositionBreakdown = true 
}: PlayerStatsCardProps) {

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !performance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Player Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load statistics for {playerName}. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{playerName}'s Statistics</span>
          <Badge variant="outline">
            {performance.gamesPlayed} {performance.gamesPlayed === 1 ? 'Game' : 'Games'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatsBox label="Goals" value={performance.goals} />
            <StatsBox label="Intercepts" value={performance.intercepts} />
            <StatsBox label="Rebounds" value={performance.rebounds} />
            <StatsBox label="Pick Ups" value={performance.pickUp} />
            <StatsBox label="Handling Errors" value={performance.handlingError} negativeMetric />
            <StatsBox label="Bad Passes" value={performance.badPass} negativeMetric />
          </div>
          
          {showPositionBreakdown && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Position Breakdown (Quarters)</h4>
              <div className="flex flex-wrap gap-2">
                {allPositions.map(position => (
                  <PositionBadge 
                    key={position}
                    position={position}
                    quarters={performance.quartersByPosition[position]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsBox({ label, value, negativeMetric = false }: { 
  label: string; 
  value: number; 
  negativeMetric?: boolean;
}) {
  return (
    <div className="bg-muted/50 p-3 rounded-md text-center">
      <div className={`text-xl font-bold ${negativeMetric ? 'text-red-500' : 'text-green-600'}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function PositionBadge({ position, quarters }: { position: Position; quarters: number }) {
  if (quarters === 0) return null;

  return (
    <Badge variant={quarters > 6 ? "default" : "outline"} className="text-xs">
      {position}: {quarters}
    </Badge>
  );
}