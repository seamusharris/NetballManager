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
  Building2, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckSquare,
  Square
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

interface Club {
  id: number;
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  isActive: boolean;
  _count?: {
    teams: number;
    players: number;
  };
}

export default function AdminClubs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClubs, setSelectedClubs] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all clubs with counts
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['admin-clubs'],
    queryFn: async () => {
      const response = await apiClient.get('/api/clubs?include=counts');
      return response as Club[];
    },
  });

  // Delete single club mutation
  const deleteMutation = useMutation({
    mutationFn: (clubId: number) => apiClient.delete(`/api/clubs/${clubId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      toast({ title: 'Club deleted successfully' });
      setClubToDelete(null);
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting club', 
        description: error.message || 'Failed to delete club',
        variant: 'destructive' 
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (clubIds: number[]) => 
      Promise.all(clubIds.map(id => apiClient.delete(`/api/clubs/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      toast({ title: `${selectedClubs.length} clubs deleted successfully` });
      setSelectedClubs([]);
      setShowBulkDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting clubs', 
        description: error.message || 'Failed to delete some clubs',
        variant: 'destructive' 
      });
    },
  });

  // Filter clubs based on search term
  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (club.address && club.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle individual club selection
  const handleClubSelect = (clubId: number, checked: boolean) => {
    if (checked) {
      setSelectedClubs([...selectedClubs, clubId]);
    } else {
      setSelectedClubs(selectedClubs.filter(id => id !== clubId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClubs(filteredClubs.map(club => club.id));
    } else {
      setSelectedClubs([]);
    }
  };

  // Handle single delete
  const handleDelete = (club: Club) => {
    setClubToDelete(club);
    setShowDeleteDialog(true);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedClubs.length === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const isAllSelected = filteredClubs.length > 0 && selectedClubs.length === filteredClubs.length;
  const isIndeterminate = selectedClubs.length > 0 && selectedClubs.length < filteredClubs.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Club Administration</h1>
          <p className="text-gray-600">Manage all clubs across the system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {filteredClubs.length} clubs
          </Badge>
          {selectedClubs.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedClubs.length})
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
                placeholder="Search clubs by name, code, or address..."
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

      {/* Clubs List */}
      <div className="grid gap-4">
        {filteredClubs.map((club) => (
          <Card key={club.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedClubs.includes(club.id)}
                    onCheckedChange={(checked) => handleClubSelect(club.id, checked as boolean)}
                  />
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{club.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Code: {club.code}</span>
                        {club.address && <span>• {club.address}</span>}
                        {club.contactEmail && <span>• {club.contactEmail}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{club._count?.teams || 0} teams</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{club._count?.players || 0} players</span>
                    </div>
                  </div>

                  {/* Status */}
                  <Badge variant={club.isActive ? "default" : "secondary"}>
                    {club.isActive ? "Active" : "Inactive"}
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
                      onClick={() => handleDelete(club)}
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

      {filteredClubs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No clubs have been created yet.'}
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
              <span>Delete Club</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{clubToDelete?.name}"? This action cannot be undone and will also delete all associated teams, players, and games.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clubToDelete && deleteMutation.mutate(clubToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Club'}
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
              <span>Delete Multiple Clubs</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedClubs.length} clubs? This action cannot be undone and will also delete all associated teams, players, and games.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedClubs)}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedClubs.length} Clubs`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}