import { describe, it, expect } from 'vitest';

const baseUrl = 'http://localhost:3000';
const testClubId = 54; // Example club ID

// Only test safe endpoints (GET, POST, PATCH). Do not run DELETEs.
describe('Teams API (Safe Methods Only)', () => {
  it('should return teams for a club', async () => {
    const res = await fetch(`${baseUrl}/api/clubs/${testClubId}/teams`, {
      headers: { 'x-current-club-id': testClubId.toString() }
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  // Example: Test POST (if you want to test creation, use a test club or mock data)
  // it('should create a new team (SKIPPED: avoid data changes)', async () => {
  //   const res = await fetch(`${baseUrl}/api/clubs/${testClubId}/teams`, {
  //     method: 'POST',
  //     headers: {
  //       'x-current-club-id': testClubId.toString(),
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ name: 'Test Team', division: 'Test Division' })
  //   });
  //   expect(res.status).toBe(201);
  // });

  // Do NOT run DELETE tests in this suite.
  // it('should delete a team (SKIPPED: destructive)', async () => {
  //   // Skipped to avoid accidental data loss
  // });
}); 