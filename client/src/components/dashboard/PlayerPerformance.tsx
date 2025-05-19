import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game, Player, GameStat } from '@shared/schema';
import { cn, getInitials } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

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

type SortField = 'name' | 'goals' | 'goalsAgainst' | 'missedGoals' | 'rebounds' | 'intercepts' | 
                'badPass' | 'handlingError' | 'pickUp' | 'infringement' | 'rating';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function PlayerPerformance({ players, games, className }: PlayerPerformanceProps): JSX.Element {
  const [timeRange, setTimeRange] = useState('last5');
  const [playerStatsMap, setPlayerStatsMap] = useState<Record<number, PlayerStats>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'rating', direction: 'desc' });
  
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
        // Use cache-busting parameter to ensure we get fresh data
        const response = await fetch(`/api/games/${gameId}/stats?_t=${Date.now()}`);
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
    staleTime: 0, // Always get latest data
    gcTime: 15 * 60 * 1000,   // Keep data in cache for 15 minutes
    refetchOnWindowFocus: true // Refresh data when user returns to the window
  });
  
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
    
    // Process all game stats - but only include the latest game for accurate ratings display
    if (Object.keys(gameStatsMap).length > 0) {
      // Get the most recent game ID (should be the highest ID number)
      const gameIds = Object.keys(gameStatsMap).map(id => parseInt(id));
      const latestGameId = Math.max(...gameIds);
      
      // Get stats from only the latest game
      const latestGameStats = gameStatsMap[latestGameId] || [];
      
      // Process stats using a de-duplication approach to handle duplicate records
      // Create a map to track the most recent stat entry for each player in each quarter
      const dedupedStats: Record<number, Record<number, GameStat>> = {};
      
      // First identify the most recent stat for each player in each quarter
      latestGameStats.forEach(stat => {
        if (!stat || !stat.playerId || !stat.quarter) return;
        
        const playerId = stat.playerId;
        const quarter = stat.quarter;
        
        // Initialize player's stats map if needed
        if (!dedupedStats[playerId]) {
          dedupedStats[playerId] = {};
        }
        
        // Keep only the most recent stat for this player and quarter
        if (!dedupedStats[playerId][quarter] || 
            stat.id > dedupedStats[playerId][quarter].id) {
          dedupedStats[playerId][quarter] = stat;
        }
      });
      
      // Now process only the de-duplicated stats
      Object.values(dedupedStats).forEach(playerQuarterStats => {
        Object.values(playerQuarterStats).forEach(stat => {
          const playerId = stat.playerId;
          if (!newPlayerStatsMap[playerId]) return;
          
          // Add this player's stats
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
      
      console.log(`Using stats from game ${latestGameId} for the dashboard performance metrics`);
    }
    
    // Process player ratings - use only the most recent quarter 1 stats
    Object.values(newPlayerStatsMap).forEach(playerStat => {
      // Find all quarter 1 stats for this player across all games
      const quarter1Stats = Object.values(gameStatsMap)
        .flatMap(gameStats => 
          gameStats.filter(stat => 
            stat.playerId === playerStat.playerId && 
            stat.quarter === 1 && 
            stat.rating !== undefined && 
            stat.rating !== null
          )
        )
        .sort((a, b) => b.id - a.id); // Sort by ID descending
      
      // Use the most recent rating if available
      if (quarter1Stats.length > 0) {
        const latestRating = quarter1Stats[0].rating;
        if (typeof latestRating === 'number') {
          playerStat.rating = latestRating;
          console.log(`Using rating ${latestRating} for player ${playerStat.playerId} from stat ID ${quarter1Stats[0].id}`);
        }
      } else {
        // Calculate default rating based on performance
        const calculatedRating = 5 + 
          (playerStat.goals * 0.2) +
          (playerStat.rebounds * 0.3) + 
          (playerStat.intercepts * 0.4);
        
        playerStat.rating = Math.min(10, Math.max(1, calculatedRating));
      }
    });
    
    setPlayerStatsMap(newPlayerStatsMap);
  }, [gameStatsMap, isLoading, players]);
  
  // Generate a fixed color mapping for each player by ID
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
    };
    
    // Return the fixed color or a fallback
    return colorMap[player.id] || 'bg-primary-light';
  };
  
  const getRatingClass = (rating: number): string => {
    if (rating >= 9) return 'bg-success/20 text-success';
    if (rating >= 8) return 'bg-accent/20 text-accent';
    if (rating >= 7) return 'bg-warning/20 text-warning';
    return 'bg-error/20 text-error';
  };
  
  // Sort handler function
  const handleSort = (field: SortField) => {
    // If clicking the same field, toggle direction, otherwise set to default (desc)
    const direction = 
      sortConfig.field === field && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    
    setSortConfig({ field, direction });
  };
  
  // Get players with their stats
  const playersWithStats = players
    .map(player => ({
      ...player,
      stats: playerStatsMap[player.id] || {
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
        rating: 5.0
      }
    }))
    .sort((a, b) => {
      // Sort by the selected field and direction
      const { field, direction } = sortConfig;
      
      // Handle name sorting separately
      if (field === 'name') {
        if (direction === 'asc') {
          return a.displayName.localeCompare(b.displayName);
        } else {
          return b.displayName.localeCompare(a.displayName);
        }
      }
      
      // For numeric fields, sort numerically
      const aValue = field === 'rating' ? a.stats[field] : a.stats[field];
      const bValue = field === 'rating' ? b.stats[field] : b.stats[field];
      
      if (direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  
  // Column definitions
  const columns = [
    { field: 'name', label: 'Player' },
    { field: 'goals', label: 'Goals' },
    { field: 'goalsAgainst', label: 'Opp Goals' },
    { field: 'missedGoals', label: 'Missed' },
    { field: 'rebounds', label: 'Rebounds' },
    { field: 'intercepts', label: 'Intercepts' },
    { field: 'badPass', label: 'Bad Pass' },
    { field: 'handlingError', label: 'Errors' },
    { field: 'pickUp', label: 'Pick Up' },
    { field: 'infringement', label: 'Infr.' },
    { field: 'rating', label: 'Rating' },
  ];
  
  // Helper to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 inline" />;
    }
    
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3 inline text-primary" /> : 
      <ArrowDown className="ml-1 h-3 w-3 inline text-primary" />;
  };
  
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
                {columns.map((column) => (
                  <th 
                    key={column.field}
                    className={cn(
                      "px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50",
                      column.field === 'name' ? "text-left" : "text-center",
                      sortConfig.field === column.field ? "bg-gray-50" : ""
                    )}
                    onClick={() => handleSort(column.field as SortField)}
                  >
                    <span className="flex items-center justify-center">
                      {column.field === 'name' ? (
                        <span className="flex items-center justify-start">
                          {column.label} {renderSortIndicator(column.field as SortField)}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          {column.label} {renderSortIndicator(column.field as SortField)}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
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
                  <tr 
                    key={player.id} 
                    className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                    onClick={() => window.location.href = `/player/${player.id}`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white", getAvatarColor(player))}>
                          <span className="text-xs font-semibold">
                            {getInitials(player.firstName, player.lastName)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-blue-600">
                            {player.displayName}
                          </span>
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