/**
 * Test Data Manager - Creates and cleans up test data
 * Ensures tests only operate on data they create
 */

interface TestClub {
  id: number;
  name: string;
  code: string;
}

interface TestTeam {
  id: number;
  name: string;
  clubId: number;
  seasonId: number;
}

interface TestPlayer {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
}

interface TestGame {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  date: string;
}

export class TestDataManager {
  private baseUrl = 'http://localhost:3000';
  private createdClubs: TestClub[] = [];
  private createdTeams: TestTeam[] = [];
  private createdPlayers: TestPlayer[] = [];
  private createdGames: TestGame[] = [];
  private createdSeasons: any[] = [];

  /**
   * Create a test club
   */
  async createTestClub(name?: string): Promise<TestClub> {
    const clubData = {
      name: name || `Test Club ${Date.now()}`,
      code: `TC${Date.now()}`,
      address: '123 Test Street',
      contactEmail: 'test@example.com',
      primaryColor: '#1f2937',
      secondaryColor: '#ffffff'
    };

    const response = await fetch(`${this.baseUrl}/api/clubs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clubData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create test club: ${response.status}`);
    }

    const club = await response.json();
    this.createdClubs.push(club);
    return club;
  }

  /**
   * Create a test season
   */
  async createTestSeason(name?: string): Promise<any> {
    const seasonData = {
      name: name || `Test Season ${Date.now()}`,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      isActive: true,
      type: 'Test',
      year: 2025,
      displayOrder: 1
    };

    const response = await fetch(`${this.baseUrl}/api/seasons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(seasonData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create test season: ${response.status}`);
    }

    const season = await response.json();
    this.createdSeasons.push(season);
    return season;
  }

  /**
   * Create a test team
   */
  async createTestTeam(clubId: number, seasonId: number, name?: string): Promise<TestTeam> {
    const teamData = {
      name: name || `Test Team ${Date.now()}`,
      clubId,
      seasonId,
      isActive: true
    };

    const response = await fetch(`${this.baseUrl}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-current-club-id': clubId.toString()
      },
      body: JSON.stringify(teamData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create test team: ${response.status}`);
    }

    const team = await response.json();
    this.createdTeams.push(team);
    return team;
  }

  /**
   * Create a test player
   */
  async createTestPlayer(clubId: number, firstName?: string, lastName?: string): Promise<TestPlayer> {
    const timestamp = Date.now();
    const playerData = {
      firstName: firstName || `TestFirst${timestamp}`,
      lastName: lastName || `TestLast${timestamp}`,
      displayName: `${firstName || 'TestFirst'} ${lastName || 'TestLast'}`,
      positionPreferences: ['GS', 'GA'],
      active: true,
      avatarColor: 'bg-blue-600'
    };

    const response = await fetch(`${this.baseUrl}/api/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-current-club-id': clubId.toString()
      },
      body: JSON.stringify(playerData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create test player: ${response.status}`);
    }

    const player = await response.json();
    this.createdPlayers.push(player);
    return player;
  }

  /**
   * Create a test game
   */
  async createTestGame(homeTeamId: number, awayTeamId: number, date?: string): Promise<TestGame> {
    const gameData = {
      date: date || '2025-07-20',
      time: '10:00',
      homeTeamId,
      awayTeamId,
      venue: 'Test Venue',
      statusId: 1, // Upcoming
      round: 'Test Round'
    };

    const response = await fetch(`${this.baseUrl}/api/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create test game: ${response.status}`);
    }

    const game = await response.json();
    this.createdGames.push(game);
    return game;
  }

  /**
   * Clean up all created test data
   * Call this in afterEach or afterAll
   */
  async cleanup(): Promise<void> {
    const errors: string[] = [];

    // Clean up in reverse order of creation to handle dependencies

    // Clean up games
    for (const game of this.createdGames) {
      try {
        await fetch(`${this.baseUrl}/api/games/${game.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        errors.push(`Failed to delete game ${game.id}: ${error}`);
      }
    }

    // Clean up players
    for (const player of this.createdPlayers) {
      try {
        await fetch(`${this.baseUrl}/api/players/${player.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        errors.push(`Failed to delete player ${player.id}: ${error}`);
      }
    }

    // Clean up teams
    for (const team of this.createdTeams) {
      try {
        await fetch(`${this.baseUrl}/api/teams/${team.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        errors.push(`Failed to delete team ${team.id}: ${error}`);
      }
    }

    // Clean up seasons
    for (const season of this.createdSeasons) {
      try {
        await fetch(`${this.baseUrl}/api/seasons/${season.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        errors.push(`Failed to delete season ${season.id}: ${error}`);
      }
    }

    // Clean up clubs
    for (const club of this.createdClubs) {
      try {
        await fetch(`${this.baseUrl}/api/clubs/${club.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        errors.push(`Failed to delete club ${club.id}: ${error}`);
      }
    }

    // Clear arrays
    this.createdClubs = [];
    this.createdTeams = [];
    this.createdPlayers = [];
    this.createdGames = [];
    this.createdSeasons = [];

    if (errors.length > 0) {
      console.warn('Some test data cleanup failed:', errors);
    }
  }

  /**
   * Get all created test data for assertions
   */
  getCreatedData() {
    return {
      clubs: [...this.createdClubs],
      teams: [...this.createdTeams],
      players: [...this.createdPlayers],
      games: [...this.createdGames],
      seasons: [...this.createdSeasons]
    };
  }
}