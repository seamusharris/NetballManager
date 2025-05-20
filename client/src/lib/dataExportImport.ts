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
    
    // Step 1: Import players
    for (const player of data.players) {
      try {
        const response = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: player.id,
            displayName: player.displayName || "",
            firstName: player.firstName || "",
            lastName: player.lastName || "",
            dateOfBirth: player.dateOfBirth || null,
            positionPreferences: player.positionPreferences || [],
            active: player.active !== false,
            avatarColor: player.avatarColor || null
          })
        });
        
        if (response.ok) {
          playersImported++;
        }
      } catch (error) {
        console.error(`Failed to import player ${player.displayName || player.id}:`, error);
      }
    }
    
    // Step 2: Import opponents
    for (const opponent of data.opponents) {
      try {
        const response = await fetch('/api/opponents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: opponent.id,
            teamName: opponent.teamName || "Unknown Team",
            primaryColor: opponent.primaryColor || "#000000",
            secondaryColor: opponent.secondaryColor || "#FFFFFF",
            notes: opponent.notes || ""
          })
        });
        
        if (response.ok) {
          opponentsImported++;
        }
      } catch (error) {
        console.error(`Failed to import opponent ${opponent.teamName || opponent.id}:`, error);
      }
    }
    
    // Step 3: Import games
    for (const game of data.games) {
      try {
        const gameResponse = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: game.id,
            date: game.date || null,
            time: game.time || null,
            opponentId: game.opponentId,
            completed: game.completed === true,
            isBye: game.isBye === true,
            round: game.round,
            venue: game.venue || null,
            teamScore: game.teamScore || 0,
            opponentScore: game.opponentScore || 0,
            notes: game.notes || null
          })
        });
        
        if (gameResponse.ok) {
          const gameResult = await gameResponse.json();
          gamesImported++;
          
          // Extra step: ensure the round number is set correctly
          if (game.round && gameResult.id) {
            try {
              await fetch(`/api/games/${gameResult.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ round: game.round })
              });
            } catch (err) {
              console.error(`Error updating round for game ${gameResult.id}:`, err);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to import game ${formatDate(game.date || "")}:`, error);
      }
    }
    
    // Step 4: Import rosters
    const rostersData = Array.isArray(data.rosters) ? data.rosters : [];
    for (const roster of rostersData) {
      try {
        if (!roster || typeof roster !== 'object' || !roster.gameId || !roster.playerId) continue;
        
        const response = await fetch('/api/rosters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: roster.id,
            gameId: roster.gameId,
            playerId: roster.playerId,
            quarter: roster.quarter || 1,
            position: roster.position || "GS"
          })
        });
        
        if (response.ok) {
          rostersImported++;
        }
      } catch (error) {
        console.error(`Failed to import roster:`, error);
      }
    }
    
    // Step 5: Import game stats
    const gameStatsData = Array.isArray(data.gameStats) ? data.gameStats : [];
    for (const stat of gameStatsData) {
      try {
        if (!stat || typeof stat !== 'object' || !stat.gameId || !stat.playerId) continue;
        
        const response = await fetch('/api/gamestats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: stat.id,
            gameId: stat.gameId,
            playerId: stat.playerId,
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
          })
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