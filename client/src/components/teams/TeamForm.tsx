import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Team, Season } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useCreateMutation } from '@/hooks/use-form-mutations';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

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
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}

export default function TeamForm({ team, seasons, clubId, onSuccess, onCancel }: TeamFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/teams', data),
    onSuccess: () => {
      // Invalidate all team-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && queryKey.includes('/api/teams');
        }
      });

      toast({ title: "Team created successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/api/teams/${team?.id}`, data),
    onSuccess: () => {
      // Invalidate all team-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${team?.id}`] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && queryKey.includes('/api/teams');
        }
      });

      toast({ title: "Team updated successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating team",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name || '',
      division: team?.division || '',
      clubId: clubId || 0,
      seasonId: team?.seasonId || seasons.find(s => s.isActive)?.id || seasons[0]?.id || 0,
      isActive: team?.isActive ?? true,
    },
  });

  const handleSubmit = (data: TeamFormData) => {
    if (team) {
      updateMutation.mutate(data, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        }
      });
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Team Name</FormLabel>
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
              <FormLabel required>Season</FormLabel>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (team ? "Updating..." : "Creating...") : (team ? "Update Team" : "Create Team")}
          </Button>
        </div>
      </form>
    </Form>
  );
}