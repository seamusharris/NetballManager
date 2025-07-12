import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { db } from '@server/db';

// Import your app setup
let app: express.Application;

describe('API Pluralization Tests', () => {
  beforeAll(async () => {
    // Setup test app
    app = express();
    // Import and setup your routes here
    // This will be implemented once we have the app properly exported
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('Club Endpoints', () => {
    it('should use plural /api/clubs/ instead of /api/club/', async () => {
      // Test that new plural endpoints work
      const pluralResponse = await request(app)
        .get('/api/clubs/1')
        .expect(200);
      
      expect(pluralResponse.body).toHaveProperty('id');
      expect(pluralResponse.body).toHaveProperty('name');
    });

    it('should handle club-scoped player endpoints', async () => {
      const response = await request(app)
        .get('/api/clubs/1/players')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should handle club-scoped team endpoints', async () => {
      const response = await request(app)
        .get('/api/clubs/1/teams')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should handle club-scoped game endpoints', async () => {
      const response = await request(app)
        .get('/api/clubs/1/games')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Team Endpoints', () => {
    it('should use plural /api/teams/ instead of /api/team/', async () => {
      const response = await request(app)
        .get('/api/teams')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Player Endpoints', () => {
    it('should use plural /api/players/ instead of /api/player/', async () => {
      const response = await request(app)
        .get('/api/players')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Game Endpoints', () => {
    it('should use plural /api/games/ instead of /api/game/', async () => {
      const response = await request(app)
        .get('/api/games')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Season Endpoints', () => {
    it('should use plural /api/seasons/ instead of /api/season/', async () => {
      const response = await request(app)
        .get('/api/seasons')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Section Endpoints', () => {
    it('should use plural /api/sections/ instead of /api/section/', async () => {
      const response = await request(app)
        .get('/api/seasons/1/sections')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
    });
  });
}); 