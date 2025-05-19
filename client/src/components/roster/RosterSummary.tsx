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

export default function RosterSummary({ players, selectedGameId }: RosterSummaryProps) {
  // State to track player assignments by quarter and position
  const [positionAssignments, setPositionAssignments] = useState<Record<number, Record<Position, number | null>>>({
    1: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    2: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    3: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    4: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
  });
  
  // Fetch roster data directly from API
  const { data: gameRosters = [] as Roster[] } = useQuery<Roster[]>({
    queryKey: ['/api/games', selectedGameId, 'rosters'],
    enabled: !!selectedGameId
  });
  
  // Create a map for quick player lookups
  const playerMap = players.reduce((map, player) => {
    map[player.id] = player;
    return map;
  }, {} as Record<number, Player>);
  
  // Standard position order from GS to GK
  const positionOrder: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
  
  // Process the roster data whenever it changes
  useEffect(() => {
    if (!selectedGameId || !gameRosters || gameRosters.length === 0) return;
    
    // Start with empty position assignments
    const newAssignments = {
      1: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      2: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      3: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      4: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
    };
    
    console.log(`Found ${gameRosters.length} roster entries for game ${selectedGameId}`);
    
    // Fill in position assignments from roster data
    gameRosters.forEach((roster: Roster) => {
      if (roster.quarter >= 1 && roster.quarter <= 4) {
        const position = roster.position as Position;
        if (positionOrder.includes(position)) {
          newAssignments[roster.quarter][position] = roster.playerId;
        }
      }
    });
    
    // Update state with processed assignments
    setPositionAssignments(newAssignments);
  }, [gameRosters, selectedGameId]);
  
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
                  const playerId = positionAssignments[quarter][position];
                  const player = playerId !== null ? playerMap[playerId] : null;
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