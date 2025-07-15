/**
 * Self-Contained CRUD Tests
 * These tests create their own data and clean up after themselves
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestDataManager } from '../helpers/test-data-manager';

describe('Self-Contained CRUD Tests', () => {
  let testDataManager: TestDataManager;
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    testDataManager = new TestDataManager();
  });

  afterEach(async () => {
    // Clean up all test data after each test
    await testDataManager.cleanup();
  });

  describe('Player CRUD Operations', () => {
    it('should create, read, update, and delete a player', async () => {
      // 1. CREATE - Set up test data
      const testClub = await testDataManager.createTestClub('Test CRUD Club');
      const testSeason = await testDataManager.createTestSeason('Test CRUD Season');
      
      // 2. CREATE - Create a test player
      const createdPlayer = await testDataManager.createTestPlayer(
        testClub.id, 
        'John', 
        'TestPlayer'
      );

      expect(createdPlayer).toHaveProperty('id');
      expect(createdPlayer.firstName).toBe('John');
      expect(createdPlayer.lastName).toBe('TestPlayer');

      // 3. READ - Verify player was created
      const readResponse = await fetch(`${baseUrl}/api/players/${createdPlayer.id}`, {
        headers: {
          'x-current-club-id': testClub.id.toString()
        }
      });

      expect(readResponse.status).toBe(200);
      const readPlayer = await readResponse.json();
      expect(readPlayer.id).toBe(createdPlayer.id);
      expect(readPlayer.firstName).toBe('John');

      // 4. UPDATE - Update the player
      const updateData = {
        firstName: 'UpdatedJohn',
        lastName: 'UpdatedTestPlayer',
        displayName: 'UpdatedJohn UpdatedTestPlayer',
        positionPreferences: ['GS', 'GA', 'WA'],
        active: true,
        avatarColor: 'bg-green-600'
      };

      const updateResponse = await fetch(`${baseUrl}/api/players/${createdPlayer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-current-club-id': testClub.id.toString()
        },
        body: JSON.stringify(updateData)
      });

      expect(updateResponse.status).toBe(200);
      const updatedPlayer = await updateResponse.json();
      expect(updatedPlayer.firstName).toBe('UpdatedJohn');
      expect(updatedPlayer.positionPreferences).toEqual(['GS', 'GA', 'WA']);

      // 5. READ - Verify update persisted
      const verifyResponse = await fetch(`${baseUrl}/api/players/${createdPlayer.id}`, {
        headers: {
          'x-current-club-id': testClub.id.toString()
        }
      });

      const verifiedPlayer = await verifyResponse.json();
      expect(verifiedPlayer.firstName).toBe('UpdatedJohn');
      expect(verifiedPlayer.positionPreferences).toEqual(['GS', 'GA', 'WA']);

      // 6. DELETE - Delete the player
      const deleteResponse = await fetch(`${baseUrl}/api/players/${createdPlayer.id}`, {
        method: 'DELETE',
        headers: {
          'x-current-club-id': testClub.id.toString()
        }
      });

      expect(deleteResponse.status).toBe(200);

      // 7. READ - Verify deletion
      const deletedResponse = await fetch(`${baseUrl}/api/players/${createdPlayer.id}`, {
        headers: {
          'x-current-club-id': testClub.id.toString()
        }
      });

      expect(deletedResponse.status).toBe(404);

      // Test data will be cleaned up automatically in afterEach
    });
  });

  describe('Team CRUD Operations', () => {
    it('should create, read, update, and delete a team', async () => {
      // 1. CREATE - Set up test data
      const testClub = await testDataManager.createTestClub('Test Team Club');
      const testSeason = await testDataManager.createTestSeason('Test Team Season');
      
      // 2. CREATE - Create a test team
      const createdTeam = await testDataManager.createTestTeam(
        testClub.id,
        testSeason.id,
        'Test CRUD Team'
      );

      expect(createdTeam).toHaveProperty('id');
      expect(createdTeam.name).toBe('Test CRUD Team');
      expect(createdTeam.clubId).toBe(testClub.id);

      // 3. READ - Verify team was created
      const readResponse = await fetch(`${baseUrl}/api/clubs/${testClub.id}/teams`, {
        headers: {
          'x-current-club-id': testClub.id.toString()
        }
      });

      expect(readResponse.status).toBe(200);
      const teams = await readResponse.json();
      const foundTeam = teams.find((t: any) => t.id === createdTeam.id);
      expect(foundTeam).toBeDefined();
      expect(foundTeam.name).toBe('Test CRUD Team');

      // 4. UPDATE - Update the team
      const updateData = {
        name: 'Updated CRUD Team',
        isActive: false
      };

      const updateResponse = await fetch(`${baseUrl}/api/teams/${createdTeam.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-current-club-id': testClub.id.toString()
        },
        body: JSON.stringify(updateData)
      });

      expect(updateResponse.status).toBe(200);
      const updatedTeam = await updateResponse.json();
      expect(updatedTeam.name).toBe('Updated CRUD Team');

      // 5. DELETE - Delete the team
      const deleteResponse = await fetch(`${baseUrl}/api/teams/${createdTeam.id}`, {
        method: 'DELETE',
        headers: {
          'x-current-club-id': testClub.id.toString()
        }
      });

      expect(deleteResponse.status).toBe(200);

      // Test data will be cleaned up automatically in afterEach
    });
  });

  describe('Game CRUD Operations', () => {
    it('should create, read, update, and delete a game', async () => {
      // 1. CREATE - Set up test data
      const testClub = await testDataManager.createTestClub('Test Game Club');
      const testSeason = await testDataManager.createTestSeason('Test Game Season');
      const homeTeam = await testDataManager.createTestTeam(testClub.id, testSeason.id, 'Home Team');
      const awayTeam = await testDataManager.createTestTeam(testClub.id, testSeason.id, 'Away Team');
      
      // 2. CREATE - Create a test game
      const createdGame = await testDataManager.createTestGame(
        homeTeam.id,
        awayTeam.id,
        '2025-08-01'
      );

      expect(createdGame).toHaveProperty('id');
      expect(createdGame.homeTeamId).toBe(homeTeam.id);
      expect(createdGame.awayTeamId).toBe(awayTeam.id);

      // 3. READ - Verify game was created
      const readResponse = await fetch(`${baseUrl}/api/games/${createdGame.id}`, {
        headers: {
          'x-current-club-id': testClub.id.toString()
        }
      });

      expect(readResponse.status).toBe(200);
      const readGame = await readResponse.json();
      expect(readGame.id).toBe(createdGame.id);

      // 4. UPDATE - Update the game
      const updateData = {
        date: '2025-08-15',
        time: '14:00',
        venue: 'Updated Test Venue'
      };

      const updateResponse = await fetch(`${baseUrl}/api/games/${createdGame.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-current-club-id': testClub.id.toString()
        },
        body: JSON.stringify(updateData)
      });

      expect(updateResponse.status).toBe(200);
      const updatedGame = await updateResponse.json();
      expect(updatedGame.date).toBe('2025-08-15');
      expect(updatedGame.venue).toBe('Updated Test Venue');

      // 5. DELETE - Delete the game
      const deleteResponse = await fetch(`${baseUrl}/api/games/${createdGame.id}`, {
        method: 'DELETE'
      });

      expect(deleteResponse.status).toBe(200);

      // Test data will be cleaned up automatically in afterEach
    });
  });

  describe('Data Isolation Tests', () => {
    it('should only see data from the correct club', async () => {
      // Create two separate clubs with their own data
      const club1 = await testDataManager.createTestClub('Club 1');
      const club2 = await testDataManager.createTestClub('Club 2');
      
      const season = await testDataManager.createTestSeason('Shared Season');
      
      const player1 = await testDataManager.createTestPlayer(club1.id, 'Player', 'One');
      const player2 = await testDataManager.createTestPlayer(club2.id, 'Player', 'Two');
      
      const team1 = await testDataManager.createTestTeam(club1.id, season.id, 'Team One');
      const team2 = await testDataManager.createTestTeam(club2.id, season.id, 'Team Two');

      // Test that club 1 only sees its own teams
      const club1TeamsResponse = await fetch(`${baseUrl}/api/clubs/${club1.id}/teams`, {
        headers: {
          'x-current-club-id': club1.id.toString()
        }
      });

      const club1Teams = await club1TeamsResponse.json();
      expect(club1Teams).toHaveLength(1);
      expect(club1Teams[0].id).toBe(team1.id);
      expect(club1Teams[0].name).toBe('Team One');

      // Test that club 2 only sees its own teams
      const club2TeamsResponse = await fetch(`${baseUrl}/api/clubs/${club2.id}/teams`, {
        headers: {
          'x-current-club-id': club2.id.toString()
        }
      });

      const club2Teams = await club2TeamsResponse.json();
      expect(club2Teams).toHaveLength(1);
      expect(club2Teams[0].id).toBe(team2.id);
      expect(club2Teams[0].name).toBe('Team Two');

      // Test that clubs don't see each other's players
      const club1PlayersResponse = await fetch(`${baseUrl}/api/clubs/${club1.id}/players`, {
        headers: {
          'x-current-club-id': club1.id.toString()
        }
      });

      const club1Players = await club1PlayersResponse.json();
      const club1PlayerIds = club1Players.map((p: any) => p.id);
      expect(club1PlayerIds).toContain(player1.id);
      expect(club1PlayerIds).not.toContain(player2.id);

      // Test data will be cleaned up automatically in afterEach
    });
  });
});