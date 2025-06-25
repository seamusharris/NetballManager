import React, { useState } from 'react';
import { useStandardQuery } from '@/hooks/use-standard-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import SeasonForm from '@/components/seasons/SeasonForm';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Season } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import PageTemplate from '@/components/layout/PageTemplate';
import { useLocation } from 'wouter';

export default function Seasons() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch seasons using standard query (like Teams)
    endpoint: '/api/seasons'
  });

  // Fetch active season
    endpoint: '/api/seasons/active'
  });

  // Direct mutations like Teams - no useCrudMutations to avoid 404 handling issues
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/seasons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({
        title: "Success",
        description: "Season created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create season",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.patch(`/api/seasons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({
        title: "Success",
        description: "Season updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update season",
        variant: "destructive",
      });
    },
  });

  // Delete mutation handled separately like Teams to avoid 404 issues
  const deleteMutation = useMutation({
    mutationFn: (seasonId: number) => apiClient.delete(`/api/seasons/${seasonId}`),
    onSuccess: () => {
      // Use correct endpoint-based keys that match useStandardQuery
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });

      toast({
        title: "Success",
        description: "Season deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete season",
        variant: "destructive",
      });
    },
  });

  // Set active season mutation
  const setActiveSeasonMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/api/seasons/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({
        title: "Success",
        description: "Active season updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update active season. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => setIsDialogOpen(false)
    });
  };

  const handleUpdate = (data: any) => {
    if (editingSeason) {
      updateMutation.mutate({ id: editingSeason.id, ...data }, {
        onSuccess: () => setEditingSeason(null)
      });
    }
  };

  const handleDelete = (seasonId: number) => {
    if (deleteMutation.isPending) return; // Prevent duplicate calls
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

  const breadcrumbs = [
    { label: 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: 'Seasons' }
  ];

  return (
    <>
      <PageTemplate
        title="Seasons"
        subtitle="Manage your club's seasons and set the active season"
        breadcrumbs={breadcrumbs}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end pb-4">
              <Button onClick={() => setIsDialogOpen(true)}>
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
                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
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
                            <CardTitle className="text-xl">{season.name}</CardTitle>
                            <CardDescription>
                              {season.type || "Regular"} Season {season.year}
                            </CardDescription>
                          </div>
                          {isCurrentlyActive && (
                            <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                              Active
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-semibold">Start Date:</span>{" "}
                            {format(new Date(season.startDate), "PPP")}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold">End Date:</span>{" "}
                            {format(new Date(season.endDate), "PPP")}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold">Display Order:</span>{" "}
                            {season.displayOrder}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
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
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </PageTemplate>

      <CrudDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create Season"
      >
        <SeasonForm
          onSubmit={handleCreate}
          onCancel={() => setIsDialogOpen(false)}
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