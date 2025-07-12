
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { apiClient } from '@/lib/apiClient';
import SeasonForm from '@/components/seasons/SeasonForm';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Season } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function SeasonsManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: seasons = [], isLoading } = useQuery({
    queryKey: ['/api/seasons'],
    queryFn: () => apiClient.get('/api/seasons'),
  });

  const { data: activeSeason } = useQuery({
    queryKey: ['/api/seasons/active'],
    queryFn: () => apiClient.get('/api/seasons/active'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/seasons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      setIsCreateDialogOpen(false);
      toast({ title: "Season created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating season",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.patch(`/api/seasons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      setEditingSeason(null);
      toast({ title: "Season updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating season",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/seasons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({ title: "Season deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting season",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const setActiveSeasonMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/api/seasons/${id}/set-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({ title: "Active season updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error setting active season",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    if (editingSeason) {
      updateMutation.mutate({ id: editingSeason.id, ...data });
    }
  };

  const handleDelete = (seasonId: number) => {
    if (confirm('Are you sure you want to delete this season?')) {
      deleteMutation.mutate(seasonId);
    }
  };

  const handleSetActiveSeason = (id: number) => {
    setActiveSeasonMutation.mutate(id);
  };

  // Sort seasons: active first, then by display order
  const sortedSeasons = seasons
    .slice()
    .sort((a, b) => {
      if (activeSeason?.id === a.id) return -1;
      if (activeSeason?.id === b.id) return 1;
      return a.displayOrder - b.displayOrder;
    });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Seasons Management</CardTitle>
          <CardDescription>
            Manage your club's seasons and set the active season
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end pb-4">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Season
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          ) : !seasons || seasons.length === 0 ? (
            <div className="text-center p-6">
              <h3 className="text-lg font-medium mb-2">No seasons found</h3>
              <p className="text-gray-500 mb-4">Create your first season to get started.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Season
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSeasons.map((season: Season) => {
                const isCurrentlyActive = activeSeason?.id === season.id;
                return (
                  <Card key={season.id} className={cn(
                    "transition-all", 
                    isCurrentlyActive ? "border-blue-600 shadow-md" : ""
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {season.name}
                            {isCurrentlyActive && (
                              <Badge variant="default" className="bg-blue-600">
                                <Star className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(season.startDate), 'MMM d, yyyy')} - {format(new Date(season.endDate), 'MMM d, yyyy')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2 flex-wrap">
                        {!isCurrentlyActive && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetActiveSeason(season.id)}
                            disabled={setActiveSeasonMutation.isPending}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingSeason(season)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!isCurrentlyActive && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleDelete(season.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CrudDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Create Season"
      >
        <SeasonForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateDialogOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </CrudDialog>

      <CrudDialog
        isOpen={!!editingSeason}
        onClose={() => setEditingSeason(null)}
        title="Edit Season"
      >
        <SeasonForm
          season={editingSeason || undefined}
          onSubmit={handleUpdate}
          onCancel={() => setEditingSeason(null)}
          isSubmitting={updateMutation.isPending}
        />
      </CrudDialog>
    </>
  );
}
