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

// Extend the schema for the form validation
const formSchema = insertPlayerSchema.extend({
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
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export default function PlayerForm({ player, onSubmit, isSubmitting, onCancel }: PlayerFormProps) {
  const isEditing = !!player;

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

  const handleSubmit = async (values: FormValues) => {
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

      // Create the player data without seasons
      const playerData = {
        ...rest,
        positionPreferences,
      };

      console.log("Submitting player data:", playerData);

      // Submit the data and wait for completion
      await onSubmit(playerData);
      
      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      // Re-throw error so parent component can handle it properly
      throw error;
    }
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
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-primary text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Player' : 'Add Player'}
          </Button>
        </div>
      </form>
    </Form>
  );
}