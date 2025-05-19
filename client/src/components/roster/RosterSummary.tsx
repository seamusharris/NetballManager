import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Player, Position } from '@shared/schema';
import { positionLabels } from '@/lib/utils';

interface RosterSummaryProps {
  selectedGameId: number | null;
  localRosterState?: Record<string, Record<string, number | null>>; // Local state for unsaved changes
  players?: Player[]; // Pass players directly
}

export default function RosterSummary({ 
  selectedGameId, 
  localRosterState,
  players = []
}: RosterSummaryProps) {
  // Type for quarters and positions
  type Quarter = 1 | 2 | 3 | 4;
  const quarters: Quarter[] = [1, 2, 3, 4];
  const positionOrder: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
  
  // Create a map for quick player lookups
  const playerMap: Record<number, Player> = {};
  players.forEach(player => {
    playerMap[player.id] = player;
  });
  
  // Show placeholder when no game is selected or no roster state available
  if (!selectedGameId || !localRosterState) {
    return (
      <Card className="mb-6 shadow-md">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Roster Summary</h3>
          <p className="text-gray-500">
            {!selectedGameId ? "Select a game to view roster" : "No roster data available"}
          </p>
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
                  {quarters.map(quarter => {
                    const quarterKey = quarter.toString();
                    const playerId = localRosterState[quarterKey]?.[position] || null;
                    const player = playerId !== null ? playerMap[playerId] : null;
                    
                    return (
                      <TableCell key={quarter} className="text-center">
                        {player ? (
                          <span className="font-medium">{player.displayName}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
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