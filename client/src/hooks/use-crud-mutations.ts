import { useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { apiClient, mutateWithInvalidation } from '@/lib/apiClient';

interface UseCrudMutationsOptions {
  entityName: string;
  baseEndpoint: string;
  invalidatePatterns?: (string | (string | number | undefined)[])[];
  mutationOptions?: {
    retry?: boolean | number;
    cacheTime?: number;
    networkMode?: 'online' | 'always' | 'offlineFirst';
    mutationKey?: (id?: number) => (string | number)[];
  };
  onDeleteError?: (error: any) => void;
  onCreateError?: (error: any) => void;
  onUpdateError?: (error: any) => void;
}

export function useCrudMutations<T extends { id?: number }>({
  entityName,
  baseEndpoint,
  invalidatePatterns = [],
  mutationOptions = {},
  onDeleteError,
  onCreateError,
  onUpdateError
}: UseCrudMutationsOptions) {
  const { toast } = useToast();

  const createMutation = useMutation({
    retry: mutationOptions.retry ?? false,
    networkMode: mutationOptions.networkMode ?? 'online',
    mutationFn: async (data: Omit<T, 'id'>) => {
      return mutateWithInvalidation(
        () => apiClient.post<T>(baseEndpoint, data),
        invalidatePatterns
      );
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${entityName} created successfully`,
      });
    },
    onError: (error: Error) => {
      if (onCreateError) {
        onCreateError(error);
      } else {
        toast({
          title: "Error",
          description: `Failed to create ${entityName.toLowerCase()}: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  });

  const updateMutation = useMutation({
    retry: mutationOptions.retry ?? false,
    networkMode: mutationOptions.networkMode ?? 'online',
    mutationFn: async ({ id, ...data }: T & { id: number }) => {
      return mutateWithInvalidation(
        () => apiClient.patch<T>(`${baseEndpoint}/${id}`, data),
        invalidatePatterns
      );
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${entityName} updated successfully`,
      });
    },
    onError: (error: Error) => {
      if (onUpdateError) {
        onUpdateError(error);
      } else {
        toast({
          title: "Error",
          description: `Failed to update ${entityName.toLowerCase()}: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationKey: mutationOptions.mutationKey ? (id: number) => mutationOptions.mutationKey!(id) : undefined,
    retry: mutationOptions.retry ?? false,
    networkMode: mutationOptions.networkMode ?? 'online',
    mutationFn: async (id: number) => {
      return mutateWithInvalidation(
        () => apiClient.delete(`${baseEndpoint}/${id}`),
        invalidatePatterns
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${entityName} removed successfully`,
      });
    },
    onError: (error: Error) => {
      // Handle "not found" errors gracefully - this is common in React Strict Mode
      if (error.message.includes("not found") || error.message.includes("404")) {
        toast({
          title: "Success", 
          description: `${entityName} was already removed`,
        });
      } else {
        // Use custom error handler if provided
        if (onDeleteError) {
          onDeleteError(error);
        } else {
          toast({
            title: "Error",
            description: `Failed to remove ${entityName.toLowerCase()}: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    }
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
}