import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useStandardForm } from '@/hooks/useStandardForm';

// Form schema using camelCase (frontend format)
const divisionFormSchema = z.object({
  ageGroupId: z.coerce.number().min(1, 'Age group is required'),
  sectionId: z.coerce.number().min(1, 'Section is required'),
  seasonId: z.coerce.number().min(1, 'Season is required'),
  displayName: z.string().min(1, 'Display name is required'),
  isActive: z.boolean().default(true),
});

type DivisionFormData = z.infer<typeof divisionFormSchema>;

interface Division {
  id: number;
  ageGroupId: number;
  sectionId: number;
  seasonId: number;
  displayName: string;
  isActive: boolean;
}

interface AgeGroup {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
}

interface Section {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
}

interface DivisionFormProps {
  division?: Division;
  seasonId?: number; // Optional context from parent
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}

export default function DivisionForm({ 
  division, 
  seasonId: contextSeasonId, 
  onSuccess, 
  onCancel 
}: DivisionFormProps) {
  const queryClient = useQueryClient();

  // Fetch required data
  const { data: seasons = [] } = useQuery<any[]>({
    queryKey: ['/api/seasons'],
    queryFn: () => apiClient.get('/api/seasons'),
  });

  const { data: activeSeason } = useQuery<any>({
    queryKey: ['/api/seasons/active'],
    queryFn: () => apiClient.get('/api/seasons/active'),
  });

  const { data: ageGroups = [] } = useQuery<AgeGroup[]>({
    queryKey: ['/api/age-groups'],
    queryFn: () => apiClient.get('/api/age-groups'),
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ['/api/sections'],
    queryFn: () => apiClient.get('/api/sections'),
  });

  // Prepare default values
  const getDefaultValues = (): Partial<DivisionFormData> => {
    if (!division) {
      return {
        ageGroupId: 0,
        sectionId: 0,
        seasonId: contextSeasonId || activeSeason?.id || 0,
        displayName: '',
        isActive: true,
      };
    }

    return {
      ageGroupId: division.ageGroupId,
      sectionId: division.sectionId,
      seasonId: division.seasonId,
      displayName: division.displayName,
      isActive: division.isActive,
    };
  };

  // Determine API endpoints based on seasonId context
  const getApiEndpoints = () => {
    const effectiveSeasonId = division?.seasonId || contextSeasonId || activeSeason?.id;
    
    if (effectiveSeasonId) {
      return {
        createEndpoint: `/api/seasons/${effectiveSeasonId}/divisions`,
        updateEndpoint: (id: number) => `/api/divisions/${id}`,
      };
    }
    
    return {
      createEndpoint: '/api/divisions',
      updateEndpoint: (id: number) => `/api/divisions/${id}`,
    };
  };

  const endpoints = getApiEndpoints();

  // Custom success handler to invalidate the correct caches
  const handleSuccess = (data?: any) => {
    const effectiveSeasonId = division?.seasonId || contextSeasonId || activeSeason?.id;
    
    // Invalidate all relevant caches
    queryClient.invalidateQueries({ queryKey: ['/api/divisions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/age-groups'] });
    queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
    
    // Invalidate season-specific divisions cache (this is the key one!)
    if (effectiveSeasonId) {
      queryClient.invalidateQueries({ queryKey: ['divisions', effectiveSeasonId] });
    }
    
    // Call the original onSuccess callback
    onSuccess?.(data);
  };

  const {
    form,
    handleSubmit,
    handleCancel,
    isLoading,
    isEditing,
    watch,
    setValue,
  } = useStandardForm<DivisionFormData>({
    schema: divisionFormSchema,
    createEndpoint: endpoints.createEndpoint,
    updateEndpoint: endpoints.updateEndpoint,
    defaultValues: getDefaultValues(),
    initialData: division,
    onSuccess: handleSuccess,
    onCancel,
    successMessage: division ? 'Division updated successfully' : 'Division created successfully',
    errorMessage: division ? 'Failed to update division' : 'Failed to create division',
  });

  // Watch for changes to auto-generate display name
  const selectedAgeGroupId = watch('ageGroupId');
  const selectedSectionId = watch('sectionId');
  const currentDisplayName = watch('displayName');
  
  // Track the last auto-generated display name to avoid overwriting user edits
  const prevAutoDisplayName = useRef<string>("");

  // Set default season when creating new division
  useEffect(() => {
    if (!division && activeSeason && !watch('seasonId')) {
      setValue('seasonId', activeSeason.id);
    }
  }, [division, activeSeason, setValue, watch]);

  // Auto-generate display name when age group or section changes
  useEffect(() => {
    if (selectedAgeGroupId && selectedSectionId && ageGroups.length && sections.length) {
      const ageGroup = ageGroups.find(ag => ag.id === selectedAgeGroupId);
      const section = sections.find(s => s.id === selectedSectionId);
      
      if (ageGroup && section) {
        const autoDisplayName = `${ageGroup.name}/${section.name}`;
        
        // Only auto-set if displayName is empty or matches the previous auto-generated value
        if (!currentDisplayName || currentDisplayName === prevAutoDisplayName.current) {
          setValue('displayName', autoDisplayName);
          prevAutoDisplayName.current = autoDisplayName;
        }
      }
    }
  }, [selectedAgeGroupId, selectedSectionId, ageGroups, sections, currentDisplayName, setValue]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="seasonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Season</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString() || ''}
                disabled={!!contextSeasonId} // Disable if season is provided by context
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a season" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id.toString()}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {contextSeasonId && (
                <FormDescription>
                  Season is pre-selected from context
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ageGroupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Age Group</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value > 0 ? field.value.toString() : ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an age group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ageGroups
                    .filter(ag => ag.isActive)
                    .map((ageGroup) => (
                      <SelectItem key={ageGroup.id} value={ageGroup.id.toString()}>
                        {ageGroup.displayName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Section</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value > 0 ? field.value.toString() : ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sections
                    .filter(s => s.isActive)
                    .map((section) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.displayName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 15U/1" {...field} />
              </FormControl>
              <FormDescription>
                Auto-generated from age group and section, but you can customize it
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Division</FormLabel>
                <FormDescription>
                  This division is currently active and can be assigned to teams
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

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Division' : 'Create Division')}
          </Button>
        </div>
      </form>
    </Form>
  );
}