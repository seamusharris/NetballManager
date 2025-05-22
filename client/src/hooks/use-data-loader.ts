import { useState, useEffect } from 'react';
import { useOptimizedQuery } from './use-optimized-queries';
import { useToast } from '@/hooks/use-toast';
import { 
  Player, 
  Game, 
  GameStat, 
  Roster, 
  Opponent 
} from '@shared/schema';

/**
 * Type for the data loading status
 */
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Options for the useDataLoader hook
 */
interface DataLoaderOptions<T> {
  /**
   * A function to transform the data after it's loaded
   */
  transform?: (data: T) => any;
  
  /**
   * Whether to enable the query (default: true)
   */
  enabled?: boolean;
  
  /**
   * A callback function to run when the data is successfully loaded
   */
  onSuccess?: (data: T) => void;
  
  /**
   * A callback function to run when there's an error loading the data
   */
  onError?: (error: Error) => void;
}

/**
 * Custom hook to load data with improved error handling and loading states
 */
export function useDataLoader<T>(
  endpoint: string,
  options: DataLoaderOptions<T> = {}
) {
  const { transform, enabled = true, onSuccess, onError } = options;
  const [status, setStatus] = useState<LoadingStatus>('idle');
  const { toast } = useToast();
  
  const query = useOptimizedQuery<T>(endpoint, {
    enabled,
    onSuccess: (data) => {
      setStatus('success');
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      setStatus('error');
      toast({
        title: 'Error loading data',
        description: error.message,
        variant: 'destructive'
      });
      if (onError) onError(error);
    }
  });
  
  useEffect(() => {
    if (query.isLoading) {
      setStatus('loading');
    }
  }, [query.isLoading]);
  
  // Apply transformation if provided
  const transformedData = transform && query.data
    ? transform(query.data)
    : query.data;
  
  return {
    data: transformedData as T,
    status,
    isLoading: status === 'loading',
    isError: status === 'error',
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Custom hook to load players
 */
export function usePlayers() {
  return useDataLoader<Player[]>('/api/players');
}

/**
 * Custom hook to load games
 */
export function useGames() {
  return useDataLoader<Game[]>('/api/games');
}

/**
 * Custom hook to load a specific game
 */
export function useGame(id: string | number) {
  return useDataLoader<Game>(`/api/games/${id}`, {
    enabled: !!id
  });
}

/**
 * Custom hook to load opponents
 */
export function useOpponents() {
  return useDataLoader<Opponent[]>('/api/opponents');
}

/**
 * Custom hook to load game stats for a specific game
 */
export function useGameStats(gameId: string | number | undefined) {
  // Return an empty query if gameId is undefined
  if (gameId === undefined) {
    return {
      data: undefined,
      status: 'idle' as LoadingStatus,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve()
    };
  }
  
  return useDataLoader<GameStat[]>(`/api/games/${gameId}/stats`, {
    enabled: !!gameId
  });
}

/**
 * Custom hook to load roster for a specific game
 */
export function useGameRoster(gameId: string | number) {
  return useDataLoader<Roster[]>(`/api/games/${gameId}/rosters`, {
    enabled: !!gameId
  });
}

/**
 * Custom hook to load everything needed for a game detail view
 */
export function useGameData(gameId: string | number) {
  const game = useGame(gameId);
  const stats = useGameStats(gameId);
  const roster = useGameRoster(gameId);
  const players = usePlayers();
  const opponents = useOpponents();
  
  const isLoading = game.isLoading || stats.isLoading || roster.isLoading || players.isLoading || opponents.isLoading;
  const isError = game.isError || stats.isError || roster.isError || players.isError || opponents.isError;
  
  return {
    game: game.data,
    stats: stats.data || [],
    roster: roster.data || [],
    players: players.data || [],
    opponents: opponents.data || [],
    isLoading,
    isError,
    refetch: () => {
      game.refetch();
      stats.refetch();
      roster.refetch();
      players.refetch();
      opponents.refetch();
    }
  };
}