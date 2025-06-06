
import React, { useState } from 'react';
import { useStandardQuery } from '@/hooks/use-standard-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/ui/crud-dialog';
import SeasonForm from '@/components/seasons/SeasonForm';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Season } from '@shared/schema';
import { BackButton } from '@/components/ui/back-button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Seasons() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch seasons using same pattern as Teams
  const { data: seasons = [], isLoading: isLoadingSeasons } = useStandardQuery<Season[]>({
    endpoint: '/api/seasons'
  });

  // Fetch active season using same pattern
  const { data: activeSeason } = useStandardQuery<Season>({
    endpoint: '/api/seasons/active'
  });

  // Create mutation - EXACTLY matching Teams pattern
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/seasons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({ title: "Season created successfully" });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating season",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update mutation - EXACTLY matching Teams pattern
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.patch(`/api/seasons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({ title: "Season updated successfully" });
      setEditingSeason(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating season",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete mutation - with React Strict Mode 404 handling
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/seasons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({ title: "Season deleted successfully" });
    },
    onError: (error: any) => {
      console.error('Failed to delete season:', error);
      
      // Handle "not found" errors gracefully - this is common in React Strict Mode
      const errorMessage = error.message?.toLowerCase() || '';
      const is404Error = errorMessage.includes("not found") || 
                         errorMessage.includes("404") || 
                         errorMessage.includes("season not found") ||
                         error.status === 404 ||
                         error.response?.status === 404;

      if (is404Error) {
        // Don't show any error for 404s - they're expected in React Strict Mode
        toast({
          title: "Season deleted successfully",
          description: "The season has been removed."
        });
        return; // Exit early, don't show error
      }

      // Show error for other types of failures
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete season",
        variant: "destructive",
      });
    },
  });

  // Delete handler - EXACTLY matching Teams pattern
  const handleDelete = (season: Season) => {
    if (confirm(`Are you sure you want to delete "${season.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(season.id);
    }
  };

  // Set active season mutation
  const setActiveSeasonMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/api/seasons/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({
        title: "Active season changed",
        description: "The active season has been updated."
      });
    },
    onError: () => {
      toast({
        title: "Error changing active season",
        description: "Failed to change active season. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSetActiveSeason = (id: number) => {
    setActiveSeasonMutation.mutate(id);
  };

  return (
    <>
      <div className="container mx-auto p-6">
        <BackButton fallbackPath="/dashboard" className="mb-4">
          Back to Dashboard
        </BackButton>

        <Card>
          <CardHeader>
            <CardTitle>Seasons</CardTitle>
            <CardDescription>
              Manage your club's seasons and set the active season
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end pb-4">
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Season
              </Button>
            </div>

            {isLoadingSeasons ? (
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
                {seasons.map((season: Season) => {
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
                            <Badge className="bg-blue-600">Active</Badge>
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
                        >
                          Set Active
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingSeason(season)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {!isCurrentlyActive && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDelete(season)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
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
      </div>

      <CrudDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create Season"
      >
        <SeasonForm
          onSubmit={(data) => createMutation.mutate(data)}
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
          onSubmit={(data) => updateMutation.mutate({ id: editingSeason!.id, ...data })}
          onCancel={() => setEditingSeason(null)}
          isSubmitting={updateMutation.isPending}
        />
      </CrudDialog>
    </>
  );
}
