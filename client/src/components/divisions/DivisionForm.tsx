import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

const divisionFormSchema = z.object({
  ageGroupId: z.number().min(1, 'Age group is required'),
  sectionId: z.number().min(1, 'Section is required'),
  seasonId: z.number().min(1, 'Season is required'),
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
  seasonId: number;
  onSubmit: (data: DivisionFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function DivisionForm({ division, seasonId, onSubmit, onCancel, isSubmitting }: DivisionFormProps) {
  const { data: seasons = [] } = useQuery<any[]>({
    queryKey: ['seasons'],
    queryFn: () => apiClient.get('/api/seasons'),
  });

  const { data: activeSeason } = useQuery<any>({
    queryKey: ['seasons', 'active'],
    queryFn: () => apiClient.get('/api/seasons/active'),
  });

  const form = useForm<DivisionFormData>({
    resolver: zodResolver(divisionFormSchema),
    defaultValues: {
      ageGroupId: division?.ageGroupId || 0,
      sectionId: division?.sectionId || 0,
      seasonId: division?.seasonId || seasonId || activeSeason?.id || 0,
      displayName: division?.displayName || '',
      isActive: division?.isActive ?? true, // Default to true for new divisions
    },
  });

  // Fetch age groups and sections
  const { data: ageGroups = [] } = useQuery<AgeGroup[]>({
    queryKey: ['age-groups'],
    queryFn: () => apiClient.get('/api/age-groups'),
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ['sections'],
    queryFn: () => apiClient.get('/api/sections'),
  });

  const selectedAgeGroupId = form.watch('ageGroupId');
  const selectedSectionId = form.watch('sectionId');
  const selectedSeasonId = form.watch('seasonId');

  const prevAutoDisplayName = React.useRef<string>("");

  // Set default season to active season when creating new division
  React.useEffect(() => {
    if (!division && activeSeason && !selectedSeasonId) {
      form.setValue('seasonId', activeSeason.id);
    }
  }, [division, activeSeason, selectedSeasonId, form]);

  // Auto-generate display name when age group or section changes
  React.useEffect(() => {
    if (selectedAgeGroupId && selectedSectionId) {
      const ageGroup = ageGroups.find(ag => ag.id === selectedAgeGroupId);
      const section = sections.find(s => s.id === selectedSectionId);
      const displayName = form.getValues('displayName');
      const autoDisplayName = ageGroup && section ? `${ageGroup.name}/${section.name}` : '';
      // Only auto-set if displayName is empty or matches the previous auto-generated value
      if (
        ageGroup && section &&
        (!displayName || displayName === prevAutoDisplayName.current)
      ) {
        form.setValue('displayName', autoDisplayName);
        prevAutoDisplayName.current = autoDisplayName;
      }
    }
  }, [selectedAgeGroupId, selectedSectionId, ageGroups, sections, form]);

  const handleSubmit = (data: DivisionFormData) => {
    console.log('DivisionForm submit data:', data);
    onSubmit(data);
  };

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
                value={field.value.toString()}
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
                value={field.value.toString()}
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
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  This division is currently active and can be assigned to teams
                </div>
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (division ? 'Updating...' : 'Creating...') : division ? 'Update Division' : 'Create Division'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 