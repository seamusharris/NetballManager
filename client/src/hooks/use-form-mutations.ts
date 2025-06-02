
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
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
  return useFormMutation<T>({
    endpoint,
    method: 'PUT',
    invalidatePatterns,
    successMessage: successMessage || 'Updated successfully'
  });
}
