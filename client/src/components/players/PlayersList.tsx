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
import { apiClient } from '@/lib/apiClient';
import { useClub } from '@/contexts/ClubContext';
import { usePlayerStatsMapping, PlayerStats } from '@/hooks/usePlayerStatsMapping';

interface PlayersListProps {
  players: Player[];
  isLoading: boolean;
  onEdit: (player: Player) => void;
  onDelete: (id: number) => void;
}

type SortField = 'name' | 'gamesPlayed' | 'goals' | 'goalsAgainst' | 'missedGoals' | 
                'rebounds' | 'intercepts' | 'badPass' | 'handlingError' | 'pickUp' | 'infringement' | 'rating';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function PlayersList({ players, isLoading: isPlayersLoading, onEdit, onDelete }: PlayersListProps) {
  const { currentClubId } = useClub();

  // Track players being deleted to prevent double-clicks
  const [deletingPlayerIds, setDeletingPlayerIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });
  const [_, navigate] = useLocation();
  const itemsPerPage = 20;

  // Fetch games to calculate player statistics
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ['/api/games'],
    queryFn: () => apiClient.get('/api/games'),
  });

  // Get completed games using same filtering as Team Dashboard PlayerAnalyticsWidget
  const completedGames = games.filter(game => 
    game.statusIsCompleted === true && game.statusAllowsStatistics === true
  );
  const gameIds = completedGames.map(game => game.id);
  const enableQuery = gameIds.length > 0;

  // Use Team Dashboard's exact cache keys to share data - use batch endpoint
  const { data: gameStatsMap, isLoading: isLoadingStats } = useQuery<Record<number, GameStat[]>>({
    queryKey: ['centralized-stats', currentClubId, gameIds.sort().join(',')],
    queryFn: async () => {
      if (gameIds.length === 0) return {};

      console.log(`PlayersList: Using batch endpoint for stats fetch of ${gameIds.length} completed games`);

      try {
        // Use batch endpoint for better performance and cache consistency
        const batchResponse = await apiClient.post('/api/games/stats/batch', {
          gameIds: gameIds
        });
        console.log(`PlayersList: Batch stats fetch completed for ${Object.keys(batchResponse).length} games`);
        return batchResponse;
      } catch (error) {
        console.error('PlayersList: Batch stats fetch failed, falling back to individual requests:', error);

        // Fallback to individual requests
        const statsMap: Record<number, GameStat[]> = {};
        for (const gameId of gameIds) {
          try {
            const stats = await apiClient.get(`/api/games/${gameId}/stats`);
            statsMap[gameId] = stats || [];
          } catch (error) {
            console.error(`PlayersList: Error fetching stats for game ${gameId}:`, error);
            statsMap[gameId] = [];
          }
        }
        return statsMap;
      }
    },
    enabled: enableQuery && !!currentClubId,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased for better caching)
    gcTime: 30 * 60 * 1000, // 30 minutes (increased for better caching)
  });

  // Use Team Dashboard's exact cache keys to share roster data
  const { data: gameRostersMap, isLoading: isLoadingRosters } = useQuery<Record<number, any[]>>({
    queryKey: ['centralized-rosters', currentClubId, gameIds.sort().join(',')],
    queryFn: async () => {
      if (gameIds.length === 0) return {};

      console.log(`PlayersList: Using individual requests for roster fetch of ${gameIds.length} games`);
      const rostersMap: Record<number, any[]> = {};

      // Fetch rosters for all games
      for (const gameId of gameIds) {
        try {
          const roster = await apiClient.get(`/api/games/${gameId}/rosters`);
          rostersMap[gameId] = roster || [];
        } catch (error) {
          console.error(`PlayersList: Error fetching roster for game ${gameId}:`, error);
          rostersMap[gameId] = [];
        }
      }

      console.log(`PlayersList: Centralized roster fetch completed for ${Object.keys(rostersMap).length} games`);
      return rostersMap;
    },
    enabled: enableQuery && !!currentClubId,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased for better caching)
    gcTime: 30 * 60 * 1000, // 30 minutes (increased for better caching)
  });

  // Combined loading state
  const isLoading = isPlayersLoading || isLoadingStats || isLoadingRosters || isLoadingGames;

  // Calculate player statistics using shared hook
  const playerStatsMap = usePlayerStatsMapping(players, gameStatsMap, gameRostersMap);

  // Filter players based on search and filters
  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      searchQuery === '' || 
      (player.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.lastName || '').toLowerCase().includes(searchQuery.toLowerCase());

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

  // Get players with their stats
  const playersWithStats = filteredPlayers
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
        const aName = a.displayName || `${a.firstName || ''} ${a.lastName || ''}`.trim();
        const bName = b.displayName || `${b.firstName || ''} ${b.lastName || ''}`.trim();
        if (direction === 'asc') {
          return aName.localeCompare(bName);
        } else {
          return bName.localeCompare(aName);
        }
      }

      // For numeric fields, sort numerically
      const aValue = a.stats[field];
      const bValue = b.stats[field];

      if (direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

  // Pagination
  const totalPages = Math.ceil(playersWithStats.length / itemsPerPage);
  const paginatedPlayers = playersWithStats.slice(
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
    }
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
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto border-t border-l border-b rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead 
                    className="w-[160px] border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('name')}
                  >
                    Player {renderSortIndicator('name')}
                  </TableHead>
                  <TableHead className="text-center w-4 border-r border-b"></TableHead>

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

                <TableRow>
                  <TableHead className="border-b"></TableHead>
                  <TableHead className="border-r border-b"></TableHead>

                  {/* Stat field column headers */}
                  {statCategories.map(category => (
                    category.fields.map((field, fieldIndex) => (
                      <TableHead 
                        key={field.field} 
                        className={`text-center py-1 px-0 text-xs font-medium text-gray-500 border-r border-b ${fieldIndex === 0 ? 'border-l' : ''}`}
                        onClick={() => handleSort(field.field as SortField)}
                        style={{ width: '55px', cursor: 'pointer' }}
                      >
                        {field.label} {renderSortIndicator(field.field as SortField)}
                      </TableHead>
                    ))
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500 border-b">
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ) : paginatedPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-4 text-gray-500 border-b">
                      No players found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPlayers.map((player, playerIndex) => (
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
                              {getInitials(player.firstName || 'U', player.lastName || 'N')}
                            </span>
                          </div>
                          <div className="ml-2">
                            <span className="text-sm font-medium text-blue-600">
                              {player.displayName || `${player.firstName || 'Unknown'} ${player.lastName || 'Name'}`}
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

      {/* Pagination - only show if we have more than itemsPerPage players */}
      {!isLoading && filteredPlayers.length > itemsPerPage && (
        <div className="flex items-center justify-between">
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
    </div>
  );
}