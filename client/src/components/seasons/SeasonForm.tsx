import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useStandardForm } from "@/hooks/useStandardForm";

// Form schema using camelCase (frontend format)
const seasonFormSchema = z.object({
  name: z.string().min(2, { message: "Season name must be at least 2 characters." }),
  type: z.string().optional(),
  startDate: z.coerce.date({ required_error: "Start date is required." }),
  endDate: z.coerce.date({ required_error: "End date is required." }),
  year: z.coerce.number().int().min(2020, { message: "Year must be 2020 or later." }),
  displayOrder: z.coerce.number().int().min(0, { message: "Display order must be 0 or higher." }),
  isActive: z.boolean().default(false)
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type SeasonFormData = z.infer<typeof seasonFormSchema>;

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

interface SeasonFormProps {
  season?: Season;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}

export default function SeasonForm({ 
  season, 
  onSuccess, 
  onCancel 
}: SeasonFormProps) {
  
  // Prepare default values for the form
  const getDefaultValues = (): Partial<SeasonFormData> => {
    if (!season) {
      return {
        name: "",
        type: "Regular",
        year: new Date().getFullYear(),
        displayOrder: 0,
        isActive: false,
      };
    }

    return {
      name: season.name || "",
      type: season.type || "Regular",
      startDate: season.startDate ? new Date(season.startDate) : undefined,
      endDate: season.endDate ? new Date(season.endDate) : undefined,
      year: season.year || new Date().getFullYear(),
      displayOrder: season.displayOrder || 0,
      isActive: season.isActive || false,
    };
  };

  const {
    form,
    handleSubmit,
    handleCancel,
    isLoading,
    isEditing,
  } = useStandardForm<SeasonFormData>({
    schema: seasonFormSchema,
    createEndpoint: '/api/seasons',
    updateEndpoint: (id) => `/api/seasons/${id}`,
    defaultValues: getDefaultValues(),
    initialData: season,
    onSuccess,
    onCancel,
    cacheKeys: ['/api/seasons', 'active-season'],
    successMessage: season ? 'Season updated successfully' : 'Season created successfully',
    errorMessage: season ? 'Failed to update season' : 'Failed to create season',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel required>Start Date</FormLabel>
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
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel required>End Date</FormLabel>
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
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={field.value || ""}
                    onChange={e => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : parseInt(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={field.value || ""}
                    onChange={e => {
                      const value = e.target.value;
                      field.onChange(value === "" ? 0 : parseInt(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Order in which seasons are displayed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Active Season
                </FormLabel>
                <FormDescription>
                  Set this season as the currently active season
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Season" : "Create Season")}
          </Button>
        </div>
      </form>
    </Form>
  );
}