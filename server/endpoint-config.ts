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
      'isRegular': 'is_regular'
    },
    description: 'Team player assignment - critical endpoint'
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
      'seasonId': 'season_id',
      'isInterClub': 'is_inter_club'
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
    fieldMappings: {
      'firstName': 'first_name',
      'lastName': 'last_name',
      'displayName': 'display_name',
      'positionPreferences': 'position_preferences',
      'avatarColor': 'avatar_color'
    },
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
  '/api/game/*/team/*/stats': {
    convertRequest: false,
    convertResponse: true,
    description: 'Legacy stats endpoint - to be deprecated'
  },

  '/api/game/*/team/*/rosters': {
    convertRequest: false,
    convertResponse: true,
    description: 'Legacy rosters endpoint - to be deprecated'
  },

  // ==========================================================================
  // SAFE ENDPOINTS - No request body or already working
  // ==========================================================================
  '/api/seasons': {
    convertRequest: false,
    convertResponse: true,
    description: 'Seasons endpoint - mostly GET operations'
  },

  '/api/clubs': {
    convertRequest: true,
    convertResponse: true,
    description: 'Club CRUD operations'
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
 * Apply field mappings to request body
 */
export function applyFieldMappings(body: any, mappings: Record<string, string>): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const result = { ...body };

  // Apply mappings
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