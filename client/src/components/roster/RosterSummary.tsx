import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Roster, Player, Position } from '@shared/schema';
import { positionLabels } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface RosterSummaryProps {
  selectedGameId: number | null;
  updateTrigger?: number; // Optional counter to trigger refetch
}

export default function RosterSummary({ selectedGameId, updateTrigger = 0 }: RosterSummaryProps) {
  // Type for quarters
  type Quarter = 1 | 2 | 3 | 4;
  
  // Fetch roster data directly from API
  const { data: rosters = [], isLoading, refetch } = useQuery<Roster[]>({
    queryKey: ['/api/games/' + selectedGameId + '/rosters'],
    enabled: !!selectedGameId,
    refetchOnWindowFocus: true,
    staleTime: 0, // Don't use cached data
    refetchInterval: 1000, // Poll every second for updates
  });
  
  // Listen for update trigger and refetch when it changes
  useEffect(() => {
    if (selectedGameId && updateTrigger > 0) {
      console.log(`Roster update triggered (${updateTrigger}), refetching data for game ${selectedGameId}`);
      refetch();
    }
  }, [updateTrigger, selectedGameId, refetch]);
  
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
    if (!selectedGameId || !rosters.length) {
      console.log(`No roster data for game ${selectedGameId || 'none'}, rosters length: ${rosters?.length || 0}`);
      return;
    }
    
    console.log(`Processing ${rosters.length} roster entries for game ${selectedGameId}`);
    console.log("Roster data sample:", rosters.slice(0, 3));
    
    // Check if we have player data
    console.log(`We have ${Object.keys(playerMap).length} players in our player map`);
    console.log("Player map keys:", Object.keys(playerMap));
    
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
        
        // Debug each assignment
        const player = playerMap[roster.playerId];
        console.log(`Assignment: Q${quarter} ${position}: Player ID ${roster.playerId} -> ${player ? player.displayName : 'Unknown player'}`);
      }
    });
    
    setAssignments(newAssignments);
  }, [rosters, selectedGameId, playerMap]);
  
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
  
  // Add loading state
  if (isLoading) {
    return (
      <Card className="mb-6 shadow-md">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Roster Summary</h3>
          <p className="text-gray-500">Loading roster data...</p>
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
                    // Get player from map but only if ID exists and is in the map
                    const player = playerId !== null && playerMap[playerId] ? playerMap[playerId] : null;
                    return (
                      <TableCell key={q} className="text-center">
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