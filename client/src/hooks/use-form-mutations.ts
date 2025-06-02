import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, mutateWithInvalidation } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface FormMutationOptions<T = any> {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  invalidatePatterns: string[];
  successMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useFormMutation<T = any>({
  endpoint,
  method = 'POST',
  invalidatePatterns,
  successMessage,
  onSuccess,
  onError
}: FormMutationOptions<T>) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => {
      switch (method) {
        case 'PUT':
          return apiClient.put<T>(endpoint, data);
        case 'PATCH':
          return apiClient.patch<T>(endpoint, data);
        default:
          return apiClient.post<T>(endpoint, data);
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      mutateWithInvalidation(
        () => Promise.resolve(data),
        invalidatePatterns
      );

      if (successMessage) {
        toast({ title: successMessage });
      }

      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive"
      });

      onError?.(error);
    }
  });
}

// Specialized hooks for common operations
export function useCreateMutation<T = any>(
  endpoint: string,
  invalidatePatterns: string[],
  successMessage?: string
) {
  return useFormMutation<T>({
    endpoint,
    method: 'POST',
    invalidatePatterns,
    successMessage: successMessage || 'Created successfully'
  });
}

export function useUpdateMutation<T = any>(
  endpoint: string,
  invalidatePatterns: string[],
  successMessage?: string
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.patch(endpoint, data);
    },
    onSuccess: () => {
      // Invalidate related queries
      invalidatePatterns.forEach(pattern => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey[0];
            return typeof queryKey === 'string' && queryKey.includes(pattern);
          }
        });
      });

      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}