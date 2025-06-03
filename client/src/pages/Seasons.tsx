import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

// Season form schema with validation
const seasonFormSchema = z.object({
  name: z.string().min(2, { message: "Season name must be at least 2 characters." }),
  type: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  year: z.number().int().min(2020, { message: "Year must be 2020 or later." }),
  displayOrder: z.number().int().min(0, { message: "Display order must be 0 or higher." }),
  isActive: z.boolean().default(false)
});

type SeasonFormValues = z.infer<typeof seasonFormSchema>;

export default function Seasons() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingSeason, setEditingSeason] = useState<any>(null);
  const [deletingSeason, setDeletingSeason] = useState<any>(null);
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
    retry: false // Don't retry if no active season exists
  });

  // Add new season mutation
  const addSeasonMutation = useMutation({
    mutationFn: async (seasonData: SeasonFormValues) => {
      const res = await apiRequest('POST', '/api/seasons', seasonData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      toast({
        title: "Season created",
        description: "The new season has been successfully created."
      });
      setOpenAddDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating season",
        description: "Failed to create season. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update season mutation
  const updateSeasonMutation = useMutation({
    mutationFn: async (data: { id: number; seasonData: Partial<SeasonFormValues> }) => {
      const res = await apiRequest('PATCH', `/api/seasons/${data.id}`, data.seasonData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      toast({
        title: "Season updated",
        description: "The season has been successfully updated."
      });
      setEditingSeason(null);
    },
    onError: (error) => {
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
      const res = await apiRequest('DELETE', `/api/seasons/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      toast({
        title: "Season deleted",
        description: "The season has been successfully deleted."
      });
      setDeletingSeason(null);
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
      const res = await apiRequest('POST', `/api/seasons/${id}/activate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons/active'] });
      toast({
        title: "Active season changed",
        description: "The active season has been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error changing active season",
        description: "Failed to change active season. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Add season form
  const addForm = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonFormSchema),
    defaultValues: {
      name: "",
      type: "Regular",
      year: new Date().getFullYear(),
      displayOrder: 0,
      isActive: false
    }
  });

  // Edit season form
  const editForm = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonFormSchema),
    defaultValues: {
      name: "",
      type: "",
      year: new Date().getFullYear(),
      displayOrder: 0,
      isActive: false
    }
  });

  // Handle add season form submission
  const onAddSubmit = (data: SeasonFormValues) => {
    addSeasonMutation.mutate(data);
  };

  // Handle edit season form submission
  const onEditSubmit = (data: SeasonFormValues) => {
    if (editingSeason) {
      updateSeasonMutation.mutate({ id: editingSeason.id, seasonData: data });
    }
  };

  // Set up the edit form when a season is selected for editing
  const handleEditSeason = (season: any) => {
    setEditingSeason(season);
    editForm.reset({
      name: season.name,
      type: season.type || "",
      startDate: new Date(season.startDate),
      endDate: new Date(season.endDate),
      year: season.year,
      displayOrder: season.displayOrder,
      isActive: season.isActive
    });
  };

  // Delete a season
  const handleDeleteSeason = (season: any) => {
    setDeletingSeason(season);
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
          {Array.isArray(seasons) && seasons.map((season: any) => (
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
                  onClick={() => handleEditSeason(season)}
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
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Season Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Spring Season 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Regular, Summer, Winter" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional: Specify the type of season
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 2025)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Set as active season
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={addSeasonMutation.isPending}
                >
                  {addSeasonMutation.isPending ? "Creating..." : "Create Season"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Season Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season Type</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional: Specify the type of season
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 2025)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingSeason(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={updateSeasonMutation.isPending}
                >
                  {updateSeasonMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Season Confirmation */}
      <AlertDialog 
        open={!!deletingSeason} 
        onOpenChange={(open) => !open && setDeletingSeason(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              "{deletingSeason?.name}" season and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteSeasonMutation.mutate(deletingSeason.id)}
              disabled={deleteSeasonMutation.isPending}
            >
              {deleteSeasonMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}