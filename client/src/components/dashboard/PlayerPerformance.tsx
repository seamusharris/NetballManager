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
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  badPass: number;
  handlingError: number;
  pickUp: number;
  infringement: number;
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
    
    // Initialize all players with zeros
    players.forEach(player => {
      newPlayerStatsMap[player.id] = {
        playerId: player.id,
        goals: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0,
        rating: 0
      };
    });
    
    // Process all game stats
    Object.values(gameStatsMap).forEach(quarterStats => {
      quarterStats.forEach(stat => {
        if (!stat || !stat.playerId) return;
        
        const playerId = stat.playerId;
        // Check if player exists in our map
        if (!newPlayerStatsMap[playerId]) {
          // This might happen if a stat is for a player not in our player list
          console.warn(`Stats found for player ${playerId} who is not in the players list`);
          return;
        }
        
        // Accumulate all the stats
        newPlayerStatsMap[playerId].goals += stat.goalsFor || 0;
        newPlayerStatsMap[playerId].goalsAgainst += stat.goalsAgainst || 0;
        newPlayerStatsMap[playerId].missedGoals += stat.missedGoals || 0;
        newPlayerStatsMap[playerId].rebounds += stat.rebounds || 0;
        newPlayerStatsMap[playerId].intercepts += stat.intercepts || 0;
        newPlayerStatsMap[playerId].badPass += stat.badPass || 0;
        newPlayerStatsMap[playerId].handlingError += stat.handlingError || 0;
        newPlayerStatsMap[playerId].pickUp += stat.pickUp || 0;
        newPlayerStatsMap[playerId].infringement += stat.infringement || 0;
      });
    });
    
    // Process player ratings
    Object.values(newPlayerStatsMap).forEach(player => {
      // Get the player's quarter 1 stats to see if there's a rating
      // Find all quarter 1 stats for this player
      const playerQ1Stats = Object.values(gameStatsMap || {})
        .flatMap(stats => stats.filter(stat => 
          stat.playerId === player.playerId && 
          stat.quarter === 1 && 
          stat.rating !== undefined && 
          stat.rating !== null
        ))
        .sort((a, b) => b.id - a.id)[0]; // Sort by ID descending to get the most recent
      
      if (playerQ1Stats && typeof playerQ1Stats.rating === 'number') {
        // Use the stored rating if available
        player.rating = playerQ1Stats.rating;
      } else {
        // Calculate a default rating based on stats
        const calculatedRating = 5 + 
                      (player.goals * 0.5) +  // Each goal is worth 0.5 points
                      (player.rebounds * 0.5) + // Each rebound is worth 0.5 points
                      (player.intercepts * 0.8); // Each intercept is worth 0.8 points
                      
        // Ensure rating is between 1 and 10
        player.rating = Math.min(10, Math.max(1, calculatedRating));
      }
    });
    
    setPlayerStatsMap(newPlayerStatsMap);
  }, [gameStatsMap, isLoading, players]);
  
  // Generate a fixed color mapping for each player by ID
  const getAvatarColor = (player: Player) => {
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
    };
    
    // Return the fixed color or a fallback
    return colorMap[player.id] || 'bg-primary-light';
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
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Goals</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Opp Goals</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Missed</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rebounds</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Intercepts</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bad Pass</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pick Up</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Infr.</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="text-center py-4 text-gray-500">Loading player statistics...</td>
                </tr>
              ) : playersWithStats.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-4 text-gray-500">No player statistics available</td>
                </tr>
              ) : (
                playersWithStats.map(player => (
                  <tr key={player.id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white", getAvatarColor(player))}>
                          <span className="text-xs font-semibold">
                            {getInitials(player.firstName, player.lastName)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{player.displayName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.goals}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.goalsAgainst}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.missedGoals}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.rebounds}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.intercepts}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.badPass}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.handlingError}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.pickUp}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-mono">{player.stats.infringement}</td>
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