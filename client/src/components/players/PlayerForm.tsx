import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { insertPlayerSchema, Position, Player, allPositions } from "@shared/schema";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

// Create form schema excluding positionPreferences (we handle this separately)
const formSchema = insertPlayerSchema.omit({ positionPreferences: true }).extend({
  position1: z.string().refine((val) => allPositions.includes(val as Position), {
    message: "Please select a valid position",
  }),
  position2: z.string().default("none"),
  position3: z.string().default("none"),
  position4: z.string().default("none"),
});

type FormValues = z.infer<typeof formSchema>;

interface PlayerFormProps {
  player?: Player;
  clubId: number;
  teamId?: number; // Optional team context for automatic team assignment
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}

export default function PlayerForm({ player, clubId, teamId, onSuccess, onCancel }: PlayerFormProps) {
  const isEditing = !!player;
  const queryClient = useQueryClient();

  // Extract position preferences for default values
  const getPositionDefaults = () => {
    if (!player) return { position1: "", position2: "none", position3: "none", position4: "none" };

    const preferences = player.positionPreferences as Position[];
    return {
      position1: preferences[0] || "",
      position2: preferences[1] || "none",
      position3: preferences[2] || "none",
      position4: preferences[3] || "none",
    };
  };

  const positionDefaults = getPositionDefaults();

  const createPlayer = useMutation({
    mutationFn: (data: any) => {
      console.log('\n=== PLAYER FORM MUTATION START ===');
      console.log('PlayerForm: Timestamp:', new Date().toISOString());
      console.log('PlayerForm: Creating player with club context:', clubId, 'team context:', teamId);
      console.log('PlayerForm: Raw form data received:', JSON.stringify(data, null, 2));

      if (!clubId) {
        console.error('PlayerForm: ERROR - No club context available');
        throw new Error('Club context is required for player creation');
      }

      const playerData = {
        ...data,
        clubId, // Always include club ID in payload
        teamId: teamId || undefined // Include team ID if in team context
      };

      console.log('PlayerForm: Final payload being sent:', JSON.stringify(playerData, null, 2));
      console.log('PlayerForm: Headers being sent:', {
        'x-current-club-id': clubId.toString(),
        ...(teamId && { 'x-current-team-id': teamId.toString() })
      });

      // Log the API call details
      console.log('PlayerForm: About to make API call to /api/players');
      console.log('PlayerForm: Request details:', {
        url: '/api/players',
        method: 'POST',
        timestamp: new Date().toISOString(),
        bodySize: JSON.stringify(playerData).length + ' bytes'
      });

      const apiPromise = apiClient.post('/api/players', playerData, {
        headers: {
          'x-current-club-id': clubId.toString(),
          ...(teamId && { 'x-current-team-id': teamId.toString() })
        }
      });

      console.log('PlayerForm: API call initiated, promise created');
      
      // Add promise logging
      apiPromise
        .then(response => {
          console.log('PlayerForm: API call succeeded with response:', response.status);
        })
        .catch(error => {
          console.error('PlayerForm: API call failed with error:', error);
        });

      return apiPromise;
    },
    onSuccess: () => {
      // Invalidate all player-related queries - simplified like working forms
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: [`/api/clubs/${clubId}/players`] });

      // Team-specific invalidations if in team context
      if (teamId) {
        queryClient.invalidateQueries({ queryKey: ['team-players', teamId] });
        queryClient.invalidateQueries({ queryKey: ['unassigned-players'] });
      }

      toast({ title: "Player created successfully" });
      form.reset(); // Reset form on success
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('PlayerForm: Player creation failed:', error);
      toast({
        title: "Error creating player",
        description: error.message || "Failed to create player",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/api/players/${player?.id}`, data),
    onSuccess: () => {
      // Invalidate all player-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: [`/api/players/${player?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/clubs/${clubId}/players`] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && queryKey.includes('/api/players');
        }
      });

      toast({ title: "Player updated successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating player",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const isSubmitting = createPlayer.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: player?.displayName || "",
      firstName: player?.firstName || "",
      lastName: player?.lastName || "",
      dateOfBirth: player?.dateOfBirth || "",
      position1: positionDefaults.position1,
      position2: positionDefaults.position2,
      position3: positionDefaults.position3,
      position4: positionDefaults.position4,
      active: player?.active !== undefined ? player.active : true,
    },
  });

  // Watch position selections to filter out duplicates
  const position1 = useWatch({ control: form.control, name: "position1" });
  const position2 = useWatch({ control: form.control, name: "position2" });
  const position3 = useWatch({ control: form.control, name: "position3" });
  const position4 = useWatch({ control: form.control, name: "position4" });

  // Manage available positions for each dropdown
  const [availablePositions, setAvailablePositions] = useState({
    position1: [...allPositions],
    position2: [...allPositions],
    position3: [...allPositions],
    position4: [...allPositions],
  });

  // Update available positions when selections change
  useEffect(() => {
    const selectedPositions = [position1, position2, position3, position4].filter(
      pos => pos && pos !== "none"
    );

    const newAvailablePositions = {
      position1: [...allPositions],
      position2: [...allPositions],
      position3: [...allPositions],
      position4: [...allPositions],
    };

    // For each dropdown, filter out positions selected in other dropdowns
    for (let i = 1; i <= 4; i++) {
      const fieldName = `position${i}` as keyof typeof availablePositions;
      const currentValue = form.getValues(fieldName as any);

      newAvailablePositions[fieldName] = allPositions.filter(pos => {
        // Always include the currently selected value in the options
        if (pos === currentValue) return true;

        // Exclude positions selected in other dropdowns
        return !selectedPositions.includes(pos) || pos === currentValue;
      });
    }

    setAvailablePositions(newAvailablePositions);

    // Check for duplicates and reset if any are found
    if (position2 !== "none" && position2 === position1) {
      form.setValue("position2", "none");
    }

    if (position3 !== "none" && (position3 === position1 || position3 === position2)) {
      form.setValue("position3", "none");
    }

    if (position4 !== "none" && (position4 === position1 || position4 === position2 || position4 === position3)) {
      form.setValue("position4", "none");
    }

  }, [position1, position2, position3, position4, form]);

  const handleSubmit = (values: FormValues) => {
    console.log('\n=== PLAYER FORM SUBMISSION START ===');
    console.log('PlayerForm: handleSubmit called at:', new Date().toISOString());
    console.log('PlayerForm: handleSubmit called with values:', JSON.stringify(values, null, 2));
    console.log('PlayerForm: Club context:', clubId, 'Team context:', teamId);
    console.log('PlayerForm: Is editing mode:', isEditing);
    console.log('PlayerForm: Form validation state:', {
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
      errors: form.formState.errors
    });

    // Validate at least one position is selected
    if (!values.position1) {
      console.log('PlayerForm: VALIDATION FAILED - No primary position selected');
      form.setError("position1", { 
        type: "required", 
        message: "Primary position is required" 
      });
      return;
    }

    console.log('PlayerForm: Primary position validation passed:', values.position1);

    // Construct position preferences array from individual selections
    const positionPreferences: Position[] = [
      values.position1 as Position,
    ];

    // Only add secondary positions if they're not "none"
    if (values.position2 !== "none") {
      positionPreferences.push(values.position2 as Position);
      console.log('PlayerForm: Added position2:', values.position2);
    }

    if (values.position3 !== "none") {
      positionPreferences.push(values.position3 as Position);
      console.log('PlayerForm: Added position3:', values.position3);
    }

    if (values.position4 !== "none") {
      positionPreferences.push(values.position4 as Position);
      console.log('PlayerForm: Added position4:', values.position4);
    }

    console.log('PlayerForm: Final position preferences array:', positionPreferences);

    // Remove position fields from the data object

    // Create the player data
    const playerData = {
      ...rest,
      positionPreferences,
    };

    console.log('PlayerForm: Final player data being submitted:', JSON.stringify(playerData, null, 2));
    console.log('PlayerForm: Club context being sent:', clubId, 'Team context:', teamId);

    try {
      if (player) {
        console.log('PlayerForm: Calling updateMutation.mutate for existing player');
        updateMutation.mutate(playerData, {
          onSuccess: () => {
            console.log('PlayerForm: Update mutation succeeded');
            form.reset();
            onSuccess?.();
          }
        });
      } else {
        console.log('PlayerForm: Calling createPlayer.mutate for new player');
        console.log('PlayerForm: About to call createPlayer mutation at:', new Date().toISOString());
        console.log('PlayerForm: Mutation state before call:', {
          isPending: createPlayer.isPending,
          isError: createPlayer.isError,
          isSuccess: createPlayer.isSuccess
        });
        
        createPlayer.mutate(playerData);
        
        console.log('PlayerForm: createPlayer.mutate call completed (async)');
        console.log('PlayerForm: Mutation state after call:', {
          isPending: createPlayer.isPending,
          isError: createPlayer.isError,
          isSuccess: createPlayer.isSuccess
        });
      }
    } catch (error) {
      console.error('PlayerForm: Exception during mutation call:', error);
      console.error('PlayerForm: Exception stack trace:', error.stack);
    }

    console.log('=== PLAYER FORM SUBMISSION END ===');
  };

  // Season management is now handled on the player details page

  // Remove games fetch since it's not needed for player creation and was causing opponent API calls

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="J. Smith" {...field} />
                </FormControl>
                <FormDescription>
                  Name as displayed on roster and statistics
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Active Status</FormLabel>
                  <FormDescription>
                    Inactive players won't appear in roster selections
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  value={field.value || ''} 
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seasons are now managed on the player details page */}

        <div>
          <h3 className="text-sm font-medium mb-2">Position Preferences (Ranked)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="position1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Primary Position</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePositions.position1.map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second Preference</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key="none" value="none">None</SelectItem>
                      {availablePositions.position2.map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Third Preference</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key="none" value="none">None</SelectItem>
                      {availablePositions.position3.map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position4"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fourth Preference</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key="none" value="none">None</SelectItem>
                      {availablePositions.position4.map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-primary text-white" 
            disabled={isSubmitting}
            onClick={() => {
              console.log('PlayerForm: Submit button clicked');
              console.log('PlayerForm: Current form state:', form.getValues());
              console.log('PlayerForm: Form errors:', form.formState.errors);
              console.log('PlayerForm: Is form valid:', form.formState.isValid);
            }}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Player' : 'Add Player'}
          </Button>
        </div>
      </form>
    </Form>
  );
}