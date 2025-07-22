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
  Shield
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

interface Team {
  id: number;
  name: string;
  division?: string;
  isActive: boolean;
  _count?: {
    players: number;
    games: number;
  };
  club?: {
    id: number;
    name: string;
    code: string;
  };
  season?: {
    id: number;
    name: string;
    isActive: boolean;
  };
}

export default function AdminTeams() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all teams with counts and related info
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: async () => {
      const response = await apiClient.get('/api/teams?include=counts,club,season');
      return response as Team[];
    },
  });

  // Delete single team mutation
  const deleteMutation = useMutation({
    mutationFn: (teamId: number) => apiClient.delete(`/api/teams/${teamId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
      toast({ title: 'Team deleted successfully' });
      setTeamToDelete(null);
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting team', 
        description: error.message || 'Failed to delete team',
        variant: 'destructive' 
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (teamIds: number[]) => 
      Promise.all(teamIds.map(id => apiClient.delete(`/api/teams/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
      toast({ title: `${selectedTeams.length} teams deleted successfully` });
      setSelectedTeams([]);
      setShowBulkDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting teams', 
        description: error.message || 'Failed to delete some teams',
        variant: 'destructive' 
      });
    },
  });

  // Filter teams based on search term
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.division && team.division.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (team.club && (
      team.club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.club.code.toLowerCase().includes(searchTerm.toLowerCase())
    )) ||
    (team.season && team.season.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle individual team selection
  const handleTeamSelect = (teamId: number, checked: boolean) => {
    if (checked) {
      setSelectedTeams([...selectedTeams, teamId]);
    } else {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTeams(filteredTeams.map(team => team.id));
    } else {
      setSelectedTeams([]);
    }
  };

  // Handle single delete
  const handleDelete = (team: Team) => {
    setTeamToDelete(team);
    setShowDeleteDialog(true);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedTeams.length === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const isAllSelected = filteredTeams.length > 0 && selectedTeams.length === filteredTeams.length;
  const isIndeterminate = selectedTeams.length > 0 && selectedTeams.length < filteredTeams.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Administration</h1>
          <p className="text-gray-600">Manage all teams across the system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {filteredTeams.length} teams
          </Badge>
          {selectedTeams.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedTeams.length})
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
                placeholder="Search teams by name, division, club, or season..."
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

      {/* Teams List */}
      <div className="grid gap-4">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedTeams.includes(team.id)}
                    onCheckedChange={(checked) => handleTeamSelect(team.id, checked as boolean)}
                  />
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {team.division && <span>Division: {team.division}</span>}
                        {team.club && (
                          <span>• Club: {team.club.name} ({team.club.code})</span>
                        )}
                        {team.season && (
                          <span>• Season: {team.season.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{team._count?.players || 0} players</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{team._count?.games || 0} games</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    <Badge variant={team.isActive ? "default" : "secondary"}>
                      {team.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {team.season?.isActive && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Current Season
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(team)}
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

      {filteredTeams.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No teams have been created yet.'}
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
              <span>Delete Team</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{teamToDelete?.name}"? This action cannot be undone and will also delete all associated games, rosters, and statistics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => teamToDelete && deleteMutation.mutate(teamToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Team'}
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
              <span>Delete Multiple Teams</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTeams.length} teams? This action cannot be undone and will also delete all associated games, rosters, and statistics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedTeams)}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedTeams.length} Teams`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}