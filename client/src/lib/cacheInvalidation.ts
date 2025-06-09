
import { queryClient } from './queryClient';
import { CACHE_KEYS } from './cacheKeys';

export const invalidateCache = {
  // When player data changes
  players: (clubId: number) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.players(clubId) });
    // Also invalidate any computed data that depends on players
    queryClient.invalidateQueries({ queryKey: ['player-performance'] });
    queryClient.invalidateQueries({ queryKey: ['team-analysis', clubId] });
  },
  
  // When game data changes
  games: (clubId: number, teamId?: number) => {
    queryClient.invalidateQueries({ queryKey: ['games', clubId] });
    // Invalidate both team-specific and club-wide views
    queryClient.invalidateQueries({ queryKey: ['centralized-stats', clubId] });
    queryClient.invalidateQueries({ queryKey: ['centralized-rosters', clubId] });
    queryClient.invalidateQueries({ queryKey: ['team-analysis', clubId] });
    queryClient.invalidateQueries({ queryKey: ['opponent-analysis', clubId] });
  },
  
  // When game stats change (live stats scenario)
  gameStats: (gameId: number, clubId: number) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.gameStats(gameId) });
    // Invalidate all centralized stats that might include this game
    queryClient.invalidateQueries({ queryKey: ['centralized-stats', clubId] });
    // Invalidate computed data
    queryClient.invalidateQueries({ queryKey: ['player-performance'] });
    queryClient.invalidateQueries({ queryKey: ['team-analysis', clubId] });
    queryClient.invalidateQueries({ queryKey: ['opponent-analysis', clubId] });
  },
  
  // When rosters change
  gameRosters: (gameId: number, clubId: number) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.gameRoster(gameId) });
    queryClient.invalidateQueries({ queryKey: ['centralized-rosters', clubId] });
    queryClient.invalidateQueries({ queryKey: ['player-performance'] });
  },
  
  // When teams change
  teams: (clubId: number) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.teams(clubId) });
    queryClient.invalidateQueries({ queryKey: ['games', clubId] });
    queryClient.invalidateQueries({ queryKey: ['team-analysis', clubId] });
  }
};
