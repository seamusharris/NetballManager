import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Roster, Player, Position } from '@shared/schema';
import { positionLabels } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface RosterSummaryProps {
  selectedGameId: number | null;
}

export default function RosterSummary({ selectedGameId }: RosterSummaryProps) {
  // Type for quarters
  type Quarter = 1 | 2 | 3 | 4;
  
  // Fetch roster data directly from API
  const { data: rosters = [] } = useQuery<Roster[]>({
    queryKey: ['/api/games', selectedGameId, 'rosters'],
    enabled: !!selectedGameId
  });
  
  // Fetch players directly from API
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/players'],
    enabled: true
  });
  
  // Create a map for quick player lookups
  const playerMap = React.useMemo(() => {
    const map: Record<number, Player> = {};
    players.forEach(player => {
      map[player.id] = player;
    });
    return map;
  }, [players]);
  
  // State to track player assignments by quarter and position
  const [assignments, setAssignments] = useState<Record<Quarter, Record<Position, number | null>>>({
    1: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    2: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    3: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    4: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
  });
  
  // Standard position order from GS to GK
  const positionOrder: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
  
  // Process the roster data whenever it changes
  useEffect(() => {
    if (!selectedGameId || !rosters.length) return;
    
    const newAssignments = {
      1: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      2: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      3: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      4: { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
    } as Record<Quarter, Record<Position, number | null>>;
    
    // Fill in position assignments from roster data
    rosters.forEach(roster => {
      if (roster.quarter >= 1 && roster.quarter <= 4) {
        const quarter = roster.quarter as Quarter;
        const position = roster.position as Position;
        newAssignments[quarter][position] = roster.playerId;
      }
    });
    
    setAssignments(newAssignments);
  }, [rosters, selectedGameId]);
  
  // Define quarters array for display
  const quarters: Quarter[] = [1, 2, 3, 4];
  
  if (!selectedGameId) {
    return (
      <Card className="mb-6 shadow-md">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Roster Summary</h3>
          <p className="text-gray-500">Select a game to view roster</p>
        </CardContent>
      </Card>
    );
  }
  
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
                    const playerId = assignments[q][position];
                    const player = playerId !== null && playerMap[playerId] ? playerMap[playerId] : null;
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