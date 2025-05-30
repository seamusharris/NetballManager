
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Team, Season } from '@shared/schema';

const teamFormSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  division: z.string().optional(),
  clubId: z.number(),
  seasonId: z.number(),
  isActive: z.boolean().default(true),
});

type TeamFormData = z.infer<typeof teamFormSchema>;

interface TeamFormProps {
  team?: Team;
  seasons: Season[];
  clubId: number;
  onSubmit: (data: TeamFormData) => void;
  onCancel?: () => void;
}

export function TeamForm({ team, seasons, clubId, onSubmit, onCancel }: TeamFormProps) {
  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name || '',
      division: team?.division || '',
      clubId,
      seasonId: team?.seasonId || seasons.find(s => s.isActive)?.id || seasons[0]?.id,
      isActive: team?.isActive ?? true,
    },
  });

  const handleSubmit = (data: TeamFormData) => {
    console.log('TeamForm handleSubmit called with:', data);
    console.log('Form validation state:', form.formState.errors);
    console.log('Form is valid:', form.formState.isValid);
    console.log('Form is submitting:', form.formState.isSubmitting);
    
    // Ensure all required fields are present
    const submitData = {
      ...data,
      clubId: data.clubId || clubId, // Fallback to prop if not in form data
    };
    
    console.log('Final submit data being passed to onSubmit:', submitData);
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log('Form onSubmit event triggered');
          console.log('Event:', e);
          console.log('Form state before submit:', {
            isValid: form.formState.isValid,
            errors: form.formState.errors,
            values: form.getValues()
          });
          
          // Let React Hook Form handle the submission
          form.handleSubmit(handleSubmit)(e);
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Emeralds A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="division"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Division 1, Premier" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seasonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Season</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a season" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id.toString()}>
                      {season.name} ({season.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            onClick={(e) => {
              console.log('Submit button clicked');
              console.log('Button event:', e);
              // Don't prevent default here, let the form handle it
            }}
          >
            {team ? 'Update Team' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
