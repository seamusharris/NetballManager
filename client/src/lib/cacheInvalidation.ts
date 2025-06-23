// This file is no longer needed - cache invalidation should happen
// only at data mutation points (when saving/updating data), not during
// UI navigation or team switching.
//
// Individual mutation functions should handle their own cache invalidation
// using React Query's built-in invalidation methods.

import { queryClient } from '../App';

export function invalidateQueries(pattern: string) {
  return queryClient.invalidateQueries({ 
    predicate: (query) => {
      const queryKey = query.queryKey[0];
      return typeof queryKey === 'string' && queryKey.includes(pattern);
    }
  });
}

// Invalidate game-related data when scores/stats change
export function invalidateGameData(gameId: number) {
  console.log(`Invalidating cache for game ${gameId}`);

  // Invalidate specific game data
  queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
  queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'rosters'] });
  queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });

  // Invalidate batch data that includes this game
  queryClient.invalidateQueries({ 
    predicate: (query) => {
      const key = query.queryKey[0];
      return typeof key === 'string' && (
        key.includes('/api/games/stats/batch') ||
        key.includes('/api/games/scores/batch') ||
        key.includes('/api/games/rosters/batch')
      );
    }
  });

  // Invalidate games list to refresh overall stats
  queryClient.invalidateQueries({ queryKey: ['/api/games'] });
}

// Invalidate team data when rosters change
export function invalidateTeamData(teamId: number) {
  console.log(`Invalidating cache for team ${teamId}`);
  queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}`] });
  queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/players`] });
}

// Smart invalidation that only updates what's necessary
export function invalidateAfterScoreUpdate(gameId: number, teamId?: number) {
  invalidateGameData(gameId);
  if (teamId) {
    invalidateTeamData(teamId);
  }
}

export {};