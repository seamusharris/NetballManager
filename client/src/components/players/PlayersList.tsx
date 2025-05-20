import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Game, Player, Position, GameStat } from '@shared/schema';
import { cn, getInitials, allPositions, positionGroups } from '@/lib/utils';

interface PlayersListProps {
  players: Player[];
  isLoading: boolean;
  onEdit: (player: Player) => void;
  onDelete: (id: number) => void;
}

interface PlayerStats {
  playerId: number;
  gamesPlayed: number;
  goals: number;
  goalsAgainst: number;
  missedGoals: number;
  rating: number;
}

export default function PlayersList({ players, isLoading, onEdit, onDelete }: PlayersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [playerStatsMap, setPlayerStatsMap] = useState<Record<number, PlayerStats>>({});
  const [_, navigate] = useLocation();
  const itemsPerPage = 10;
  
  // Fetch games to calculate player statistics
  const { data: games = [], isLoading: isLoadingGames } = useQuery({
    queryKey: ['/api/games'],
  });

  // Get only completed games
  const completedGames = games.filter((game: Game) => game.completed);
  const gameIds = completedGames.map((game: Game) => game.id);
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
    staleTime: 0, 
    gcTime: 15 * 60 * 1000,
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
  });

  // Combined loading state
  const isLoadingData = isLoadingStats || isLoadingRosters || isLoadingGames;

  // When game stats or players change, recalculate player statistics
  useEffect(() => {
    if (!gameStatsMap || isLoadingData || players.length === 0) return;
    
    const newPlayerStatsMap: Record<number, PlayerStats> = {};
    
    // Initialize all players with zeros
    players.forEach(player => {
      newPlayerStatsMap[player.id] = {
        playerId: player.id,
        gamesPlayed: 0,
        goals: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rating: 5 // Default rating
      };
    });
    
    // Count games played from both rosters and game stats
    if ((gameRostersMap && Object.keys(gameRostersMap).length > 0) || 
        (gameStatsMap && Object.keys(gameStatsMap).length > 0)) {
      
      // Track which games each player participated in
      const playerGameIds: Record<number, Set<number>> = {};
      
      // Initialize sets for each player
      players.forEach(player => {
        playerGameIds[player.id] = new Set();
      });
      
      // First, process all game rosters to find participation
      if (gameRostersMap) {
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
      }
      
      // Then, process all game stats to find additional participation
      if (gameStatsMap) {
        Object.entries(gameStatsMap).forEach(([gameIdStr, stats]) => {
          const gameId = parseInt(gameIdStr);
          
          if (Array.isArray(stats)) {
            // Get unique player IDs that have stats for this game
            const playerIdsWithStats = new Set(stats.map(stat => stat.playerId));
            
            // Mark each player as having participated in this game
            playerIdsWithStats.forEach(playerId => {
              if (playerId && playerGameIds[playerId]) {
                playerGameIds[playerId].add(gameId);
              }
            });
          }
        });
      }
      
      // Update games played count for each player
      players.forEach(player => {
        if (playerGameIds[player.id] && newPlayerStatsMap[player.id]) {
          newPlayerStatsMap[player.id].gamesPlayed = playerGameIds[player.id].size;
        }
      });
    }
    
    // Process all game stats for each player
    if (Object.keys(gameStatsMap).length > 0) {
      // Get all stats across all games
      const allGameStats = Object.values(gameStatsMap).flatMap(stats => stats);
      
      // Use a de-duplication approach to handle duplicate records
      const dedupedStats: Record<number, Record<string, GameStat>> = {};
      
      // First identify the most recent stat for each player in each quarter of each game
      allGameStats.forEach(stat => {
        if (!stat || !stat.playerId || !stat.quarter || !stat.gameId) return;
        
        const playerId = stat.playerId;
        const uniqueKey = `${stat.gameId}-${stat.quarter}`;
        
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
      
      // Process only the de-duplicated stats to get player totals
      Object.values(dedupedStats).forEach(playerQuarterStats => {
        Object.values(playerQuarterStats).forEach(stat => {
          const playerId = stat.playerId;
          if (!newPlayerStatsMap[playerId]) return;
          
          // Add this player's stats
          newPlayerStatsMap[playerId].goals += stat.goalsFor || 0;
          newPlayerStatsMap[playerId].goalsAgainst += stat.goalsAgainst || 0;
          newPlayerStatsMap[playerId].missedGoals += stat.missedGoals || 0;
        });
      });
    }
    
    // Process player ratings - use only the most recent quarter 1 stats
    if (Object.keys(gameStatsMap).length > 0) {
      Object.values(newPlayerStatsMap).forEach(playerStat => {
        // Find all quarter 1 stats for this player across all games
        const quarter1Stats = Object.values(gameStatsMap)
          .flatMap(gameStats => 
            gameStats.filter((stat: GameStat) => 
              stat.playerId === playerStat.playerId && 
              stat.quarter === 1 && 
              stat.rating !== undefined && 
              stat.rating !== null
            )
          )
          .sort((a: GameStat, b: GameStat) => b.id - a.id); // Sort by ID descending
        
        // Use the most recent rating if available
        if (quarter1Stats.length > 0) {
          const latestRating = quarter1Stats[0].rating;
          if (typeof latestRating === 'number') {
            playerStat.rating = latestRating;
          }
        } else {
          // Calculate default rating based on performance
          const calculatedRating = 5 + 
            (playerStat.goals * 0.2) +
            (playerStat.goalsAgainst * -0.1) + 
            (playerStat.missedGoals * -0.1);
          
          playerStat.rating = Math.min(10, Math.max(1, calculatedRating));
        }
      });
    }
    
    setPlayerStatsMap(newPlayerStatsMap);
  }, [gameStatsMap, gameRostersMap, isLoadingData, players]);
  
  // Filter players based on search and filters
  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      searchQuery === '' || 
      player.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if the filter is for a position group or individual position
    const matchesPosition = 
      positionFilter === 'all' || 
      (positionFilter === 'attackers' && (player.positionPreferences as Position[]).some(pos => positionGroups.attackers.includes(pos))) ||
      (positionFilter === 'mid-courters' && (player.positionPreferences as Position[]).some(pos => positionGroups['mid-courters'].includes(pos))) ||
      (positionFilter === 'defenders' && (player.positionPreferences as Position[]).some(pos => positionGroups.defenders.includes(pos))) ||
      (player.positionPreferences as Position[]).includes(positionFilter as Position);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && player.active) || 
      (statusFilter === 'inactive' && !player.active);
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Sort players by display name
  const sortedPlayers = [...filteredPlayers].sort((a, b) => 
    a.displayName.localeCompare(b.displayName)
  );
  
  // Pagination
  const totalPages = Math.ceil(sortedPlayers.length / itemsPerPage);
  const paginatedPlayers = sortedPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Get the player's stored avatar color
  const getAvatarColor = (player: Player): string => {
    // If the player has a stored avatar color, use it
    if (player?.avatarColor) {
      return player.avatarColor;
    }
    
    // Default fallback if the player has no stored color
    return 'bg-gray-500';
  };
  
  // Stat categories for the table
  const statCategories = [
    { 
      name: 'Games', 
      fields: [
        { field: 'gamesPlayed', label: 'Played' },
        { field: 'rating', label: 'Rating' }
      ]
    },
    { 
      name: 'Shooting', 
      fields: [
        { field: 'goals', label: 'For' },
        { field: 'goalsAgainst', label: 'Agn' },
        { field: 'missedGoals', label: 'Miss' },
      ]
    }
  ];
  
  // Rating color/classes
  const getRatingClass = (rating: number): string => {
    if (rating >= 9) return 'bg-success/20 text-success';
    if (rating >= 8) return 'bg-accent/20 text-accent';
    if (rating >= 7) return 'bg-warning/20 text-warning';
    return 'bg-error/20 text-error';
  };
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search players..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {/* Position Group Options */}
                  <SelectItem value="attackers">Attackers (GS, GA)</SelectItem>
                  <SelectItem value="mid-courters">Mid-courters (WA, C, WD)</SelectItem>
                  <SelectItem value="defenders">Defenders (GD, GK)</SelectItem>
                  <SelectItem value="group-divider" disabled>─────────────</SelectItem>
                  {/* Individual Position Options */}
                  {allPositions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Players" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Players</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Players Performance Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[80px] border-b">Player</TableHead>
                <TableHead className="text-center w-[90px] border-r border-b">Position</TableHead>
                
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
                
                {/* Stat field column headers */}
                {statCategories.map(category => (
                  category.fields.map((field, fieldIndex) => (
                    <TableHead 
                      key={field.field} 
                      className={`text-center py-2 text-xs font-medium text-gray-500 border-r border-b ${fieldIndex === 0 ? 'border-l' : ''}`}
                      style={{ width: '50px' }} // Extra narrow columns
                    >
                      {field.label}
                    </TableHead>
                  ))
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody className="bg-white divide-y divide-gray-200">
              {isLoading || isLoadingData ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No players found. Please add a player or adjust your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlayers.map((player, playerIndex) => {
                  const playerStats = playerStatsMap[player.id] || {
                    playerId: player.id,
                    gamesPlayed: 0,
                    goals: 0,
                    goalsAgainst: 0,
                    missedGoals: 0,
                    rating: 5
                  };
                  
                  return (
                    <TableRow 
                      key={player.id} 
                      className={`hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${playerIndex === paginatedPlayers.length - 1 ? "" : "border-b"}`}
                      onClick={() => navigate(`/player/${player.id}`)}
                    >
                      {/* Player column */}
                      <TableCell className="px-1 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-white", getAvatarColor(player))}>
                            <span className="text-xs font-semibold">
                              {getInitials(player.firstName, player.lastName)}
                            </span>
                          </div>
                          <div className="ml-2 w-[50px] truncate">
                            <span className="text-sm font-medium text-blue-600">
                              {player.displayName}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Position preferences column */}
                      <TableCell className="text-center px-1 py-2 border-r">
                        <div className="flex flex-wrap justify-center gap-1">
                          {(player.positionPreferences as Position[]).map((position, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={cn(
                                "px-1 py-0.5 text-xs rounded-full",
                                index === 0 ? "bg-primary/10 text-primary font-semibold" : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {position}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      
                      {/* Stat category fields */}
                      {statCategories.map(category => (
                        category.fields.map((field, i) => {
                          // Special handling for Rating field
                          if (field.field === 'rating') {
                            return (
                              <TableCell 
                                key={field.field} 
                                className={`py-2 px-1 text-center border-r ${i === 0 ? 'border-l' : ''}`}
                              >
                                <span className={cn(
                                  "text-sm font-medium px-2 py-1 rounded", 
                                  getRatingClass(playerStats.rating)
                                )}>
                                  {playerStats.rating.toFixed(1)}
                                </span>
                              </TableCell>
                            );
                          }
                          
                          // Regular fields
                          return (
                            <TableCell 
                              key={field.field} 
                              className={`py-2 px-1 text-center border-r ${i === 0 ? 'border-l' : ''}`}
                            >
                              <span className="text-sm font-medium">
                                {playerStats[field.field as keyof PlayerStats] || 0}
                              </span>
                            </TableCell>
                          );
                        })
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {!isLoading && filteredPlayers.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredPlayers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredPlayers.length}</span> players
              </p>
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}
