import { Player, Opponent, Game, Roster, GameStat } from '@shared/schema';
import { apiRequest } from './queryClient';
import { formatDate } from './utils';

interface ExportResult {
  fileContents: string;
  filename: string;
}

interface ImportResult {
  playersImported: number;
  opponentsImported: number;
  gamesImported: number;
  rostersImported: number;
  statsImported: number;
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
    // Fetch all data
    const playersResponse = await fetch('/api/players');
    const players = await playersResponse.json() as Player[];
    
    const opponentsResponse = await fetch('/api/opponents');
    const opponents = await opponentsResponse.json() as Opponent[];
    
    const gamesResponse = await fetch('/api/games');
    const games = await gamesResponse.json() as Game[];
    
    // Fetch rosters and stats for each game
    let allRosters: Roster[] = [];
    let allGameStats: GameStat[] = [];
    
    for (const game of games) {
      try {
        const rosterResponse = await fetch(`/api/games/${game.id}/rosters`);
        const rosters = await rosterResponse.json() as Roster[];
        allRosters = [...allRosters, ...rosters];
      } catch (error) {
        console.error(`Failed to fetch rosters for game ${game.id}:`, error);
      }
      
      try {
        const statsResponse = await fetch(`/api/games/${game.id}/stats`);
        const stats = await statsResponse.json() as GameStat[];
        allGameStats = [...allGameStats, ...stats];
      } catch (error) {
        console.error(`Failed to fetch stats for game ${game.id}:`, error);
      }
    }
    
    // Create JSON structure for all data in the standardized format
    const exportData = {
      players,
      opponents,
      games,
      rosters: allRosters,
      gameStats: allGameStats,
      exportDate: new Date().toISOString()
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
    let playersImported = 0;
    let opponentsImported = 0;
    let gamesImported = 0;
    let rostersImported = 0;
    let statsImported = 0;
    
    // Import all data in a single bulk operation
    console.log("Importing data in bulk...");
    const response = await fetch('/api/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonData // Send the entire JSON data as is
    });
    
    if (response.ok) {
      const result = await response.json();
      playersImported = result.playersImported || 0;
      opponentsImported = result.opponentsImported || 0;
      gamesImported = result.gamesImported || 0;
      rostersImported = result.rostersImported || 0;
      statsImported = result.statsImported || 0;
      
      console.log(`Import completed successfully: ${playersImported} players, ${opponentsImported} opponents, ${gamesImported} games, ${rostersImported} roster entries, ${statsImported} stats`);
    } else {
      const errorData = await response.json();
      throw new Error(`Import failed: ${errorData.message || 'Unknown error'}`);
    }
    
    return {
      playersImported,
      opponentsImported,
      gamesImported,
      rostersImported,
      statsImported
    };
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Failed to import data. Please check the file format and try again.');
  }
}