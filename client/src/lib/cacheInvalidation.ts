
import { queryClient } from '../App';

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
    console.log(`🔄 Smart invalidation for game ${gameId}, type: ${changeType}`);

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
    
    console.log(`🔄 Executing ${tier} invalidation:`, queries);

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

    console.log(`🔄 Executing ${this.pendingInvalidations.size} deferred invalidations`);

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
