import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Edit, Trash2, Search, Eye } from 'lucide-react';
import { Player, Position } from '@shared/schema';
import { cn, getInitials } from '@/lib/utils';
import { allPositions } from '@shared/schema';

interface PlayersListProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (playerId: number) => void;
  isLoading?: boolean;
}

export default function PlayersList({ players, onEdit, onDelete, isLoading = false }: PlayersListProps) {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handlePlayerClick = (player: Player) => {
    navigate(`/player/${player.id}`);
  };

  // Filter players based on search and filters
  const filteredPlayers = players.filter(player => {
    const matchesSearch = !searchQuery || 
      player.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPosition = positionFilter === 'all' || 
      player.positionPreferences.includes(positionFilter as Position);

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? player.active : !player.active);

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const getPositionBadgeColor = (position: Position) => {
    const colorMap = {
      'GS': 'bg-red-100 text-red-800',
      'GA': 'bg-orange-100 text-orange-800',
      'WA': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-green-100 text-green-800',
      'WD': 'bg-blue-100 text-blue-800',
      'GD': 'bg-indigo-100 text-indigo-800',
      'GK': 'bg-purple-100 text-purple-800',
    };
    return colorMap[position] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading players...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players ({filteredPlayers.length})</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {allPositions.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery || positionFilter !== 'all' || statusFilter !== 'all' 
              ? 'No players match your filters' 
              : 'No players found'}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Positions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                          player.avatarColor || 'bg-gray-500'
                        )}>
                          {getInitials(player.displayName)}
                        </div>
                        <div>
                          <button
                            onClick={() => handlePlayerClick(player)}
                            className="font-medium text-left hover:text-blue-600 transition-colors"
                          >
                            {player.displayName}
                          </button>
                          <div className="text-sm text-muted-foreground">
                            {player.firstName} {player.lastName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {player.positionPreferences.map((position, index) => (
                          <Badge 
                            key={position} 
                            variant="secondary" 
                            className={cn(
                              getPositionBadgeColor(position),
                              index === 0 && "font-semibold" // Primary position
                            )}
                          >
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={player.active ? "default" : "secondary"}>
                        {player.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {player.dateOfBirth ? (
                        new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()
                      ) : '-'}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayerClick(player)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(player)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(player.id!)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}