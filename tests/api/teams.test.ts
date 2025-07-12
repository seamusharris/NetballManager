import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server/index'; // Adjust path if needed

// Use a real clubId from your test DB (Warrandyte Netball Club)
const clubId = 54;
let createdTeamId: number;

// Sample team data
const newTeam = {
  name: 'Test Team',
  division: 'A',
  sectionId: 1
};

const updatedTeam = {
  name: 'Updated Test Team'
};

describe('Teams API', () => {
  it('should list all teams for a club', async () => {
    const res = await request(app)
      .get(`/api/clubs/${clubId}/teams`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new team', async () => {
    const res = await request(app)
      .post(`/api/clubs/${clubId}/teams`)
      .send(newTeam)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(newTeam.name);
    createdTeamId = res.body.id;
  });

  it('should update a team', async () => {
    const res = await request(app)
      .patch(`/api/teams/${createdTeamId}`)
      .send(updatedTeam)
      .expect(200);
    expect(res.body.name).toBe(updatedTeam.name);
  });

  it('should delete a team', async () => {
    await request(app)
      .delete(`/api/teams/${createdTeamId}`)
      .expect(204);
  });

  it('should return 404 for non-existent team', async () => {
    await request(app)
      .get(`/api/teams/999999`)
      .expect(404);
  });

  it.skip('should return 403 if user lacks permission', async () => {
    // Simulate a user without canManageTeams
    // This may require mocking auth or using a test user
    // Example:
    // await request(app)
    //   .post(`/api/clubs/${clubId}/teams`)
    //   .set('Authorization', 'Bearer no-permission-token')
    //   .send({ name: 'NoPerm Team' })
    //   .expect(403);
  });
}); 