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

export default function TeamForm({ team, seasons, clubId, onSuccess, onCancel }: TeamFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name || '',
      clubId: clubId || 0,
      seasonId: team?.seasonId || (seasons && seasons.length > 0 ? seasons.find(s => s.isActive)?.id || seasons[0].id : undefined),
      sectionId: team?.sectionId || undefined,
      isActive: team?.isActive ?? true,
    },
  });

  const selectedSeasonId = form.watch('seasonId');

  // Set form values when team data or seasons load
  useEffect(() => {
    console.log('TeamForm: useEffect triggered', { 
      team, 
      seasonsLength: seasons?.length,
      currentFormSeasonId: form.getValues('seasonId')
    });
    
    if (team && seasons && seasons.length > 0) {
      console.log('TeamForm: Setting team values', {
        name: team.name,
        seasonId: team.seasonId,
        sectionId: team.sectionId,
        isActive: team.isActive
      });
      
      // Set individual values with validation
      form.setValue('name', team.name);
      form.setValue('clubId', team.clubId || clubId);
      
      // Ensure seasonId is valid
      if (team.seasonId && seasons.find(s => s.id === team.seasonId)) {
        form.setValue('seasonId', team.seasonId);
      } else {
        // Fallback to active season if team's season doesn't exist
        const fallbackSeasonId = seasons.find(s => s.isActive)?.id || seasons[0].id;
        console.log('TeamForm: Team season not found, using fallback:', fallbackSeasonId);
        form.setValue('seasonId', fallbackSeasonId);
      }
      
      form.setValue('sectionId', team.sectionId || undefined);
      form.setValue('isActive', team.isActive ?? true);
    } else if (!team && seasons && seasons.length > 0 && !form.getValues('seasonId')) {
      // Set default season for new teams
      const defaultSeasonId = seasons.find(s => s.isActive)?.id || seasons[0].id;
      console.log('TeamForm: Setting default season for new team:', defaultSeasonId);
      form.setValue('seasonId', defaultSeasonId);
    }
  }, [team, seasons, form, clubId]);

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', selectedSeasonId],
    queryFn: async () => {
      if (!selectedSeasonId) return [];
      console.log('TeamForm: Fetching sections for season:', selectedSeasonId);
      const result = await apiClient.get(`/api/seasons/${selectedSeasonId}/sections`);
      console.log('TeamForm: Sections received:', result);
      return result;
    },
    enabled: !!selectedSeasonId,
    staleTime: 0, // Disable caching temporarily for debugging
    gcTime: 0, // Disable caching temporarily for debugging
  });

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

      // Invalidate sections queries
      if (selectedSeasonId) {
        queryClient.invalidateQueries({ queryKey: ['sections', selectedSeasonId] });
      }

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
          return queryKey === 'sections' || 
                 (typeof queryKey === 'string' && queryKey.includes('/api/seasons') && queryKey.includes('/sections'));
        }
      });

      toast({ title: "Team updated successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('TeamForm: Update mutation failed:', error);
      toast({
        title: "Error updating team",
        description: error.message,
        variant: "destructive"
      });
    }
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
        title: "Error",
        description: "Season is required",
        variant: "destructive"
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
        }
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
          name="seasonId"
          render={({ field }) => {
            const currentValue = field.value ? field.value.toString() : "";
            console.log('TeamForm: Season field render', { 
              fieldValue: field.value, 
              currentValue, 
              availableSeasons: seasons?.map(s => ({ id: s.id, name: s.name })),
              teamSeasonId: team?.seasonId
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
                  value={currentValue}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a season" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {seasons?.map((season) => (
                      <SelectItem key={season.id} value={season.id.toString()}>
                        {season.name} ({season.year})
                        {season.isActive && " (Active)"}
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
              <Select 
                onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} 
                value={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No section</SelectItem>
                  {sections?.map((section: Section) => (
                    <SelectItem 
                      key={section.id} 
                      value={section.id.toString()}
                    >
                      {section.displayName} ({section.teamCount} teams)
                    </SelectItem>
                  )) || []}
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