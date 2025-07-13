import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const ageGroupFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type AgeGroupFormData = z.infer<typeof ageGroupFormSchema>;

interface AgeGroup {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
}

interface AgeGroupFormProps {
  ageGroup?: AgeGroup;
  onSubmit: (data: AgeGroupFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function AgeGroupForm({ ageGroup, onSubmit, onCancel, isSubmitting }: AgeGroupFormProps) {
  const form = useForm<AgeGroupFormData>({
    resolver: zodResolver(ageGroupFormSchema),
    defaultValues: {
      name: ageGroup?.name || '',
      displayName: ageGroup?.displayName || '',
      description: ageGroup?.description || '',
      isActive: ageGroup?.isActive ?? true,
    },
  });

  const handleSubmit = (data: AgeGroupFormData) => {
    onSubmit(data);
  };

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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Optional description of this age group" 
                  {...field} 
                />
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
                  This age group is currently active and can be used in divisions
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
            {isSubmitting ? (ageGroup ? 'Updating...' : 'Creating...') : ageGroup ? 'Update Age Group' : 'Create Age Group'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 