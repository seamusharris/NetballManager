import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server/index';

/**
 * Integration tests for standardized API response formats
 * Tests that migrated endpoints return consistent response structures
 */

describe('Standardized API Response Format Integration', () => {
  let server: any;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Seasons Endpoints (Migrated)', () => {
    it('GET /api/seasons should return standardized array response', async () => {
      const response = await request(app)
        .get('/api/seasons')
        .expect(200);

      // Check standardized response structure
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('success', true);
      
      // Check meta properties
      expect(response.body.meta).toHaveProperty('timestamp');
      expect(response.body.meta).toHaveProperty('count');
      expect(typeof response.body.meta.timestamp).toBe('string');
      expect(typeof response.body.meta.count).toBe('number');
      
      // Data should be an array
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.count).toBe(response.body.data.length);
    });

    it('GET /api/seasons/active should return standardized object response', async () => {
      const response = await request(app)
        .get('/api/seasons/active');

      if (response.status === 200) {
        // Success case - should have standardized structure
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');
        expect(response.body).toHaveProperty('success', true);
        
        expect(response.body.meta).toHaveProperty('timestamp');
        expect(typeof response.body.meta.timestamp).toBe('string');
        
        // Data should be an object (not array)
        expect(typeof response.body.data).toBe('object');
        expect(Array.isArray(response.body.data)).toBe(false);
      } else if (response.status === 404) {
        // Not found case - should have standardized error structure
        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('meta');
        expect(response.body).toHaveProperty('success', false);
        
        expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
        expect(response.body.error).toHaveProperty('message');
        expect(response.body.meta).toHaveProperty('timestamp');
      }
    });

    it('GET /api/seasons/:id should return standardized response for valid ID', async () => {
      // First get all seasons to find a valid ID
      const seasonsResponse = await request(app)
        .get('/api/seasons')
        .expect(200);

      if (seasonsResponse.body.data.length > 0) {
        const validId = seasonsResponse.body.data[0].id;
        
        const response = await request(app)
          .get(`/api/seasons/${validId}`)
          .expect(200);

        // Check standardized response structure
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');
        expect(response.body).toHaveProperty('success', true);
        
        expect(response.body.meta).toHaveProperty('timestamp');
        expect(typeof response.body.data).toBe('object');
        expect(response.body.data.id).toBe(validId);
      }
    });

    it('GET /api/seasons/:id should return standardized error for invalid ID', async () => {
      const response = await request(app)
        .get('/api/seasons/99999')
        .expect(404);

      // Check standardized error response structure
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('success', false);
      
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message', 'Season not found');
      expect(response.body.meta).toHaveProperty('timestamp');
    });
  });

  describe('Response Format Validation', () => {
    it('should have consistent timestamp format across endpoints', async () => {
      const responses = await Promise.all([
        request(app).get('/api/seasons'),
        request(app).get('/api/seasons/active'),
      ]);

      responses.forEach(response => {
        if (response.body.meta?.timestamp) {
          // Should be valid ISO date string
          expect(() => new Date(response.body.meta.timestamp)).not.toThrow();
          expect(response.body.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        }
      });
    });

    it('should have consistent success/error structure', async () => {
      // Test success response
      const successResponse = await request(app).get('/api/seasons');
      expect(typeof successResponse.body.success).toBe('boolean');
      
      // Test error response
      const errorResponse = await request(app).get('/api/seasons/99999');
      expect(typeof errorResponse.body.success).toBe('boolean');
      expect(errorResponse.body.success).toBe(false);
    });
  });
});