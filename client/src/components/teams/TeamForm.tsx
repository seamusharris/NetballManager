import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Team, Season } from '@shared/schema';

interface Section {
  id: number;
  displayName: string;
  teamCount: number;
  maxTeams: number;
}
import { useToast } from '@/hooks/use-toast';
import { useCreateMutation } from '@/hooks/use-form-mutations';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

const teamFormSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  clubId: z.number(),
  seasonId: z.number(),
  sectionId: z.number().optional(),
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

// Define the SectionSelect component
interface SectionSelectProps {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
  sections: Section[] | undefined;
  isLoading: boolean;
  error: any;
  onRetry: () => void;
}

const SectionSelect: React.FC<SectionSelectProps> = ({
  value,
  onValueChange,
  sections,
  isLoading,
  error,
  onRetry,
}) => {
  return (
    <Select onValueChange={(val) => onValueChange(val === 'none' ? undefined : parseInt(val))} value={value?.toString() || 'none'} disabled={isLoading}>
      <FormControl>
        <SelectTrigger>
          <SelectValue
            placeholder={
              isLoading ? 'Loading sections...' : error ? 'Error loading sections' : 'Select a section'
            }
          />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="none">No section</SelectItem>
        {sections && sections.length > 0 && (
          sections.map((section) => (
            <SelectItem key={section.id} value={section.id.toString()}>
              {section.displayName} ({section.teamCount} teams)
            </SelectItem>
          ))
        )}
        {!isLoading && sections && sections.length === 0 && (
          <SelectItem value="none" disabled>
            No sections available for this season
          </SelectItem>
        )}
        {error && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </SelectContent>
    </Select>
  );
};

// Custom hook to fetch form select data
const useTeamFormSelects = (selectedSeasonId?: number) => {
  const seasonsQuery = useQuery({
    queryKey: ['seasons'],
    queryFn: async () => {
      const result = await apiClient.get('/api/seasons');
      return result;
    },
    staleTime: 60000, // 1 minute
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', selectedSeasonId],
    queryFn: async () => {
      if (!selectedSeasonId) return [];
      const result = await apiClient.get(`/api/seasons/${selectedSeasonId}/sections`);
      return result;
    },
    enabled: !!selectedSeasonId,
    staleTime: 60000, // 1 minute
  });

  return {
    seasons: seasonsQuery,
    sections: {
      data: sectionsQuery.data as Section[],
      isLoading: sectionsQuery.isLoading,
      error: sectionsQuery.error,
      refetch: sectionsQuery.refetch,
    },
  };
};

export default function TeamForm({ team, seasons: propSeasons, clubId, onSuccess, onCancel }: TeamFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name || '',
      clubId: clubId || 0,
      seasonId: team?.seasonId || undefined,
      sectionId: team?.sectionId || undefined,
      isActive: team?.isActive ?? true,
    },
  });

  const selectedSeasonId = form.watch('seasonId');
  const { seasons, sections } = useTeamFormSelects(selectedSeasonId);

  // Initialize form with team data when available
  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        clubId: team.clubId || clubId,
        seasonId: team.seasonId,
        sectionId: team.sectionId || undefined,
        isActive: team.isActive ?? true,
      });
    } else if (seasons.data && seasons.data.length > 0 && !form.getValues('seasonId')) {
      // Set default season for new teams
      const defaultSeasonId = seasons.data.find(s => s.isActive)?.id || seasons.data[0].id;
      form.setValue('seasonId', defaultSeasonId);
    }
  }, [team, seasons.data, form, clubId]);

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
        },
      });

      // Invalidate sections queries
      if (selectedSeasonId) {
        queryClient.invalidateQueries({ queryKey: ['sections', selectedSeasonId] });
      }

      toast({ title: 'Team created successfully' });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating team',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('TeamForm: Update mutation called with data:', data);
      console.log('TeamForm: Updating team with ID:', team?.id);
      return apiClient.patch(`/api/teams/${team?.id}`, data);
    },
    onSuccess: (result) => {
      console.log('TeamForm: Update mutation successful, result:', result);

      // Invalidate all team-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${team?.id}`] });

      // Invalidate sections queries for current season
      if (selectedSeasonId) {
        queryClient.invalidateQueries({ queryKey: ['sections', selectedSeasonId] });
      }

      // Invalidate all sections queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const [queryKey] = query.queryKey;
          return (
            queryKey === 'sections' ||
            (typeof queryKey === 'string' && queryKey.includes('/api/seasons') && queryKey.includes('/sections'))
          );
        },
      });

      toast({ title: 'Team updated successfully' });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('TeamForm: Update mutation failed:', error);
      toast({
        title: 'Error updating team',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (data: TeamFormData) => {
    console.log('TeamForm: Form submission started');
    console.log('TeamForm: Submitting data:', data);
    console.log('TeamForm: Is editing existing team?', !!team);
    console.log('TeamForm: Team ID:', team?.id);

    // Validate required fields
    if (!data.seasonId) {
      console.error('TeamForm: Missing seasonId');
      toast({
        title: 'Error',
        description: 'Season is required',
        variant: 'destructive',
      });
      return;
    }

    if (team) {
      console.log('TeamForm: Calling update mutation...');
      updateMutation.mutate(data, {
        onSuccess: () => {
          console.log('TeamForm: Update successful callback');
          onSuccess?.();
        },
        onError: (error) => {
          console.error('TeamForm: Update failed callback:', error);
        },
      });
    } else {
      console.log('TeamForm: Calling create mutation...');
      createMutation.mutate(data, {
        onSuccess: () => {
          console.log('TeamForm: Create successful callback');
          form.reset();
          onSuccess?.();
        },
        onError: (error) => {
          console.error('TeamForm: Create failed callback:', error);
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          name="seasonId"
          render={({ field }) => {
            // Ensure we have a valid string value for the Select component
            const stringValue = field.value != null ? field.value.toString() : '';

            console.log('TeamForm: Season field render', {
              fieldValue: field.value,
              stringValue,
              availableSeasons: seasons?.data?.map((s) => ({ id: s.id, name: s.name })),
              teamSeasonId: team?.seasonId,
              hasSeasons: !!seasons && seasons.data && seasons.data.length > 0,
            });

            return (
              <FormItem>
                <FormLabel required>Season</FormLabel>
                <Select
                  onValueChange={(value) => {
                    console.log('TeamForm: Season changed to:', value);
                    const seasonId = parseInt(value);
                    field.onChange(seasonId);
                    // Clear section when season changes
                    form.setValue('sectionId', undefined);
                  }}
                  value={stringValue}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a season" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {seasons?.data?.map((season) => (
                      <SelectItem key={season.id} value={season.id.toString()}>
                        {season.name} ({season.year})
                        {season.isActive && ' (Active)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="sectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section (Optional)</FormLabel>
              <SectionSelect
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value ? parseInt(value) : undefined);
                }}
                sections={sections.data}
                isLoading={sections.isLoading}
                error={sections.error}
                onRetry={sections.refetch}
              />
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
            {isSubmitting ? (team ? 'Updating...' : 'Creating...') : team ? 'Update Team' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Form>
  );
}