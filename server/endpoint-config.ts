/**
 * Endpoint Configuration System
 * 
 * Provides fine-grained control over case conversion for individual endpoints
 */

export interface EndpointConfig {
  convertRequest: boolean;
  convertResponse: boolean;
  fieldMappings?: Record<string, string>;
  description?: string;
}

/**
 * Endpoint-specific configuration
 * Key: URL pattern (supports wildcards with *)
 * Value: Configuration for that endpoint
 */
export const endpointConfigs: Record<string, EndpointConfig> = {
  // ==========================================================================
  // BATCH ENDPOINTS - Working well with current setup
  // ==========================================================================
  '/api/games/stats/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Batch stats endpoint - expects camelCase gameIds array'
  },
  
  '/api/games/scores/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Batch scores endpoint - expects camelCase gameIds array'
  },
  
  '/api/clubs/*/games/stats/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Club-scoped batch stats endpoint'
  },
  
  '/api/clubs/*/games/scores/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Club-scoped batch scores endpoint'
  },

  // ==========================================================================
  // CRITICAL ENDPOINTS - Need special handling
  // ==========================================================================
  '/api/teams/*/players': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'playerId': 'player_id',
      'isRegular': 'is_regular',
      'positionPreferences': 'position_preferences'
    },
    description: 'Team player assignment - critical endpoint'
  },

  '/api/teams/*/players/*': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'isRegular': 'is_regular',
      'positionPreferences': 'position_preferences'
    },
    description: 'Team player updates - PATCH endpoint'
  },

  '/api/teams/*/games/*/availability': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'availablePlayerIds': 'available_player_ids',
      'explicitlyEmpty': 'explicitly_empty'
    },
    description: 'Player availability management'
  },

  // ==========================================================================
  // GAME MANAGEMENT ENDPOINTS
  // ==========================================================================
  '/api/games': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'homeTeamId': 'home_team_id',
      'awayTeamId': 'away_team_id',
      'statusId': 'status_id',
      'seasonId': 'season_id'
    },
    description: 'Game CRUD operations'
  },

  '/api/games/*': {
    convertRequest: true,
    convertResponse: true,
    description: 'Individual game operations'
  },

  // ==========================================================================
  // PLAYER MANAGEMENT ENDPOINTS
  // ==========================================================================
  '/api/players': {
    convertRequest: true,
    convertResponse: true,
    description: 'Player CRUD operations'
  },

  '/api/players/*': {
    convertRequest: true,
    convertResponse: true,
    description: 'Individual player operations'
  },

  // ==========================================================================
  // TEAM MANAGEMENT ENDPOINTS
  // ==========================================================================
  '/api/teams': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'clubId': 'club_id',
      'seasonId': 'season_id',
      'divisionId': 'division_id',
      'isActive': 'is_active'
    },
    description: 'Team CRUD operations'
  },

  '/api/teams/*': {
    convertRequest: true,
    convertResponse: true,
    description: 'Individual team operations'
  },

  // ==========================================================================
  // LEGACY ENDPOINTS - Maintain current behavior
  // ==========================================================================

  // ==========================================================================
  // SAFE ENDPOINTS - No request body or already working
  // ==========================================================================

  '/api/clubs': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'contactEmail': 'contact_email',
      'contactPhone': 'contact_phone',
      'logoUrl': 'logo_url',
      'primaryColor': 'primary_color',
      'secondaryColor': 'secondary_color',
      'isActive': 'is_active',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    },
    description: 'Club CRUD operations'
  },

  '/api/clubs/*/players': {
    convertRequest: true,
    convertResponse: true,
    description: 'Club players management - GET, POST, DELETE'
  },

  '/api/clubs/*/players/*': {
    convertRequest: true,
    convertResponse: true,
    description: 'Club player individual operations - GET, PATCH, DELETE'
  },

  '/api/clubs/*/teams': {
    convertRequest: true,
    convertResponse: true,
    description: 'Club-scoped team CRUD operations'
  },

  // ==========================================================================
  // AVAILABILITY ENDPOINTS
  // ==========================================================================
  '/api/games/*/availability': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'availablePlayerIds': 'available_player_ids',
      'explicitlyEmpty': 'explicitly_empty',
      'isAvailable': 'is_available'
    },
    description: 'Game availability management'
  },

  // ==========================================================================
  // STATISTICS ENDPOINTS
  // ==========================================================================
  '/api/games/*/stats': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'gameId': 'game_id',
      'teamId': 'team_id',
      'goalsFor': 'goals_for',
      'goalsAgainst': 'goals_against',
      'missedGoals': 'missed_goals'
    },
    description: 'Game statistics management'
  },

  '/api/game/*/team/*/stats': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'gameId': 'game_id',
      'teamId': 'team_id',
      'playerId': 'player_id',
      'statType': 'stat_type'
    },
    description: 'Legacy team stats endpoint'
  },

  // ==========================================================================
  // ROSTER ENDPOINTS
  // ==========================================================================
  '/api/games/*/rosters': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'gameId': 'game_id',
      'playerId': 'player_id',
      'teamId': 'team_id'
    },
    description: 'Game roster management'
  },

  '/api/game/*/team/*/rosters': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'gameId': 'game_id',
      'teamId': 'team_id',
      'playerId': 'player_id',
      'jerseyNumber': 'jersey_number'
    },
    description: 'Legacy team rosters endpoint'
  },

  '/api/rosters': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'gameId': 'game_id',
      'playerId': 'player_id',
      'teamId': 'team_id',
      'jerseyNumber': 'jersey_number'
    },
    description: 'Roster CRUD operations'
  },

  // ==========================================================================
  // SCORES ENDPOINTS
  // ==========================================================================
  '/api/games/*/scores': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'homeScore': 'home_score',
      'awayScore': 'away_score',
      'gameId': 'game_id'
    },
    description: 'Game scores management'
  },

  // ==========================================================================
  // SEASONS & DIVISIONS
  // ==========================================================================
  '/api/seasons': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'startDate': 'start_date',
      'endDate': 'end_date',
      'isActive': 'is_active'
    },
    description: 'Season CRUD operations'
  },

  '/api/seasons/*/divisions': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'displayName': 'display_name',
      'ageGroupId': 'age_group_id',
      'sectionId': 'section_id',
      'isActive': 'is_active'
    },
    description: 'Division creation under seasons'
  },

  '/api/divisions': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'displayName': 'display_name',
      'ageGroupId': 'age_group_id',
      'sectionId': 'section_id',
      'isActive': 'is_active'
    },
    description: 'Division CRUD operations'
  },

  '/api/age-groups': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'displayName': 'display_name',
      'isActive': 'is_active'
    },
    description: 'Age group CRUD operations'
  },

  '/api/sections': {
    convertRequest: true,
    convertResponse: true,
    description: 'Section CRUD operations'
  },

  // ==========================================================================
  // PLAYER SEASONS & CLUBS
  // ==========================================================================
  '/api/players/*/seasons': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'seasonIds': 'season_ids',
      'playerId': 'player_id'
    },
    description: 'Player season assignments'
  },

  '/api/players/*/clubs': {
    convertRequest: true,
    convertResponse: true,
    description: 'Player club assignments'
  },

  '/api/players/*/teams': {
    convertRequest: true,
    convertResponse: true,
    description: 'Player team assignments'
  },

  // ==========================================================================
  // GAME ACTIONS
  // ==========================================================================
  '/api/games/*/award': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'playerId': 'player_id',
      'awardType': 'award_type',
      'teamId': 'team_id'
    },
    description: 'Game award management'
  },

  '/api/games/*/notes': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'teamId': 'team_id'
    },
    description: 'Game notes management'
  },

  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================
  '/api/clubs/*/users/invite': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'clubId': 'club_id',
      'userId': 'user_id'
    },
    description: 'User invitation to clubs'
  },

  '/api/clubs/*/users/*': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'clubId': 'club_id',
      'userId': 'user_id'
    },
    description: 'User management in clubs'
  },

  // ==========================================================================
  // PLAYER BORROWING
  // ==========================================================================
  '/api/clubs/*/player-borrowing': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'clubId': 'club_id',
      'playerId': 'player_id',
      'borrowingId': 'borrowing_id',
      'jerseyNumber': 'jersey_number'
    },
    description: 'Player borrowing management'
  },

  // ==========================================================================
  // GAME PERMISSIONS
  // ==========================================================================
  '/api/games/*/permissions': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'gameId': 'game_id',
      'clubId': 'club_id'
    },
    description: 'Game permissions management'
  },

  '/api/games/permissions/bulk': {
    convertRequest: true,
    convertResponse: true,
    fieldMappings: {
      'gameIds': 'game_ids',
      'clubId': 'club_id'
    },
    description: 'Bulk game permissions'
  },

  // ==========================================================================
  // ADDITIONAL BATCH ENDPOINTS
  // ==========================================================================
  '/api/teams/*/games/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Team-scoped batch games endpoint'
  },

  '/api/clubs/*/games/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Club-scoped batch games endpoint'
  },

  '/api/teams/*/games/stats/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Team-scoped batch stats endpoint'
  },

  '/api/teams/*/games/scores/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Team-scoped batch scores endpoint'
  },

  '/api/clubs/*/games/rosters/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Club-scoped batch rosters endpoint'
  },

  '/api/games/rosters/batch': {
    convertRequest: false,
    convertResponse: true,
    description: 'Batch rosters endpoint'
  }
};

/**
 * Get configuration for a specific endpoint path
 */
export function getEndpointConfig(path: string): EndpointConfig | null {
  // First try exact match
  if (endpointConfigs[path]) {
    return endpointConfigs[path];
  }

  // Then try pattern matching with wildcards
  for (const [pattern, config] of Object.entries(endpointConfigs)) {
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\*/g, '[^/]+');
      const regex = new RegExp(`^${regexPattern}$`);
      
      if (regex.test(path)) {
        return config;
      }
    }
  }

  return null;
}

/**
 * Apply field mappings to request body (converts camelCase to snake_case)
 */
export function applyFieldMappings(body: any, mappings: Record<string, string>): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const result = { ...body };

  // Apply mappings - convert camelCase to snake_case for requests
  for (const [camelCase, snake_case] of Object.entries(mappings)) {
    if (result[camelCase] !== undefined) {
      result[snake_case] = result[camelCase];
      delete result[camelCase];
    }
  }

  return result;
}

/**
 * Check if an endpoint should have case conversion applied
 */
export function shouldConvertEndpoint(path: string): {
  convertRequest: boolean;
  convertResponse: boolean;
  config: EndpointConfig | null;
} {
  const config = getEndpointConfig(path);
  
  if (config) {
    return {
      convertRequest: config.convertRequest,
      convertResponse: config.convertResponse,
      config
    };
  }

  // Default behavior for unconfigured endpoints
  return {
    convertRequest: false,
    convertResponse: true, // Always convert responses to camelCase
    config: null
  };
}