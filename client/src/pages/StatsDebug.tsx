import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameStat, Position, allPositions } from '@shared/schema';
import SingleStatTester from '@/components/statistics/SingleStatTester';

export default function StatsDebug() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id);
  
  const { data: stats = [], isLoading } = useQuery<GameStat[]>({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => apiRequest(`/api/games/${gameId}/stats`),
    enabled: !!gameId && !isNaN(gameId),
    refetchInterval: 2000 // Auto refresh every 2 seconds
  });
  
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Function to directly create a new stat for testing
  const createTestStat = async () => {
    try {
      setStatusMessage('Creating test stat...');
      
      // Test stat for GS in Q1
      const payload = {
        gameId: gameId,
        position: 'GS' as Position,
        quarter: 1,
        goalsFor: 1,
        goalsAgainst: 0,
        missedGoals: 1,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0,
        rating: null
      };
      
      const response = await fetch('/api/game-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const result = await response.json();
        setStatusMessage(`Test stat created with ID: ${result.id}`);
      } else {
        setStatusMessage(`Failed to create test stat: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating test stat:', error);
      setStatusMessage(`Error: ${error}`);
    }
  };
  
  // Find stats for GS in Q1
  const gsQ1Stat = stats.find(s => s.position === 'GS' && s.quarter === 1);
  const gaQ1Stat = stats.find(s => s.position === 'GA' && s.quarter === 1);
  
  if (isLoading) {
    return <div className="container py-6">Loading stats...</div>;
  }
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Stats Debug for Game {gameId}</h1>
      
      <div className="bg-slate-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Status: {statusMessage || 'Ready'}</h2>
        <div className="flex gap-2">
          <Button onClick={createTestStat}>
            Create Test Stat
          </Button>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Current Stats ({stats.length} total)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.slice(0, 9).map(stat => (
          <Card key={stat.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50 py-2">
              <CardTitle className="text-md">
                {stat.position} - Q{stat.quarter} (ID: {stat.id})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Goals:</span> {stat.goalsFor}</div>
                <div><span className="font-medium">Against:</span> {stat.goalsAgainst}</div>
                <div><span className="font-medium">Misses:</span> {stat.missedGoals}</div>
                <div><span className="font-medium">Rebounds:</span> {stat.rebounds}</div>
                <div><span className="font-medium">Intercepts:</span> {stat.intercepts}</div>
                <div><span className="font-medium">Bad Passes:</span> {stat.badPass}</div>
                <div><span className="font-medium">Handling:</span> {stat.handlingError}</div>
                <div><span className="font-medium">Pick Ups:</span> {stat.pickUp}</div>
                <div><span className="font-medium">Infringements:</span> {stat.infringement}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Test Individual Stat Updates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gsQ1Stat && (
          <SingleStatTester 
            gameId={gameId}
            statId={gsQ1Stat.id}
            initialValue={gsQ1Stat.goalsFor || 0}
            statName="Goals For (GS Q1)"
            statField="goalsFor"
          />
        )}
        
        {gsQ1Stat && (
          <SingleStatTester 
            gameId={gameId}
            statId={gsQ1Stat.id}
            initialValue={gsQ1Stat.missedGoals || 0}
            statName="Missed Goals (GS Q1)"
            statField="missedGoals"
          />
        )}
        
        {gaQ1Stat && (
          <SingleStatTester 
            gameId={gameId}
            statId={gaQ1Stat.id}
            initialValue={gaQ1Stat.goalsFor || 0}
            statName="Goals For (GA Q1)"
            statField="goalsFor"
          />
        )}
        
        {gaQ1Stat && (
          <SingleStatTester 
            gameId={gameId}
            statId={gaQ1Stat.id}
            initialValue={gaQ1Stat.intercepts || 0}
            statName="Intercepts (GA Q1)"
            statField="intercepts"
          />
        )}
      </div>
    </div>
  );
}