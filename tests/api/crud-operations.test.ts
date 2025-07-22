import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../server/index';
import { TestDataManager } from '../helpers/test-data-manager';

/**
 * Clean CRUD operation tests using TestDataManager
 * Each test suite is isolated and cleans up after itself
 */

describe('CRUD Operations with Auto-Cleanup', () => {
  let testManager: TestDataManager;

  beforeEach(() => {
    testManager = new TestDataManager();
  });

  afterEach(async () => {
    await testManager.cleanup();
  });

  describe('Club Management', () => {
    it('should perform complete club lifecycle', async () => {
      // Create
      const club = await testManager.createTestClub({
        name: 'Lifecycle Test Club',
        code: 'LTC001'
      });

      expect(club).toHaveProperty('id');
      expect(club.name).toBe('Lifecycle Test Club');
      expect(club.code).toBe('LTC001');

      // Read
      const readResponse = await request(app)
        .get(`/api/clubs/${club.id}`)
        .expect(200);

      // Club might be wrapped in data property or directly returned
      const clubData = readResponse.body.data || readResponse.body;
      expect(clubData.id).toBe(club.id);
      expect(clubData.name).toBe('Lifecycle Test Club');

      // Update
      const updateResponse = await request(app)
        .patch(`/api/clubs/${club.id}`)
        .send({
          name: 'Updated Lifecycle Club',
          code: club.code, // Include the existing code
          address: 'New Address'
        })
        .expect(200);

      expect(updateResponse.body.name).toBe('Updated Lifecycle Club');
      expect(updateResponse.body.address).toBe('New Address');

      // Verify update persisted
      const verifyResponse = await request(app)
        .get(`/api/clubs/${club.id}`)
        .expect(200);

      expect(verifyResponse.body.name).toBe('Updated Lifecycle Club');
    });

    it('should handle club validation errors', async () => {
      // Missing required fields
      const response = await request(app)
        .post('/api/clubs')
        .send({})
        .expect(400);

      // Accept either error or message property in error responses
      expect(response.body).toSatisfy(body => body.hasOwnProperty('error') || body.hasOwnProperty('message'));
    });

    it('should prevent duplicate club codes', async () => {
      // Create first club
      await testManager.createTestClub({
        name: 'First Club',
        code: 'UNIQUE001'
      });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/clubs')
        .send({
          name: 'Second Club',
          code: 'UNIQUE001', // Same code
          address: '123 Test St'
        })
        .expect(409);

      // Accept either error or message property in error responses
      expect(response.body).toSatisfy(body => body.hasOwnProperty('error') || body.hasOwnProperty('message'));
    });
  });

  describe('Player Management', () => {
    it('should perform complete player lifecycle', async () => {
      // Setup: Create club first
      const club = await testManager.createTestClub();

      // Create player
      const player = await testManager.createTestPlayer(club.id, {
        display_name: 'Lifecycle Player',
        first_name: 'Life',
        last_name: 'Cycle',
        position_preferences: ['GS', 'GA']
      });

      expect(player).toHaveProperty('id');
      expect(player.display_name).toBe('Lifecycle Player');
      expect(player.position_preferences).toEqual(['GS', 'GA']);

      // Read
      const readResponse = await request(app)
        .get(`/api/players/${player.id}`)
        .expect(200);

      expect(readResponse.body.data.id).toBe(player.id);
      expect(readResponse.body.data.display_name).toBe('Lifecycle Player');

      // Update
      const updateResponse = await request(app)
        .patch(`/api/players/${player.id}`)
        .send({
          display_name: 'Updated Player',
          position_preferences: ['C', 'WA'],
          active: false
        })
        .expect(200);

      expect(updateResponse.body.data.display_name).toBe('Updated Player');
      expect(updateResponse.body.data.position_preferences).toEqual(['C', 'WA']);
      expect(updateResponse.body.data.active).toBe(false);

      // Verify in club players list
      const clubPlayersResponse = await request(app)
        .get(`/api/clubs/${club.id}/players`)
        .expect(200);

      // Handle both direct array and wrapped response formats
      const playersData = clubPlayersResponse.body.data || clubPlayersResponse.body;
      const ourPlayer = playersData.find((p: any) => p.id === player.id);
      expect(ourPlayer).toBeDefined();
      expect(ourPlayer.displayName || ourPlayer.display_name).toBe('Updated Player');
    });

    it('should handle invalid position preferences', async () => {
      const club = await testManager.createTestClub();

      const response = await request(app)
        .post('/api/players')
        .set('x-current-club-id', club.id.toString())
        .send({
          display_name: 'Invalid Player',
          first_name: 'Invalid',
          last_name: 'Player',
          position_preferences: ['INVALID_POSITION'], // Invalid position
          active: true
        })
        .expect(400);

      // Accept either error or message property in error responses
      expect(response.body).toSatisfy(body => body.hasOwnProperty('error') || body.hasOwnProperty('message'));
    });
  });

  describe('Team Management', () => {
    it('should perform complete team lifecycle', async () => {
      // Setup: Create club and season
      const club = await testManager.createTestClub();
      const season = await testManager.getOrCreateTestSeason();

      // Create team
      const team = await testManager.createTestTeam(club.id, season.id, {
        name: 'Lifecycle Team',
        division: 'A Grade'
      });

      expect(team).toHaveProperty('id');
      expect(team.name).toBe('Lifecycle Team');
      expect(team.division).toBe('A Grade');
      expect(team.clubId).toBe(club.id);

      // Read
      const readResponse = await request(app)
        .get(`/api/teams/${team.id}`)
        .expect(200);

      expect(readResponse.body.data.id).toBe(team.id);
      expect(readResponse.body.data.name).toBe('Lifecycle Team');

      // Update
      const updateResponse = await request(app)
        .patch(`/api/teams/${team.id}`)
        .send({
          name: 'Updated Team',
          division: 'B Grade'
        })
        .expect(200);

      expect(updateResponse.body.data.name).toBe('Updated Team');
      expect(updateResponse.body.data.division).toBe('B Grade');

      // Verify in club teams list
      const clubTeamsResponse = await request(app)
        .get(`/api/clubs/${club.id}/teams`)
        .expect(200);

      // Handle both direct array and wrapped response formats
      const teamsData = clubTeamsResponse.body.data || clubTeamsResponse.body;
      const ourTeam = teamsData.find((t: any) => t.id === team.id);
      expect(ourTeam).toBeDefined();
      expect(ourTeam.name).toBe('Updated Team');
    });
  });

  describe('Game Management', () => {
    it('should perform complete game lifecycle', async () => {
      // Setup: Create ecosystem
      const { club, team, season } = await testManager.createTestEcosystem();

      // Create game
      const game = await testManager.createTestGame(team.id, season.id, {
        venue: 'Lifecycle Venue',
        round: 'Test Round 1'
      });

      expect(game).toHaveProperty('id');
      expect(game.venue).toBe('Lifecycle Venue');
      expect(game.round).toBe('Test Round 1');

      // Read
      const readResponse = await request(app)
        .get(`/api/games/${game.id}`)
        .expect(200);

      expect(readResponse.body.data.id).toBe(game.id);
      expect(readResponse.body.data.venue).toBe('Lifecycle Venue');

      // Update
      const updateResponse = await request(app)
        .patch(`/api/games/${game.id}`)
        .send({
          venue: 'Updated Venue',
          round: 'Updated Round'
        })
        .expect(200);

      expect(updateResponse.body.data.venue).toBe('Updated Venue');
      expect(updateResponse.body.data.round).toBe('Updated Round');

      // Verify in team games list
      const teamGamesResponse = await request(app)
        .get(`/api/teams/${team.id}/games`)
        .expect(200);

      const ourGame = teamGamesResponse.body.find((g: any) => g.id === game.id);
      expect(ourGame).toBeDefined();
    });
  });

  describe('Game Stats Management', () => {
    it('should perform complete game stats lifecycle', async () => {
      // Setup: Create full ecosystem
      const { club, team, player, game, season } = await testManager.createTestEcosystem();

      // Create game stats
      const stats = await testManager.createTestGameStats(game.id, team.id, player.id, {
        position: 'GS',
        quarter: 1,
        goalsFor: 10,
        goalsAgainst: 0,
        rating: 9
      });

      expect(stats).toHaveProperty('id');
      expect(stats.goalsFor).toBe(10);
      expect(stats.rating).toBe(9);

      // Read game stats
      const readResponse = await request(app)
        .get(`/api/games/${game.id}/stats`)
        .expect(200);

      const ourStats = readResponse.body.data.find((s: any) => s.id === stats.id);
      expect(ourStats).toBeDefined();
      expect(ourStats.goalsFor).toBe(10);

      // Update stats
      const updateResponse = await request(app)
        .patch(`/api/games/${game.id}/stats/${stats.id}`)
        .send({
          goalsFor: 15,
          missedGoals: 2,
          rating: 8
        })
        .expect(200);

      expect(updateResponse.body.data.goalsFor).toBe(15);
      expect(updateResponse.body.data.missedGoals).toBe(2);
      expect(updateResponse.body.data.rating).toBe(8);
    });
  });

  describe('Integrated Ecosystem Tests', () => {
    it('should create and manage a complete netball ecosystem', async () => {
      // Create full ecosystem
      const ecosystem = await testManager.createTestEcosystem();
      const { club, team, player, game, season } = ecosystem;

      // Verify all relationships
      expect(club.id).toBeDefined();
      expect(team.clubId).toBe(club.id);
      expect(game.homeTeamId).toBe(team.id);
      expect(game.seasonId).toBe(season.id);

      // Test club -> teams relationship
      const clubTeamsResponse = await request(app)
        .get(`/api/clubs/${club.id}/teams`)
        .expect(200);

      // Handle both direct array and wrapped response formats
      const teamsData = clubTeamsResponse.body.data || clubTeamsResponse.body;
      const clubTeam = teamsData.find((t: any) => t.id === team.id);
      expect(clubTeam).toBeDefined();

      // Test club -> players relationship
      const clubPlayersResponse = await request(app)
        .get(`/api/clubs/${club.id}/players`)
        .expect(200);

      const clubPlayer = clubPlayersResponse.body.find((p: any) => p.id === player.id);
      expect(clubPlayer).toBeDefined();

      // Test team -> games relationship
      const teamGamesResponse = await request(app)
        .get(`/api/teams/${team.id}/games`)
        .expect(200);

      const teamGame = teamGamesResponse.body.find((g: any) => g.id === game.id);
      expect(teamGame).toBeDefined();

      // Create roster entry
      const roster = await testManager.createTestRoster(game.id, player.id, {
        position: 'GS',
        quarter: 1
      });

      expect(roster).toHaveProperty('id');
      expect(roster.gameId).toBe(game.id);
      expect(roster.playerId).toBe(player.id);

      // Create game stats
      const stats = await testManager.createTestGameStats(game.id, team.id, player.id, {
        position: 'GS',
        quarter: 1,
        goalsFor: 12,
        rating: 9
      });

      expect(stats).toHaveProperty('id');
      expect(stats.goalsFor).toBe(12);

      // Verify complete game data
      const gameStatsResponse = await request(app)
        .get(`/api/games/${game.id}/stats`)
        .expect(200);

      expect(gameStatsResponse.body.data).toHaveLength(1);
      expect(gameStatsResponse.body.data[0].goalsFor).toBe(12);

      console.log('✅ Complete ecosystem test passed');
    });

    it('should handle cascade operations correctly', async () => {
      // Create ecosystem
      const { club, team, player, game } = await testManager.createTestEcosystem();

      // Create dependent data
      await testManager.createTestGameStats(game.id, team.id, player.id);
      await testManager.createTestRoster(game.id, player.id);

      // Verify data exists
      const statsResponse = await request(app)
        .get(`/api/games/${game.id}/stats`)
        .expect(200);

      expect(statsResponse.body.data.length).toBeGreaterThan(0);

      // Test will automatically cleanup via testManager.cleanup()
      // This tests that cleanup handles dependencies correctly
    });
  });

  describe('Performance and Load Tests', () => {
    it('should handle multiple concurrent operations', async () => {
      const startTime = Date.now();

      // Create multiple clubs concurrently with unique timestamps
      const baseTimestamp = Date.now();
      const clubPromises = Array.from({ length: 5 }, (_, i) =>
        testManager.createTestClub({
          name: `Concurrent Club ${i}-${baseTimestamp + i}`,
          code: `CC${i}${baseTimestamp + i}`
        })
      );

      const clubs = await Promise.all(clubPromises);
      expect(clubs).toHaveLength(5);

      // Create players for each club concurrently
      const playerPromises = clubs.map((club, i) =>
        testManager.createTestPlayer(club.id, {
          display_name: `Concurrent Player ${i}`
        })
      );

      const players = await Promise.all(playerPromises);
      expect(players).toHaveLength(5);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ Created 5 clubs and 5 players in ${duration}ms`);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle bulk data operations efficiently', async () => {
      const { club, team, season } = await testManager.createTestEcosystem();

      const startTime = Date.now();

      // Create multiple players
      const playerPromises = Array.from({ length: 10 }, (_, i) =>
        testManager.createTestPlayer(club.id, {
          display_name: `Bulk Player ${i}`,
          first_name: `Bulk${i}`,
          last_name: `Player${i}`
        })
      );

      const players = await Promise.all(playerPromises);

      // Create multiple games
      const gamePromises = Array.from({ length: 5 }, (_, i) =>
        testManager.createTestGame(team.id, season.id, {
          venue: `Bulk Venue ${i}`,
          round: `Bulk Round ${i}`
        })
      );

      const games = await Promise.all(gamePromises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ Created 10 players and 5 games in ${duration}ms`);
      expect(players).toHaveLength(10);
      expect(games).toHaveLength(5);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});