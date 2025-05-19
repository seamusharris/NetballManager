import { useState } from 'react';
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
import { Edit, Trash2, FileText, CalendarRange, Search } from 'lucide-react';
import { Game, Opponent } from '@shared/schema';
import { formatDate, formatShortDate } from '@/lib/utils';

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
  const [dateFilter, setDateFilter] = useState('all');
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [_, navigate] = useLocation();
  
  // Get opponent name by ID
  const getOpponentName = (opponentId: number) => {
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
  
  // Sort games by date (most recent first for completed, soonest first for upcoming)
  const sortedGames = [...filteredGames].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    if (a.completed && b.completed) {
      return dateB - dateA; // Most recent completed games first
    } else if (!a.completed && !b.completed) {
      return dateA - dateB; // Soonest upcoming games first
    } else {
      return a.completed ? 1 : -1; // Upcoming games before completed ones
    }
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
                <TableHead className="px-6 py-3 text-left">Opponent</TableHead>
                <TableHead className="px-6 py-3 text-left">Status</TableHead>
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
                      <div className="font-medium">vs. {getOpponentName(game.opponentId)}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
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
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <a 
                          href={`/roster?game=${game.id}`}
                          className="inline-flex items-center justify-center rounded-md text-xs py-1 px-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        >
                          <CalendarRange className="h-3 w-3 mr-1" />
                          Manage Roster
                        </a>
                        
                        {game.completed && (
                          <a 
                            href={`/statistics?game=${game.id}`}
                            className="inline-flex items-center justify-center rounded-md text-xs py-1 px-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View Stats
                          </a>
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
                                Are you sure you want to delete this game against {getOpponentName(game.opponentId)}? 
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
