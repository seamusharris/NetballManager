
import React from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useStandardForm } from '@/hooks/useStandardForm';
import { useQueryClient } from '@tanstack/react-query';

// Form schema using camelCase (frontend format)
const clubFormSchema = z.object({
  name: z.string().min(1, 'Club name is required').max(100, 'Name must be 100 characters or less'),
  code: z.string().min(1, 'Club code is required').max(10, 'Code must be 10 characters or less').regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
  address: z.string().max(200, 'Address must be 200 characters or less').nullable().transform(val => val || ''),
  contactEmail: z.string().email('Invalid email address').or(z.literal('')).nullable().transform(val => val || ''),
  contactPhone: z.string().max(20, 'Phone must be 20 characters or less').nullable().transform(val => val || ''),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#1f2937'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#ffffff'),
});

type ClubFormData = z.infer<typeof clubFormSchema>;

interface Club {
  id: number;
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ClubFormProps {
  club?: Club;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}

export default function ClubForm({ club, onSuccess, onCancel }: ClubFormProps) {
  const queryClient = useQueryClient();

  // Prepare default values
  const getDefaultValues = (): Partial<ClubFormData> => {
    if (!club) {
      return {
        name: '',
        code: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        primaryColor: '#1f2937',
        secondaryColor: '#ffffff',
      };
    }

    return {
      name: club.name,
      code: club.code,
      address: club.address || '',
      contactEmail: club.contactEmail || '',
      contactPhone: club.contactPhone || '',
      primaryColor: club.primaryColor || '#1f2937',
      secondaryColor: club.secondaryColor || '#ffffff',
    };
  };

  // Custom success handler to invalidate the correct caches
  const handleSuccess = (data?: any) => {
    // Invalidate all relevant caches
    queryClient.invalidateQueries({ queryKey: ['/api/clubs'] });
    queryClient.invalidateQueries({ queryKey: ['clubs'] });
    
    // Call the original onSuccess callback
    onSuccess?.(data);
  };

  const {
    form,
    handleSubmit,
    handleCancel,
    isLoading,
    isEditing,
  } = useStandardForm<ClubFormData>({
    schema: clubFormSchema,
    createEndpoint: '/api/clubs',
    updateEndpoint: (id) => `/api/clubs/${id}`,
    defaultValues: getDefaultValues(),
    initialData: club,
    onSuccess: handleSuccess,
    onCancel,
    successMessage: club ? 'Club updated successfully' : 'Club created successfully',
    errorMessage: club ? 'Failed to update club' : 'Failed to create club',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Club Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Emeralds Netball Club"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Club Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., ENC"
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                A short code to identify the club (uppercase letters and numbers only)
              </FormDescription>
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Club address (optional)..."
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="club@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input 
                    type="tel"
                    placeholder="+61 4XX XXX XXX"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color"
                      className="w-12 h-10 p-1 border"
                      {...field}
                    />
                    <Input 
                      type="text"
                      placeholder="#1f2937"
                      className="flex-1"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color"
                      className="w-12 h-10 p-1 border"
                      {...field}
                    />
                    <Input 
                      type="text"
                      placeholder="#ffffff"
                      className="flex-1"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Club' : 'Create Club')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
