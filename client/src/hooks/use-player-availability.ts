
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  
  // Track requests to handle overlapping updates intelligently
  const activeRequestRef = useRef<{
    gameId: number;
    timestamp: number;
    promise: Promise<any>;
  } | null>(null);

  return useMutation({
    mutationFn: async ({ gameId, data }: { gameId: number; data: SetAvailabilityData }) => {
      const requestTimestamp = Date.now();
      
      // If there's an active request for the same game, wait for it to complete
      if (activeRequestRef.current?.gameId === gameId) {
        console.log(`⏳ Waiting for previous request to complete for game ${gameId}`);
        try {
          await activeRequestRef.current.promise;
        } catch (error) {
          // Previous request failed, but we'll continue with this one
          console.log(`Previous request failed, continuing with new request`);
        }
      }
      
      // Send the request
      console.log(`🚀 Sending availability update for game ${gameId}: ${data.availablePlayerIds.length} players`);
      const requestPromise = teamId 
        ? apiClient.post(`/api/teams/${teamId}/games/${gameId}/availability`, data)
        : apiClient.post(`/api/games/${gameId}/availability`, data);
      
      // Track this request
      activeRequestRef.current = {
        gameId,
        timestamp: requestTimestamp,
        promise: requestPromise
      };
      
      const result = await requestPromise;
      
      // Clear the active request if this was the one being tracked
      if (activeRequestRef.current?.timestamp === requestTimestamp) {
        activeRequestRef.current = null;
      }
      
      console.log(`✅ Availability update completed for game ${gameId}`);
      return result;
    },
    onMutate: async ({ gameId, data }) => {
      console.log(`🎯 Optimistic update for game ${gameId}: ${data.availablePlayerIds.length} players`);
      
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['availability', teamId, gameId] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['availability', teamId, gameId]);
      
      // Optimistically update to the new value immediately
      queryClient.setQueryData(['availability', teamId, gameId], {
        availablePlayerIds: data.availablePlayerIds
      });
      
      return { previousData };
    },
    onSuccess: (_, { gameId }) => {
      console.log(`🔄 Invalidating cache for game ${gameId}`);
      
      // Invalidate to get fresh data
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
      console.error(`❌ Failed to update availability for game ${gameId}:`, error);
      
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['availability', teamId, gameId], context.previousData);
      }
      
      toast({
        title: "Error",
        description: "Failed to update player availability. Please try again.",
        variant: "destructive",
      });
    },
  });
}
