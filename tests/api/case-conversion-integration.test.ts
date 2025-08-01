import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server/index';

/**
 * Case Conversion Integration Tests
 * 
 * Tests the case conversion system with a real database connection
 * Focuses on the most critical endpoints to verify end-to-end functionality
 */

describe('Case Conversion Integration Tests', () => {
  let server: any;
  const testData: { clubs: number[], players: number[], teams: number[], games: number[] } = {
    clubs: [],
    players: [],
    teams: [],
    games: []
  };

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    
    // Clean up in reverse dependency order
    for (const gameId of testData.games) {
      try {
        await request(app).delete(`/api/games/${gameId}`);
      } catch (error) {
        console.warn(`Failed to cleanup game ${gameId}`);
      }
    }

    for (const teamId of testData.teams) {
      try {
        await request(app).delete(`/api/teams/${teamId}`);
      } catch (error) {
        console.warn(`Failed to cleanup team ${teamId}`);
      }
    }

    for (const playerId of testData.players) {
      try {
        await request(app).delete(`/api/players/${playerId}`);
      } catch (error) {
        console.warn(`Failed to cleanup player ${playerId}`);
      }
    }

    for (const clubId of testData.clubs) {
      try {
        await request(app).delete(`/api/clubs/${clubId}`);
      } catch (error) {
        console.warn(`Failed to cleanup club ${clubId}`);
      }
    }

    if (server) {
      server.close();
    }
  });

  describe('Core Case Conversion Flow', () => {
    it('should handle club creation with camelCase input and return camelCase response', async () => {
      const clubData = {
        name: `Integration Test Club ${Date.now()}`,
        code: `ITC${Date.now()}`,
        address: '123 Integration Test Street',
        contactEmail: 'integration@test.com',
        isActive: true
      };

      const response = await request(app)
        .post('/api/clubs')
        .send(clubData)
        .expect(201);

      // Verify response is in camelCase
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(clubData.name);
      expect(response.body.code).toBe(clubData.code);
      expect(response.body.isActive).toBe(true);
      expect(response.body.contactEmail).toBe(clubData.contactEmail);

      // Verify NO snake_case fields in response
      expect(response.body).not.toHaveProperty('is_active');
      expect(response.body).not.toHaveProperty('contact_info');

      testData.clubs.push(response.body.id);
      console.log(`✅ Created test club ${response.body.id}`);
    });

    it('should handle player creation with complex camelCase fields', async () => {
      // Use the club we just created
      const clubId = testData.clubs[0];

      const playerData = {
        displayName: `Integration Test Player ${Date.now()}`,
        firstName: 'Integration',
        lastName: 'Test',
        dateOfBirth: '1995-01-01',
        positionPreferences: ['GS', 'GA'],
        avatarColor: '#FF5733',
        isActive: true
      };

      const response = await request(app)
        .post('/api/players')
        .set('x-current-club-id', clubId.toString())
        .send(playerData)
        .expect(201);

      // Verify response is in camelCase
      expect(response.body.displayName).toBe(playerData.displayName);
      expect(response.body.firstName).toBe(playerData.firstName);
      expect(response.body.lastName).toBe(playerData.lastName);
      expect(response.body.dateOfBirth).toBe(playerData.dateOfBirth);
      expect(response.body.positionPreferences).toEqual(playerData.positionPreferences);
      expect(response.body.avatarColor).toBe(playerData.avatarColor);
      expect(response.body.isActive).toBe(true);

      // Verify NO snake_case fields
      expect(response.body).not.toHaveProperty('display_name');
      expect(response.body).not.toHaveProperty('first_name');
      expect(response.body).not.toHaveProperty('last_name');
      expect(response.body).not.toHaveProperty('date_of_birth');
      expect(response.body).not.toHaveProperty('position_preferences');
      expect(response.body).not.toHaveProperty('avatar_color');
      expect(response.body).not.toHaveProperty('is_active');

      testData.players.push(response.body.id);
      console.log(`✅ Created test player ${response.body.id}`);
    });

    it('should handle team creation with field mappings', async () => {
      const clubId = testData.clubs[0];

      // Get or create a season
      let seasonId = 1; // Default fallback
      try {
        const seasonResponse = await request(app).get('/api/seasons/active');
        if (seasonResponse.body && seasonResponse.body.id) {
          seasonId = seasonResponse.body.id;
        }
      } catch (error) {
        console.log('Using default season ID');
      }

      const teamData = {
        name: `Integration Test Team ${Date.now()}`,
        clubId: clubId,
        seasonId: seasonId,
        divisionId: null,
        isActive: true
      };

      const response = await request(app)
        .post('/api/teams')
        .send(teamData)
        .expect(201);

      // Verify response is in camelCase
      expect(response.body.name).toBe(teamData.name);
      expect(response.body.clubId).toBe(clubId);
      expect(response.body.seasonId).toBe(seasonId);
      expect(response.body.isActive).toBe(true);

      // Verify NO snake_case fields
      expect(response.body).not.toHaveProperty('club_id');
      expect(response.body).not.toHaveProperty('season_id');
      expect(response.body).not.toHaveProperty('division_id');
      expect(response.body).not.toHaveProperty('is_active');

      testData.teams.push(response.body.id);
      console.log(`✅ Created test team ${response.body.id}`);
    });

    it('should handle critical field mappings for team-player assignment', async () => {
      const teamId = testData.teams[0];
      const playerId = testData.players[0];

      const assignmentData = {
        playerId: playerId,
        isRegular: true
      };

      const response = await request(app)
        .post(`/api/teams/${teamId}/players`)
        .send(assignmentData)
        .expect(201);

      // Verify response is in camelCase
      expect(response.body.playerId).toBe(playerId);
      expect(response.body.isRegular).toBe(true);

      // Verify NO snake_case fields
      expect(response.body).not.toHaveProperty('player_id');
      expect(response.body).not.toHaveProperty('is_regular');

      console.log(`✅ Assigned player ${playerId} to team ${teamId}`);
    });

    it('should handle game creation with multiple ID fields', async () => {
      const teamId = testData.teams[0];
      const clubId = testData.clubs[0];

      // Create a second team for away team
      const awayTeamData = {
        name: `Away Team ${Date.now()}`,
        clubId: clubId,
        seasonId: 1,
        isActive: true
      };

      const awayTeamResponse = await request(app)
        .post('/api/teams')
        .send(awayTeamData)
        .expect(201);

      const awayTeamId = awayTeamResponse.body.id;
      testData.teams.push(awayTeamId);

      const gameData = {
        date: '2025-07-20',
        time: '10:00',
        homeTeamId: teamId,
        awayTeamId: awayTeamId,
        venue: 'Integration Test Venue',
        round: 'Integration Test Round',
        seasonId: 1,
        statusId: 1,
        isInterClub: false
      };

      const response = await request(app)
        .post('/api/games')
        .send(gameData)
        .expect(201);

      // Verify response is in camelCase
      expect(response.body.homeTeamId).toBe(teamId);
      expect(response.body.awayTeamId).toBe(awayTeamId);
      expect(response.body.seasonId).toBe(1);
      expect(response.body.statusId).toBe(1);
      expect(response.body.isInterClub).toBe(false);

      // Verify NO snake_case fields
      expect(response.body).not.toHaveProperty('home_team_id');
      expect(response.body).not.toHaveProperty('away_team_id');
      expect(response.body).not.toHaveProperty('season_id');
      expect(response.body).not.toHaveProperty('status_id');

      testData.games.push(response.body.id);
      console.log(`✅ Created test game ${response.body.id}`);
    });
  });

  describe('Batch Endpoint Protection', () => {
    it('should NOT convert batch stats requests (performance protection)', async () => {
      const gameId = testData.games[0];

      const batchData = {
        gameIds: [gameId] // This should stay as camelCase
      };

      const response = await request(app)
        .post('/api/games/stats/batch')
        .send(batchData)
        .expect(200);

      // Should return data without errors
      expect(response.body).toBeDefined();
      console.log(`✅ Batch stats endpoint protected from conversion`);
    });

    it('should NOT convert batch scores requests (performance protection)', async () => {
      const gameId = testData.games[0];

      const batchData = {
        gameIds: [gameId] // This should stay as camelCase
      };

      const response = await request(app)
        .post('/api/games/scores/batch')
        .send(batchData)
        .expect(200);

      // Should return data without errors
      expect(response.body).toBeDefined();
      console.log(`✅ Batch scores endpoint protected from conversion`);
    });
  });

  describe('Data Integrity Verification', () => {
    it('should verify data was stored correctly in database', async () => {
      const clubId = testData.clubs[0];
      const playerId = testData.players[0];
      const teamId = testData.teams[0];

      // Fetch the club back and verify data integrity
      const clubResponse = await request(app)
        .get(`/api/clubs/${clubId}`)
        .expect(200);

      expect(clubResponse.body.id).toBe(clubId);
      expect(clubResponse.body.name).toContain('Integration Test Club');
      expect(clubResponse.body.isActive).toBe(true);

      // Fetch the player back
      const playerResponse = await request(app)
        .get(`/api/players/${playerId}`)
        .expect(200);

      expect(playerResponse.body.id).toBe(playerId);
      expect(playerResponse.body.displayName).toContain('Integration Test Player');
      expect(playerResponse.body.positionPreferences).toEqual(['GS', 'GA']);

      // Fetch the team back
      const teamResponse = await request(app)
        .get(`/api/teams/${teamId}`)
        .expect(200);

      expect(teamResponse.body.id).toBe(teamId);
      expect(teamResponse.body.name).toContain('Integration Test Team');
      expect(teamResponse.body.clubId).toBe(clubId);

      console.log(`✅ Data integrity verified - all entities stored and retrieved correctly`);
    });

    it('should handle updates with camelCase input', async () => {
      const clubId = testData.clubs[0];

      const updateData = {
        name: `Updated Integration Test Club ${Date.now()}`,
        isActive: false,
        contactInfo: 'updated@integration.test'
      };

      const response = await request(app)
        .patch(`/api/clubs/${clubId}`)
        .send(updateData)
        .expect(200);

      // Verify response is in camelCase
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.isActive).toBe(false);
      expect(response.body.contactInfo).toBe(updateData.contactInfo);

      // Verify NO snake_case fields
      expect(response.body).not.toHaveProperty('is_active');
      expect(response.body).not.toHaveProperty('contact_info');

      console.log(`✅ Update operations work correctly with case conversion`);
    });
  });

  describe('Performance Validation', () => {
    it('should complete case conversion operations within reasonable time', async () => {
      const startTime = Date.now();

      // Perform multiple operations to test performance
      const operations = [
        request(app).get(`/api/clubs/${testData.clubs[0]}`),
        request(app).get(`/api/players/${testData.players[0]}`),
        request(app).get(`/api/teams/${testData.teams[0]}`),
        request(app).get(`/api/games/${testData.games[0]}`)
      ];

      const responses = await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All operations should complete successfully
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
      });

      // Should complete within reasonable time (less than 2 seconds for 4 operations)
      expect(duration).toBeLessThan(2000);

      console.log(`✅ Performance test passed: ${operations.length} operations in ${duration}ms`);
    });
  });
});