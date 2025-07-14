import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
}

export interface SectionFormProps {
  section?: {
    id: number;
    name: string;
    displayName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function SectionForm({ section, onSubmit, onCancel, isSubmitting }: SectionFormProps) {
  const form = useForm<SectionFormData>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      name: section?.name || '',
      displayName: section?.displayName || '',
      isActive: section?.isActive ?? true,
    },
  });

  // Reset form values when section changes (edit vs create)
  useEffect(() => {
    form.reset({
      name: section?.name || '',
      displayName: section?.displayName || '',
      isActive: section?.isActive ?? true,
    });
  }, [section, form]);

  const handleSubmit = (data: SectionFormData) => {
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
                <Input placeholder="e.g., 1" {...field} />
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
                <Input placeholder="e.g., Division 1" {...field} />
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
                  This section is currently active and can be used in divisions
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
            {isSubmitting ? (section ? 'Updating...' : 'Creating...') : section ? 'Update Section' : 'Create Section'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 