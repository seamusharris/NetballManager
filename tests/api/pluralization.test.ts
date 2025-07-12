import { describe, it, expect } from 'vitest';

describe('API Pluralization Tests', () => {
  const baseUrl = 'http://localhost:3000';
  const testClubId = 54;
  const testTeamId = 116;
  const testGameId = 72;

  describe('Club Endpoints', () => {
    it('should use plural /api/clubs/ instead of /api/club/', async () => {
      const response = await fetch(`${baseUrl}/api/clubs/${testClubId}`, {
        headers: {
          'x-current-club-id': testClubId.toString(),
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
    });

    it('should handle club-scoped player endpoints', async () => {
      const response = await fetch(`${baseUrl}/api/clubs/${testClubId}/players`, {
        headers: {
          'x-current-club-id': testClubId.toString(),
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle club-scoped team endpoints', async () => {
      const response = await fetch(`${baseUrl}/api/clubs/${testClubId}/teams`, {
        headers: {
          'x-current-club-id': testClubId.toString(),
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle club-scoped game endpoints', async () => {
      const response = await fetch(`${baseUrl}/api/clubs/${testClubId}/games`, {
        headers: {
          'x-current-club-id': testClubId.toString(),
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Team Endpoints', () => {
    it('should use plural /api/teams/ instead of /api/team/', async () => {
      const response = await fetch(`${baseUrl}/api/teams`, {
        headers: {
          'x-current-club-id': testClubId.toString(),
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Player Endpoints', () => {
    it('should use plural /api/players/ instead of /api/player/', async () => {
      const response = await fetch(`${baseUrl}/api/players`, {
        headers: {
          'x-current-club-id': testClubId.toString(),
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Game Endpoints', () => {
    it('should use plural /api/games/ instead of /api/game/', async () => {
      const response = await fetch(`${baseUrl}/api/games`, {
        headers: {
          'x-current-club-id': testClubId.toString(),
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Season Endpoints', () => {
    it('should use plural /api/seasons/ instead of /api/season/', async () => {
      const response = await fetch(`${baseUrl}/api/seasons`, {
        headers: {
          'x-current-club-id': testClubId.toString(),
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Section Endpoints', () => {
    it('should use plural /api/sections/ instead of /api/section/', async () => {
      const response = await fetch(`${baseUrl}/api/seasons/1/sections`, {
        headers: {
          'x-current-club-id': testClubId.toString(),
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
}); 