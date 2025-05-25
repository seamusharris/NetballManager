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
import { insertPlayerSchema, Position, Player, allPositions, Season } from "@shared/schema";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Extend the schema for the form validation
const formSchema = insertPlayerSchema.extend({
  position1: z.string().refine((val) => allPositions.includes(val as Position), {
    message: "Please select a valid position",
  }),
  position2: z.string().default("none"),
  position3: z.string().default("none"),
  position4: z.string().default("none"),
});

type FormValues = z.infer<typeof formSchema> & {
  seasonIds: number[];
};

interface PlayerFormProps {
  player?: Player;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function PlayerForm({ player, onSubmit, isSubmitting }: PlayerFormProps) {
  const isEditing = !!player;
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>([]);
  
  // Fetch all available seasons
  const { data: seasons = [] } = useQuery<Season[]>({
    queryKey: ['/api/seasons'],
  });
  
  // If editing, fetch player's current seasons
  const { data: playerSeasons = [] } = useQuery<Season[]>({
    queryKey: ['/api/players', player?.id, 'seasons'],
    enabled: isEditing && !!player?.id,
  });
  
  // Set selected seasons when player seasons data is loaded
  useEffect(() => {
    // Important: Reset the selected seasons array when entering the component
    // to avoid potential stale state from previous edits
    setSelectedSeasons([]);
    
    if (playerSeasons.length > 0) {
      // Map seasons from player's seasons
      const validSeasonIds = playerSeasons.map(season => season.id);
      console.log("Setting player seasons from API:", validSeasonIds);
      setSelectedSeasons(validSeasonIds);
    } else if (seasons.length > 0 && !isEditing) {
      // For new players, select the active season by default
      const activeSeasonIds = seasons
        .filter(season => season.isActive)
        .map(season => season.id);
      
      console.log("Setting active seasons for new player:", activeSeasonIds);
      setSelectedSeasons(activeSeasonIds);
    }
  }, [playerSeasons, seasons, isEditing]);
  
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
      seasonIds: [],
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
    try {
      // Validate at least one position is selected
      if (!values.position1) {
        form.setError("position1", { 
          type: "required", 
          message: "Primary position is required" 
        });
        return;
      }
      
      // Construct position preferences array from individual selections
      const positionPreferences: Position[] = [
        values.position1 as Position,
      ];
      
      // Only add secondary positions if they're not "none"
      if (values.position2 !== "none") {
        positionPreferences.push(values.position2 as Position);
      }
      
      if (values.position3 !== "none") {
        positionPreferences.push(values.position3 as Position);
      }
      
      if (values.position4 !== "none") {
        positionPreferences.push(values.position4 as Position);
      }
      
      // Remove position fields from the data object
      const { position1, position2, position3, position4, ...rest } = values;
      
      // Double-check we only have valid season IDs
      // Get the actual season IDs from our seasons data
      const validSeasonIds = seasons.map(season => season.id);
      
      // Filter the selectedSeasons to only include valid season IDs
      const filteredSeasonIds = selectedSeasons.filter(id => 
        validSeasonIds.includes(id)
      );
      
      console.log("Selected seasons:", selectedSeasons);
      console.log("Valid season IDs:", validSeasonIds);
      console.log("Filtered season IDs:", filteredSeasonIds);
      
      // Construct the final player data object with properly filtered seasons
      const playerData = {
        ...rest,
        positionPreferences,
        seasonIds: filteredSeasonIds.length > 0 ? filteredSeasonIds : validSeasonIds.filter(id => seasons.find(s => s.id === id)?.isActive),
      };
      
      console.log("Player form submitted with data:", playerData);
      
      // Submit the data
      onSubmit(playerData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };
  
  // Function to handle season checkbox toggle
  const handleSeasonToggle = (seasonId: number) => {
    // First verify this is a valid season ID
    const isValidSeason = seasons.some(season => season.id === seasonId);
    
    if (!isValidSeason) {
      console.error(`Attempted to toggle invalid season ID: ${seasonId}`);
      return; // Exit early if not a valid season
    }
    
    if (selectedSeasons.includes(seasonId)) {
      // Remove the season if already selected
      const newSelection = selectedSeasons.filter(id => id !== seasonId);
      console.log(`Removed season ${seasonId}, new selection:`, newSelection);
      setSelectedSeasons(newSelection);
    } else {
      // Add the season if not already selected
      const newSelection = [...selectedSeasons, seasonId];
      console.log(`Added season ${seasonId}, new selection:`, newSelection);
      setSelectedSeasons(newSelection);
    }
  };

  // Function to handle manual form submission
  const onFormSubmit = () => {
    // Get the current form values
    const values = form.getValues();
    
    // Validate form manually
    if (!values.displayName || !values.firstName || !values.lastName || !values.position1) {
      if (!values.displayName) {
        form.setError("displayName", { type: "required", message: "Display name is required" });
      }
      if (!values.firstName) {
        form.setError("firstName", { type: "required", message: "First name is required" });
      }
      if (!values.lastName) {
        form.setError("lastName", { type: "required", message: "Last name is required" });
      }
      if (!values.position1) {
        form.setError("position1", { type: "required", message: "Primary position is required" });
      }
      return;
    }
    
    // Validate at least one season is selected
    if (selectedSeasons.length === 0 && seasons.length > 0) {
      alert("Please select at least one season for the player");
      return;
    }
    
    // Build position preferences array
    const positionPreferences: Position[] = [values.position1 as Position];
    if (values.position2 !== "none") positionPreferences.push(values.position2 as Position);
    if (values.position3 !== "none") positionPreferences.push(values.position3 as Position);
    if (values.position4 !== "none") positionPreferences.push(values.position4 as Position);
    
    // CRITICAL FIX: Ensure we're only using valid season IDs
    // Get the actual season IDs from our seasons data
    const validSeasonIds = seasons.map(season => season.id);
    
    // Filter the selectedSeasons to only include valid season IDs
    const filteredSeasonIds = selectedSeasons.filter(id => 
      validSeasonIds.includes(id)
    );
    
    // If we have no valid season IDs but we have seasons, use the active season
    const finalSeasonIds = filteredSeasonIds.length > 0 
      ? filteredSeasonIds 
      : (seasons.filter(s => s.isActive).map(s => s.id));
    
    console.log("Valid season IDs from API:", validSeasonIds);
    console.log("Selected seasons before filtering:", selectedSeasons);
    console.log("Final filtered season IDs for submission:", finalSeasonIds);
    
    // Build player data object with properly filtered season IDs
    const playerData = {
      displayName: values.displayName,
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth || null,
      positionPreferences,
      active: values.active,
      seasonIds: finalSeasonIds
    };
    
    console.log("Submitting player data manually:", playerData);
    
    // Call the onSubmit handler passed from parent
    onSubmit(playerData);
  };
  
  return (
    <Form {...form}>
      <div className="space-y-6">
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
        
        {/* Season Selection */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Seasons</h3>
          <div className="border rounded-md p-4">
            {seasons.length === 0 ? (
              <p className="text-sm text-gray-500">No seasons available</p>
            ) : (
              <div className="space-y-2">
                {seasons.map((season) => (
                  <div key={season.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`season-${season.id}`}
                      checked={selectedSeasons.includes(season.id)}
                      onCheckedChange={() => handleSeasonToggle(season.id)}
                    />
                    <label
                      htmlFor={`season-${season.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {season.name}
                      {season.isActive && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Active
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Select which seasons this player belongs to
          </p>
        </div>
        
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
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              // Get original values to properly reset
              const originalValues = {
                displayName: player?.displayName || "",
                firstName: player?.firstName || "",
                lastName: player?.lastName || "",
                dateOfBirth: player?.dateOfBirth || "",
                position1: positionDefaults.position1,
                position2: positionDefaults.position2,
                position3: positionDefaults.position3,
                position4: positionDefaults.position4,
                active: player?.active !== undefined ? player.active : true,
              };
              
              // Reset form to original values
              form.reset(originalValues);
            }}
          >
            Reset
          </Button>
          <Button 
            type="button" 
            className="bg-primary text-white" 
            disabled={isSubmitting}
            onClick={onFormSubmit}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Player' : 'Add Player'}
          </Button>
        </div>
      </div>
    </Form>
  );
}
