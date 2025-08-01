
import { queryClient } from './queryClient';

/**
 * Smart Hierarchical Cache Invalidation System
 * 
 * This system uses a three-tier approach:
 * - Tier 1 (Immediate): Direct data affected
 * - Tier 2 (Cascade): Computed/derived data 
 * - Tier 3 (Background): Broader context data
 */

// Cache invalidation patterns for different data types
const INVALIDATION_PATTERNS = {
  GAME_STATS: {
    immediate: [
      '/api/games/{gameId}/stats',
      '/api/games/{gameId}',
    ],
    cascade: [
      '/api/games/stats/batch',
      '/api/clubs/{clubId}/games/stats/batch',
      '/api/teams/{teamId}/games',
    ],
    background: [
      '/api/clubs/{clubId}/games',
      '/api/teams/{teamId}',
    ]
  },
  GAME_SCORES: {
    immediate: [
      '/api/games/{gameId}/scores', 
      '/api/games/{gameId}',
    ],
    cascade: [
      '/api/games/scores/batch',
      '/api/clubs/{clubId}/games/scores/batch',
      '/api/teams/{teamId}/games',
    ],
    background: [
      '/api/clubs/{clubId}/games',
    ]
  },
  GAME_STATUS: {
    immediate: [
      '/api/games/{gameId}',
    ],
    cascade: [
      '/api/teams/{teamId}/games',
      '/api/games/stats/batch',
      '/api/games/scores/batch',
    ],
    background: [
      '/api/clubs/{clubId}/games',
    ]
  },
  ROSTER_CHANGES: {
    immediate: [
      '/api/games/{gameId}/roster',
      '/api/games/{gameId}',
    ],
    cascade: [
      '/api/games/rosters/batch',
      '/api/teams/{teamId}/games',
    ],
    background: [
      '/api/teams/{teamId}/players',
    ]
  }
};

// Smart invalidation based on data type and context
export class SmartCacheInvalidator {
  private static instance: SmartCacheInvalidator;
  private pendingInvalidations = new Set<string>();
  private invalidationTimer: NodeJS.Timeout | null = null;

  static getInstance(): SmartCacheInvalidator {
    if (!SmartCacheInvalidator.instance) {
      SmartCacheInvalidator.instance = new SmartCacheInvalidator();
    }
    return SmartCacheInvalidator.instance;
  }

  // Main invalidation method with smart hierarchical logic
  async invalidateGameData(gameId: number, changeType: keyof typeof INVALIDATION_PATTERNS, context?: {
    teamId?: number;
    clubId?: number;
    isLiveGame?: boolean;
    isCriticalChange?: boolean;
  }) {


    const patterns = INVALIDATION_PATTERNS[changeType];
    const { teamId, clubId, isLiveGame = false, isCriticalChange = false } = context || {};

    // Tier 1: Immediate invalidation (always execute)
    await this.executeInvalidation('immediate', patterns.immediate, {
      gameId,
      teamId,
      clubId
    });

    // Tier 2: Cascade invalidation (execute based on context)
    if (isCriticalChange || isLiveGame) {
      await this.executeInvalidation('cascade', patterns.cascade, {
        gameId,
        teamId,
        clubId
      });
    } else {
      // Defer cascade invalidation for non-critical changes
      this.deferInvalidation('cascade', patterns.cascade, {
        gameId,
        teamId,
        clubId
      });
    }

    // Tier 3: Background invalidation (always deferred)
    this.deferInvalidation('background', patterns.background, {
      gameId,
      teamId,
      clubId
    });
  }

  // Execute immediate invalidations
  private async executeInvalidation(
    tier: string,
    patterns: string[],
    context: { gameId: number; teamId?: number; clubId?: number }
  ) {
    const queries = this.expandPatterns(patterns, context);
    


    for (const query of queries) {
      await queryClient.invalidateQueries({
        predicate: (q) => {
          const key = q.queryKey[0];
          return typeof key === 'string' && (
            key === query || 
            key.includes(query) ||
            this.matchesPattern(key, query)
          );
        }
      });
    }
  }

  // Defer non-critical invalidations to reduce UI blocking
  private deferInvalidation(
    tier: string,
    patterns: string[],
    context: { gameId: number; teamId?: number; clubId?: number }
  ) {
    const queries = this.expandPatterns(patterns, context);
    queries.forEach(q => this.pendingInvalidations.add(`${tier}:${q}`));

    // Clear existing timer and set new one
    if (this.invalidationTimer) {
      clearTimeout(this.invalidationTimer);
    }

    this.invalidationTimer = setTimeout(() => {
      this.executePendingInvalidations();
    }, 1000); // 1 second delay for background invalidations
  }

  // Execute all pending invalidations
  private async executePendingInvalidations() {
    if (this.pendingInvalidations.size === 0) return;



    const invalidations = Array.from(this.pendingInvalidations);
    this.pendingInvalidations.clear();

    for (const invalidation of invalidations) {
      const [tier, query] = invalidation.split(':', 2);
      await queryClient.invalidateQueries({
        predicate: (q) => {
          const key = q.queryKey[0];
          return typeof key === 'string' && (
            key === query || 
            key.includes(query) ||
            this.matchesPattern(key, query)
          );
        }
      });
    }
  }

  // Expand pattern templates with actual values
  private expandPatterns(
    patterns: string[],
    context: { gameId: number; teamId?: number; clubId?: number }
  ): string[] {
    return patterns.map(pattern => {
      return pattern
        .replace('{gameId}', context.gameId.toString())
        .replace('{teamId}', context.teamId?.toString() || '')
        .replace('{clubId}', context.clubId?.toString() || '');
    });
  }

  // Pattern matching for flexible query matching
  private matchesPattern(queryKey: string, pattern: string): boolean {
    // Remove template variables for pattern matching
    const cleanPattern = pattern.replace(/\{[^}]+\}/g, '');
    return queryKey.includes(cleanPattern);
  }
}

// Convenience functions for common invalidation scenarios
export async function invalidateAfterStatsSave(gameId: number, context?: {
  teamId?: number;
  clubId?: number;
  isLiveGame?: boolean;
}) {
  const invalidator = SmartCacheInvalidator.getInstance();
  await invalidator.invalidateGameData(gameId, 'GAME_STATS', {
    ...context,
    isCriticalChange: true
  });
}

export async function invalidateAfterScoreUpdate(gameId: number, context?: {
  teamId?: number;
  clubId?: number;
  isLiveGame?: boolean;
}) {
  const invalidator = SmartCacheInvalidator.getInstance();
  await invalidator.invalidateGameData(gameId, 'GAME_SCORES', {
    ...context,
    isCriticalChange: true
  });
}

export async function invalidateAfterStatusChange(gameId: number, context?: {
  teamId?: number;
  clubId?: number;
}) {
  const invalidator = SmartCacheInvalidator.getInstance();
  await invalidator.invalidateGameData(gameId, 'GAME_STATUS', {
    ...context,
    isCriticalChange: true
  });
}

export async function invalidateAfterRosterChange(gameId: number, context?: {
  teamId?: number;
  clubId?: number;
}) {
  const invalidator = SmartCacheInvalidator.getInstance();
  await invalidator.invalidateGameData(gameId, 'ROSTER_CHANGES', context);
}

// Legacy functions for backward compatibility
export function invalidateQueries(pattern: string) {
  return queryClient.invalidateQueries({ 
    predicate: (query) => {
      const queryKey = query.queryKey[0];
      return typeof queryKey === 'string' && queryKey.includes(pattern);
    }
  });
}

export function invalidateGameData(gameId: number) {
  console.log(`⚠️  Using legacy invalidateGameData - consider upgrading to smart invalidation`);
  return invalidateAfterStatsSave(gameId);
}

export function invalidateTeamData(teamId: number) {
  console.log(`⚠️  Using legacy invalidateTeamData - consider upgrading to smart invalidation`);
  return queryClient.invalidateQueries({ 
    predicate: (query) => {
      const key = query.queryKey[0];
      return typeof key === 'string' && key.includes(`/teams/${teamId}`);
    }
  });
}

export function invalidateAvailability(queryClient: any, gameId: number) {
  console.log(`⚠️  Using legacy invalidateAvailability - consider upgrading to smart invalidation`);
  return queryClient.invalidateQueries({ 
    predicate: (query) => {
      const key = query.queryKey[0];
      return typeof key === 'string' && key.includes(`/games/${gameId}/availability`);
    }
  });
}

// Enhanced cache invalidation for form operations
export interface FormCacheContext {
  clubId?: number;
  seasonId?: number;
  teamId?: number;
  playerId?: number;
  gameId?: number;
}

export class FormCacheInvalidator {
  private static instance: FormCacheInvalidator;

  static getInstance(): FormCacheInvalidator {
    if (!FormCacheInvalidator.instance) {
      FormCacheInvalidator.instance = new FormCacheInvalidator();
    }
    return FormCacheInvalidator.instance;
  }

  // Team form operations
  async invalidateTeamCaches(context: FormCacheContext) {
    const patterns = [
      'teams',
      '/api/teams',
    ];
    
    if (context.clubId) {
      patterns.push(`/api/clubs/${context.clubId}/teams`);
    }
    
    if (context.seasonId) {
      patterns.push(`/api/seasons/${context.seasonId}/teams`);
      patterns.push(`/api/seasons/${context.seasonId}/divisions`); // Team count affects divisions
    }

    await this.invalidatePatterns(patterns);
  }

  // Player form operations
  async invalidatePlayerCaches(context: FormCacheContext) {
    const patterns = [
      'players',
      '/api/players',
    ];
    
    if (context.clubId) {
      patterns.push(`/api/clubs/${context.clubId}/players`);
    }
    
    if (context.teamId) {
      patterns.push(`/api/teams/${context.teamId}/players`);
    }

    await this.invalidatePatterns(patterns);
  }

  // Club form operations
  async invalidateClubCaches(context: FormCacheContext) {
    const patterns = [
      'clubs',
      '/api/clubs',
    ];
    
    if (context.clubId) {
      patterns.push(`/api/clubs/${context.clubId}`);
    }

    await this.invalidatePatterns(patterns);
  }

  // Game form operations
  async invalidateGameCaches(context: FormCacheContext) {
    const patterns = [
      'games',
      '/api/games',
    ];
    
    if (context.clubId) {
      patterns.push(`/api/clubs/${context.clubId}/games`);
    }
    
    if (context.teamId) {
      patterns.push(`/api/teams/${context.teamId}/games`);
    }
    
    if (context.seasonId) {
      patterns.push(`/api/seasons/${context.seasonId}/games`);
    }

    await this.invalidatePatterns(patterns);
  }

  // Season form operations
  async invalidateSeasonCaches(context: FormCacheContext) {
    const patterns = [
      'seasons',
      '/api/seasons',
    ];
    
    if (context.seasonId) {
      patterns.push(`/api/seasons/${context.seasonId}`);
      patterns.push(`/api/seasons/${context.seasonId}/divisions`);
    }

    await this.invalidatePatterns(patterns);
  }

  // Helper to execute pattern invalidations
  private async invalidatePatterns(patterns: string[]) {
    for (const pattern of patterns) {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && (
            key === pattern || 
            key.includes(pattern)
          );
        }
      });
    }
  }
}

// Convenience functions for form cache invalidation
export async function invalidateTeamFormCaches(context: FormCacheContext) {
  const invalidator = FormCacheInvalidator.getInstance();
  await invalidator.invalidateTeamCaches(context);
}

export async function invalidatePlayerFormCaches(context: FormCacheContext) {
  const invalidator = FormCacheInvalidator.getInstance();
  await invalidator.invalidatePlayerCaches(context);
}

export async function invalidateClubFormCaches(context: FormCacheContext) {
  const invalidator = FormCacheInvalidator.getInstance();
  await invalidator.invalidateClubCaches(context);
}

export async function invalidateGameFormCaches(context: FormCacheContext) {
  const invalidator = FormCacheInvalidator.getInstance();
  await invalidator.invalidateGameCaches(context);
}

export async function invalidateSeasonFormCaches(context: FormCacheContext) {
  const invalidator = FormCacheInvalidator.getInstance();
  await invalidator.invalidateSeasonCaches(context);
}
