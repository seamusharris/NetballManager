import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Roster, Player, Position } from '@shared/schema';
import { positionLabels } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface RosterSummaryProps {
  rosters: Roster[];
  players: Player[];
  selectedGameId: number | null;
}

export default function RosterSummary({ rosters, players, selectedGameId }: RosterSummaryProps) {
  // Using the roster data passed from parent component
  const [rosterData, setRosterData] = useState<Roster[]>([]);
  
  useEffect(() => {
    // Filter rosters for current game
    if (selectedGameId) {
      const gameRosters = rosters.filter(r => r.gameId === selectedGameId);
      console.log("Game rosters for summary:", gameRosters);
      setRosterData(gameRosters);
    }
  }, [rosters, selectedGameId]);
  // Create a map for quick player lookups
  const playerMap = players.reduce((map, player) => {
    map[player.id] = player;
    return map;
  }, {} as Record<number, Player>);
  
  // Standard position order from GS to GK
  const positionOrder: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
  
  // Create a structured format for the roster data
  const quarterPositions: Record<number, Record<Position, number | null>> = {
    1: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    2: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    3: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    4: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
  };
  
  // Fill in the roster assignments
  rosters.forEach(roster => {
    if (roster.quarter >= 1 && roster.quarter <= 4) {
      // Make sure we're handling the position correctly
      const position = roster.position as Position;
      if (positionOrder.includes(position)) {
        quarterPositions[roster.quarter][position] = roster.playerId;
      }
    }
  });
  
  // Debug console
  console.log("Roster summary data:", rosters);
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Roster Summary</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Position</TableHead>
              <TableHead>Quarter 1</TableHead>
              <TableHead>Quarter 2</TableHead>
              <TableHead>Quarter 3</TableHead>
              <TableHead>Quarter 4</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positionOrder.map(position => (
              <TableRow key={position}>
                <TableCell className="font-medium">{positionLabels[position]}</TableCell>
                {[1, 2, 3, 4].map(quarter => {
                  const playerId = quarterPositions[quarter][position];
                  const player = playerId ? playerMap[playerId] : null;
                  return (
                    <TableCell key={quarter}>
                      {player ? player.displayName : '—'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}