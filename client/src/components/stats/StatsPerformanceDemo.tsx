import React, { useState } from 'react';
import { useGames, useGameStats } from '@/hooks/use-data-loader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A demo component to showcase optimized data loading with
 * - Proper loading states
 * - Granular stale times
 * - Error handling
 * - Cached data usage
 */
export function StatsPerformanceDemo() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  
  const { 
    data: games, 
    isLoading: gamesLoading, 
    isError: gamesError,
    refetch: refetchGames
  } = useGames();
  
  const {
    data: gameStats,
    isLoading: statsLoading,
    isError: statsError, 
    refetch: refetchStats
  } = useGameStats(selectedGameId);
  
  // Filter to only include completed games
  const completedGames = games?.filter(game => 
    game.status === 'completed' || game.status === 'forfeit-win' || game.status === 'forfeit-loss'
  ) || [];
  
  const handleGameSelect = (gameId: number) => {
    setSelectedGameId(gameId);
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto my-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Performance Optimized Data Loading</span>
          {(gamesLoading || statsLoading) && (
            <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
          )}
        </CardTitle>
        <CardDescription>
          Demonstrating improved query handling with granular stale times and error boundaries
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="games">Game List</TabsTrigger>
            <TabsTrigger value="stats" disabled={!selectedGameId}>
              Game Statistics
              {selectedGameId && (
                <Badge variant="outline" className="ml-2">
                  Game #{selectedGameId}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="games" className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <h3 className="text-sm font-medium">
                {gamesLoading ? 'Loading games...' : 
                 `${completedGames.length} Completed Games`}
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchGames()}
                disabled={gamesLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </Button>
            </div>
            
            {gamesError ? (
              <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Error loading games. Please try again.</span>
              </div>
            ) : gamesLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {completedGames.map(game => (
                  <div
                    key={game.id}
                    className={cn(
                      "p-3 border rounded-md cursor-pointer transition-colors",
                      selectedGameId === game.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-accent"
                    )}
                    onClick={() => handleGameSelect(game.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{game.date} {game.time}</h4>
                        <p className="text-sm text-muted-foreground">
                          {game.status === 'forfeit-win' || game.status === 'forfeit-loss' 
                            ? `Forfeit (${game.status})` 
                            : game.status}
                        </p>
                      </div>
                      <Badge variant={game.status === 'completed' ? 'default' : 'destructive'}>
                        Game #{game.id}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats">
            {!selectedGameId ? (
              <div className="p-4 text-center text-muted-foreground">
                Select a game to view statistics
              </div>
            ) : statsError ? (
              <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Error loading game statistics. Please try again.</span>
              </div>
            ) : statsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between py-2">
                  <h3 className="text-sm font-medium">
                    {gameStats?.length || 0} Statistics Entries
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refetchStats()}
                    disabled={statsLoading}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Refresh</span>
                  </Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from(new Set(gameStats?.map(stat => stat.position) || [])).map(position => (
                      <div key={position} className="border rounded-md p-3">
                        <h4 className="font-medium mb-2">{position}</h4>
                        <div className="space-y-1">
                          {gameStats
                            ?.filter(stat => stat.position === position)
                            .map(stat => (
                              <div key={stat.id} className="flex justify-between text-sm">
                                <span>Quarter {stat.quarter}</span>
                                <div className="flex items-center gap-1">
                                  {stat.goalsFor > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {stat.goalsFor} Goals
                                    </Badge>
                                  )}
                                  {stat.intercepts > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {stat.intercepts} Int
                                    </Badge>
                                  )}
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-muted/50 flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
            <span>Optimized Query Caching</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
            <span>Connection Pool Management</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
            <span>Indexed Database Queries</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}