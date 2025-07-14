import request from 'supertest';
import app from '../../server/index';

describe('Batch Scores API Integration', () => {
  const clubId = 54;
  const validGameIds = [91, 92]; // Use real test IDs from your DB/fixtures

  it('should accept camelCase gameIds and return scores', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId}/games/scores/batch`)
      .send({ gameIds: validGameIds })
      .set('Content-Type', 'application/json')
      .set('x-current-club-id', String(clubId));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(String(validGameIds[0]));
    expect(Array.isArray(res.body[String(validGameIds[0])])).toBe(true);
  });

  it('should reject snake_case game_ids with 400', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId}/games/scores/batch`)
      .send({ game_ids: validGameIds })
      .set('Content-Type', 'application/json')
      .set('x-current-club-id', String(clubId));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/gameIds array is required/i);
  });
}); 