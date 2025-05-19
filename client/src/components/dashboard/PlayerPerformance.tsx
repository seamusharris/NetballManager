import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { Game, Player } from '@shared/schema';
import { cn, getInitials } from '@/lib/utils';
import { useState } from 'react';

interface PlayerPerformanceProps {
  players: Player[];
  games: Game[];
  className?: string;
}

export default function PlayerPerformance({ players, games, className }: PlayerPerformanceProps) {
  const [timeRange, setTimeRange] = useState('last5');
  
  // This would come from actual player stats in a real implementation
  // Using placeholder data for demonstration
  const getPlayerStats = (player: Player) => {
    // Generate somewhat random but consistent stats based on player id
    const seed = player.id;
    return {
      position: ['GA', 'GS', 'WA', 'C', 'WD', 'GD', 'GK'][seed % 7],
      goals: 5 + (seed * 3) % 20,
      rebounds: 2 + (seed * 7) % 10,
      intercepts: 2 + (seed * 11) % 13,
      rating: (7 + (seed * 23) % 30) / 10
    };
  };
  
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
  
  // Sort players by rating for display
  const sortedPlayers = [...players]
    .map(player => ({ ...player, stats: getPlayerStats(player) }))
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
              {sortedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">No player data available</td>
                </tr>
              ) : (
                sortedPlayers.map(player => (
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
