import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Trash2, 
  Edit, 
  Users, 
  Building2, 
  Calendar,
  AlertTriangle,
  User
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Player {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  positionPreferences?: string[];
  active: boolean;
  avatarColor?: string;
  _count?: {
    teams: number;
    clubs: number;
  };
  clubs?: Array<{
    id: number;
    name: string;
    code: string;
  }>;
}

export default function AdminPlayers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all players with counts and club info
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['admin-players'],
    queryFn: async () => {
      const response = await apiClient.get('/api/players?include=counts,clubs');
      return response as Player[];
    },
  });

  // Delete single player mutation
  const deleteMutation = useMutation({
    mutationFn: (playerId: number) => apiClient.delete(`/api/players/${playerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-players'] });
      toast({ title: 'Player deleted successfully' });
      setPlayerToDelete(null);
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting player', 
        description: error.message || 'Failed to delete player',
        variant: 'destructive' 
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (playerIds: number[]) => 
      Promise.all(playerIds.map(id => apiClient.delete(`/api/players/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-players'] });
      toast({ title: `${selectedPlayers.length} players deleted successfully` });
      setSelectedPlayers([]);
      setShowBulkDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting players', 
        description: error.message || 'Failed to delete some players',
        variant: 'destructive' 
      });
    },
  });

  // Filter players based on search term
  const filteredPlayers = players.filter(player =>
    player.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.clubs && player.clubs.some(club => 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.code.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Handle individual player selection
  const handlePlayerSelect = (playerId: number, checked: boolean) => {
    if (checked) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    } else {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPlayers(filteredPlayers.map(player => player.id));
    } else {
      setSelectedPlayers([]);
    }
  };

  // Handle single delete
  const handleDelete = (player: Player) => {
    setPlayerToDelete(player);
    setShowDeleteDialog(true);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedPlayers.length === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const isAllSelected = filteredPlayers.length > 0 && selectedPlayers.length === filteredPlayers.length;
  const isIndeterminate = selectedPlayers.length > 0 && selectedPlayers.length < filteredPlayers.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Player Administration</h1>
          <p className="text-gray-600">Manage all players across the system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {filteredPlayers.length} players
          </Badge>
          {selectedPlayers.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedPlayers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search players by name or club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isIndeterminate ? "data-[state=indeterminate]:bg-blue-600" : ""}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <div className="grid gap-4">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedPlayers.includes(player.id)}
                    onCheckedChange={(checked) => handlePlayerSelect(player.id, checked as boolean)}
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${player.avatarColor || 'bg-blue-100'}`}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{player.displayName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{player.firstName} {player.lastName}</span>
                        {player.dateOfBirth && (
                          <span>• Born: {new Date(player.dateOfBirth).toLocaleDateString()}</span>
                        )}
                        {player.positionPreferences && player.positionPreferences.length > 0 && (
                          <span>• Positions: {player.positionPreferences.join(', ')}</span>
                        )}
                      </div>
                      {player.clubs && player.clubs.length > 0 && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Building2 className="w-3 h-3 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {player.clubs.map((club) => (
                              <Badge key={club.id} variant="outline" className="text-xs">
                                {club.name} ({club.code})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-4 h-4" />
                      <span>{player._count?.clubs || 0} clubs</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{player._count?.teams || 0} teams</span>
                    </div>
                  </div>

                  {/* Status */}
                  <Badge variant={player.active ? "default" : "secondary"}>
                    {player.active ? "Active" : "Inactive"}
                  </Badge>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(player)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No players have been created yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Delete Player</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{playerToDelete?.displayName}"? This action cannot be undone and will remove the player from all teams and clubs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => playerToDelete && deleteMutation.mutate(playerToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Player'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Delete Multiple Players</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPlayers.length} players? This action cannot be undone and will remove all players from their teams and clubs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedPlayers)}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedPlayers.length} Players`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}