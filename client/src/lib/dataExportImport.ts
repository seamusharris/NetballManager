import { Player, Opponent, Game, Roster, GameStat } from '@shared/schema';
import { apiRequest } from './queryClient';
import { formatDate } from './utils';

interface ExportResult {
  fileContents: string;
  filename: string;
}

interface ImportResult {
  clubsImported: number;
  seasonsImported: number;
  gameStatusesImported: number;
  teamsImported: number;
  playersImported: number;
  opponentsImported: number;
  gamesImported: number;
  rostersImported: number;
  statsImported: number;
  clubPlayersImported: number;
  teamPlayersImported: number;
  playerAvailabilityImported: number;
}

/**
 * Export all data to a standardized JSON format
 * 
 * The exported data structure is:
 * {
 *   players: Player[],
 *   opponents: Opponent[],
 *   games: Game[],
 *   rosters: Roster[],  // Flat array of all roster entries
 *   gameStats: GameStat[],  // Flat array of all game stats
 *   exportDate: string  // ISO date string of when the export was created
 * }
 */
export async function exportAllData(): Promise<ExportResult> {
  try {
    console.log("Starting comprehensive data export process...");

    // Fetch all clubs
    console.log("Fetching clubs...");
    const clubsResponse = await fetch('/api/user/clubs');
    if (!clubsResponse.ok) {
      throw new Error(`Failed to fetch clubs: ${clubsResponse.statusText}`);
    }
    const clubs = await clubsResponse.json();
    console.log(`Exported ${clubs.length} clubs`);

    // Fetch all seasons
    console.log("Fetching seasons...");
    const seasonsResponse = await fetch('/api/seasons');
    if (!seasonsResponse.ok) {
      throw new Error(`Failed to fetch seasons: ${seasonsResponse.statusText}`);
    }
    const seasons = await seasonsResponse.json();
    console.log(`Exported ${seasons.length} seasons`);

    // Fetch all game statuses
    console.log("Fetching game statuses...");
    const gameStatusesResponse = await fetch('/api/game-statuses');
    if (!gameStatusesResponse.ok) {
      throw new Error(`Failed to fetch game statuses: ${gameStatusesResponse.statusText}`);
    }
    const gameStatuses = await gameStatusesResponse.json();
    console.log(`Exported ${gameStatuses.length} game statuses`);

    // Fetch all teams for all clubs
    console.log("Fetching teams for all clubs...");
    let allTeams: any[] = [];
    for (const club of clubs) {
      try {
        const teamsResponse = await fetch(`/api/clubs/${club.clubId}/teams`);
        if (teamsResponse.ok) {
          const teams = await teamsResponse.json();
          allTeams = [...allTeams, ...teams];
          console.log(`Exported ${teams.length} teams for club ${club.clubName}`);
        }
      } catch (error) {
        console.warn(`Failed to fetch teams for club ${club.clubId}:`, error);
      }
    }

    // Fetch all players
    console.log("Fetching players...");
    const playersResponse = await fetch('/api/players');
    if (!playersResponse.ok) {
      throw new Error(`Failed to fetch players: ${playersResponse.statusText}`);
    }
    const players = await playersResponse.json() as Player[];
    console.log(`Exported ${players.length} players with their avatar colors`);

    // Fetch all opponents
    console.log("Fetching opponents...");
    const opponentsResponse = await fetch('/api/opponents');
    if (!opponentsResponse.ok) {
      throw new Error(`Failed to fetch opponents: ${opponentsResponse.statusText}`);
    }
    const opponents = await opponentsResponse.json() as Opponent[];
    console.log(`Exported ${opponents.length} opponents`);

    // Fetch all games for all clubs
    console.log("Fetching games for all clubs...");
    let allGames: Game[] = [];
    for (const club of clubs) {
      try {
        const gamesResponse = await fetch(`/api/clubs/${club.clubId}/games`);
        if (gamesResponse.ok) {
          const games = await gamesResponse.json() as Game[];
          allGames = [...allGames, ...games];
          console.log(`Exported ${games.length} games for club ${club.clubName}`);
        }
      } catch (error) {
        console.warn(`Failed to fetch games for club ${club.clubId}:`, error);
      }
    }

    // Fetch rosters and stats for each game
    let allRosters: Roster[] = [];
    let allGameStats: GameStat[] = [];
    let allGameScores: any[] = [];

    console.log("Fetching roster, stat, and score data for each game...");
    for (const game of allGames) {
      // Get rosters for this game
      try {
        const rosterResponse = await fetch(`/api/games/${game.id}/rosters`);
        if (rosterResponse.ok) {
          const rosters = await rosterResponse.json() as Roster[];
          allRosters = [...allRosters, ...rosters];
          console.log(`Exported ${rosters.length} roster entries for game ${game.id}`);
        }
      } catch (error) {
        console.error(`Failed to fetch rosters for game ${game.id}:`, error);
      }

      // Get game stats for this game
      try {
        const statsResponse = await fetch(`/api/games/${game.id}/stats`);
        if (statsResponse.ok) {
          const stats = await statsResponse.json() as GameStat[];
          allGameStats = [...allGameStats, ...stats];
          console.log(`Exported ${stats.length} stat entries for game ${game.id}`);
        }
      } catch (error) {
        console.error(`Failed to fetch stats for game ${game.id}:`, error);
      }

      // Get game scores for this game
      try {
        const scoresResponse = await fetch(`/api/games/${game.id}/scores`);
        if (scoresResponse.ok) {
          const scores = await scoresResponse.json();
          allGameScores = [...allGameScores, ...scores];
          console.log(`Exported ${scores.length} score entries for game ${game.id}`);
        }
      } catch (error) {
        console.error(`Failed to fetch scores for game ${game.id}:`, error);
      }
    }

    // Fetch club-player and team-player relationships
    console.log("Fetching player relationships...");
    let allClubPlayers: any[] = [];
    let allTeamPlayers: any[] = [];
    let allPlayerAvailability: any[] = [];

    for (const club of clubs) {
      try {
        // Get club-player relationships
        const clubPlayersResponse = await fetch(`/api/clubs/${club.clubId}/players`);
        if (clubPlayersResponse.ok) {
          const clubPlayers = await clubPlayersResponse.json();
          allClubPlayers = [...allClubPlayers, ...clubPlayers.map((p: any) => ({ ...p, clubId: club.clubId }))];
        }

        // Get team-player relationships for each team in this club
        const clubTeams = allTeams.filter(t => t.clubId === club.clubId);
        for (const team of clubTeams) {
          try {
            const teamPlayersResponse = await fetch(`/api/teams/${team.id}/players`);
            if (teamPlayersResponse.ok) {
              const teamPlayers = await teamPlayersResponse.json();
              allTeamPlayers = [...allTeamPlayers, ...teamPlayers.map((p: any) => ({ ...p, teamId: team.id }))];
            }
          } catch (error) {
            console.warn(`Failed to fetch players for team ${team.id}:`, error);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch relationships for club ${club.clubId}:`, error);
      }
    }

    // Create comprehensive JSON structure for all data
    const exportData = {
      // Core organizational data
      clubs,
      seasons,
      gameStatuses,
      teams: allTeams,
      
      // Player and game data
      players,
      opponents, // Legacy data
      games: allGames,
      rosters: allRosters,
      gameStats: allGameStats,
      gameScores: allGameScores,
      
      // Relationship data
      clubPlayers: allClubPlayers,
      teamPlayers: allTeamPlayers,
      playerAvailability: allPlayerAvailability,
      
      // Metadata
      exportDate: new Date().toISOString(),
      version: '2.0'
    };

    // Convert to JSON string
    const jsonData = JSON.stringify(exportData, null, 2);

    // Create the filename with current date and time
    const now = new Date();
    const datePart = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timePart = now.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'); // HH-MM-SS
    const filename = `netball_export_${datePart}_${timePart}.json`;

    return {
      fileContents: jsonData,
      filename
    };
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data. Please try again later.');
  }
}

/**
 * Import data from the standardized JSON format
 * 
 * Expected structure:
 * {
 *   players: Player[],
 *   opponents: Opponent[],
 *   games: Game[],
 *   rosters: Roster[], 
 *   gameStats: GameStat[], 
 *   exportDate: string 
 * }
 */
export async function importData(jsonData: string): Promise<ImportResult> {
  try {
    // Parse the JSON data
    const data = JSON.parse(jsonData);

    // Validate the data structure
    if (!data.players || !data.opponents || !data.games) {
      throw new Error('Invalid data format. The import file is missing required data sections.');
    }

    // First, clean the database to prevent ID conflicts
    console.log("Clearing existing data before import...");
    await fetch('/api/clear-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    // Count successful imports
    let clubsImported = 0;
    let seasonsImported = 0;
    let gameStatusesImported = 0;
    let teamsImported = 0;
    let playersImported = 0;
    let opponentsImported = 0;
    let gamesImported = 0;
    let rostersImported = 0;
    let statsImported = 0;
    let clubPlayersImported = 0;
    let teamPlayersImported = 0;
    let playerAvailabilityImported = 0;

    // Import all data in a single bulk operation
    console.log("Importing data in bulk...");

    try {
      const response = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonData // Send the entire JSON data as is
      });

      if (response.ok) {
        const result = await response.json();
        clubsImported = result.clubsImported || 0;
        seasonsImported = result.seasonsImported || 0;
        gameStatusesImported = result.gameStatusesImported || 0;
        teamsImported = result.teamsImported || 0;
        playersImported = result.playersImported || 0;
        opponentsImported = result.opponentsImported || 0;
        gamesImported = result.gamesImported || 0;
        rostersImported = result.rostersImported || 0;
        statsImported = result.statsImported || 0;
        clubPlayersImported = result.clubPlayersImported || 0;
        teamPlayersImported = result.teamPlayersImported || 0;
        playerAvailabilityImported = result.playerAvailabilityImported || 0;

        console.log(`Import completed successfully: ${clubsImported} clubs, ${seasonsImported} seasons, ${gameStatusesImported} game statuses, ${teamsImported} teams, ${playersImported} players, ${opponentsImported} opponents, ${gamesImported} games, ${rostersImported} roster entries, ${statsImported} stats, ${clubPlayersImported} club-player relationships, ${teamPlayersImported} team-player relationships, ${playerAvailabilityImported} availability records`);
      } else {
        const errorText = await response.text();
        console.error("Import API error:", errorText);
        throw new Error(`Import failed: ${errorText || 'Unknown error'}`);
      }
    } catch (importError) {
      console.error("Failed during bulk import:", importError);
      throw importError;
    }

    return {
      clubsImported,
      seasonsImported,
      gameStatusesImported,
      teamsImported,
      playersImported,
      opponentsImported,
      gamesImported,
      rostersImported,
      statsImported,
      clubPlayersImported,
      teamPlayersImported,
      playerAvailabilityImported
    };
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Failed to import data. Please check the file format and try again.');
  }
}