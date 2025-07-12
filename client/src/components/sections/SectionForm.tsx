
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Section } from '@shared/schema';

const sectionFormSchema = z.object({
  ageGroup: z.string().min(1, 'Age group is required'),
  sectionName: z.string().min(1, 'Section name is required'),
  description: z.string().optional(),
  maxTeams: z.number().min(1).max(20).default(8),
});

type SectionFormData = z.infer<typeof sectionFormSchema>;

interface SectionFormProps {
  section?: Section;
  seasonId: number;
  onSubmit: (data: SectionFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export default function SectionForm({ 
  section, 
  seasonId, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: SectionFormProps) {
  const form = useForm<SectionFormData>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      ageGroup: section?.ageGroup || '',
      sectionName: section?.sectionName || '',
      description: section?.description || '',
      maxTeams: section?.maxTeams || 8,
    },
  });

  const handleSubmit = async (data: SectionFormData) => {
    await onSubmit(data);
    if (!section) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ageGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Age Group</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 15U, 9U, Open" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sectionName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Section</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 1, 2, A, B" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="maxTeams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Teams</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={20}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 8)}
                />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about this section"
                  {...field}
                />
              </FormControl>
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
            {isSubmitting ? 
              (section ? "Updating..." : "Creating...") : 
              (section ? "Update Section" : "Create Section")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
