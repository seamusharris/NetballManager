import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Player, Game, GameStat } from "@shared/schema";
import { cn, getInitials } from "@/lib/utils";
import { ArrowLeft, Award, Target, Shield, Activity } from "lucide-react";
import { useState } from "react";

export default function PlayerDetails() {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch player data
  const { data: player, isLoading: isLoadingPlayer } = useQuery<Player>({
    queryKey: [`/api/players/${playerId}`],
    enabled: !isNaN(playerId),
  });

  // Fetch all games
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });
  
  // Fetch all opponents
  const { data: opponents = [], isLoading: isLoadingOpponents } = useQuery<any[]>({
    queryKey: ['/api/opponents'],
  });

  // Fetch all player stats
  const { data: allGameStats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ['playerAllGameStats', playerId],
    queryFn: async () => {
      if (isNaN(playerId)) return {};
      
      const completedGames = (games as Game[]).filter(game => game.completed);
      const gameIds = completedGames.map(game => game.id);
      
      if (gameIds.length === 0) {
        return {};
      }
      
      // Fetch stats for each completed game
      const statsPromises = gameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/stats?_t=${Date.now()}`);
        const allStats = await response.json() as GameStat[];
        // Filter stats for only this player
        const playerStats = allStats.filter(stat => stat.playerId === playerId);
        return { gameId, stats: playerStats };
      });
      
      const results = await Promise.all(statsPromises);
      
      // Create a map of game ID to stats array
      const statsMap: Record<number, GameStat[]> = {};
      results.forEach(result => {
        if (result.stats.length > 0) {
          statsMap[result.gameId] = result.stats;
        }
      });
      
      return statsMap;
    },
    enabled: !isNaN(playerId) && (games as Game[]).length > 0,
  });

  const isLoading = isLoadingPlayer || isLoadingGames || isLoadingStats;

  // Calculate aggregate stats
  const calculateAggregateStats = () => {
    if (!allGameStats || Object.keys(allGameStats).length === 0) {
      return {
        totalGames: 0,
        totalGoals: 0,
        totalGoalsAgainst: 0,
        totalMissedGoals: 0,
        totalRebounds: 0,
        totalIntercepts: 0,
        totalBadPasses: 0,
        totalHandlingErrors: 0,
        totalPickUps: 0,
        totalInfringements: 0,
        averageRating: 0,
        gameStats: []
      };
    }

    let totalGames = 0;
    let totalGoals = 0;
    let totalGoalsAgainst = 0;
    let totalMissedGoals = 0;
    let totalRebounds = 0;
    let totalIntercepts = 0;
    let totalBadPasses = 0;
    let totalHandlingErrors = 0;
    let totalPickUps = 0;
    let totalInfringements = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    
    const gameStatSummaries: {
      gameId: number,
      date: string,
      opponent: string,
      goals: number,
      goalsAgainst: number,
      rebounds: number,
      intercepts: number,
      rating: number
    }[] = [];

    // Process each game's stats
    Object.entries(allGameStats).forEach(([gameIdStr, stats]) => {
      if (!stats || stats.length === 0) return;
      
      const gameId = parseInt(gameIdStr);
      const game = games.find(g => g.id === gameId);
      if (!game) return;
      
      totalGames++;
      
      // Find opponent name from opponent ID
      const opponent = opponents.find(o => o.id === game.opponentId);
      const opponentName = opponent ? opponent.teamName : `Team #${game.opponentId}`;
      
      // Sum stats for this game
      let gameGoals = 0;
      let gameGoalsAgainst = 0;
      let gameMissedGoals = 0;
      let gameRebounds = 0;
      let gameIntercepts = 0;
      let gameBadPasses = 0;
      let gameHandlingErrors = 0;
      let gamePickUps = 0;
      let gameInfringements = 0;
      let gameRating = 0;
      
      stats.forEach(stat => {
        gameGoals += stat.goalsFor || 0;
        gameGoalsAgainst += stat.goalsAgainst || 0;
        gameMissedGoals += stat.missedGoals || 0;
        gameRebounds += stat.rebounds || 0;
        gameIntercepts += stat.intercepts || 0;
        gameBadPasses += stat.badPass || 0;
        gameHandlingErrors += stat.handlingError || 0;
        gamePickUps += stat.pickUp || 0;
        gameInfringements += stat.infringement || 0;
        
        // Use quarter 1 rating as the game rating
        if (stat.quarter === 1 && typeof stat.rating === 'number') {
          gameRating = stat.rating;
          ratingSum += stat.rating;
          ratingCount++;
        }
      });
      
      // Add to totals
      totalGoals += gameGoals;
      totalGoalsAgainst += gameGoalsAgainst;
      totalMissedGoals += gameMissedGoals;
      totalRebounds += gameRebounds;
      totalIntercepts += gameIntercepts;
      totalBadPasses += gameBadPasses;
      totalHandlingErrors += gameHandlingErrors;
      totalPickUps += gamePickUps;
      totalInfringements += gameInfringements;
      
      // Add game summary
      gameStatSummaries.push({
        gameId,
        date: game.date,
        opponent: opponentName,
        goals: gameGoals,
        goalsAgainst: gameGoalsAgainst,
        rebounds: gameRebounds,
        intercepts: gameIntercepts,
        rating: gameRating
      });
    });
    
    // Sort game summaries by date (most recent first)
    gameStatSummaries.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return {
      totalGames,
      totalGoals,
      totalGoalsAgainst,
      totalMissedGoals,
      totalRebounds,
      totalIntercepts,
      totalBadPasses,
      totalHandlingErrors,
      totalPickUps,
      totalInfringements,
      averageRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
      gameStats: gameStatSummaries
    };
  };

  const stats = calculateAggregateStats();

  // Generate avatar color
  const getAvatarColor = (player: Player): string => {
    // Fixed color mapping by player ID to ensure consistency
    const colorMap: Record<number, string> = {
      1: 'bg-blue-500',     // Lucia
      2: 'bg-purple-500',   // Isla
      3: 'bg-pink-500',     // JoJo
      4: 'bg-green-500',    // Abby D
      5: 'bg-accent',       // Abbey N
      6: 'bg-secondary',    // Mila
      7: 'bg-orange-500',   // Emily
      8: 'bg-primary',      // Ollie
      9: 'bg-red-500',      // Evie
    };
    
    // For any player not in the map, generate a deterministic color based on player ID
    if (!player?.id || !colorMap[player.id]) {
      // Use a deterministic algorithm based on ID to choose from a set of good colors
      const availableColors = [
        'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-yellow-600', 
        'bg-pink-600', 'bg-indigo-600', 'bg-red-600', 'bg-cyan-600', 
        'bg-amber-600', 'bg-lime-600', 'bg-emerald-600', 'bg-teal-600',
        'bg-violet-600', 'bg-fuchsia-600', 'bg-rose-600'
      ];
      
      if (!player?.id) return 'bg-gray-500'; // Default fallback if no player
      
      // Use player ID modulo the number of colors to select one deterministically
      const colorIndex = player.id % availableColors.length;
      return availableColors[colorIndex];
    }
    
    return colorMap[player.id];
  };

  const getRatingClass = (rating: number): string => {
    if (rating >= 9) return 'bg-success/20 text-success';
    if (rating >= 8) return 'bg-accent/20 text-accent';
    if (rating >= 7) return 'bg-warning/20 text-warning';
    return 'bg-error/20 text-error';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Loading player data...</h1>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Player not found</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{player.displayName} - Player Details | Netball Team Manager</title>
        <meta name="description" content={`Performance statistics and details for ${player.displayName}`} />
      </Helmet>
      
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Player Info Card */}
          <Card className="flex-grow md:w-1/3 md:max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={cn("h-16 w-16 rounded-full flex items-center justify-center text-white mr-4", getAvatarColor(player))}>
                  <span className="text-lg font-semibold">
                    {getInitials(player.firstName, player.lastName)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">{player.displayName}</h1>
                  <p className="text-gray-600">{player.firstName} {player.lastName}</p>
                  {player.dateOfBirth && (
                    <p className="text-sm text-gray-500 mt-1">
                      DOB: {new Date(player.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Position Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {player.positionPreferences?.map((position, index) => (
                    <span key={index} className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium", 
                      index === 0 ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-700"
                    )}>
                      {position} {index === 0 && <span className="ml-1">(Primary)</span>}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex items-center">
                <span className="mr-2">Status:</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  player.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                )}>
                  {player.active ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Performance Summary Card */}
          <Card className="flex-grow">
            <CardHeader className="pb-2">
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Award className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className={cn("mt-1 px-2 py-1 rounded-full text-sm font-semibold", getRatingClass(stats.averageRating))}>
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Target className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-gray-600">Goals Scored</span>
                  <span className="mt-1 text-lg font-semibold">{stats.totalGoals}</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-gray-600">Intercepts</span>
                  <span className="mt-1 text-lg font-semibold">{stats.totalIntercepts}</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Activity className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-gray-600">Rebounds</span>
                  <span className="mt-1 text-lg font-semibold">{stats.totalRebounds}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Season Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Games Played</p>
                        <p className="text-lg font-semibold">{stats.totalGames}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Goals Scored</p>
                        <p className="text-lg font-semibold">{stats.totalGoals}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Goals Against</p>
                        <p className="text-lg font-semibold">{stats.totalGoalsAgainst}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Missed Goals</p>
                        <p className="text-lg font-semibold">{stats.totalMissedGoals}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Rebounds</p>
                        <p className="text-lg font-semibold">{stats.totalRebounds}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Intercepts</p>
                        <p className="text-lg font-semibold">{stats.totalIntercepts}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Bad Passes</p>
                        <p className="text-lg font-semibold">{stats.totalBadPasses}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Handling Errors</p>
                        <p className="text-lg font-semibold">{stats.totalHandlingErrors}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Pick Ups</p>
                        <p className="text-lg font-semibold">{stats.totalPickUps}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Infringements</p>
                        <p className="text-lg font-semibold">{stats.totalInfringements}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Recent Games</h3>
                    {stats.gameStats.length === 0 ? (
                      <p className="text-gray-500">No game statistics available</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2">Date</th>
                              <th className="text-left py-2 px-2">Opponent</th>
                              <th className="text-center py-2 px-2">Goals</th>
                              <th className="text-center py-2 px-2">Rebounds</th>
                              <th className="text-center py-2 px-2">Intercepts</th>
                              <th className="text-center py-2 px-2">Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.gameStats.slice(0, 5).map((game) => (
                              <tr key={game.gameId} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-2">{new Date(game.date).toLocaleDateString()}</td>
                                <td className="py-2 px-2">{game.opponent}</td>
                                <td className="py-2 px-2 text-center">{game.goals}</td>
                                <td className="py-2 px-2 text-center">{game.rebounds}</td>
                                <td className="py-2 px-2 text-center">{game.intercepts}</td>
                                <td className="py-2 px-2 text-center">
                                  <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getRatingClass(game.rating))}>
                                    {game.rating.toFixed(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="games">
            <Card>
              <CardHeader>
                <CardTitle>Game Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.gameStats.length === 0 ? (
                  <p className="text-gray-500">No game statistics available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Date</th>
                          <th className="text-left py-2 px-2">Opponent</th>
                          <th className="text-center py-2 px-2">Goals</th>
                          <th className="text-center py-2 px-2">Goals Against</th>
                          <th className="text-center py-2 px-2">Rebounds</th>
                          <th className="text-center py-2 px-2">Intercepts</th>
                          <th className="text-center py-2 px-2">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.gameStats.map((game) => (
                          <tr key={game.gameId} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2">{new Date(game.date).toLocaleDateString()}</td>
                            <td className="py-2 px-2">{game.opponent}</td>
                            <td className="py-2 px-2 text-center">{game.goals}</td>
                            <td className="py-2 px-2 text-center">{game.goalsAgainst}</td>
                            <td className="py-2 px-2 text-center">{game.rebounds}</td>
                            <td className="py-2 px-2 text-center">{game.intercepts}</td>
                            <td className="py-2 px-2 text-center">
                              <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getRatingClass(game.rating))}>
                                {game.rating.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Offensive Stats */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Offensive Stats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">Scoring</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Goals Scored:</span>
                            <span className="font-semibold">{stats.totalGoals}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Missed Goals:</span>
                            <span className="font-semibold">{stats.totalMissedGoals}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shooting %:</span>
                            <span className="font-semibold">
                              {stats.totalGoals + stats.totalMissedGoals > 0 
                                ? Math.round((stats.totalGoals / (stats.totalGoals + stats.totalMissedGoals)) * 100) 
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">Ball Control</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pick Ups:</span>
                            <span className="font-semibold">{stats.totalPickUps}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bad Passes:</span>
                            <span className="font-semibold">{stats.totalBadPasses}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Handling Errors:</span>
                            <span className="font-semibold">{stats.totalHandlingErrors}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Defensive Stats */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Defensive Stats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">Defense</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Intercepts:</span>
                            <span className="font-semibold">{stats.totalIntercepts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rebounds:</span>
                            <span className="font-semibold">{stats.totalRebounds}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Goals Against:</span>
                            <span className="font-semibold">{stats.totalGoalsAgainst}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">Discipline</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Infringements:</span>
                            <span className="font-semibold">{stats.totalInfringements}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Infringements per Game:</span>
                            <span className="font-semibold">
                              {stats.totalGames > 0 
                                ? (stats.totalInfringements / stats.totalGames).toFixed(1) 
                                : "0.0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Per Game Averages */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Per Game Averages</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {stats.totalGames > 0 ? (
                        <>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Goals</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalGoals / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Rebounds</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalRebounds / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Intercepts</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalIntercepts / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Bad Passes</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalBadPasses / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Handling Errors</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalHandlingErrors / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500 col-span-5">No game data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}