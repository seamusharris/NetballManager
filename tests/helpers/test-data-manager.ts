import request from 'supertest';
import app from '../../server/index';

/**
 * Test Data Manager - Helps create and cleanup test data
 * Ensures tests are isolated and don't interfere with each other
 */

export interface TestDataTracker {
  clubs: number[];
  players: number[];
  teams: number[];
  games: number[];
  seasons: number[];
  gameStats: number[];
  rosters: number[];
}

export class TestDataManager {
  private data: TestDataTracker = {
    clubs: [],
    players: [],
    teams: [],
    games: [],
    seasons: [],
    gameStats: [],
    rosters: []
  };

  /**
   * Create a test club with unique identifiers
   */
  async createTestClub(overrides: Partial<any> = {}): Promise<any> {
    const timestamp = Date.now();
    const clubData = {
      name: `Test Club ${timestamp}`,
      code: `TC${timestamp}`,
      address: '123 Test Street, Test City',
      contactInfo: 'test@example.com',
      ...overrides
    };

    const response = await request(app)
      .post('/api/clubs')
      .send(clubData)
      .expect(201);

    this.data.clubs.push(response.body.id);
    console.log(`📝 Created test club ${response.body.id}: ${response.body.name}`);
    return response.body;
  }

  /**
   * Create a test player for a specific club
   */
  async createTestPlayer(clubId: number, overrides: Partial<any> = {}): Promise<any> {
    const timestamp = Date.now();
    const playerData = {
      display_name: `Test Player ${timestamp}`,
      first_name: 'Test',
      last_name: `Player${timestamp}`,
      date_of_birth: '1995-01-01',
      position_preferences: ['GS', 'GA'],
      active: true,
      ...overrides
    };

    const response = await request(app)
      .post('/api/players')
      .set('x-current-club-id', clubId.toString())
      .send(playerData)
      .expect(201);

    this.data.players.push(response.body.id);
    console.log(`📝 Created test player ${response.body.id}: ${response.body.display_name}`);
    return response.body;
  }

  /**
   * Create a test team for a specific club
   */
  async createTestTeam(clubId: number, seasonId: number, overrides: Partial<any> = {}): Promise<any> {
    const timestamp = Date.now();
    const teamData = {
      name: `Test Team ${timestamp}`,
      clubId: clubId,
      seasonId: seasonId,
      division: 'Test Division',
      ...overrides
    };

    const response = await request(app)
      .post('/api/teams')
      .send(teamData)
      .expect(201);

    this.data.teams.push(response.body.id);
    console.log(`📝 Created test team ${response.body.id}: ${response.body.name}`);
    return response.body;
  }

  /**
   * Create a test game between teams
   */
  async createTestGame(homeTeamId: number, seasonId: number, overrides: Partial<any> = {}, clubId?: number): Promise<any> {
    const timestamp = Date.now();
    
    // Create a second team for away team if not provided in overrides
    let awayTeamId = overrides.awayTeamId;
    if (!awayTeamId) {
      // Use provided clubId or get it from the home team
      let teamClubId = clubId;
      if (!teamClubId) {
        const homeTeamResponse = await request(app).get(`/api/teams/${homeTeamId}`);
        const homeTeam = homeTeamResponse.body;
        teamClubId = homeTeam.clubId || homeTeam.club_id;
      }
      const awayTeam = await this.createTestTeam(teamClubId, seasonId, {
        name: `Away Team ${timestamp}`
      });
      awayTeamId = awayTeam.id;
    }
    
    const gameData = {
      date: '2025-07-20',
      time: '10:00',
      homeTeamId: homeTeamId,
      awayTeamId: awayTeamId,
      venue: `Test Venue ${timestamp}`,
      round: `Test Round ${timestamp}`,
      seasonId: seasonId,
      statusId: 1, // Assuming status 1 exists
      ...overrides
    };

    const response = await request(app)
      .post('/api/games')
      .send(gameData)
      .expect(201);

    this.data.games.push(response.body.id);
    console.log(`📝 Created test game ${response.body.id}`);
    return response.body;
  }

  /**
   * Create test game stats
   */
  async createTestGameStats(gameId: number, teamId: number, playerId: number, overrides: Partial<any> = {}): Promise<any> {
    const statsData = {
      gameId: gameId,
      teamId: teamId,
      position: 'GS',
      quarter: 1,
      goalsFor: 5,
      goalsAgainst: 0,
      missedGoals: 1,
      rebounds: 2,
      intercepts: 1,
      deflections: 3,
      turnovers: 0,
      gains: 4,
      receives: 10,
      penalties: 0,
      rating: 8,
      ...overrides
    };

    const response = await request(app)
      .post(`/api/games/${gameId}/stats`)
      .send(statsData)
      .expect(201);

    this.data.gameStats.push(response.body.id);
    console.log(`📝 Created test game stats ${response.body.id}`);
    return response.body;
  }

  /**
   * Create test roster entry
   */
  async createTestRoster(gameId: number, playerId: number, overrides: Partial<any> = {}): Promise<any> {
    const rosterData = {
      gameId: gameId,
      playerId: playerId,
      position: 'GS',
      quarter: 1,
      ...overrides
    };

    const response = await request(app)
      .post(`/api/games/${gameId}/rosters`)
      .send(rosterData)
      .expect(201);

    this.data.rosters.push(response.body.id);
    console.log(`📝 Created test roster entry ${response.body.id}`);
    return response.body;
  }

  /**
   * Get or create an active season for testing
   */
  async getOrCreateTestSeason(): Promise<any> {
    try {
      // Try to get active season first
      const response = await request(app)
        .get('/api/seasons/active')
        .expect(200);

      if (response.body && response.body.id) {
        console.log(`📝 Using existing season ${response.body.id}`);
        return response.body;
      }
    } catch (error) {
      // Active season doesn't exist, create one
    }

    // Create a test season
    const timestamp = Date.now();
    const seasonData = {
      name: `Test Season ${timestamp}`,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      isActive: false, // Don't interfere with existing active season
      type: 'regular',
      year: 2025
    };

    const response = await request(app)
      .post('/api/seasons')
      .send(seasonData)
      .expect(201);

    this.data.seasons.push(response.body.id);
    console.log(`📝 Created test season ${response.body.id}`);
    return response.body;
  }

  /**
   * Create a complete test ecosystem (club -> team -> player -> game)
   */
  async createTestEcosystem(): Promise<{
    club: any;
    team: any;
    player: any;
    game: any;
    season: any;
  }> {
    console.log('🏗️ Creating test ecosystem...');

    const season = await this.getOrCreateTestSeason();
    const club = await this.createTestClub();
    const team = await this.createTestTeam(club.id, season.id);
    const player = await this.createTestPlayer(club.id);
    const game = await this.createTestGame(team.id, season.id, {}, club.id);

    console.log('✅ Test ecosystem created successfully');
    return { club, team, player, game, season };
  }

  /**
   * Clean up all test data in proper dependency order
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Starting test data cleanup...');

    // Clean up in reverse dependency order
    const cleanupOrder = [
      { type: 'rosters', ids: this.data.rosters, endpoint: '/api/rosters' },
      { type: 'gameStats', ids: this.data.gameStats, endpoint: '/api/game-stats' },
      { type: 'games', ids: this.data.games, endpoint: '/api/games' },
      { type: 'teams', ids: this.data.teams, endpoint: '/api/teams' },
      { type: 'players', ids: this.data.players, endpoint: '/api/players' },
      { type: 'seasons', ids: this.data.seasons, endpoint: '/api/seasons' },
      { type: 'clubs', ids: this.data.clubs, endpoint: '/api/clubs' }
    ];

    for (const { type, ids, endpoint } of cleanupOrder) {
      for (const id of ids) {
        try {
          await request(app).delete(`${endpoint}/${id}`);
          console.log(`✅ Cleaned up ${type} ${id}`);
        } catch (error) {
          console.warn(`⚠️ Failed to cleanup ${type} ${id}:`, error);
        }
      }
    }

    // Reset tracking
    this.data = {
      clubs: [],
      players: [],
      teams: [],
      games: [],
      seasons: [],
      gameStats: [],
      rosters: []
    };

    console.log('🎉 Test data cleanup complete');
  }

  /**
   * Get tracked data for inspection
   */
  getTrackedData(): TestDataTracker {
    return { ...this.data };
  }

  /**
   * Track manually created entities for cleanup
   */
  track(type: keyof TestDataTracker, id: number): void {
    this.data[type].push(id);
    console.log(`📝 Tracking ${type} ${id} for cleanup`);
  }

  /**
   * Generate random test data
   */
  static generateRandomData() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    return {
      club: {
        name: `Random Club ${timestamp}`,
        code: `RC${random}`,
        address: `${random} Random Street, Random City`,
        contactInfo: `random${random}@example.com`
      },
      player: {
        displayName: `Random Player ${timestamp}`,
        firstName: `Random${random}`,
        lastName: `Player${timestamp}`,
        dateOfBirth: '1990-01-01',
        positionPreferences: ['GS', 'GA', 'WA'][Math.floor(Math.random() * 3)],
        active: true
      },
      team: {
        name: `Random Team ${timestamp}`,
        division: ['A Grade', 'B Grade', 'C Grade'][Math.floor(Math.random() * 3)]
      },
      game: {
        date: '2025-07-20',
        time: ['09:00', '10:00', '11:00', '12:00'][Math.floor(Math.random() * 4)],
        venue: `Random Venue ${random}`,
        round: `Round ${Math.floor(Math.random() * 20) + 1}`
      }
    };
  }
}