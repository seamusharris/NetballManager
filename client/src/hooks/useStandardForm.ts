import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { z } from 'zod';
import { useEffect } from 'react';

interface StandardFormOptions<T> {
  schema: z.ZodSchema<T>;
  createEndpoint?: string;
  updateEndpoint?: (id: number) => string;
  defaultValues?: Partial<T>;
  initialData?: any; // For edit mode
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  cacheKeys?: string[]; // Which caches to invalidate
  successMessage?: string;
  errorMessage?: string;
  // Custom mutation functions for complex cases
  customCreateFn?: (data: T) => Promise<any>;
  customUpdateFn?: (data: T, id: number) => Promise<any>;
}

export function useStandardForm<T extends Record<string, any>>(
  options: StandardFormOptions<T>
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<T>({
    resolver: zodResolver(options.schema),
    defaultValues: options.defaultValues || {}
  });

  // Initialize form with existing data for edit mode
  useEffect(() => {
    if (options.initialData) {
      form.reset(options.initialData);
    }
  }, [options.initialData, form]);

  // Smart cache invalidation helper
  const invalidateCaches = () => {
    if (options.cacheKeys) {
      options.cacheKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: T) => {
      if (options.customCreateFn) {
        return options.customCreateFn(data);
      }
      if (!options.createEndpoint) {
        throw new Error('Either createEndpoint or customCreateFn must be provided');
      }
      return apiClient.post(options.createEndpoint, data);
    },
    onSuccess: (result) => {
      invalidateCaches();
      
      toast({ 
        title: options.successMessage || 'Created successfully' 
      });
      options.onSuccess?.(result);
    },
    onError: (error: any) => {
      toast({
        title: options.errorMessage || 'Error creating item',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: T) => {
      const id = options.initialData?.id;
      if (!id) {
        throw new Error('No ID found for update operation');
      }
      
      if (options.customUpdateFn) {
        return options.customUpdateFn(data, id);
      }
      if (!options.updateEndpoint) {
        throw new Error('Either updateEndpoint or customUpdateFn must be provided');
      }
      return apiClient.patch(options.updateEndpoint(id), data);
    },
    onSuccess: (result) => {
      invalidateCaches();
      
      toast({ 
        title: options.successMessage || 'Updated successfully' 
      });
      options.onSuccess?.(result);
    },
    onError: (error: any) => {
      toast({
        title: options.errorMessage || 'Error updating item',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: T) => {
    if (options.initialData) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    form.reset();
    options.onCancel?.();
  };

  return {
    form,
    handleSubmit,
    handleCancel,
    isLoading: createMutation.isPending || updateMutation.isPending,
    isEditing: !!options.initialData,
    createMutation,
    updateMutation,
    // Expose form state for complex conditional logic
    formState: form.formState,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    reset: form.reset
  };
}

// Type helper for better TypeScript experience
export type StandardFormReturn<T> = ReturnType<typeof useStandardForm<T>>;