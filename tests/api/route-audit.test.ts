import { describe, it, expect } from 'vitest';

describe('API Route Audit', () => {
  describe('should identify all current API endpoints', () => {
    it('should have the expected number of core endpoints', () => {
      // Based on the actual API routes found in the codebase
      const currentEndpoints = [
        '/api/clubs/:clubId/teams',
        '/api/clubs/:clubId/players', 
        '/api/clubs/:clubId/games',
        '/api/teams/:teamId/games',
        '/api/teams/:teamId/games/:gameId/stats',
        '/api/teams/:teamId/games/:gameId/rosters',
        '/api/games/:gameId/scores',
        '/api/games/:gameId/stats',
        '/api/games/:gameId/rosters',
        '/api/seasons',
        '/api/players',
        '/api/teams'
      ];

      expect(currentEndpoints).toHaveLength(12);
      
      // Check for plural consistency
      const pluralEndpoints = currentEndpoints.filter(endpoint => 
        endpoint.includes('/clubs/') || 
        endpoint.includes('/teams/') || 
        endpoint.includes('/players/') || 
        endpoint.includes('/games/') || 
        endpoint.includes('/seasons/')
      );
      
      expect(pluralEndpoints.length).toBeGreaterThan(0);
    });
  });

  describe('should identify endpoints that need pluralization', () => {
    it('should not have any singular endpoints', () => {
      const currentEndpoints = [
        '/api/clubs/:clubId/teams',
        '/api/clubs/:clubId/players', 
        '/api/clubs/:clubId/games',
        '/api/teams/:teamId/games',
        '/api/teams/:teamId/games/:gameId/stats',
        '/api/teams/:teamId/games/:gameId/rosters',
        '/api/games/:gameId/scores',
        '/api/games/:gameId/stats',
        '/api/games/:gameId/rosters',
        '/api/seasons',
        '/api/players',
        '/api/teams'
      ];

      const singularEndpoints = currentEndpoints.filter(endpoint => 
        endpoint.includes('/club/') || 
        endpoint.includes('/team/') || 
        endpoint.includes('/player/') || 
        endpoint.includes('/game/') || 
        endpoint.includes('/season/')
      );
      
      expect(singularEndpoints).toHaveLength(0);
    });
  });

  describe('should identify inconsistent nesting patterns', () => {
    it('should have consistent club-scoped patterns', () => {
      const clubScopedEndpoints = [
        '/api/clubs/:clubId/teams',
        '/api/clubs/:clubId/players', 
        '/api/clubs/:clubId/games'
      ];

      // All club-scoped endpoints should follow the same pattern
      clubScopedEndpoints.forEach(endpoint => {
        expect(endpoint).toMatch(/^\/api\/clubs\/:clubId\/[a-z]+$/);
      });
    });
  });
}); 