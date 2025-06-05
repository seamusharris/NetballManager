import { useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { apiClient, mutateWithInvalidation } from '@/lib/apiClient';

interface CrudMutationOptions<T> {
  entityName: string;
  baseEndpoint: string;
  invalidatePatterns: string[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useCrudMutations<T extends { id?: number }>({
  entityName,
  baseEndpoint,
  invalidatePatterns,
  onSuccess,
  onError
}: CrudMutationOptions<T>) {
  const { toast } = useToast();

  const createMutation = useMutation({
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
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create ${entityName.toLowerCase()}: ${error.message}`,
        variant: "destructive",
      });
      onError?.(error);
    }
  });

  const updateMutation = useMutation({
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
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update ${entityName.toLowerCase()}: ${error.message}`,
        variant: "destructive",
      });
      onError?.(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return mutateWithInvalidation(
        () => apiClient.delete(`${baseEndpoint}/${id}`),
        invalidatePatterns
      );
    },
    // Prevent duplicate requests for the same ID
    mutationKey: [baseEndpoint, 'delete'],
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${entityName} deleted successfully`,
      });
      onSuccess?.(undefined as any);
    },
    onError: (error: Error) => {
      // Handle "not found" errors gracefully
      if (error.message.includes("not found") || error.message.includes("404")) {
        toast({
          title: "Success",
          description: `${entityName} was already deleted`,
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to delete ${entityName.toLowerCase()}: ${error.message}`,
          variant: "destructive",
        });
        onError?.(error);
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