import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Roster, Player, Position } from '@shared/schema';
import { positionLabels } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface RosterSummaryProps {
  players: Player[];
  selectedGameId: number | null;
}

export default function RosterSummary({ players, selectedGameId }: RosterSummaryProps) {
  // Type for quarters
  type Quarter = 1 | 2 | 3 | 4;
  
  // State to track player assignments by quarter and position
  const [positionAssignments, setPositionAssignments] = useState<Record<Quarter, Record<Position, number | null>>>({
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
    const newAssignments: Record<Quarter, Record<Position, number | null>> = {
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
        const quarter = roster.quarter as Quarter;
        if (positionOrder.includes(position)) {
          // Use proper typing to ensure we access valid quarters
          newAssignments[quarter][position] = roster.playerId;
        }
      }
    });
    
    // Update state with processed assignments
    setPositionAssignments(newAssignments);
  }, [gameRosters, selectedGameId]);
  
  // Define quarters array for strong typing
  const quarters: Quarter[] = [1, 2, 3, 4];
  
  return (
    <Card className="mb-6 shadow-md">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Roster Summary</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-24 font-bold">Position</TableHead>
                {quarters.map(q => (
                  <TableHead key={q} className="text-center font-semibold">Quarter {q}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {positionOrder.map(position => (
                <TableRow key={position} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{positionLabels[position]}</TableCell>
                  {quarters.map(q => {
                    const playerId = positionAssignments[q][position];
                    const player = playerId !== null ? playerMap[playerId] : null;
                    return (
                      <TableCell key={q} className="text-center">
                        {player ? player.displayName : '—'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}