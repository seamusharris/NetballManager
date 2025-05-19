import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Game, Player, GameStat } from '@shared/schema';
import { cn, getInitials, generateRandomColor } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface PlayerPerformanceProps {
  players: Player[];
  games: Game[];
  className?: string;
}

interface PlayerStats {
  playerId: number;
  goals: number;
  rebounds: number;
  intercepts: number;
  position: string;
  rating: number;
}

export default function PlayerPerformance({ players, games, className }: PlayerPerformanceProps) {
  const [timeRange, setTimeRange] = useState('last5');
  
  // Get only completed games
  const completedGames = games.filter(game => game.completed);
  const gameIds = completedGames.map(game => game.id);
  const enableQuery = gameIds.length > 0;
  
  // Use React Query to fetch and cache game statistics
  const { data: gameStatsMap, isLoading } = useQuery({
    queryKey: ['playerGameStats', ...gameIds],
    queryFn: async () => {
      if (gameIds.length === 0) {
        return {};
      }
      
      // Fetch stats for each completed game
      const statsPromises = gameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/stats`);
        const stats = await response.json();
        return { gameId, stats };
      });
      
      const results = await Promise.all(statsPromises);
      
      // Create a map of game ID to stats array
      const statsMap: Record<number, GameStat[]> = {};
      results.forEach(result => {
        statsMap[result.gameId] = result.stats;
      });
      
      return statsMap;
    },
    enabled: enableQuery,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 15 * 60 * 1000,   // Keep data in cache for 15 minutes
  });
  
  // State to store calculated player stats
  const [playerStatsMap, setPlayerStatsMap] = useState<Record<number, PlayerStats>>({});
  
  // When game stats or players change, recalculate player statistics
  useEffect(() => {
    if (!gameStatsMap || isLoading || players.length === 0) return;
    
    const newPlayerStatsMap: Record<number, PlayerStats> = {};
    
    // Initialize stats for all players
    players.forEach(player => {
      newPlayerStatsMap[player.id] = {
        playerId: player.id,
        goals: 0,
        rebounds: 0,
        intercepts: 0,
        position: player.positionPreferences[0] || 'GS', // Use the first preferred position as default
        rating: 0
      };
    });
    
    // First, get all game stats and log them for debugging
    const gameStats = Object.values(gameStatsMap).flatMap(stats => stats);
    console.log('All game stats:', gameStats);
    
    // Count appearances for each player across all games and quarters
    const playerAppearances: Record<number, number> = {};
    players.forEach(player => {
      playerAppearances[player.id] = 0;
    });
    
    // Process each game's stats and aggregate them by player
    Object.values(gameStatsMap).forEach(gameStats => {
      // Create a set of players who appeared in this game
      const playersInGame = new Set<number>();
      
      gameStats.forEach(stat => {
        // Ensure the player exists in our stats map
        if (stat.playerId && newPlayerStatsMap[stat.playerId]) {
          const player = newPlayerStatsMap[stat.playerId];
          
          // Add player to the set of players in this game
          playersInGame.add(stat.playerId);
          
          // Accumulate stats
          player.goals += stat.goalsFor || 0;
          player.rebounds += stat.rebounds || 0;
          player.intercepts += stat.intercepts || 0;
          
          // We don't track positions in the game stats currently
          // We'll use the player's preferred position from their profile
        }
      });
      
      // Increment appearance count for each player who was in this game
      playersInGame.forEach(playerId => {
        playerAppearances[playerId] = (playerAppearances[playerId] || 0) + 1;
      });
    });
    
    // Calculate player ratings based on their stats
    Object.values(newPlayerStatsMap).forEach(player => {
      // Get the number of games this player appeared in
      const appearances = playerAppearances[player.playerId] || 1;
      
      // Calculate per-game averages
      const avgGoals = player.goals / appearances;
      const avgRebounds = player.rebounds / appearances;
      const avgIntercepts = player.intercepts / appearances;
      
      // Advanced rating formula:
      // Base: 5 points
      // Goals: +1 point per average goal
      // Rebounds: +0.5 points per average rebound
      // Intercepts: +0.8 points per average intercept
      const rating = 5 + 
                    (avgGoals * 1.0) + 
                    (avgRebounds * 0.5) + 
                    (avgIntercepts * 0.8);
      
      // Ensure rating is between 1 and 10
      player.rating = Math.min(10, Math.max(1, rating));
    });
    
    setPlayerStatsMap(newPlayerStatsMap);
  }, [gameStatsMap, isLoading, players]);
  
  // Generate consistent avatar colors based on player names
  const getAvatarColor = (player: Player) => {
    // Use the player's full name as a seed for the color generator
    const fullName = `${player.firstName} ${player.lastName}`;
    
    // Create deterministic background color from the fullName
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to tailwind class color
    const colorClasses = [
      'bg-primary-light', 'bg-accent', 'bg-secondary', 
      'bg-primary', 'bg-accent-dark', 'bg-success', 'bg-warning',
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'
    ];
    
    return colorClasses[Math.abs(hash) % colorClasses.length];
  };
  
  const getRatingClass = (rating: number) => {
    if (rating >= 9) return 'bg-success/20 text-success';
    if (rating >= 8) return 'bg-accent/20 text-accent';
    if (rating >= 7) return 'bg-warning/20 text-warning';
    return 'bg-error/20 text-error';
  };
  
  // Get players with their stats and sort by rating
  const playersWithStats = players
    .map(player => ({
      ...player,
      stats: playerStatsMap[player.id] || {
        playerId: player.id,
        goals: 0,
        rebounds: 0,
        intercepts: 0,
        position: player.positionPreferences[0] || 'GS',
        rating: 5.0
      }
    }))
    .sort((a, b) => b.stats.rating - a.stats.rating); // Show all players, sorted by rating
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Player Performance</h3>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-white border rounded-md w-[140px] h-8 text-sm">
              <SelectValue placeholder="Last 5 Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last5">Last 5 Games</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="season">This Season</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Goals</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rebounds</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Intercepts</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">Loading player statistics...</td>
                </tr>
              ) : playersWithStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">No player statistics available</td>
                </tr>
              ) : (
                playersWithStats.map(player => (
                  <tr key={player.id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 text-white flex items-center justify-center">
                          <AvatarFallback className={cn("text-white", getAvatarColor(player))}>
                            {getInitials(player.firstName, player.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{player.displayName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{player.stats.position}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.goals}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.rebounds}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.intercepts}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getRatingClass(player.stats.rating))}>
                          {player.stats.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}