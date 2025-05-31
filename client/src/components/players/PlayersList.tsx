import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { Game, Player, Position, GameStat } from '@shared/schema';
import { cn, getInitials, positionGroups } from '@/lib/utils';
import { allPositions } from '@shared/schema';

interface PlayersListProps {
  players: Player[];
  isLoading: boolean;
  onEdit: (player: Player) => void;
  onDelete: (id: number) => void;
}

// Player statistics interface
interface PlayerStats {
  totalGames: number;
  totalGoals: number;
  totalGoalsAgainst: number;
  totalIntercepts: number;
  totalRebounds: number;
  averageRating: number;
  primaryPosition: Position | null;
}

type SortField = 'name' | 'position' | 'games' | 'goals' | 'rating' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function PlayersList({ players, isLoading: isPlayersLoading, onEdit, onDelete }: PlayersListProps) {
  // Track players being deleted to prevent double-clicks
  const [deletingPlayerIds, setDeletingPlayerIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });
  const [playerStatsMap, setPlayerStatsMap] = useState<Record<number, PlayerStats>>({});
  const [_, navigate] = useLocation();
  const itemsPerPage = 20;

  // Fetch games to calculate player statistics
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  // Get only completed games
  const completedGames = games.filter(game => game.gameStatus?.isCompleted === true);
  const gameIds = completedGames.map(game => game.id);
  const enableQuery = gameIds.length > 0;

  // Use React Query to fetch and cache game statistics and rosters
  const { data: gameStatsMap, isLoading: isLoadingStats } = useQuery<Record<number, GameStat[]>>({
    queryKey: ['playerGameStats', ...gameIds],
    queryFn: async () => {
      if (gameIds.length === 0) {
        return {};
      }

      const gameIdsParam = gameIds.join(',');
      const response = await fetch(`/api/games/stats/batch?gameIds=${gameIdsParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game statistics');
      }
      return response.json();
    },
    enabled: enableQuery,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: gameRostersMap, isLoading: isLoadingRosters } = useQuery<Record<number, any[]>>({
    queryKey: ['playerGameRosters', ...gameIds],
    queryFn: async () => {
      if (gameIds.length === 0) {
        return {};
      }

      const rostersPromises = gameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/rosters`);
        if (!response.ok) {
          throw new Error(`Failed to fetch rosters for game ${gameId}`);
        }
        const rosters = await response.json();
        return { gameId, rosters };
      });

      const results = await Promise.all(rostersPromises);
      return results.reduce((acc, { gameId, rosters }) => {
        acc[gameId] = rosters;
        return acc;
      }, {} as Record<number, any[]>);
    },
    enabled: enableQuery,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const isLoading = isPlayersLoading || isLoadingGames || isLoadingStats || isLoadingRosters;

  // Calculate player statistics
  useEffect(() => {
    if (!gameStatsMap || !gameRostersMap || players.length === 0) {
      return;
    }

    const statsMap: Record<number, PlayerStats> = {};

    players.forEach(player => {
      let totalGames = 0;
      let totalGoals = 0;
      let totalGoalsAgainst = 0;
      let totalIntercepts = 0;
      let totalRebounds = 0;
      let ratingSum = 0;
      let ratingCount = 0;
      const positionCounts: Record<Position, number> = {} as Record<Position, number>;

      // Process each completed game
      completedGames.forEach(game => {
        const gameStats = gameStatsMap[game.id] || [];
        const gameRosters = gameRostersMap[game.id] || [];

        // Check if player was on roster for this game
        const playerRosters = gameRosters.filter((roster: any) => 
          roster.playerId === player.id && allPositions.includes(roster.position)
        );

        if (playerRosters.length > 0) {
          totalGames++;

          // Count positions played
          playerRosters.forEach((roster: any) => {
            const position = roster.position as Position;
            positionCounts[position] = (positionCounts[position] || 0) + 1;
          });

          // Sum stats for this game - match stats by position and quarter
          gameStats.forEach((stat: GameStat) => {
            // Check if this stat matches a position the player played
            const playedThisPosition = playerRosters.some((roster: any) => 
              roster.position === stat.position && roster.quarter === stat.quarter
            );

            if (playedThisPosition) {
              totalGoals += stat.goalsFor || 0;
              totalGoalsAgainst += stat.goalsAgainst || 0;
              totalIntercepts += stat.intercepts || 0;
              totalRebounds += stat.rebounds || 0;

              // Only use rating from quarter 1
              if (stat.quarter === 1 && typeof stat.rating === 'number') {
                ratingSum += stat.rating;
                ratingCount++;
              }
            }
          });
        }
      });

      // Find primary position (most played)
      const primaryPosition = Object.entries(positionCounts).length > 0
        ? Object.entries(positionCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as Position
        : null;

      statsMap[player.id] = {
        totalGames,
        totalGoals,
        totalGoalsAgainst,
        totalIntercepts,
        totalRebounds,
        averageRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
        primaryPosition
      };
    });

    setPlayerStatsMap(statsMap);
  }, [gameStatsMap, gameRostersMap, players, completedGames]);

  // Filter and search players
  const filteredPlayers = players.filter(player => {
    const stats = playerStatsMap[player.id];

    // Search filter
    const matchesSearch = player.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    // Position filter
    const matchesPosition = positionFilter === 'all' || 
                           (stats?.primaryPosition && stats.primaryPosition === positionFilter) ||
                           (player.positionPreferences && player.positionPreferences.includes(positionFilter as Position));

    // Status filter
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && player.active) ||
                         (statusFilter === 'inactive' && !player.active);

    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Sort players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const aStats = playerStatsMap[a.id];
    const bStats = playerStatsMap[b.id];

    let aValue: any;
    let bValue: any;

    switch (sortConfig.field) {
      case 'name':
        aValue = a.displayName.toLowerCase();
        bValue = b.displayName.toLowerCase();
        break;
      case 'position':
        aValue = aStats?.primaryPosition || '';
        bValue = bStats?.primaryPosition || '';
        break;
      case 'games':
        aValue = aStats?.totalGames || 0;
        bValue = bStats?.totalGames || 0;
        break;
      case 'goals':
        aValue = aStats?.totalGoals || 0;
        bValue = bStats?.totalGoals || 0;
        break;
      case 'rating':
        aValue = aStats?.averageRating || 0;
        bValue = bStats?.averageRating || 0;
        break;
      case 'status':
        aValue = a.active ? 1 : 0;
        bValue = b.active ? 1 : 0;
        break;
      default:
        aValue = a.displayName.toLowerCase();
        bValue = b.displayName.toLowerCase();
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlayers = sortedPlayers.slice(startIndex, startIndex + itemsPerPage);

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  // Get rating color class
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

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {allPositions.map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Players</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {paginatedPlayers.length} of {filteredPlayers.length} players
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-t border-l border-b rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100 border-b"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Player
                      {renderSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100 border-b text-center"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center justify-center">
                      Primary Position
                      {renderSortIcon('position')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100 border-b text-center"
                    onClick={() => handleSort('games')}
                  >
                    <div className="flex items-center justify-center">
                      Games
                      {renderSortIcon('games')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100 border-b text-center"
                    onClick={() => handleSort('goals')}
                  >
                    <div className="flex items-center justify-center">
                      Goals
                      {renderSortIcon('goals')}
                    </div>
                  </TableHead>
                  <TableHead className="border-b text-center">Intercepts</TableHead>
                  <TableHead className="border-b text-center">Rebounds</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100 border-b text-center"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center justify-center">
                      Avg Rating
                      {renderSortIcon('rating')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100 border-b text-center"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center">
                      Status
                      {renderSortIcon('status')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500 border-b">
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ) : paginatedPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500 border-b">
                      No players found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPlayers.map((player, playerIndex) => {
                    const stats = playerStatsMap[player.id] || {
                      totalGames: 0,
                      totalGoals: 0,
                      totalGoalsAgainst: 0,
                      totalIntercepts: 0,
                      totalRebounds: 0,
                      averageRating: 0,
                      primaryPosition: null
                    };

                    return (
                      <TableRow 
                        key={player.id} 
                        className={`hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${playerIndex === paginatedPlayers.length - 1 ? "" : "border-b"}`}
                        onClick={() => navigate(`/player/${player.id}`)}
                      >
                        {/* Player column */}
                        <TableCell className="py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white", player.avatarColor || 'bg-gray-500')}>
                              <span className="text-xs font-semibold">
                                {getInitials(player.firstName, player.lastName)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {player.displayName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {player.firstName} {player.lastName}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Primary Position */}
                        <TableCell className="px-2 py-2 whitespace-nowrap text-center">
                          {stats.primaryPosition ? (
                            <Badge variant="outline" className="text-xs">
                              {stats.primaryPosition}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>

                        {/* Games */}
                        <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                          {stats.totalGames}
                        </TableCell>

                        {/* Goals */}
                        <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                          {stats.totalGoals}
                        </TableCell>

                        {/* Intercepts */}
                        <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                          {stats.totalIntercepts}
                        </TableCell>

                        {/* Rebounds */}
                        <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                          {stats.totalRebounds}
                        </TableCell>

                        {/* Average Rating */}
                        <TableCell className="px-2 py-2 whitespace-nowrap text-center">
                          {stats.averageRating > 0 ? (
                            <span className={cn("text-sm font-mono px-2 py-1 rounded-full", getRatingClass(stats.averageRating))}>
                              {stats.averageRating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-2 py-2 whitespace-nowrap text-center">
                          <Badge variant={player.active ? "default" : "secondary"} className="text-xs">
                            {player.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-center text-sm text-gray-600 mt-2">
              Page {currentPage} of {totalPages}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}