import React from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useStandardForm } from '@/hooks/useStandardForm';
import { useQueryClient } from '@tanstack/react-query';

// Form schema using camelCase (frontend format)
const sectionFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  isActive: z.boolean().default(true),
});

type SectionFormData = z.infer<typeof sectionFormSchema>;

interface Section {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectionFormProps {
  section?: Section;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}

export default function SectionForm({ section, onSuccess, onCancel }: SectionFormProps) {
  const queryClient = useQueryClient();

  // Prepare default values
  const getDefaultValues = (): Partial<SectionFormData> => {
    if (!section) {
      return {
        name: '',
        displayName: '',
        isActive: true,
      };
    }

    return {
      name: section.name,
      displayName: section.displayName,
      isActive: section.isActive,
    };
  };

  // Custom success handler to invalidate the correct caches
  const handleSuccess = (data?: any) => {
    // Invalidate all relevant caches
    queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
    queryClient.invalidateQueries({ queryKey: ['sections'] });
    
    // Call the original onSuccess callback
    onSuccess?.(data);
  };

  const {
    form,
    handleSubmit,
    handleCancel,
    isLoading,
    isEditing,
  } = useStandardForm<SectionFormData>({
    schema: sectionFormSchema,
    createEndpoint: '/api/sections',
    updateEndpoint: (id) => `/api/sections/${id}`,
    defaultValues: getDefaultValues(),
    initialData: section,
    onSuccess: handleSuccess,
    onCancel,
    successMessage: section ? 'Section updated successfully' : 'Section created successfully',
    errorMessage: section ? 'Failed to update section' : 'Failed to create section',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 1" {...field} />
              </FormControl>
              <FormDescription>
                Short name used for division naming (e.g., "1", "2", "A", "B")
              </FormDescription>
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
                <Input placeholder="e.g., Division 1" {...field} />
              </FormControl>
              <FormDescription>
                Full name displayed to users
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
                <FormLabel className="text-base">Active Section</FormLabel>
                <FormDescription>
                  This section is currently active and can be used in divisions
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
            {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Section' : 'Create Section')}
          </Button>
        </div>
      </form>
    </Form>
  );
}