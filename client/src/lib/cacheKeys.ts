export const CACHE_KEYS = {
  // Base entities - consistent patterns
  players: (clubId: number, teamId?: number) => 
    teamId ? ['players', clubId, teamId] : ['players', clubId],

  teams: (clubId: number) => ['teams', clubId],

  seasons: (clubId: number) => ['seasons', clubId],
  activeSeason: (clubId: number) => ['seasons', 'active', clubId],

  userClubs: () => ['user-clubs'],

  gameStatuses: (clubId: number) => ['game-statuses', clubId],

  // Games with consistent team handling
  games: (clubId: number, teamId?: number, isClubWide?: boolean) => {
    if (isClubWide) return ['games', clubId, 'club-wide'];
    return teamId ? ['games', clubId, teamId] : ['games', clubId, 'all-teams'];
  },

  game: (gameId: number) => ['game', gameId],

  // Batch operations with normalized IDs
  batchGameData: (clubId: number, teamId: number | null, gameIds: number[]) => [
    'batch-game-data', 
    clubId, 
    teamId || 'all-teams', 
    normalizeGameIds(gameIds)
  ],

  // Rosters with team context
  gameRoster: (gameId: number, teamId?: number) => 
    teamId ? ['roster', gameId, teamId] : ['roster', gameId],

  batchRosters: (clubId: number, gameIds: number[]) => 
    ['batch-rosters', clubId, normalizeGameIds(gameIds)],

  // Statistics
  gameStats: (gameId: number) => ['stats', gameId],

  batchStats: (clubId: number, gameIds: number[]) => 
    ['batch-stats', clubId, normalizeGameIds(gameIds)],

  // Scores
  gameScores: (gameId: number) => ['scores', gameId],

  batchScores: (clubId: number, gameIds: number[]) => 
    ['batch-scores', clubId, normalizeGameIds(gameIds)],

  // Official scores with club context
  officialScores: (clubId: number, gameIds: number[]) =>
    ['official-scores', clubId, normalizeGameIds(gameIds)],

  // Dashboard aggregations
  dashboardData: (clubId: number, teamId: number | null) => 
    ['dashboard', clubId, teamId || 'all-teams'],
};

// Helper to ensure consistent gameIds sorting
export const normalizeGameIds = (gameIds: number[]): string => 
  [...gameIds].sort((a, b) => a - b).join(',');

// Cache invalidation helpers
export const invalidateGameRelated = (queryClient: any, gameId: number) => {
  queryClient.invalidateQueries({ 
    predicate: (query: any) => {
      const key = query.queryKey;
      return key.includes('game') && (key.includes(gameId) || key.includes(gameId.toString()));
    }
  });
};

export const invalidateTeamRelated = (queryClient: any, clubId: number, teamId: number) => {
  queryClient.invalidateQueries({
    predicate: (query: any) => {
      const key = query.queryKey;
      return key.includes(clubId) && key.includes(teamId);
    }
  });
};

// Smart invalidation for game list updates (add/edit game)
export const invalidateGameLists = (queryClient: any, clubId: number, teamId?: number) => {
  // Only invalidate the specific team's games list, not all games
  if (teamId) {
    queryClient.invalidateQueries({ queryKey: ['games', clubId, teamId] });
  }

  // Always invalidate club-wide lists for dashboard
  queryClient.invalidateQueries({ queryKey: ['games', clubId, 'all-teams'] });
  queryClient.invalidateQueries({ queryKey: ['games', clubId, 'club-wide'] });

  // Don't invalidate batch data unless necessary
};

// Minimal invalidation for score-only updates
export const invalidateScoresOnly = (queryClient: any, gameId: number, clubId: number) => {
  // Only invalidate score-related queries, not full game data
  queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'scores'] });
  queryClient.invalidateQueries({ queryKey: ['scores', gameId] });

  // Invalidate batch score caches that include this game
  queryClient.invalidateQueries({
    predicate: (query: any) => {
      const key = query.queryKey;
      return Array.isArray(key) && 
             (key[0] === 'batch-scores' || key[0] === 'official-scores') && 
             key[1] === clubId;
    }
  });

  // Update dashboard games list to reflect score changes
  queryClient.invalidateQueries({
    predicate: (query: any) => {
      const key = query.queryKey;
      return Array.isArray(key) && 
             key[0] === 'games' && 
             key[1] === clubId &&
             (key[2] === 'all-teams' || key[2] === 'club-wide');
    }
  });
};