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
import { Edit, Trash2, FileText, CalendarRange, Search, Trophy, ThumbsDown, Minus, ActivitySquare, Eye } from 'lucide-react';
import { Game, Opponent, GameStatus } from '@shared/schema';
import { formatDate, formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';
import { useGamesScores } from '@/components/statistics/hooks/useGamesScores';
import { GameStatusBadge } from './GameStatusBadge';
import { GameStatusDialog } from './GameStatusDialog';
import { useGameStatuses } from '@/hooks/use-game-statuses';

interface GamesListProps {
  games: Game[];
  opponents: Opponent[];
  isLoading: boolean;
  onEdit: (game: Game) => void;
  onDelete: (id: number) => void;
  onViewStats: (id: number) => void;
}

export default function GamesList({ 
  games, 
  opponents, 
  isLoading, 
  onEdit, 
  onDelete,
  onViewStats
}: GamesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  // Check for status filter in URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const statusParam = searchParams.get('status');
    if (statusParam && ['upcoming', 'completed', 'in-progress', 'forfeit-win', 'forfeit-loss', 'bye', 'abandoned'].includes(statusParam)) {
      setStatusFilter(statusParam);
      // Clear the URL parameter after setting the filter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);
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
      // A game is completed if it has a status that marks it as completed
      // We'll need to check this against the actual game status data
      return game.status === 'completed' || game.status === 'forfeit-win' || 
             game.status === 'forfeit-loss' || game.status === 'bye' || 
             game.status === 'abandoned';
    })
    .map(game => game.id);

  // Get all non-BYE game IDs for checking roster status
  const nonByeGameIds = games
    .filter(game => game.status !== 'bye')
    .map(game => game.id);

  // Use React Query to fetch roster data for all games to check if they're complete
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
    enabled: nonByeGameIds.length > 0,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Use the same efficient scores approach as the dashboard
  const { scoresMap, isLoading: isLoadingScores } = useGamesScores(completedGameIds);

  // Determine game stats status
  useEffect(() => {
    if (!scoresMap) return;

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
  }, [scoresMap, completedGameIds]);

  // Calculate roster statuses
  useEffect(() => {
    if (!allRosterData) return;

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
  }, [allRosterData]);



  // Get opponent name by ID
  const getOpponentName = (opponentId: number | null) => {
    if (opponentId === null) return '';
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };

  // Filter games based on status
  const filteredGames = games.filter(game => {
    const matchesSearch = searchQuery === '' || 
      opponents.find(o => o.id === game.opponentId)?.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.round?.toString().includes(searchQuery) ||
      new Date(game.date).toLocaleDateString().includes(searchQuery);

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && game.status === statusFilter;
  });

  // Sort games strictly by date (future games first)
  const sortedGames = [...filteredGames].sort((a, b) => {
    // Convert date strings to timestamps for comparison
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    // If dates are different, sort by date (future dates first)
    if (dateA !== dateB) {
      return dateB - dateA; // Future games first (descending order)
    }

    // If dates are the same, sort by time
    // Convert time strings (HH:MM) to comparable values
    const [hoursA, minutesA] = a.time.split(':').map(Number);
    const [hoursB, minutesB] = b.time.split(':').map(Number);
    const timeA = hoursA * 60 + minutesA;
    const timeB = hoursB * 60 + minutesB;

    // Earlier time of day first for same date
    return timeA - timeB;
  });

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
  };

  const handleDeleteConfirmed = () => {
    if (itemToDelete !== null) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
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
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left font-bold">Date & Time</TableHead>
                <TableHead className="px-6 py-3 text-left font-bold">Round</TableHead>
                <TableHead className="px-6 py-3 text-left font-bold">Opponent</TableHead>
                <TableHead className="px-6 py-3 text-left font-bold">Status</TableHead>
                <TableHead className="px-6 py-3 text-left font-bold">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sortedGames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No games found. Please add a game or adjust your filters.
                  </TableCell>
                </TableRow>
              ) : (
                sortedGames.map(game => (
                  <TableRow 
                    key={game.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/game/${game.id}`)}
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{formatDate(game.date)}</span>
                        <span className="text-sm text-gray-500">{game.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {game.round ? (
                        <div className="font-medium">
                          <Badge variant="outline" className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 border-blue-200">
                            Round {game.round}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {game.isBye ? (
                        <div className="font-medium text-gray-500">⸺</div>
                      ) : (
                        <div className="font-medium">{getOpponentName(game.opponentId)}</div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {game.isBye ? (
                          <Badge
                            variant="outline"
                            className="px-2 py-1 text-xs rounded-full font-semibold bg-gray-200 text-gray-700"
                          >
                            BYE
                          </Badge>
                        ) : (
                          <>
                            <GameStatusBadge 
                              status={game.status || (game.completed ? 'completed' : 'upcoming')}
                            />
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {game.isBye ? (
                        <div className="font-medium text-gray-500">⸺</div>
```
                      ) : game.completed ? (
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