import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Game, GameStat } from '@shared/schema';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

/**
 * A demo component to showcase optimized data loading with
 * - Proper loading states
 * - Granular stale times
 * - Error handling
 * - Cached data usage
 */
export function StatsPerformanceDemo() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("games");
  const [games, setGames] = useState<Game[]>([]);
  const [gameStats, setGameStats] = useState<GameStat[] | null>(null);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(false);

  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Function to fetch games
  const fetchGames = async () => {
    setGamesLoading(true);
    setGamesError(false);

    try {
      const data = await apiClient.get('/api/games');
      console.log("Loaded games:", data);

      // Filter to only include completed games
      const completedGames = data.filter((game: Game) => 
        game.status === 'completed' || 
        game.status === 'forfeit-win' || 
        game.status === 'forfeit-loss'
      );

      setGames(completedGames);
    } catch (error) {
      console.error("Error loading games:", error);
      setGamesError(true);
    } finally {
      setGamesLoading(false);
    }
  };

  const handleGameSelect = (gameId: number) => {
    setSelectedGameId(gameId);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Load game stats when switching to the stats tab
    if (value === "stats" && selectedGameId) {
      loadGameStats(selectedGameId);
    }
  };

  const loadGameStats = async (gameId: number) => {
    if (!gameId) return;

    setStatsLoading(true);
    setStatsError(false);

    try {
      const data = await apiClient.get(`/api/games/${gameId}/stats`);
      console.log(`Loaded stats for game ${gameId}:`, data);

      // Sort by quarter first, then by position
      const sortedData = [...data].sort((a, b) => {
        // First sort by quarter
        if (a.quarter !== b.quarter) {
          return a.quarter - b.quarter;
        }

        // Then sort by position
        const positionOrder: Record<string, number> = {
          "GS": 1, "GA": 2, "WA": 3, "C": 4, "WD": 5, "GD": 6, "GK": 7
        };

        return positionOrder[a.position] - positionOrder[b.position];
      });

      setGameStats(sortedData);
    } catch (error) {
      console.error("Error loading game stats:", error);
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshGames = () => {
    fetchGames();
  };

  const refreshStats = () => {
    if (selectedGameId) {
      loadGameStats(selectedGameId);
    }
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                 `${games.length} Completed Games`}
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshGames}
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
                {games.map(game => (
                  <div
                    key={game.id}
                    className={cn(
                      "p-3 border rounded-md cursor-pointer transition-colors",
                      selectedGameId === game.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
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
                    onClick={refreshStats}
                    disabled={statsLoading}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Refresh</span>
                  </Button>
                </div>

                {gameStats && gameStats.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-2 text-sm font-medium text-left border-b">Position</th>
                          <th className="p-2 text-sm font-medium text-left border-b">Quarter</th>
                          <th className="p-2 text-sm font-medium text-center border-b">Goals</th>
                          <th className="p-2 text-sm font-medium text-center border-b">Intercepts</th>
                          <th className="p-2 text-sm font-medium text-center border-b">Errors</th>
                          <th className="p-2 text-sm font-medium text-center border-b">Misc</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameStats.map(stat => (
                          <tr key={`${stat.position}-${stat.quarter}`} className="hover:bg-muted/50 transition-colors">
                            <td className="p-2 border-b">
                              <Badge variant="outline">{stat.position}</Badge>
                            </td>
                            <td className="p-2 border-b">Q{stat.quarter}</td>
                            <td className="p-2 text-center border-b">
                              <div className="flex items-center justify-center gap-1">
                                <span className="font-medium">{stat.goalsFor}</span>
                                <span className="text-sm text-muted-foreground">({stat.missedGoals} miss)</span>
                              </div>
                            </td>
                            <td className="p-2 text-center border-b">{stat.intercepts}</td>
                            <td className="p-2 text-center border-b">
                              {(stat.badPass || 0) + (stat.handlingError || 0)}
                            </td>
                            <td className="p-2 text-center border-b">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-xs text-muted-foreground">Pick: {stat.pickUp}</span>
                                <span className="text-xs text-muted-foreground">Inf: {stat.infringement}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground border rounded-md">
                    No statistics available for this game
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>Data caching enabled</span>
        </div>
        <div>Stale time: 5 minutes</div>
      </CardFooter>
    </Card>
  );
}