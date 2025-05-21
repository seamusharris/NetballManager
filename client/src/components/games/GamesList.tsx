import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
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
import { Edit, Trash2, FileText, CalendarRange, Search, Trophy, ThumbsDown, Minus, ActivitySquare } from 'lucide-react';
import { Game, Opponent, GameStat } from '@shared/schema';
import { formatDate, formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';

interface GamesListProps {
  games: Game[];
  opponents: Opponent[];
  isLoading: boolean;
  onEdit: (game: Game) => void;
  onDelete: (id: number) => void;
  onViewStats: (id: number) => void;
}

// Interface for game scores
interface GameScore {
  team: number;
  opponent: number;
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
  const [dateFilter, setDateFilter] = useState('all');
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [_, navigate] = useLocation();
  const [gameScores, setGameScores] = useState<Record<number, GameScore>>({});
  // Use an enum-like type for roster status
  type RosterStatus = 'not-started' | 'partial' | 'complete';
  const [gameRosterStatus, setGameRosterStatus] = useState<Record<number, RosterStatus>>({});
  
  // Fetch game stats for all completed games
  const completedGameIds = games
    .filter(game => game.completed)
    .map(game => game.id);
  
  // Get all non-BYE game IDs for checking roster status
  const nonByeGameIds = games
    .filter(game => !game.isBye)
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
  
  // Use React Query to fetch and cache all game statistics
  const { data: allGameStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['allGameStats', ...completedGameIds],
    queryFn: async () => {
      if (completedGameIds.length === 0) {
        return {};
      }
      
      // Create a map to store stats by game ID
      const statsMap: Record<number, any[]> = {};
      
      // Fetch stats for each completed game
      const statsPromises = completedGameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/stats`);
        const stats = await response.json();
        return { gameId, stats };
      });
      
      const results = await Promise.all(statsPromises);
      
      // Organize stats by game ID
      results.forEach(result => {
        statsMap[result.gameId] = result.stats;
      });
      
      return statsMap;
    },
    enabled: completedGameIds.length > 0,
    staleTime: 0, // Always refetch when needed
  });
  
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
  
  // Filter games based on search and filters
  const filteredGames = games.filter(game => {
    const opponentName = getOpponentName(game.opponentId);
    
    const matchesSearch = 
      searchQuery === '' || 
      opponentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.date.includes(searchQuery) ||
      game.time.includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'completed' && game.completed) || 
      (statusFilter === 'upcoming' && !game.completed);
      
    // Date filtering (simple implementation - would be more sophisticated in real app)
    const gameDate = new Date(game.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isPast = gameDate < today;
    const isFuture = gameDate > today;
    const isToday = gameDate.toDateString() === today.toDateString();
    
    const matchesDate = 
      dateFilter === 'all' || 
      (dateFilter === 'past' && isPast) ||
      (dateFilter === 'future' && isFuture) ||
      (dateFilter === 'today' && isToday);
    
    return matchesSearch && matchesStatus && matchesDate;
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
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="future">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="self-end">
              <Button 
                className="bg-accent hover:bg-accent-light text-white"
                onClick={() => {
                  // Reset filters
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateFilter('all');
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
                <TableHead className="px-6 py-3 text-left">Date & Time</TableHead>
                <TableHead className="px-6 py-3 text-left">Round</TableHead>
                <TableHead className="px-6 py-3 text-left">Opponent</TableHead>
                <TableHead className="px-6 py-3 text-left">Status</TableHead>
                <TableHead className="px-6 py-3 text-left">Score</TableHead>
                <TableHead className="px-6 py-3 text-left">Options</TableHead>
                <TableHead className="px-6 py-3 text-right">Actions</TableHead>
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
                  <TableRow key={game.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{formatDate(game.date)}</span>
                        <span className="text-sm text-gray-500">{game.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {game.round ? (
                        <div className="font-medium">
                          <Badge variant="outline" className="px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                            {game.round}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {game.isBye ? (
                        <div className="font-medium text-accent">BYE</div>
                      ) : (
                        <div className="font-medium">vs. {getOpponentName(game.opponentId)}</div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {game.isBye ? (
                          <Badge
                            variant="outline"
                            className="px-2 py-1 text-xs rounded-full font-semibold bg-gray-200 text-gray-700"
                          >
                            BYE Round
                          </Badge>
                        ) : (
                          <>
                            <Badge
                              variant="outline"
                              className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                game.completed 
                                  ? "bg-success/10 text-success" 
                                  : "bg-accent/10 text-accent"
                              }`}
                            >
                              {game.completed ? 'Completed' : 'Upcoming'}
                            </Badge>
                            
                            {game.completed && gameScores[game.id] && (
                              <div className={`p-1 rounded-full ${
                                gameScores[game.id].team > gameScores[game.id].opponent
                                  ? "bg-success/20" 
                                  : gameScores[game.id].team < gameScores[game.id].opponent
                                    ? "bg-error/20"
                                    : "bg-warning/20"
                              }`}>
                                {gameScores[game.id].team > gameScores[game.id].opponent ? (
                                  <Trophy className="h-4 w-4 text-success" />
                                ) : gameScores[game.id].team < gameScores[game.id].opponent ? (
                                  <ThumbsDown className="h-4 w-4 text-error" />
                                ) : (
                                  <Minus className="h-4 w-4 text-warning" />
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <GameScoreDisplay gameId={game.id} compact={true} />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {game.isBye ? (
                          <span className="text-gray-400 text-xs italic">No actions available for BYE rounds</span>
                        ) : (
                          <>
                            <button 
                              onClick={() => window.location.href = `/roster?game=${game.id}`}
                              title={
                                gameRosterStatus[game.id] === 'complete' 
                                  ? "All positions are filled for all quarters" 
                                  : gameRosterStatus[game.id] === 'partial'
                                    ? "Some positions are filled, but roster is incomplete"
                                    : "No positions are assigned yet"
                              }
                              className={`inline-flex items-center justify-center rounded-md text-xs py-1 px-2 border ${
                                gameRosterStatus[game.id] === 'complete'
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                                  : gameRosterStatus[game.id] === 'partial'
                                    ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                    : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              }`}
                            >
                              <CalendarRange className={`h-3 w-3 mr-1 ${
                                gameRosterStatus[game.id] === 'complete'
                                  ? "text-emerald-600"
                                  : gameRosterStatus[game.id] === 'partial'
                                    ? "text-amber-600"
                                    : "text-red-600"
                              }`} />
                              Roster
                            </button>
                            
                            <button 
                                onClick={() => navigate(`/statistics?game=${game.id}`)}
                                className="inline-flex items-center justify-center rounded-md text-xs py-1 px-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                View Stats
                              </button>
                            
                            {!game.isBye && 
                             !game.completed && 
                             gameRosterStatus[game.id] === 'complete' && (
                              <button 
                                onClick={() => navigate(`/games/${game.id}/livestats`)}
                                className="inline-flex items-center justify-center rounded-md text-xs py-1 px-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                              >
                                <ActivitySquare className="h-3 w-3 mr-1 text-purple-600" />
                                Live Stats
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-accent hover:text-accent-dark"
                          onClick={() => onEdit(game)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-error hover:text-error/80"
                              onClick={() => confirmDelete(game.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this {game.isBye ? "BYE round" : `game against ${getOpponentName(game.opponentId)}`}? 
                                This will also delete all roster assignments and statistics for this game.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={handleDeleteConfirmed}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
