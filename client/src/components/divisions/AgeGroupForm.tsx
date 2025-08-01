import React from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useStandardForm } from '@/hooks/useStandardForm';
import { useQueryClient } from '@tanstack/react-query';

// Form schema using camelCase (frontend format)
const ageGroupFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  isActive: z.boolean().default(true),
});

type AgeGroupFormData = z.infer<typeof ageGroupFormSchema>;

interface AgeGroup {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
}

interface AgeGroupFormProps {
  ageGroup?: AgeGroup;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}

export default function AgeGroupForm({ ageGroup, onSuccess, onCancel }: AgeGroupFormProps) {
  const queryClient = useQueryClient();

  // Prepare default values
  const getDefaultValues = (): Partial<AgeGroupFormData> => {
    if (!ageGroup) {
      return {
        name: '',
        displayName: '',
        isActive: true,
      };
    }

    return {
      name: ageGroup.name,
      displayName: ageGroup.displayName,
      isActive: ageGroup.isActive,
    };
  };

  // Custom success handler to invalidate the correct caches
  const handleSuccess = (data?: any) => {
    // Invalidate all relevant caches
    queryClient.invalidateQueries({ queryKey: ['/api/age-groups'] });
    queryClient.invalidateQueries({ queryKey: ['age-groups'] });
    
    // Call the original onSuccess callback
    onSuccess?.(data);
  };

  const {
    form,
    handleSubmit,
    handleCancel,
    isLoading,
    isEditing,
  } = useStandardForm<AgeGroupFormData>({
    schema: ageGroupFormSchema,
    createEndpoint: '/api/age-groups',
    updateEndpoint: (id) => `/api/age-groups/${id}`,
    defaultValues: getDefaultValues(),
    initialData: ageGroup,
    onSuccess: handleSuccess,
    onCancel,
    successMessage: ageGroup ? 'Age group updated successfully' : 'Age group created successfully',
    errorMessage: ageGroup ? 'Failed to update age group' : 'Failed to create age group',
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
                <Input placeholder="e.g., 15U" {...field} />
              </FormControl>
              <FormDescription>
                Short name used for division naming (e.g., "15U", "17U", "Open")
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
                <Input placeholder="e.g., Under 15" {...field} />
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
                <FormLabel className="text-base">Active Age Group</FormLabel>
                <FormDescription>
                  This age group is currently active and can be used in divisions
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
            {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Age Group' : 'Create Age Group')}
          </Button>
        </div>
      </form>
    </Form>
  );
}