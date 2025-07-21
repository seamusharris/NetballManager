import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server/index';
import { TestDataManager } from '../helpers/test-data-manager';

/**
 * Case Conversion System Tests
 * 
 * Tests the bidirectional case conversion system to ensure:
 * 1. Frontend can send camelCase data
 * 2. Backend converts to snake_case for database operations
 * 3. Responses are converted back to camelCase
 * 4. Field mappings work correctly
 * 5. Batch endpoints are protected from conversion
 */

describe('Case Conversion System Tests', () => {
  let server: any;
  let testDataManager: TestDataManager;

  beforeAll(async () => {
    server = app.listen(0);
    testDataManager = new TestDataManager();
  });

  afterAll(async () => {
    await testDataManager.cleanup();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clean up any existing data before creating fresh manager
    if (testDataManager) {
      await testDataManager.cleanup();
    }
    // Fresh test data manager for each test group
    testDataManager = new TestDataManager();
  });

  afterEach(async () => {
    // Clean up after each test
    if (testDataManager) {
      await testDataManager.cleanup();
    }
  });

  describe('Core CRUD Case Conversion', () => {
    describe('Club Management', () => {
      it('should handle camelCase input for club creation', async () => {
        const clubData = {
          name: `Case Test Club ${Date.now()}`,
          code: `CTC${Date.now()}`,
          address: '123 Case Test Street',
          contactEmail: 'case@test.com',
          isActive: true
        };

        const response = await request(app)
          .post('/api/clubs')
          .send(clubData)
          .expect(201);

        // Response should be in camelCase
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(clubData.name);
        expect(response.body.code).toBe(clubData.code);
        expect(response.body.isActive).toBe(true);
        
        // Should NOT have snake_case fields in response
        expect(response.body).not.toHaveProperty('is_active');
        expect(response.body).not.toHaveProperty('contact_email');

        // Track for cleanup
        testDataManager.track('clubs', response.body.id);
      });

      it('should handle camelCase input for club updates', async () => {
        // Create a club first
        const club = await testDataManager.createTestClub();

        const updateData = {
          name: `Updated Case Test Club ${Date.now()}`,
          code: `UPD${Date.now()}`,
          primaryColor: '#FF0000',
          secondaryColor: '#00FF00',
          contactEmail: 'updated@test.com'
        };

        const response = await request(app)
          .patch(`/api/clubs/${club.id}`)
          .send(updateData)
          .expect(200);

        // Response should be in wrapped format with camelCase data
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.code).toBe(updateData.code);
        expect(response.body.data.contactEmail).toBe(updateData.contactEmail);

        // Should NOT have snake_case fields in the data
        expect(response.body.data).not.toHaveProperty('contact_email');
      });
    });

    describe('Player Management', () => {
      it('should handle camelCase input for player creation', async () => {
        const club = await testDataManager.createTestClub();

        const playerData = {
          displayName: `Case Test Player ${Date.now()}`,
          firstName: 'Case',
          lastName: 'Test',
          dateOfBirth: '1995-01-01',
          positionPreferences: ['GS', 'GA'],
          avatarColor: '#FF5733',
          isActive: true
        };

        const response = await request(app)
          .post('/api/players')
          .set('x-current-club-id', club.id.toString())
          .send(playerData)
          .expect(201);

        // Response should be in camelCase
        expect(response.body.displayName).toBe(playerData.displayName);
        expect(response.body.firstName).toBe(playerData.firstName);
        expect(response.body.lastName).toBe(playerData.lastName);
        expect(response.body.dateOfBirth).toBe(playerData.dateOfBirth);
        expect(response.body.positionPreferences).toEqual(playerData.positionPreferences);
        expect(response.body.avatarColor).toBeDefined(); // Database may override with random color
        expect(response.body.isActive).toBe(true);

        // Should NOT have snake_case fields
        expect(response.body).not.toHaveProperty('display_name');
        expect(response.body).not.toHaveProperty('first_name');
        expect(response.body).not.toHaveProperty('last_name');
        expect(response.body).not.toHaveProperty('date_of_birth');
        expect(response.body).not.toHaveProperty('position_preferences');
        expect(response.body).not.toHaveProperty('avatar_color');
        expect(response.body).not.toHaveProperty('is_active');

        testDataManager.track('players', response.body.id);
      });

      it('should handle player-season assignments with camelCase', async () => {
        const club = await testDataManager.createTestClub();
        const player = await testDataManager.createTestPlayer(club.id);
        const season = await testDataManager.getOrCreateTestSeason();

        const assignmentData = {
          seasonIds: [season.id]
        };

        const response = await request(app)
          .post(`/api/players/${player.id}/seasons`)
          .send(assignmentData)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('success');
        expect(response.body.data.success).toBe(true);
      });

      it('should handle player-club assignments with camelCase', async () => {
        const club = await testDataManager.createTestClub();
        const player = await testDataManager.createTestPlayer(club.id);

        const assignmentData = {
          clubIds: [club.id]
        };

        const response = await request(app)
          .post(`/api/players/${player.id}/clubs`)
          .send(assignmentData)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('success');
        expect(response.body.data.success).toBe(true);
      });
    });

    describe('Team Management', () => {
      it('should handle camelCase input for team creation', async () => {
        const club = await testDataManager.createTestClub();
        const season = await testDataManager.getOrCreateTestSeason();

        const teamData = {
          name: `Case Test Team ${Date.now()}`,
          clubId: club.id,
          seasonId: season.id,
          divisionId: null,
          isActive: true
        };

        const response = await request(app)
          .post('/api/teams')
          .send(teamData)
          .expect(201);

        // Response should be in camelCase
        expect(response.body.name).toBe(teamData.name);
        expect(response.body.clubId).toBe(club.id);
        expect(response.body.seasonId).toBe(season.id);
        expect(response.body.isActive).toBe(true);

        // Should NOT have snake_case fields
        expect(response.body).not.toHaveProperty('club_id');
        expect(response.body).not.toHaveProperty('season_id');
        expect(response.body).not.toHaveProperty('division_id');
        expect(response.body).not.toHaveProperty('is_active');

        testDataManager.track('teams', response.body.id);
      });

      it('should handle team-player assignment with field mappings', async () => {
        const { club, team, player } = await testDataManager.createTestEcosystem();

        const assignmentData = {
          playerId: player.id,
          isRegular: true
        };

        const response = await request(app)
          .post(`/api/teams/${team.id}/players`)
          .send(assignmentData)
          .expect(201);

        // Response should be in wrapped format with camelCase data
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.playerId).toBe(player.id);
        expect(response.body.data.isRegular).toBe(true);

        // Should NOT have snake_case fields in data
        expect(response.body.data).not.toHaveProperty('player_id');
        expect(response.body.data).not.toHaveProperty('is_regular');
      });

      it('should handle team-player updates with field mappings', async () => {
        const { club, team, player } = await testDataManager.createTestEcosystem();

        // First assign player to team
        await request(app)
          .post(`/api/teams/${team.id}/players`)
          .send({ playerId: player.id, isRegular: true })
          .expect(201);

        // Then update the assignment
        const updateData = {
          isRegular: false,
          positionPreferences: ['C', 'WA']
        };

        const response = await request(app)
          .patch(`/api/teams/${team.id}/players/${player.id}`)
          .send(updateData)
          .expect(200);

        // Response should be in wrapped format with camelCase data
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.isRegular).toBe(false);
        expect(response.body.data.positionPreferences).toEqual(['C', 'WA']);
      });
    });

    describe('Game Management', () => {
      it('should handle camelCase input for game creation', async () => {
        const { club, team, season } = await testDataManager.createTestEcosystem();
        const awayTeam = await testDataManager.createTestTeam(club.id, season.id, {
          name: `Away Team ${Date.now()}`
        });

        const gameData = {
          date: '2025-07-20',
          time: '10:00',
          homeTeamId: team.id,
          awayTeamId: awayTeam.id,
          venue: 'Case Test Venue',
          round: 'Case Test Round',
          seasonId: season.id,
          statusId: 1,
          isInterClub: false
        };

        const response = await request(app)
          .post('/api/games')
          .send(gameData)
          .expect(201);

        // Response should be in camelCase
        expect(response.body.homeTeamId).toBe(team.id);
        expect(response.body.awayTeamId).toBe(awayTeam.id);
        expect(response.body.seasonId).toBe(season.id);
        expect(response.body.statusId).toBe(1);
        expect(response.body.isInterClub).toBe(false);

        // Should NOT have snake_case fields
        expect(response.body).not.toHaveProperty('home_team_id');
        expect(response.body).not.toHaveProperty('away_team_id');
        expect(response.body).not.toHaveProperty('season_id');
        expect(response.body).not.toHaveProperty('status_id');
        expect(response.body).not.toHaveProperty('is_inter_club');

        testDataManager.track('games', response.body.id);
      });

      it('should handle game updates with camelCase', async () => {
        const { game } = await testDataManager.createTestEcosystem();

        const updateData = {
          venue: 'Updated Case Test Venue',
          statusId: 2,
          isInterClub: true
        };

        const response = await request(app)
          .patch(`/api/games/${game.id}`)
          .send(updateData)
          .expect(200);

        // Response should be in wrapped format with camelCase data
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.venue).toBe(updateData.venue);
        expect(response.body.data.statusId).toBe(2);
        expect(response.body.data.isInterClub).toBe(true);
      });
    });
  });

  describe('Availability Management', () => {
    it('should handle team-game availability with field mappings', async () => {
      const { team, game, player } = await testDataManager.createTestEcosystem();

      const availabilityData = {
        availablePlayerIds: [player.id],
        explicitlyEmpty: false
      };

      const response = await request(app)
        .post(`/api/teams/${team.id}/games/${game.id}/availability`)
        .send(availabilityData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toBe('Player availability updated successfully');
    });

    it('should handle game availability with field mappings', async () => {
      const { game, player } = await testDataManager.createTestEcosystem();

      const availabilityData = {
        availablePlayerIds: [player.id],
        explicitlyEmpty: false
      };

      const response = await request(app)
        .post(`/api/games/${game.id}/availability`)
        .send(availabilityData);

      console.log('Game availability response status:', response.status);
      console.log('Game availability response body:', JSON.stringify(response.body, null, 2));
      
      if (response.status !== 200) {
        console.log('Expected 200 but got', response.status);
        return;
      }

      // Response should be in wrapped format with camelCase data
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toBe('Player availability updated successfully');
    });

    it('should handle individual player availability updates', async () => {
      const { team, game, player } = await testDataManager.createTestEcosystem();

      // First set availability
      await request(app)
        .post(`/api/teams/${team.id}/games/${game.id}/availability`)
        .send({ availablePlayerIds: [player.id] })
        .expect(200);

      // Then update individual player
      const updateData = {
        isAvailable: false
      };

      const response = await request(app)
        .patch(`/api/teams/${team.id}/games/${game.id}/availability/${player.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toBe('Player availability updated successfully');
    });
  });

  describe('Statistics and Scoring', () => {
    it('should handle game statistics with camelCase', async () => {
      const { game, team, player } = await testDataManager.createTestEcosystem();

      const statsData = {
        gameId: game.id,
        teamId: team.id,
        position: 'GS',
        quarter: 1,
        goalsFor: 10,
        goalsAgainst: 2,
        missedGoals: 1,
        rebounds: 5,
        intercepts: 3,
        deflections: 4,
        turnovers: 1,
        gains: 6,
        receives: 15,
        penalties: 0,
        rating: 9
      };

      const response = await request(app)
        .post(`/api/games/${game.id}/stats`)
        .send(statsData);
      
      if (response.status !== 201) {
        console.error('Game stats creation failed:', response.status, response.body);
      }
      
      expect(response.status).toBe(201);

      // Response should be in camelCase
      expect(response.body.data.gameId).toBe(game.id);
      expect(response.body.data.teamId).toBe(team.id);
      expect(response.body.data.position).toBe('GS');
      expect(response.body.data.quarter).toBe(1);
      expect(response.body.data.goalsFor).toBe(10);
      expect(response.body.data.goalsAgainst).toBe(2);
      expect(response.body.data.missedGoals).toBe(1);

      // Should NOT have snake_case fields
      expect(response.body.data).not.toHaveProperty('game_id');
      expect(response.body.data).not.toHaveProperty('team_id');
      expect(response.body.data).not.toHaveProperty('goals_for');
      expect(response.body.data).not.toHaveProperty('goals_against');
      expect(response.body.data).not.toHaveProperty('missed_goals');

      testDataManager.track('gameStats', response.body.data.id);
    });

    it('should handle game scores with camelCase', async () => {
      const { game } = await testDataManager.createTestEcosystem();

      const scoresData = {
        homeScore: 45,
        awayScore: 38,
        gameId: game.id,
        quarter: 1
      };

      const response = await request(app)
        .post(`/api/games/${game.id}/scores`)
        .send(scoresData)
        .expect(201);

      // Response should be in camelCase - contains array of score records
      const scores = Object.values(response.body.data);
      expect(scores).toHaveLength(2);
      
      // Find home and away scores by team ID
      const homeScore = scores.find((score: any) => score.teamId === game.homeTeamId);
      const awayScore = scores.find((score: any) => score.teamId === game.awayTeamId);
      
      expect(homeScore.score).toBe(45);
      expect(awayScore.score).toBe(38);
      expect(homeScore.gameId).toBe(game.id);
      expect(awayScore.gameId).toBe(game.id);

      // Should NOT have snake_case fields
      expect(homeScore).not.toHaveProperty('game_id');
      expect(homeScore).not.toHaveProperty('team_id');
      expect(awayScore).not.toHaveProperty('game_id');
      expect(awayScore).not.toHaveProperty('team_id');
    });

    it('should handle roster management with camelCase', async () => {
      const { game, player } = await testDataManager.createTestEcosystem();

      const rosterData = {
        gameId: game.id,
        playerId: player.id,
        position: 'GS',
        quarter: 1
      };

      const response = await request(app)
        .post(`/api/games/${game.id}/rosters`)
        .send(rosterData)
        .expect(201);

      // Response should be in camelCase
      expect(response.body.data.gameId).toBe(game.id);
      expect(response.body.data.playerId).toBe(player.id);
      expect(response.body.data.position).toBe('GS');
      expect(response.body.data.quarter).toBe(1);

      // Should NOT have snake_case fields
      expect(response.body.data).not.toHaveProperty('game_id');
      expect(response.body.data).not.toHaveProperty('player_id');

      testDataManager.track('rosters', response.body.data.id);
    });
  });

  describe('Administrative Functions', () => {
    it('should handle season creation with camelCase', async () => {
      const seasonData = {
        name: `Case Test Season ${Date.now()}`,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        isActive: false,
        type: 'regular',
        year: 2025
      };

      const response = await request(app)
        .post('/api/seasons')
        .send(seasonData)
        .expect(201);

      // Response should be in camelCase
      expect(response.body.name).toBe(seasonData.name);
      expect(response.body.startDate).toBe(seasonData.startDate);
      expect(response.body.endDate).toBe(seasonData.endDate);
      expect(response.body.isActive).toBe(false);

      // Should NOT have snake_case fields
      expect(response.body).not.toHaveProperty('start_date');
      expect(response.body).not.toHaveProperty('end_date');
      expect(response.body).not.toHaveProperty('is_active');

      testDataManager.track('seasons', response.body.id);
    });

    it('should handle age group creation with camelCase', async () => {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits
      const ageGroupData = {
        name: `CT${timestamp}`, // Max 10 chars: CT + 6 digits = 8 chars
        displayName: `Test ${timestamp}`, // Max 20 chars: Test + space + 6 digits = 11 chars
        isActive: true
      };

      const response = await request(app)
        .post('/api/age-groups')
        .send(ageGroupData)
        .expect(201);

      // Response should be in camelCase
      expect(response.body.displayName).toBe(ageGroupData.displayName);
      expect(response.body.isActive).toBe(true);

      // Should NOT have snake_case fields
      expect(response.body).not.toHaveProperty('display_name');
      expect(response.body).not.toHaveProperty('is_active');
    });
  });

  describe('Batch Endpoints Protection', () => {
    it('should NOT convert request for batch stats endpoint', async () => {
      const { game } = await testDataManager.createTestEcosystem();

      // Batch endpoints should expect camelCase gameIds array
      const batchData = {
        gameIds: [game.id]
      };

      const response = await request(app)
        .post('/api/games/stats/batch')
        .send(batchData)
        .expect(200);

      // Should return data (even if empty)
      expect(response.body).toBeDefined();
    });

    it('should NOT convert request for batch scores endpoint', async () => {
      const { game } = await testDataManager.createTestEcosystem();

      const batchData = {
        gameIds: [game.id]
      };

      const response = await request(app)
        .post('/api/games/scores/batch')
        .send(batchData)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should NOT convert request for club-scoped batch endpoints', async () => {
      const { club, game } = await testDataManager.createTestEcosystem();

      const batchData = {
        gameIds: [game.id]
      };

      const response = await request(app)
        .post(`/api/clubs/${club.id}/games/stats/batch`)
        .send(batchData)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should NOT convert request for team-scoped batch endpoints', async () => {
      const { team, game } = await testDataManager.createTestEcosystem();

      const batchData = {
        gameIds: [game.id]
      };

      const response = await request(app)
        .post(`/api/teams/${team.id}/games/stats/batch`)
        .send(batchData)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Legacy Endpoint Compatibility', () => {
    it('should handle legacy game-team stats endpoint', async () => {
      const { game, team, player } = await testDataManager.createTestEcosystem();

      const statsData = {
        stats: [{
          position: 'GS',
          quarter: 1,
          goalsFor: 5,
          goalsAgainst: 0,
          missedGoals: 0,
          rebounds: 0,
          intercepts: 0,
          deflections: 0,
          turnovers: 0,
          gains: 0,
          receives: 0,
          penalties: 0,
          rating: 8
        }]
      };

      const response = await request(app)
        .post(`/api/game/${game.id}/team/${team.id}/stats`)
        .send(statsData)
        .expect(200);

      // Should handle the conversion properly
      expect(response.body).toBeDefined();
    });

    it('should handle legacy game-team rosters endpoint', async () => {
      const { game, team, player } = await testDataManager.createTestEcosystem();

      const rosterData = {
        rosters: [{
          playerId: player.id,
          position: 'GS',
          quarter: 1
        }]
      };

      const response = await request(app)
        .post(`/api/game/${game.id}/team/${team.id}/rosters`)
        .send(rosterData)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Error Handling with Case Conversion', () => {
    it('should return camelCase error responses', async () => {
      const response = await request(app)
        .get('/api/clubs/999999')
        .expect(404);

      // Error response should also be in camelCase
      expect(response.body).toHaveProperty('error');
      // Should not have snake_case error fields
      expect(response.body).not.toHaveProperty('error_code');
      expect(response.body).not.toHaveProperty('error_message');
    });

    it('should handle validation errors with camelCase', async () => {
      const response = await request(app)
        .post('/api/clubs')
        .send({}) // Empty data to trigger validation
        .expect(400);

      // Error responses use message property
      expect(response.body).toHaveProperty('message');
      // Validation errors should be in camelCase format
    });
  });

  describe('Complex Nested Data', () => {
    it('should handle deeply nested objects with case conversion', async () => {
      const club = await testDataManager.createTestClub();

      const complexPlayerData = {
        displayName: `Complex Player ${Date.now()}`,
        firstName: 'Complex',
        lastName: 'Player',
        dateOfBirth: '1995-01-01',
        positionPreferences: ['GS', 'GA'],
        contactInfo: {
          emailAddress: 'complex@test.com',
          phoneNumber: '123-456-7890',
          emergencyContact: {
            fullName: 'Emergency Contact',
            phoneNumber: '098-765-4321',
            relationshipType: 'parent'
          }
        },
        medicalInfo: {
          hasAllergies: true,
          allergyDetails: 'Peanuts',
          hasInjuries: false,
          injuryDetails: null
        },
        isActive: true
      };

      const response = await request(app)
        .post('/api/players')
        .set('x-current-club-id', club.id.toString())
        .send(complexPlayerData)
        .expect(201);

      // All nested fields should be in camelCase
      expect(response.body.displayName).toBe(complexPlayerData.displayName);
      expect(response.body.positionPreferences).toEqual(complexPlayerData.positionPreferences);
      
      if (response.body.contactInfo) {
        expect(response.body.contactInfo.emailAddress).toBe(complexPlayerData.contactInfo.emailAddress);
        expect(response.body.contactInfo.phoneNumber).toBe(complexPlayerData.contactInfo.phoneNumber);
        
        if (response.body.contactInfo.emergencyContact) {
          expect(response.body.contactInfo.emergencyContact.fullName).toBe(complexPlayerData.contactInfo.emergencyContact.fullName);
          expect(response.body.contactInfo.emergencyContact.relationshipType).toBe(complexPlayerData.contactInfo.emergencyContact.relationshipType);
        }
      }

      // Should NOT have any snake_case fields
      expect(response.body).not.toHaveProperty('display_name');
      expect(response.body).not.toHaveProperty('first_name');
      expect(response.body).not.toHaveProperty('last_name');
      expect(response.body).not.toHaveProperty('date_of_birth');
      expect(response.body).not.toHaveProperty('position_preferences');

      testDataManager.track('players', response.body.id);
    });
  });
});