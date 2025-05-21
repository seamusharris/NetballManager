import React from 'react';
import { useGameStatistics } from './hooks/useGameStatistics';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Position, allPositions } from '@shared/schema';

interface PositionStatsTableProps {
  gameId: number;
  quarter?: number;
  title?: string;
}

export function PositionStatsTable({ 
  gameId, 
  quarter,
  title = "Position Statistics" 
}: PositionStatsTableProps) {
  const { positionStats, isLoading, error } = useGameStatistics(gameId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !positionStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Position Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load position statistics. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter stats by quarter if specified
  const filteredStats = Object.values(positionStats).filter(stat => 
    !quarter || stat.quarter === quarter
  );

  // Group stats by position
  const statsByPosition: Record<Position, typeof filteredStats> = {} as any;
  
  allPositions.forEach(position => {
    statsByPosition[position] = filteredStats.filter(
      stat => stat.position === position
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title} {quarter ? `(Quarter ${quarter})` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead className="text-right">Goals</TableHead>
              <TableHead className="text-right">Goals Against</TableHead>
              <TableHead className="text-right">Intercepts</TableHead>
              <TableHead className="text-right">Rebounds</TableHead>
              <TableHead className="text-right">Errors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPositions.map(position => {
              // Get the stats for this position
              const posStats = statsByPosition[position];
              if (!posStats || posStats.length === 0) {
                return (
                  <TableRow key={position}>
                    <TableCell className="font-medium">{position}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                );
              }

              // Calculate totals across all quarters (or the specified quarter)
              const totals = posStats.reduce((acc, stat) => {
                return {
                  goalsFor: acc.goalsFor + stat.goalsFor,
                  goalsAgainst: acc.goalsAgainst + stat.goalsAgainst,
                  intercepts: acc.intercepts + stat.intercepts,
                  rebounds: acc.rebounds + stat.rebounds,
                  errors: acc.errors + stat.badPass + stat.handlingError
                };
              }, {
                goalsFor: 0,
                goalsAgainst: 0,
                intercepts: 0,
                rebounds: 0,
                errors: 0
              });

              return (
                <TableRow key={position}>
                  <TableCell className="font-medium">{position}</TableCell>
                  <TableCell className="text-right text-green-600">{totals.goalsFor}</TableCell>
                  <TableCell className="text-right text-red-600">{totals.goalsAgainst}</TableCell>
                  <TableCell className="text-right">{totals.intercepts}</TableCell>
                  <TableCell className="text-right">{totals.rebounds}</TableCell>
                  <TableCell className="text-right">{totals.errors}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}