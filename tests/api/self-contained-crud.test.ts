import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server/index';

/**
 * Self-contained CRUD tests that clean up after themselves
 * Tests the full lifecycle: Create → Read → Update → Delete
 */

describe('Self-Contained CRUD Tests', () => {
  let server: any;
  
  // Test data containers - will store IDs for cleanup
  const testData = {
    clubs: [] as number[],
    players: [] as number[],
    teams: [] as number[],
    games: [] as number[]
  };

  beforeAll(async () => {
    // Start test server
    server = app.listen(0); // Use random port
  });

  afterAll(async () => {
    // Cleanup all test data in reverse dependency order
    console.log('🧹 Cleaning up test data...');
    
    // Clean up games first (depend on teams)
    for (const gameId of testData.games) {
      try {
        await request(app).delete(`/api/games/${gameId}`);
        console.log(`✅ Cleaned up game ${gameId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup game ${gameId}:`, error);
      }
    }

    // Clean up teams (depend on clubs)
    for (const teamId of testData.teams) {
      try {
        await request(app).delete(`/api/teams/${teamId}`);
        console.log(`✅ Cleaned up team ${teamId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup team ${teamId}:`, error);
      }
    }

    // Clean up players (depend on clubs)
    for (const playerId of testData.players) {
      try {
        await request(app).delete(`/api/players/${playerId}`);
        console.log(`✅ Cleaned up player ${playerId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup player ${playerId}:`, error);
      }
    }

    // Clean up clubs last
    for (const clubId of testData.clubs) {
      try {
        await request(app).delete(`/api/clubs/${clubId}`);
        console.log(`✅ Cleaned up club ${clubId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup club ${clubId}:`, error);
      }
    }

    // Close server
    if (server) {
      server.close();
    }
  });

  describe('Club CRUD Operations', () => {
    let clubId: number;

    it('should create a new club', async () => {
      const clubData = {
        name: `Test Club ${Date.now()}`,
        code: `TC${Date.now()}`,
        address: '123 Test Street, Test City',
        contactInfo: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/clubs')
        .send(clubData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(clubData.name);
      expect(response.body.code).toBe(clubData.code);

      clubId = response.body.id;
      testData.clubs.push(clubId);
      console.log(`📝 Created test club ${clubId}`);
    });

    it('should read the created club', async () => {
      const response = await request(app)
        .get(`/api/clubs/${clubId}`)
        .expect(200);

      expect(response.body.id).toBe(clubId);
      expect(response.body.name).toContain('Test Club');
    });

    it('should update the club', async () => {
      const updateData = {
        name: `Updated Test Club ${Date.now()}`,
        address: '456 Updated Street, Updated City'
      };

      const response = await request(app)
        .patch(`/api/clubs/${clubId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.address).toBe(updateData.address);
    });

    it('should list clubs including our test club', async () => {
      const response = await request(app)
        .get('/api/clubs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const ourClub = response.body.find((club: any) => club.id === clubId);
      expect(ourClub).toBeDefined();
    });
  });

  describe('Player CRUD Operations', () => {
    let clubId: number;
    let playerId: number;

    it('should create a club for player tests', async () => {
      const clubData = {
        name: `Player Test Club ${Date.now()}`,
        code: `PTC${Date.now()}`,
        address: '123 Player Test Street'
      };

      const response = await request(app)
        .post('/api/clubs')
        .send(clubData)
        .expect(201);

      clubId = response.body.id;
      testData.clubs.push(clubId);
      console.log(`📝 Created club ${clubId} for player tests`);
    });

    it('should create a new player', async () => {
      const playerData = {
        displayName: `Test Player ${Date.now()}`,
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: '1995-01-01',
        positionPreferences: ['GS', 'GA'],
        active: true
      };

      const response = await request(app)
        .post(`/api/clubs/${clubId}/players`)
        .send(playerData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.displayName).toBe(playerData.displayName);
      expect(response.body.positionPreferences).toEqual(playerData.positionPreferences);

      playerId = response.body.id;
      testData.players.push(playerId);
      console.log(`📝 Created test player ${playerId}`);
    });

    it('should read the created player', async () => {
      const response = await request(app)
        .get(`/api/players/${playerId}`)
        .expect(200);

      expect(response.body.id).toBe(playerId);
      expect(response.body.displayName).toContain('Test Player');
    });

    it('should update the player', async () => {
      const updateData = {
        displayName: `Updated Test Player ${Date.now()}`,
        positionPreferences: ['C', 'WA'],
        active: true
      };

      const response = await request(app)
        .patch(`/api/players/${playerId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.displayName).toBe(updateData.displayName);
      expect(response.body.positionPreferences).toEqual(updateData.positionPreferences);
    });

    it('should list club players including our test player', async () => {
      const response = await request(app)
        .get(`/api/clubs/${clubId}/players`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const ourPlayer = response.body.find((player: any) => player.id === playerId);
      expect(ourPlayer).toBeDefined();
    });
  });

  describe('Team CRUD Operations', () => {
    let clubId: number;
    let teamId: number;
    let seasonId: number;

    it('should create a club for team tests', async () => {
      const clubData = {
        name: `Team Test Club ${Date.now()}`,
        code: `TTC${Date.now()}`,
        address: '123 Team Test Street'
      };

      const response = await request(app)
        .post('/api/clubs')
        .send(clubData)
        .expect(201);

      clubId = response.body.id;
      testData.clubs.push(clubId);
      console.log(`📝 Created club ${clubId} for team tests`);
    });

    it('should get or create a season for team tests', async () => {
      // Try to get active season first
      let response = await request(app)
        .get('/api/seasons/active')
        .expect(200);

      if (response.body && response.body.id) {
        seasonId = response.body.id;
        console.log(`📝 Using existing season ${seasonId}`);
      } else {
        // Create a test season
        const seasonData = {
          name: `Test Season ${Date.now()}`,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          isActive: false, // Don't interfere with existing active season
          type: 'regular',
          year: 2025
        };

        response = await request(app)
          .post('/api/seasons')
          .send(seasonData)
          .expect(201);

        seasonId = response.body.id;
        console.log(`📝 Created test season ${seasonId}`);
      }
    });

    it('should create a new team', async () => {
      const teamData = {
        name: `Test Team ${Date.now()}`,
        clubId: clubId,
        seasonId: seasonId,
        division: 'A Grade'
      };

      const response = await request(app)
        .post('/api/teams')
        .send(teamData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(teamData.name);
      expect(response.body.clubId).toBe(clubId);

      teamId = response.body.id;
      testData.teams.push(teamId);
      console.log(`📝 Created test team ${teamId}`);
    });

    it('should read the created team', async () => {
      const response = await request(app)
        .get(`/api/teams/${teamId}`)
        .expect(200);

      expect(response.body.id).toBe(teamId);
      expect(response.body.name).toContain('Test Team');
    });

    it('should update the team', async () => {
      const updateData = {
        name: `Updated Test Team ${Date.now()}`,
        division: 'B Grade'
      };

      const response = await request(app)
        .patch(`/api/teams/${teamId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.division).toBe(updateData.division);
    });

    it('should list club teams including our test team', async () => {
      const response = await request(app)
        .get(`/api/clubs/${clubId}/teams`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const ourTeam = response.body.find((team: any) => team.id === teamId);
      expect(ourTeam).toBeDefined();
    });
  });

  describe('Integrated CRUD Operations', () => {
    let clubId: number;
    let playerId: number;
    let teamId: number;
    let gameId: number;
    let seasonId: number;

    it('should create a complete club ecosystem', async () => {
      // 1. Create Club
      const clubData = {
        name: `Integration Test Club ${Date.now()}`,
        code: `ITC${Date.now()}`,
        address: '123 Integration Street'
      };

      let response = await request(app)
        .post('/api/clubs')
        .send(clubData)
        .expect(201);

      clubId = response.body.id;
      testData.clubs.push(clubId);

      // 2. Get or create season
      response = await request(app)
        .get('/api/seasons/active')
        .expect(200);

      seasonId = response.body?.id || 1; // Fallback to season 1

      // 3. Create Team
      const teamData = {
        name: `Integration Test Team ${Date.now()}`,
        clubId: clubId,
        seasonId: seasonId,
        division: 'Test Division'
      };

      response = await request(app)
        .post('/api/teams')
        .send(teamData)
        .expect(201);

      teamId = response.body.id;
      testData.teams.push(teamId);

      // 4. Create Player
      const playerData = {
        displayName: `Integration Test Player ${Date.now()}`,
        firstName: 'Integration',
        lastName: 'Player',
        positionPreferences: ['GS'],
        active: true
      };

      response = await request(app)
        .post(`/api/clubs/${clubId}/players`)
        .send(playerData)
        .expect(201);

      playerId = response.body.id;
      testData.players.push(playerId);

      console.log(`📝 Created integrated ecosystem: Club ${clubId}, Team ${teamId}, Player ${playerId}`);
    });

    it('should create a game for the team', async () => {
      const gameData = {
        date: '2025-07-20',
        time: '10:00',
        homeTeamId: teamId,
        venue: 'Test Venue',
        round: 'Test Round',
        seasonId: seasonId,
        statusId: 1 // Assuming status 1 exists
      };

      const response = await request(app)
        .post('/api/games')
        .send(gameData)
        .expect(201);

      gameId = response.body.id;
      testData.games.push(gameId);
      console.log(`📝 Created test game ${gameId}`);
    });

    it('should verify all relationships work', async () => {
      // Verify club has team
      let response = await request(app)
        .get(`/api/clubs/${clubId}/teams`)
        .expect(200);

      const clubTeam = response.body.find((team: any) => team.id === teamId);
      expect(clubTeam).toBeDefined();

      // Verify club has player
      response = await request(app)
        .get(`/api/clubs/${clubId}/players`)
        .expect(200);

      const clubPlayer = response.body.find((player: any) => player.id === playerId);
      expect(clubPlayer).toBeDefined();

      // Verify team has games
      response = await request(app)
        .get(`/api/teams/${teamId}/games`)
        .expect(200);

      const teamGame = response.body.find((game: any) => game.id === gameId);
      expect(teamGame).toBeDefined();
    });

    it('should update all entities successfully', async () => {
      // Update club
      await request(app)
        .patch(`/api/clubs/${clubId}`)
        .send({ name: `Updated Integration Club ${Date.now()}` })
        .expect(200);

      // Update team
      await request(app)
        .patch(`/api/teams/${teamId}`)
        .send({ name: `Updated Integration Team ${Date.now()}` })
        .expect(200);

      // Update player
      await request(app)
        .patch(`/api/players/${playerId}`)
        .send({ displayName: `Updated Integration Player ${Date.now()}` })
        .expect(200);

      // Update game
      await request(app)
        .patch(`/api/games/${gameId}`)
        .send({ venue: 'Updated Test Venue' })
        .expect(200);

      console.log('✅ All entities updated successfully');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle non-existent resource gracefully', async () => {
      const response = await request(app)
        .get('/api/clubs/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/clubs')
        .send({}) // Empty data
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle duplicate club codes', async () => {
      const clubData = {
        name: `Duplicate Test Club ${Date.now()}`,
        code: 'DUPLICATE_TEST',
        address: '123 Test Street'
      };

      // Create first club
      const response1 = await request(app)
        .post('/api/clubs')
        .send(clubData)
        .expect(201);

      testData.clubs.push(response1.body.id);

      // Try to create duplicate
      const response2 = await request(app)
        .post('/api/clubs')
        .send(clubData)
        .expect(409); // Conflict

      expect(response2.body).toHaveProperty('error');
    });
  });
});