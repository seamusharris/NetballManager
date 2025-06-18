import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { isForfeitGame } from '@/lib/utils';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
import { Edit, Trash2, Search, Eye } from 'lucide-react';
import { Game, Opponent, GameStatus } from '@shared/schema';
import { formatDate, formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';
import { useGamesScores } from '@/components/statistics/hooks/useGamesScores';
import { GameStatusButton } from './GameStatusBadge';
import { GameStatusDialog } from './GameStatusDialog';
import { useClub } from '@/contexts/ClubContext';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { gameScoreService } from '@/lib/gameScoreService';
import GameResultCard from '@/components/ui/game-result-card';

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
  teams?: any[];
  centralizedStats?: Record<number, any[]>;
  centralizedScores?: Record<number, any>;
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

export function GamesList({ 
  games, 
  opponents = [], 
  isLoading = false, 
  onDelete, 
  onEdit, 
  onViewStats,
  isDashboard = false,
  showFilters = true,
  showActions = true,
  maxRows,
  title,
  className,
  teams = [],
  centralizedStats,
  centralizedScores
}: GamesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [opponentFilter, setOpponentFilter] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [, setLocation] = useLocation();
  const { currentClub } = useClub();

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

  // Use centralized data when available, otherwise fall back to individual fetching (dashboard vs games page)
  const scoresMap = centralizedScores || {};
  
  // For roster status checking (only for non-dashboard and when no centralized data)
  const nonByeGameIds = games
    .filter(game => {
      const gameStatus = getGameStatus(game);
      return gameStatus.name !== 'bye';
    })
    .map(game => game.id);

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
    enabled: nonByeGameIds.length > 0 && !isDashboard && !centralizedScores, // Only fetch if no centralized data
    staleTime: 5 * 60 * 1000,
  });

  // Determine game stats status (only for non-dashboard)
  useEffect(() => {
    if (isDashboard || !scoresMap) return;

    const statsStatuses: Record<number, StatsStatus> = {};
    
    // Get completed games that allow statistics
    const completedGameIds = games
      .filter(game => {
        const gameStatus = getGameStatus(game);
        return gameStatus.isCompleted === true && gameStatus.allowsStatistics === true;
      })
      .map(game => game.id);

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
  }, [scoresMap, games, isDashboard]);

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
    // Use current club context to determine opponent
    const currentClubId = currentClub?.id;
    if (!currentClubId) return "TBA";

    // Check if this is our home game (we are the home team)
    if (game.homeClubId === currentClubId && game.awayTeamName) {
      return game.awayTeamName;
    }

    // Check if this is our away game (we are the away team)  
    if (game.awayClubId === currentClubId && game.homeTeamName) {
      return game.homeTeamName;
    }

    // Fallback - if we can't determine, show away team name
    return game.awayTeamName || "TBA";
  };

  // Helper to determine if we are home or away team and get correct score orientation
  const getGameScoreForTeam = (game: any, scores: any) => {
    const currentClubId = currentClub?.id;
    if (!currentClubId || !scores) return null;

    // For inter-club games, we need to check if we're home or away to get the right score perspective
    const isHomeTeam = game.homeClubId === currentClubId;

    if (isHomeTeam) {
      // We are the home team, so our score is 'for' and opponent is 'against'
      return {
        teamScore: scores.finalScore.for,
        opponentScore: scores.finalScore.against,
        isWin: scores.finalScore.for > scores.finalScore.against
      };
    } else {
      // We are the away team, so our score is 'against' and opponent is 'for'
      return {
        teamScore: scores.finalScore.against,
        opponentScore: scores.finalScore.for,
        isWin: scores.finalScore.against > scores.finalScore.for
      };
    }
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

    // Use the scores we already calculated via useGamesScores hook
    const currentTeamId = currentClub?.currentTeam?.id || currentClub?.teams?.[0]?.id;

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

      {/* Games List */}
      <Card>
        {title && (
          <CardContent className="p-6 pb-4">
            <h3 className="font-heading font-semibold text-neutral-dark">{title}</h3>
          </CardContent>
        )}
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : finalGames.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No games found. Please add a game or adjust your filters.
            </div>
          ) : (
            <div className="space-y-6">
              {finalGames.map((game) => (
                <div key={game.id} className="relative group">
                  <GameResultCard
                    game={game}
                    layout="wide"
                    gameStats={centralizedStats?.[game.id] || []}
                    centralizedScores={scoresMap?.[game.id]}
                    useOfficialPriority={true}
                    showDate={true}
                    showRound={true}
                    showScore={true}
                    showLink={true}
                    currentTeamId={currentTeamId}
                    clubTeams={teams || []}
                  />

                  {/* Action buttons overlay */}
                  {showActions && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewStats?.(game.id)}
                        className="bg-white/90 hover:bg-white shadow-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit?.(game)}
                        className="bg-white/90 hover:bg-white shadow-sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 hover:bg-white shadow-sm text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Game</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this game? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete?.(game.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
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