import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { Game, Player, GameStat } from '@shared/schema';
import { cn, getInitials } from '@/lib/utils';

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
  const [playerStats, setPlayerStats] = useState<Record<number, PlayerStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch game statistics for completed games
  useEffect(() => {
    const completedGameIds = games
      .filter(game => game.completed)
      .map(game => game.id);
      
    if (completedGameIds.length === 0) {
      setIsLoading(false);
      return;
    }
    
    const fetchAllGameStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch game stats for each completed game
        const statsPromises = completedGameIds.map(gameId => 
          fetch(`/api/games/${gameId}/stats`)
            .then(res => res.json())
        );
        
        const allGameStatsArrays = await Promise.all(statsPromises);
        
        // Calculate player statistics from all game stats
        const playerStatsMap: Record<number, PlayerStats> = {};
        
        // Initialize stats for all players
        players.forEach(player => {
          playerStatsMap[player.id] = {
            playerId: player.id,
            goals: 0,
            rebounds: 0,
            intercepts: 0,
            position: player.positionPreferences[0] || 'GS', // Use the first preferred position as default
            rating: 0
          };
        });
        
        // Combine stats from all games
        allGameStatsArrays.forEach(gameStats => {
          gameStats.forEach((stat: GameStat) => {
            if (stat.playerId && playerStatsMap[stat.playerId]) {
              const player = playerStatsMap[stat.playerId];
              
              player.goals += stat.goalsFor || 0;
              player.rebounds += stat.rebounds || 0;
              player.intercepts += stat.intercepts || 0;
              
              // We'll leave the player position as their preferred position from before
            }
          });
        });
        
        // Calculate player ratings based on their stats
        // Simple formula: (goals * 1.0 + rebounds * 0.5 + intercepts * 0.8) / number of games
        Object.values(playerStatsMap).forEach(player => {
          const totalContribution = 
            player.goals * 1.0 + 
            player.rebounds * 0.5 + 
            player.intercepts * 0.8;
            
          // Avoid division by zero
          const numGames = completedGameIds.length || 1;
          
          // Calculate rating on a scale of 1-10
          player.rating = Math.min(10, Math.max(1, (totalContribution / numGames) + 5));
        });
        
        setPlayerStats(playerStatsMap);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching game stats:", error);
        setIsLoading(false);
      }
    };
    
    fetchAllGameStats();
  }, [games, players]);
  
  const getAvatarColor = (player: Player) => {
    const colors = [
      'bg-primary-light', 'bg-accent', 'bg-secondary', 
      'bg-primary', 'bg-accent-dark'
    ];
    return colors[player.id % colors.length];
  };
  
  const getRatingClass = (rating: number) => {
    if (rating >= 9) return 'bg-success/20 text-success';
    if (rating >= 8) return 'bg-accent/20 text-accent';
    if (rating >= 7) return 'bg-warning/20 text-warning';
    return 'bg-error/20 text-error';
  };
  
  // Get players with their stats and sort by rating
  const playersWithStats = players
    .filter(player => playerStats[player.id])
    .map(player => ({
      ...player,
      stats: playerStats[player.id] || {
        playerId: player.id,
        goals: 0,
        rebounds: 0,
        intercepts: 0,
        position: player.positionPreferences[0] || 'GS',
        rating: 5.0
      }
    }))
    .sort((a, b) => b.stats.rating - a.stats.rating)
    .slice(0, 5); // Display top 5 players
  
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
                        <Avatar className={cn("h-8 w-8 text-white flex items-center justify-center", getAvatarColor(player))}>
                          <span className="text-xs font-bold">{getInitials(player.firstName, player.lastName)}</span>
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