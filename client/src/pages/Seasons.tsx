import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import SeasonForm from "@/components/seasons/SeasonForm";

interface Season {
  id: number;
  name: string;
  type?: string;
  startDate: string;
  endDate: string;
  year: number;
  displayOrder: number;
  isActive: boolean;
}

type SeasonFormData = {
  name: string;
  type?: string;
  startDate: Date;
  endDate: Date;
  year: number;
  displayOrder: number;
  isActive: boolean;
};

export default function Seasons() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all seasons
  const { data: seasons, isLoading } = useQuery({
    queryKey: ['/api/seasons'],
    staleTime: 10000
  });

  // Fetch the active season
  const { data: activeSeason } = useQuery({
    queryKey: ['/api/seasons/active'],
    staleTime: 10000,
    retry: false
  });

  // Add new season mutation
  const addSeasonMutation = useMutation({
    mutationFn: async (seasonData: SeasonFormData) => {
      return await apiRequest('POST', '/api/seasons', seasonData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({
        title: "Season created",
        description: "The new season has been successfully created."
      });
      setOpenAddDialog(false);
    },
    onError: () => {
      toast({
        title: "Error creating season",
        description: "Failed to create season. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update season mutation
  const updateSeasonMutation = useMutation({
    mutationFn: async (data: { id: number; seasonData: SeasonFormData }) => {
      return await apiRequest('PATCH', `/api/seasons/${data.id}`, data.seasonData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({
        title: "Season updated",
        description: "The season has been successfully updated."
      });
      setEditingSeason(null);
    },
    onError: () => {
      toast({
        title: "Error updating season",
        description: "Failed to update season. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete season mutation
  const deleteSeasonMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/seasons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({
        title: "Season deleted",
        description: "The season has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting season",
        description: error.response?.data?.message || "Failed to delete season. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Set active season mutation
  const setActiveSeasonMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/seasons/${id}/activate`);
    },
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

  // Handle add season form submission
  const handleAddSubmit = (data: SeasonFormData) => {
    addSeasonMutation.mutate(data);
  };

  // Handle edit season form submission
  const handleEditSubmit = (data: SeasonFormData) => {
    if (editingSeason) {
      updateSeasonMutation.mutate({ id: editingSeason.id, seasonData: data });
    }
  };

  // Delete a season - exactly like club deletion with simple confirm
  const handleDeleteSeason = (season: Season) => {
    if (confirm(`Are you sure you want to delete "${season.name}"? This action cannot be undone.`)) {
      deleteSeasonMutation.mutate(season.id);
    }
  };

  // Set a season as active
  const handleSetActiveSeason = (id: number) => {
    setActiveSeasonMutation.mutate(id);
  };

  return (
    <div className="container mx-auto py-6">
      <BackButton fallbackPath="/dashboard" className="mb-4">
        Back to Dashboard
      </BackButton>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Seasons</h1>
        <Button 
          onClick={() => setOpenAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Season
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
      ) : !seasons || !Array.isArray(seasons) || seasons.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-6">
              <h3 className="text-lg font-medium mb-2">No seasons found</h3>
              <p className="text-gray-500 mb-4">Create your first season to get started.</p>
              <Button 
                onClick={() => setOpenAddDialog(true)} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Season
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(seasons) && seasons.map((season: Season) => (
            <Card key={season.id} className={cn(
              "transition-all", 
              season.isActive ? "border-blue-600 shadow-md" : ""
            )}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{season.name}</CardTitle>
                    <CardDescription>
                      {season.type || "Regular"} Season {season.year}
                    </CardDescription>
                  </div>
                  {season.isActive && (
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
                {!season.isActive && (
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
                {!season.isActive && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    onClick={() => handleDeleteSeason(season)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Season Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Season</DialogTitle>
            <DialogDescription>
              Create a new season for managing games and statistics.
            </DialogDescription>
          </DialogHeader>
          <SeasonForm
            onSubmit={handleAddSubmit}
            onCancel={() => setOpenAddDialog(false)}
            isSubmitting={addSeasonMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Season Dialog */}
      <Dialog open={!!editingSeason} onOpenChange={(open) => !open && setEditingSeason(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Season</DialogTitle>
            <DialogDescription>
              Update season details and preferences.
            </DialogDescription>
          </DialogHeader>
          <SeasonForm
            season={editingSeason || undefined}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingSeason(null)}
            isSubmitting={updateSeasonMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}