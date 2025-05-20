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
    
    // Count successful imports
    let playersImported = 0;
    let opponentsImported = 0;
    let gamesImported = 0;
    let rostersImported = 0;
    let statsImported = 0;
    
    // Step 1: Import players first with correct ID preservation
    console.log(`Importing ${data.players.length} players...`);
    for (const player of data.players) {
      try {
        // Always preserve avatar colors and IDs during import
        const playerData = {
          id: player.id, // Preserve the original ID
          displayName: player.displayName || "",
          firstName: player.firstName || "",
          lastName: player.lastName || "",
          dateOfBirth: player.dateOfBirth || null,
          positionPreferences: Array.isArray(player.positionPreferences) ? player.positionPreferences : [],
          active: player.active !== false,
          avatarColor: player.avatarColor // Keep original color exactly as is
        };
        
        const response = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerData)
        });
        
        if (response.ok) {
          const result = await response.json();
          playersImported++;
          console.log(`Successfully imported player ${player.displayName} (ID: ${player.id})`);
        }
      } catch (error) {
        console.error(`Failed to import player ${player.displayName || player.id}:`, error);
      }
    }
    
    // Step 2: Import opponents with ID preservation
    console.log(`Importing ${data.opponents.length} opponents...`);
    for (const opponent of data.opponents) {
      try {
        const opponentData = {
          id: opponent.id, // Preserve the original ID
          teamName: opponent.teamName || "Unknown Team",
          primaryColor: opponent.primaryColor || "#000000",
          secondaryColor: opponent.secondaryColor || "#FFFFFF",
          primaryContact: opponent.primaryContact || "",
          contactInfo: opponent.contactInfo || "",
          notes: opponent.notes || ""
        };
        
        const response = await fetch('/api/opponents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opponentData)
        });
        
        if (response.ok) {
          const result = await response.json();
          opponentsImported++;
          console.log(`Successfully imported opponent ${opponent.teamName} (ID: ${opponent.id})`);
        }
      } catch (error) {
        console.error(`Failed to import opponent ${opponent.teamName || opponent.id}:`, error);
      }
    }
    
    // Step 3: Import games with proper ID references
    console.log(`Importing ${data.games.length} games...`);
    for (const game of data.games) {
      try {
        const gameData = {
          id: game.id, // Preserve the original ID
          date: game.date || null,
          time: game.time || null,
          opponentId: game.opponentId, // No need for ID mapping, using original IDs
          completed: game.completed === true,
          isBye: game.isBye === true,
          round: game.round || null,
          venue: game.venue || null,
          notes: game.notes || null
        };
        
        const gameResponse = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gameData)
        });
        
        if (gameResponse.ok) {
          const gameResult = await gameResponse.json();
          gamesImported++;
          console.log(`Successfully imported game on ${game.date} (ID: ${game.id})`);
        }
      } catch (error) {
        console.error(`Failed to import game ${formatDate(game.date || "")}:`, error);
      }
    }
    
    // Step 4: Import rosters with proper ID references
    const rostersData = Array.isArray(data.rosters) ? data.rosters : [];
    console.log(`Importing ${rostersData.length} roster entries...`);
    for (const roster of rostersData) {
      try {
        if (!roster || typeof roster !== 'object') continue;
        
        const rosterData = {
          id: roster.id, // Preserve the original ID
          gameId: roster.gameId, // Use original game ID
          playerId: roster.playerId, // Use original player ID
          quarter: roster.quarter || 1,
          position: roster.position || "GS"
        };
        
        const response = await fetch('/api/rosters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rosterData)
        });
        
        if (response.ok) {
          rostersImported++;
        }
      } catch (error) {
        console.error(`Failed to import roster:`, error);
      }
    }
    
    // Step 5: Import game stats with proper ID references
    const gameStatsData = Array.isArray(data.gameStats) ? data.gameStats : [];
    console.log(`Importing ${gameStatsData.length} game statistics entries...`);
    for (const stat of gameStatsData) {
      try {
        if (!stat || typeof stat !== 'object') continue;
        
        const statData = {
          id: stat.id, // Preserve the original ID
          gameId: stat.gameId, // Use original game ID
          playerId: stat.playerId, // Use original player ID
          quarter: stat.quarter || 1,
          goalsFor: stat.goalsFor || 0,
          goalsAgainst: stat.goalsAgainst || 0,
          missedGoals: stat.missedGoals || 0,
          rebounds: stat.rebounds || 0,
          intercepts: stat.intercepts || 0,
          badPass: stat.badPass || 0,
          handlingError: stat.handlingError || 0,
          pickUp: stat.pickUp || 0,
          infringement: stat.infringement || 0,
          rating: stat.rating || 5
        };
        
        const response = await fetch('/api/gamestats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statData)
        });
        
        if (response.ok) {
          statsImported++;
        }
      } catch (error) {
        console.error(`Failed to import game stat:`, error);
      }
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