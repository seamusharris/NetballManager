
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { apiClient } from '@/lib/apiClient';
import { CACHE_KEYS } from '@/lib/cacheKeys';
import { CACHE_CONFIG } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PlayerAvailability {
  availablePlayerIds: number[];
  unavailablePlayerIds?: number[];
}

interface SetAvailabilityData {
  availablePlayerIds: number[];
}

export function usePlayerAvailability(gameId: number, teamId?: number) {
  return useQuery<PlayerAvailability>({
    queryKey: ['availability', teamId, gameId],
    queryFn: () => {
      if (!teamId) {
        return apiClient.get(`/api/games/${gameId}/availability`);
      }
      return apiClient.get(`/api/teams/${teamId}/games/${gameId}/availability`);
    },
    ...CACHE_CONFIG.MEDIUM,
    enabled: !!gameId,
  });
}

export function useTeamAvailability(teamId: number, gameId: number) {
  return useQuery<PlayerAvailability>({
    queryKey: CACHE_KEYS.teamAvailability(teamId, gameId),
    queryFn: () => apiClient.get(`/api/teams/${teamId}/availability/${gameId}`),
    ...CACHE_CONFIG.MEDIUM,
    enabled: !!teamId && !!gameId,
  });
}

export function useSetPlayerAvailability(teamId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Track current request to prevent overlapping saves
  const currentRequestRef = useRef<Promise<any> | null>(null);

  return useMutation({
    mutationFn: async ({ gameId, data }: { gameId: number; data: SetAvailabilityData }) => {
      // Cancel any pending request
      if (currentRequestRef.current) {
        // Let the previous request complete but don't wait for it
        currentRequestRef.current.catch(() => {});
      }

      // Create new request
      const request = teamId 
        ? apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, data)
        : apiClient.post(`/api/games/${gameId}/availability`, data);
      
      currentRequestRef.current = request;
      
      try {
        const result = await request;
        currentRequestRef.current = null;
        return result;
      } catch (error) {
        currentRequestRef.current = null;
        throw error;
      }
    },
    onMutate: async ({ gameId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['availability', teamId, gameId] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['availability', teamId, gameId]);
      
      // Optimistically update to the new value immediately
      queryClient.setQueryData(['availability', teamId, gameId], data);
      
      return { previousData };
    },
    onSuccess: (_, { gameId }) => {
      // Invalidate and refetch immediately to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['availability', teamId, gameId] });
      
      // Also invalidate any related availability caches
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && 
                 key[0] === 'availability' && 
                 key[2] === gameId;
        }
      });
    },
    onError: (error, { gameId }, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(['availability', teamId, gameId], context.previousData);
      }
      
      console.error('Failed to update player availability:', error);
      toast({
        title: "Error",
        description: "Failed to update player availability",
        variant: "destructive",
      });
    },
  });
}
