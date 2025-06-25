import React from 'react';
import { useGameStatistics } from './hooks/useGameStatistics';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameScoreDisplay } from './GameScoreDisplay';
import { PositionStatsTable } from './PositionStatsTable';
import { Player } from '@shared/schema';

interface StatisticsControlPanelProps {
  gameId: number;
  players?: Player[];
  title?: string;
}

export function StatisticsControlPanel({ 
  gameId, 
  players,
  title = "Game Statistics" 
}: StatisticsControlPanelProps) {
  const [activeTab, setActiveTab] = React.useState('overview');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load game statistics. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="q1">Quarter 1</TabsTrigger>
            <TabsTrigger value="q2">Quarter 2</TabsTrigger>
            <TabsTrigger value="q3">Quarter 3</TabsTrigger>
            <TabsTrigger value="q4">Quarter 4</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-6">
            <GameScoreDisplay gameId={gameId} />
            <PositionStatsTable gameId={gameId} title="Full Game Position Stats" />
          </TabsContent>
          
          <TabsContent value="q1" className="mt-4 space-y-6">
            <PositionStatsTable gameId={gameId} quarter={1} title="Quarter 1 Position Stats" />
          </TabsContent>
          
          <TabsContent value="q2" className="mt-4 space-y-6">
            <PositionStatsTable gameId={gameId} quarter={2} title="Quarter 2 Position Stats" />
          </TabsContent>
          
          <TabsContent value="q3" className="mt-4 space-y-6">
            <PositionStatsTable gameId={gameId} quarter={3} title="Quarter 3 Position Stats" />
          </TabsContent>
          
          <TabsContent value="q4" className="mt-4 space-y-6">
            <PositionStatsTable gameId={gameId} quarter={4} title="Quarter 4 Position Stats" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}