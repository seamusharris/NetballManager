import { useState } from 'react';
import { useLocation } from 'wouter';
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
import { Player, Position } from '@shared/schema';
import { cn, getInitials, allPositions, positionGroups } from '@/lib/utils';

interface PlayersListProps {
  players: Player[];
  isLoading: boolean;
  onEdit: (player: Player) => void;
  onDelete: (id: number) => void;
}

// Hard-coded player stats - in a real implementation, these would come from the API
interface PlayerStats {
  playerId: number;
  goals: number;
  goalsAgainst: number;
  missedGoals: number;
}

export default function PlayersList({ players, isLoading, onEdit, onDelete }: PlayersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [_, navigate] = useLocation();
  const itemsPerPage = 10;
  
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
  
  // Mock player stats (in a real implementation, these would be fetched from the API)
  const getPlayerStats = (playerId: number): PlayerStats => {
    return {
      playerId,
      goals: Math.floor(Math.random() * 10),
      goalsAgainst: Math.floor(Math.random() * 5),
      missedGoals: Math.floor(Math.random() * 3)
    };
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
      name: 'Shooting', 
      fields: [
        { field: 'goals', label: 'For' },
        { field: 'goalsAgainst', label: 'Agn' },
        { field: 'missedGoals', label: 'Miss' },
      ]
    }
  ];
  
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
                <TableHead className="min-w-[120px] border-b">Player</TableHead>
                <TableHead className="text-center border-r border-b">Position</TableHead>
                
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
                      style={{ width: '80px' }} // Fixed width columns for stats
                    >
                      {field.label}
                    </TableHead>
                  ))
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No players found. Please add a player or adjust your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlayers.map((player, playerIndex) => {
                  const playerStats = getPlayerStats(player.id);
                  
                  return (
                    <TableRow 
                      key={player.id} 
                      className={`hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${playerIndex === paginatedPlayers.length - 1 ? "" : "border-b"}`}
                      onClick={() => navigate(`/player/${player.id}`)}
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
                      
                      {/* Position preferences column */}
                      <TableCell className="text-center px-2 py-2 border-r">
                        <div className="flex flex-wrap justify-center gap-1">
                          {(player.positionPreferences as Position[]).map((position, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={cn(
                                "px-2 py-0.5 text-xs rounded-full",
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
                        category.fields.map((field, i) => (
                          <TableCell 
                            key={field.field} 
                            className={`py-2 px-2 text-center border-r ${i === 0 ? 'border-l' : ''}`}
                          >
                            <span className="text-sm font-medium">
                              {playerStats[field.field as keyof PlayerStats] || 0}
                            </span>
                          </TableCell>
                        ))
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
