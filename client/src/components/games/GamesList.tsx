import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { isForfeitGame } from '@/lib/utils';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2, FileText, CalendarRange, Search, Trophy, ThumbsDown, Minus, ActivitySquare, Eye, ArrowDown, ArrowUp, ArrowUpDown, FilterIcon } from 'lucide-react';
import { Game, Opponent, GameStatus } from '@shared/schema';
import { formatDate, formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';
import { useGamesScores } from '@/components/statistics/hooks/useGamesScores';
import { GameStatusButton } from './GameStatusBadge';
import { GameStatusDialog } from './GameStatusDialog';
import { useGameStatuses } from '@/hooks/use-game-statuses';

interface GamesListProps {
  games: Game[];
  opponents: Opponent[];
  isLoading?: boolean;
  onEdit?: (game: Game) => void;
  onDelete?: (id: number) => void;
  onViewStats?: (id: number) => void;
  className?: string;
  // Dashboard-specific props
  isDashboard?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  maxRows?: number;
  title?: string;
}

// Shared function for filtering games by status and search query
const filterGamesByStatus = (games: any[], statusFilter: string, searchQuery: string, getGameStatus: (game: any) => any) => {
  return games.filter(game => {
    const matchesSearch = searchQuery === '' || 
      game.opponent?.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.round?.toString().includes(searchQuery) ||
      new Date(game.date).toLocaleDateString().includes(searchQuery);

    if (statusFilter === 'all') return matchesSearch;

    const gameStatus = getGameStatus(game);

    // Handle special filters using status.isCompleted
    if (statusFilter === 'completed') {
      return matchesSearch && gameStatus.isCompleted === true;
    }
    if (statusFilter === 'upcoming') {
      return matchesSearch && gameStatus.isCompleted !== true && gameStatus.name !== 'bye';
    }

    // Match exact status name from database
    return matchesSearch && gameStatus.name === statusFilter;
  });
};

export default function GamesList({ 
  games, 
  opponents, 
  isLoading = false,
  onEdit, 
  onDelete,
  onViewStats,
  className,
  isDashboard = false,
  showFilters = true,
  showActions = true,
  maxRows,
  title
}: GamesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [opponentFilter, setOpponentFilter] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  // Helper function to get game status
  const getGameStatus = (game: any) => {
    return {
      name: game.statusName || game.gameStatus?.name || 'upcoming',
      displayName: game.statusDisplayName || game.gameStatus?.displayName || 'Upcoming',
      isCompleted: game.statusIsCompleted || game.gameStatus?.isCompleted || false,
      allowsStatistics: game.statusAllowsStatistics || game.gameStatus?.allowsStatistics || false
    };
  };

  // Check for status filter in URL parameters on component mount (only for non-dashboard)
  useEffect(() => {
    if (!isDashboard) {
      const searchParams = new URLSearchParams(window.location.search);
      const statusParam = searchParams.get('status');
      if (statusParam && ['upcoming', 'completed', 'in-progress', 'forfeit-win', 'forfeit-loss', 'bye', 'abandoned'].includes(statusParam)) {
        setStatusFilter(statusParam);
        // Clear the URL parameter after setting the filter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [isDashboard]);

  // Use an enum-like type for roster status
  type RosterStatus = 'not-started' | 'partial' | 'complete';
  const [gameRosterStatus, setGameRosterStatus] = useState<Record<number, RosterStatus>>({});
  // Track if each game has stats (none/partial/complete)
  type StatsStatus = 'none' | 'partial' | 'complete';
  const [gameStatsStatus, setGameStatsStatus] = useState<Record<number, StatsStatus>>({});

  // Status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Fetch game stats for all completed games (based on game status)
  const completedGameIds = games
    .filter(game => {
      const gameStatus = getGameStatus(game);
      return gameStatus.isCompleted === true;
    })
    .map(game => game.id);

  // Get all non-BYE game IDs for checking roster status
  const nonByeGameIds = games
    .filter(game => {
      const gameStatus = getGameStatus(game);
      return gameStatus.name !== 'bye';
    })
    .map(game => game.id);

  // Use React Query to fetch roster data for all games to check if they're complete (only for non-dashboard)
  const { data: allRosterData, isLoading: isLoadingRosters } = useQuery({
    queryKey: ['allRosters', ...nonByeGameIds],
    queryFn: async () => {
      if (nonByeGameIds.length === 0) {
        return {};
      }

      // Create a map to store rosters by game ID
      const rostersMap: Record<number, any[]> = {};

      // Fetch rosters for each game
      const rosterPromises = nonByeGameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/rosters`);
        const rosters = await response.json();
        return { gameId, rosters };
      });

      const results = await Promise.all(rosterPromises);

      // Organize rosters by game ID
      results.forEach(result => {
        rostersMap[result.gameId] = result.rosters;
      });

      return rostersMap;
    },
    enabled: nonByeGameIds.length > 0 && !isDashboard,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Use the same efficient scores approach as the dashboard
  const { scoresMap, isLoading: isLoadingScores } = useGamesScores(completedGameIds);

  // Determine game stats status (only for non-dashboard)
  useEffect(() => {
    if (isDashboard || !scoresMap) return;

    const statsStatuses: Record<number, StatsStatus> = {};

    // Check each completed game's stats status
    completedGameIds.forEach(gameId => {
      const scores = scoresMap[gameId];

      if (scores) {
        // If we have scores, mark as complete
        statsStatuses[gameId] = 'complete';
      } else {
        // If no scores for a completed game, mark as none
        statsStatuses[gameId] = 'none';
      }
    });

    setGameStatsStatus(statsStatuses);
  }, [scoresMap, completedGameIds, isDashboard]);

  // Calculate roster statuses (only for non-dashboard)
  useEffect(() => {
    if (isDashboard || !allRosterData) return;

    const rosterStatuses: Record<number, RosterStatus> = {};

    // Check each game's roster status (not started / partial / complete)
    Object.entries(allRosterData).forEach(([gameIdStr, rosters]) => {
      const gameId = parseInt(gameIdStr);

      // If there are no rosters at all, mark as not started
      if (rosters.length === 0) {
        rosterStatuses[gameId] = 'not-started';
        return;
      }

      // Track filled positions by quarter
      const quarterPositions: Record<number, Set<string>> = {
        1: new Set(),
        2: new Set(),
        3: new Set(),
        4: new Set()
      };

      // Count which positions are filled for each quarter
      rosters.forEach((roster: any) => {
        if (roster.quarter >= 1 && roster.quarter <= 4 && roster.position && roster.playerId) {
          quarterPositions[roster.quarter].add(roster.position);
        }
      });

      // All 7 positions (GS, GA, WA, C, WD, GD, GK) should be filled for all 4 quarters
      const allPositionsFilled = Object.values(quarterPositions).every(
        (positions) => positions.size === 7
      );

      // If all positions are filled, mark as complete, otherwise mark as partial
      rosterStatuses[gameId] = allPositionsFilled ? 'complete' : 'partial';
    });

    setGameRosterStatus(rosterStatuses);
  }, [allRosterData, isDashboard]);

  // Handle column sort click
  const handleSortClick = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getOpponentName = (game: any) => {
    // First try to use the pre-fetched opponent name from the game object
    if (game.opponentTeamName) {
      return game.opponentTeamName;
    }

    // Fallback to looking up in opponents array
    if (!game.opponentId) return "TBA";
    if (!opponents || !Array.isArray(opponents)) return "Loading...";
    const opponent = opponents.find(o => o.id === game.opponentId);
    return opponent ? opponent.teamName : "Unknown Opponent";
  };

  // Enhance games with opponent data for search filtering
  const gamesWithOpponents = games.map(game => ({
    ...game,
    opponent: (opponents && Array.isArray(opponents)) ? opponents.find(o => o.id === game.opponentId) : null
  }));

  // Filter games using shared filtering logic
  let filteredGames = filterGamesByStatus(gamesWithOpponents, statusFilter, searchQuery, getGameStatus);

  // Apply opponent filter if set
  if (opponentFilter !== null) {
    filteredGames = filteredGames.filter(game => game.opponentId === opponentFilter);
  }

  // Sort games based on column and direction
  const sortedGames = [...filteredGames].sort((a, b) => {
    let comparison = 0;

    switch (sortColumn) {
      case 'round':
        const roundA = a.round ? parseInt(a.round) : 0;
        const roundB = b.round ? parseInt(b.round) : 0;
        comparison = roundA - roundB;
        break;
      case 'date':
        comparison = (new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'opponent':
        const opponentA = opponents.find(opp => opp.id === a.opponentId)?.teamName || '';
        const opponentB = opponents.find(opp => opp.id === b.opponentId)?.teamName || '';
        comparison = opponentA.localeCompare(opponentB);
        break;
      case 'status':
        const statusA = a.gameStatus?.name || '';
        const statusB = b.gameStatus?.name || '';
        comparison = statusA.localeCompare(statusB);
        break;
      default:
        comparison = (new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Apply max rows limit if specified (for dashboard)
  const finalGames = maxRows ? sortedGames.slice(0, maxRows) : sortedGames;

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
  };

  const handleDeleteConfirmed = () => {
    if (itemToDelete !== null && onDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  const navigate = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="space-y-6">
      {/* Filters - only show if not dashboard or showFilters is true */}
      {(!isDashboard || showFilters) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap justify-between gap-4">
              <div className="w-[360px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search games..."
                    className="pl-10 pr-4 py-2 w-full"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 items-center">
                {/* Opponent Filter */}
                <div className="w-[180px]">
                  <Select 
                    value={opponentFilter?.toString() || "all"}
                    onValueChange={(value) => setOpponentFilter(value === "all" ? null : Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Opponents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Opponents</SelectItem>
                      {opponents && Array.isArray(opponents) && opponents
                        .filter(opp => games.some(game => game.opponentId === opp.id))
                        .sort((a, b) => a.teamName.localeCompare(b.teamName))
                        .map(opponent => (
                          <SelectItem key={opponent.id} value={opponent.id.toString()}>
                            {opponent.teamName}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="w-[140px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Games" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Games</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="forfeit-win">Forfeit Win</SelectItem>
                      <SelectItem value="forfeit-loss">Forfeit Loss</SelectItem>
                      <SelectItem value="bye">BYE</SelectItem>
                      <SelectItem value="abandoned">Abandoned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="bg-accent hover:bg-accent-light text-white"
                  onClick={() => {
                    // Reset filters
                    setSearchQuery('');
                    setStatusFilter('all');
                    setOpponentFilter(null);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Games Table */}
      <Card className="overflow-hidden">
        {title && (
          <CardContent className="p-6 pb-4">
            <h3 className="font-heading font-semibold text-neutral-dark">{title}</h3>
          </CardContent>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={isDashboard ? "bg-blue-50" : "bg-gray-50"}>
              <TableRow>
                <TableHead 
                  className={`px-6 py-3 text-left font-bold cursor-pointer ${isDashboard ? 'w-20 border-r border-b text-center' : ''}`}
                  onClick={() => handleSortClick('date')}
                >
                  <div className="flex items-center">
                    {isDashboard ? 'Date' : 'Date & Time'}
                    <div className="ml-1">
                      {sortColumn !== 'date' ? (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                      ) : (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3 inline text-primary" /> : 
                          <ArrowDown className="ml-1 h-3 w-3 inline text-primary" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className={`px-6 py-3 text-left font-bold cursor-pointer ${isDashboard ? 'w-20 border-r border-b text-center' : ''}`}
                  onClick={() => handleSortClick('round')}
                >
                  <div className="flex items-center">
                    Round
                    <div className="ml-1">
                      {sortColumn !== 'round' ? (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                      ) : (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3 inline text-primary" /> : 
                          <ArrowDown className="ml-1 h-3 w-3 inline text-primary" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className={`px-6 py-3 text-left font-bold cursor-pointer ${isDashboard ? 'border-r border-b' : ''}`}
                  onClick={() => handleSortClick('opponent')}
                >
                  <div className="flex items-center">
                    Opponent
                    <div className="ml-1">
                      {sortColumn !== 'opponent' ? (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                      ) : (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3 inline text-primary" /> : 
                          <ArrowDown className="ml-1 h-3 w-3 inline text-primary" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className={`px-6 py-3 text-left font-bold cursor-pointer ${isDashboard ? 'w-24 text-center border-r border-b' : ''}`}
                  onClick={() => handleSortClick('status')}
                >
                  <div className="flex items-center justify-center">
                    Status
                    <div className="ml-1">
                      {sortColumn !== 'status' ? (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                      ) : (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3 inline text-primary" /> : 
                          <ArrowDown className="ml-1 h-3 w-3 inline text-primary" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead className={`px-6 py-3 text-left font-bold ${isDashboard ? 'w-24 text-center border-b' : ''}`}>Score</TableHead>
                {showActions && !isDashboard && (
                  <TableHead className="px-6 py-3 text-left font-bold">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className={isDashboard ? "bg-white divide-y divide-gray-200" : ""}>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={showActions && !isDashboard ? 6 : 5}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : finalGames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions && !isDashboard ? 6 : 5} className={`text-center py-8 text-gray-500 ${isDashboard ? 'border-b' : ''}`}>
                    No games found. Please add a game or adjust your filters.
                  </TableCell>
                </TableRow>
              ) : (
                finalGames.map(game => (
                  <TableRow 
                    key={game.id}
                    className={`cursor-pointer ${isDashboard ? 'hover:bg-gray-50 transition-colors' : 'hover:bg-gray-50'}`}
                    onClick={() => navigate(`/game/${game.id}`)}
                  >
                    <TableCell className={`px-6 py-4 whitespace-nowrap ${isDashboard ? 'border-r' : ''}`}>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{formatDate(game.date)}</span>
                        {!isDashboard && <span className="text-sm text-gray-500">{game.time}</span>}
                        {isDashboard && <div className="text-xs text-gray-500">{game.time}</div>}
                      </div>
                    </TableCell>
                    <TableCell className={`px-6 py-4 whitespace-nowrap ${isDashboard ? 'border-r text-center' : ''}`}>
                      {game.round ? (
                        <div className="font-medium">
                          <Badge variant="outline" className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 border-blue-200">
                            {isDashboard ? game.round : `Round ${game.round}`}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </TableCell>
                    <TableCell className={`px-6 py-4 whitespace-nowrap ${isDashboard ? 'border-r' : ''}`}>
                      {getGameStatus(game).name === 'bye' ? (
                        <div className="font-medium text-gray-500">⸺</div>
                      ) : (
                        <div className="font-medium">{getOpponentName(game)}</div>
                      )}
                    </TableCell>
                    <TableCell className={`px-6 py-4 whitespace-nowrap ${isDashboard ? 'border-r text-center' : ''}`}>
                      <div className="flex items-center gap-2">
                        {getGameStatus(game).name === 'bye' ? (
                          <Badge
                            variant="outline"
                            className="px-2 py-1 text-xs rounded-full font-semibold bg-gray-200 text-gray-700"
                          >
                            BYE
                          </Badge>
                        ) : (
                          <GameStatusButton 
                            game={{
                              ...game,
                              gameStatus: getGameStatus(game)
                            }}
                            withDialog={false}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`px-6 py-4 whitespace-nowrap ${isDashboard ? 'text-center' : ''}`}>
                      {getGameStatus(game).name === 'bye' ? (
                        <div className="font-medium text-gray-500">⸺</div>
                      ) : getGameStatus(game).isCompleted ? (
                        <div className="text-center">
                          {scoresMap && scoresMap[game.id] ? (
                            (() => {
                              const scores = scoresMap[game.id];
                              const isWin = scores.finalScore.for > scores.finalScore.against;
                              const isLoss = scores.finalScore.for < scores.finalScore.against;

                              const bgColor = isWin 
                                ? "bg-green-100 border-green-200" 
                                : isLoss 
                                  ? "bg-red-100 border-red-200" 
                                  : "bg-amber-100 border-amber-200";

                              return (
                                <div className="font-semibold text-left">
                                  <div className={`inline-flex items-center px-3 py-1 rounded border text-gray-900 ${bgColor}`}>
                                    <span className={isWin ? "font-bold" : ""}>{scores.finalScore.for}</span>
                                    <span className="mx-2">-</span>
                                    <span className={isLoss ? "font-bold" : ""}>{scores.finalScore.against}</span>
                                  </div>
                                </div>
                              );
                            })()
                          ) : isLoadingScores ? (
                            <div className="flex space-x-2">
                              <div className="h-6 w-12 bg-gray-200 animate-pulse rounded" />
                              <span className="mx-1">-</span>
                              <div className="h-6 w-12 bg-gray-200 animate-pulse rounded" />
                            </div>
                          ) : (
                            <span className="text-red-500 text-sm">Score Error</span>
                          )}
                        </div>
                      ) : (
                        <div className="font-medium text-gray-500">—</div>
                      )}
                    </TableCell>

                    {/* Actions column - only for non-dashboard */}
                    {showActions && !isDashboard && (
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(game)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onViewStats && getGameStatus(game).isCompleted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewStats(game.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the game
                                    and remove all associated data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(game.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Game Status Dialog */}
      <GameStatusDialog
        game={selectedGame}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={() => {
          // Refetch all relevant data after a successful status update
          setSelectedGame(null);
        }}
      />
    </div>
  );
}

export { GamesList };