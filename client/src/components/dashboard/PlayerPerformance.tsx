import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  gamesPlayed: number;
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

type SortField = 'name' | 'gamesPlayed' | 'goals' | 'goalsAgainst' | 'missedGoals' | 'rebounds' | 'intercepts' | 
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
  
  // Use React Query to fetch and cache game statistics and rosters
  const { data: gameStatsMap, isLoading: isLoadingStats } = useQuery({
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
  
  // Fetch roster data for tracking games played
  const { data: gameRostersMap, isLoading: isLoadingRosters } = useQuery({
    queryKey: ['gameRosters', ...gameIds],
    queryFn: async () => {
      if (gameIds.length === 0) {
        return {};
      }
      
      // Fetch rosters for each game to count games played
      const rosterPromises = gameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/rosters`);
        const rosters = await response.json();
        return { gameId, rosters };
      });
      
      const results = await Promise.all(rosterPromises);
      
      // Create a map of game ID to rosters array
      const rostersMap: Record<number, any[]> = {};
      results.forEach(result => {
        rostersMap[result.gameId] = result.rosters;
      });
      
      return rostersMap;
    },
    enabled: enableQuery,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true
  });
  
  // Combined loading state
  const isLoading = isLoadingStats || isLoadingRosters;
  
  // When game stats or players change, recalculate player statistics
  useEffect(() => {
    if (!gameStatsMap || isLoading || players.length === 0) return;
    
    const newPlayerStatsMap: Record<number, PlayerStats> = {};
    
    // Initialize all players with zeros
    players.forEach(player => {
      newPlayerStatsMap[player.id] = {
        playerId: player.id,
        gamesPlayed: 0,
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
    
    // Count games played from rosters (any game where player had a position in any quarter)
    if (gameRostersMap && Object.keys(gameRostersMap).length > 0) {
      // Track which games each player participated in
      const playerGameIds: Record<number, Set<number>> = {};
      
      // Initialize sets for each player
      players.forEach(player => {
        playerGameIds[player.id] = new Set();
      });
      
      // Process all game rosters
      Object.entries(gameRostersMap).forEach(([gameIdStr, rosters]) => {
        const gameId = parseInt(gameIdStr);
        
        // For each roster entry in this game
        if (Array.isArray(rosters)) {
          rosters.forEach((roster: any) => {
            const playerId = roster.playerId;
            
            // If player is assigned to a position in any quarter, count them as having played
            if (playerId && roster.position && playerGameIds[playerId]) {
              playerGameIds[playerId].add(gameId);
            }
          });
        }
      });
      
      // Update games played count for each player
      players.forEach(player => {
        if (playerGameIds[player.id] && newPlayerStatsMap[player.id]) {
          newPlayerStatsMap[player.id].gamesPlayed = playerGameIds[player.id].size;
        }
      });
    }
    
    // Process all game stats - summing across ALL completed games for total stats
    if (Object.keys(gameStatsMap).length > 0) {
      // Process combined stats from all games
      const allGameStats = Object.values(gameStatsMap).flatMap(stats => stats);
      
      // Process stats using a de-duplication approach to handle duplicate records
      // Create a map to track the most recent stat entry for each player in each quarter of each game
      const dedupedStats: Record<number, Record<string, GameStat>> = {};
      
      // First identify the most recent stat for each player in each quarter of each game
      allGameStats.forEach(stat => {
        if (!stat || !stat.playerId || !stat.quarter || !stat.gameId) return;
        
        const playerId = stat.playerId;
        const uniqueKey = `${stat.gameId}-${stat.quarter}`; // Unique key per game and quarter
        
        // Initialize player's stats map if needed
        if (!dedupedStats[playerId]) {
          dedupedStats[playerId] = {};
        }
        
        // Keep only the most recent stat for this player and quarter in this game
        if (!dedupedStats[playerId][uniqueKey] || 
            stat.id > dedupedStats[playerId][uniqueKey].id) {
          dedupedStats[playerId][uniqueKey] = stat;
        }
      });
      
      // Now process only the de-duplicated stats to get player totals across all games
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
      
      console.log(`Using stats from all ${Object.keys(gameStatsMap).length} completed games for dashboard player performance`);
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
  
  // Get the player's stored avatar color
  const getAvatarColor = (player: Player): string => {
    // If the player has a stored avatar color, use it
    if (player?.avatarColor) {
      return player.avatarColor;
    }
    
    // Default fallback if the player has no stored color
    return 'bg-gray-500';
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
        gamesPlayed: 0,
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
  
  // Column definitions with categories
  const statCategories = [
    { 
      name: 'Games', 
      fields: [
        { field: 'gamesPlayed', label: 'Played' },
        { field: 'rating', label: 'Rating' },
      ]
    },
    { 
      name: 'Shooting', 
      fields: [
        { field: 'goals', label: 'For' },
        { field: 'goalsAgainst', label: 'Agn' },
        { field: 'missedGoals', label: 'Miss' },
      ]
    },
    { 
      name: 'Defense', 
      fields: [
        { field: 'intercepts', label: 'Int' },
        { field: 'rebounds', label: 'Reb' },
        { field: 'pickUp', label: 'Pick' },
      ]
    },
    { 
      name: 'Errors', 
      fields: [
        { field: 'badPass', label: 'Pass' },
        { field: 'handlingError', label: 'Hand' },
        { field: 'infringement', label: 'Pen' },
      ]
    },
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
        
        <div className="overflow-x-auto border-t border-l border-b rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="min-w-[120px] border-b">Player</TableHead>
                <TableHead className="text-center w-10 border-r border-b"></TableHead>
                
                {/* Stat category headers */}
                {statCategories.map((category, index) => (
                  <TableHead 
                    key={category.name} 
                    colSpan={category.fields.length}
                    className={`text-center bg-blue-50 border-r border-b ${index === 0 ? 'border-l' : ''}`}
                  >
                    {category.name}
                  </TableHead>
                ))}
              </TableRow>
              
              {/* Stat field headers */}
              <TableRow>
                <TableHead className="border-b"></TableHead>
                <TableHead className="border-r border-b"></TableHead>
                
                {statCategories.map((category, categoryIndex) => (
                  category.fields.map((field, fieldIndex) => {
                    // Add right border to last column in each category
                    const isLastInCategory = fieldIndex === category.fields.length - 1;
                    // Add left border to first column in each category (except the first category)
                    const isFirstInCategory = fieldIndex === 0;
                    const needsLeftBorder = isFirstInCategory && categoryIndex > 0;
                    
                    return (
                      <TableHead 
                        key={field.field}
                        className={`text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 border-b ${isLastInCategory ? 'border-r' : ''} ${needsLeftBorder ? 'border-l' : ''} ${sortConfig.field === field.field ? 'bg-gray-50' : ''}`}
                        onClick={() => handleSort(field.field as SortField)}
                      >
                        {field.label} {renderSortIndicator(field.field as SortField)}
                      </TableHead>
                    );
                  })
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4 text-gray-500 border-b">Loading player statistics...</TableCell>
                </TableRow>
              ) : playersWithStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4 text-gray-500 border-b">No player statistics available</TableCell>
                </TableRow>
              ) : (
                playersWithStats.map((player, playerIndex) => (
                  <TableRow 
                    key={player.id} 
                    className={`hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${playerIndex === playersWithStats.length - 1 ? "" : "border-b"}`}
                    onClick={() => window.location.href = `/player/${player.id}`}
                  >
                    {/* Player column */}
                    <TableCell className="px-3 py-2 whitespace-nowrap">
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
                    </TableCell>
                    
                    <TableCell className="border-r"></TableCell>
                    
                    {/* Games Played */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                      {player.stats.gamesPlayed}
                    </TableCell>
                    
                    {/* Rating */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-center border-r">
                      <span className={cn("text-sm font-mono", getRatingClass(player.stats.rating))}>
                        {player.stats.rating.toFixed(1)}
                      </span>
                    </TableCell>
                    
                    {/* Shooting stats */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.goals}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.goalsAgainst}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                      {player.stats.missedGoals}
                    </TableCell>
                    
                    {/* Defense stats */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.intercepts}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.rebounds}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                      {player.stats.pickUp}
                    </TableCell>
                    
                    {/* Errors stats */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.badPass}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.handlingError}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                      {player.stats.infringement}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}