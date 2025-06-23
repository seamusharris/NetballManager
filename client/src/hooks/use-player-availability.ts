
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

export function usePlayerAvailability(gameId: number) {
  return useQuery<PlayerAvailability>({
    queryKey: CACHE_KEYS.availability(gameId),
    queryFn: () => apiClient.get(`/api/games/${gameId}/availability`),
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

export function useSetPlayerAvailability() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ gameId, data }: { gameId: number; data: SetAvailabilityData }) => {
      return apiClient.post(`/api/games/${gameId}/availability`, data);
    },
    onSuccess: (_, { gameId }) => {
      // Invalidate availability cache for this game
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.availability(gameId) });
      
      // Also invalidate any team-specific availability caches
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && 
                 key[0] === 'team-availability' && 
                 key[2] === gameId;
        }
      });

      toast({
        title: "Success",
        description: "Player availability updated successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to update player availability:', error);
      toast({
        title: "Error",
        description: "Failed to update player availability",
        variant: "destructive",
      });
    },
  });
}
