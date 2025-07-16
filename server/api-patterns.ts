/**
 * API URL Pattern Registry
 * 
 * Defines all standardized URL patterns and their relationships
 */

export const API_PATTERNS = {
  // ============================================================================
  // CORE RESOURCES (Standalone)
  // ============================================================================
  
  // Clubs
  CLUBS: '/api/clubs',
  CLUB_BY_ID: '/api/clubs/:clubId',
  
  // Teams  
  TEAMS: '/api/teams',
  TEAM_BY_ID: '/api/teams/:teamId',
  
  // Games (standalone resources)
  GAMES: '/api/games',
  GAME_BY_ID: '/api/games/:gameId',
  
  // Players
  PLAYERS: '/api/players', 
  PLAYER_BY_ID: '/api/players/:playerId',
  
  // Seasons
  SEASONS: '/api/seasons',
  SEASON_BY_ID: '/api/seasons/:seasonId',

  // ============================================================================
  // TEAM-SCOPED RESOURCES (Primary Pattern)
  // ============================================================================
  
  // Team operations (most common use case)
  TEAM_PLAYERS: '/api/teams/:teamId/players',
  TEAM_GAMES: '/api/teams/:teamId/games',
  TEAM_GAME_BY_ID: '/api/teams/:teamId/games/:gameId',
  
  // Team's contextual view of game data
  TEAM_GAME_STATS: '/api/teams/:teamId/games/:gameId/stats',
  TEAM_GAME_ROSTERS: '/api/teams/:teamId/games/:gameId/rosters', 
  TEAM_GAME_AVAILABILITY: '/api/teams/:teamId/games/:gameId/availability',

  // ============================================================================
  // CLUB-SCOPED RESOURCES (Management & Batch Operations)
  // ============================================================================
  
  // Club management (when you need club-wide view)
  CLUB_TEAMS: '/api/clubs/:clubId/teams',
  CLUB_PLAYERS: '/api/clubs/:clubId/players',
  CLUB_GAMES: '/api/clubs/:clubId/games',
  
  // Club batch operations (performance-critical)
  CLUB_BATCH_GAME_STATS: '/api/clubs/:clubId/games/stats/batch',
  CLUB_BATCH_GAME_SCORES: '/api/clubs/:clubId/games/scores/batch',
  CLUB_BATCH_GAME_ROSTERS: '/api/clubs/:clubId/games/rosters/batch',

  // ============================================================================
  // GAME-SCOPED RESOURCES (Neutral view)
  // ============================================================================
  
  // Game data (neutral perspective)
  GAME_STATS: '/api/games/:gameId/stats',
  GAME_SCORES: '/api/games/:gameId/scores', 
  GAME_ROSTERS: '/api/games/:gameId/rosters',
  GAME_AVAILABILITY: '/api/games/:gameId/availability',
  GAME_PERMISSIONS: '/api/games/:gameId/permissions',

  // ============================================================================
  // PLAYER-SCOPED RESOURCES
  // ============================================================================
  
  PLAYER_SEASONS: '/api/players/:playerId/seasons',
  PLAYER_STATS: '/api/players/:playerId/stats',
  PLAYER_CLUBS: '/api/players/:playerId/clubs',

  // ============================================================================
  // BATCH OPERATIONS (Global)
  // ============================================================================
  
  BATCH_GAME_STATS: '/api/games/stats/batch',
  BATCH_GAME_SCORES: '/api/games/scores/batch',
  
} as const;

/**
 * Legacy URL patterns that need to be redirected
 */
export const LEGACY_PATTERNS = {
  // Old game-centric patterns
  '/api/game/:gameId/team/:teamId': '/api/teams/:teamId/games/:gameId',
  '/api/game/:gameId/team/:teamId/stats': '/api/teams/:teamId/games/:gameId/stats',
  '/api/game/:gameId/team/:teamId/rosters': '/api/teams/:teamId/games/:gameId/rosters',
  
  // Old stats patterns  
  '/api/game-stats/:id': '/api/games/stats/:id',
  '/api/gamestats/:id': '/api/games/stats/:id',
  
  // Old player patterns
  '/api/players': '/api/clubs/:clubId/players', // Needs club context
} as const;

/**
 * Resource hierarchy and usage patterns
 */
export const RESOURCE_HIERARCHY = {
  // Primary usage patterns (most common)
  team: {
    belongsTo: ['club'],
    owns: ['players'],
    participatesIn: ['games'],
    primaryRoutes: [
      'TEAM_PLAYERS', 'TEAM_GAMES', 'TEAM_GAME_STATS', 
      'TEAM_GAME_ROSTERS', 'TEAM_GAME_AVAILABILITY'
    ],
    useCases: ['Game day operations', 'Team management', 'Player stats']
  },
  
  // Management patterns (admin/coach use)
  club: {
    owns: ['teams', 'players'],
    participatesIn: ['games'],
    managementRoutes: [
      'CLUB_TEAMS', 'CLUB_PLAYERS', 'CLUB_GAMES',
      'CLUB_BATCH_GAME_STATS', 'CLUB_BATCH_GAME_SCORES'
    ],
    useCases: ['Club dashboard', 'Batch operations', 'Multi-team management']
  },
  
  // Neutral patterns (referee/admin use)
  game: {
    involves: ['teams'],
    owns: ['stats', 'scores', 'rosters', 'availability', 'permissions'],
    neutralRoutes: [
      'GAME_STATS', 'GAME_SCORES', 'GAME_ROSTERS', 
      'GAME_AVAILABILITY', 'GAME_PERMISSIONS'
    ],
    useCases: ['Referee interface', 'Game administration', 'Cross-team data']
  },
  
  player: {
    belongsTo: ['clubs', 'teams'],
    owns: ['seasons', 'stats'],
    routes: ['PLAYER_SEASONS', 'PLAYER_STATS', 'PLAYER_CLUBS'],
    useCases: ['Player profiles', 'Career statistics', 'Season history']
  }
} as const;

/**
 * Game perspective logic
 * 
 * Games are ALWAYS stored and displayed as "Home Team vs Away Team" 
 * but results are calculated from the requesting team/club's perspective
 */
export const GAME_PERSPECTIVE_RULES = {
  // Core data structure (always consistent - never changes)
  coreData: {
    homeTeamId: 'game.homeTeamId',
    awayTeamId: 'game.awayTeamId', 
    homeTeamName: 'game.homeTeamName',
    awayTeamName: 'game.awayTeamName',
    homeScore: 'game.homeScore',
    awayScore: 'game.awayScore',
    displayFormat: 'Home Team vs Away Team'
  },
  
  // Perspective calculations (computed based on requesting context)
  teamPerspective: {
    // When requesting team is the home team
    whenTeamIsHome: {
      isHome: true,
      ourScore: 'game.homeScore',
      theirScore: 'game.awayScore',
      opponent: 'game.awayTeamName',
      result: 'ourScore > theirScore ? "WIN" : ourScore < theirScore ? "LOSS" : "DRAW"'
    },
    // When requesting team is the away team  
    whenTeamIsAway: {
      isHome: false,
      ourScore: 'game.awayScore',
      theirScore: 'game.homeScore', 
      opponent: 'game.homeTeamName',
      result: 'ourScore > theirScore ? "WIN" : ourScore < theirScore ? "LOSS" : "DRAW"'
    }
  },
  
  clubPerspective: {
    // When requesting club owns the home team
    whenClubHasHomeTeam: {
      ourTeam: 'game.homeTeamName',
      theirTeam: 'game.awayTeamName',
      ourScore: 'game.homeScore',
      theirScore: 'game.awayScore',
      result: 'ourScore > theirScore ? "WIN" : ourScore < theirScore ? "LOSS" : "DRAW"'
    },
    // When requesting club owns the away team
    whenClubHasAwayTeam: {
      ourTeam: 'game.awayTeamName', 
      theirTeam: 'game.homeTeamName',
      ourScore: 'game.awayScore',
      theirScore: 'game.homeScore',
      result: 'ourScore > theirScore ? "WIN" : ourScore < theirScore ? "LOSS" : "DRAW"'
    },
    // When requesting club owns both teams (intra-club game)
    whenClubHasBothTeams: {
      homeTeam: 'game.homeTeamName',
      awayTeam: 'game.awayTeamName', 
      homeScore: 'game.homeScore',
      awayScore: 'game.awayScore',
      result: 'INTRA_CLUB_GAME',
      note: 'No winner/loser - both teams belong to same club'
    }
  }
} as const;