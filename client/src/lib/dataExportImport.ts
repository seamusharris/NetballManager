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

// Export data to JSON format
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
    const gameRosters: Record<number, Roster[]> = {};
    const gameStats: Record<number, GameStat[]> = {};
    
    for (const game of games) {
      try {
        const rosterResponse = await fetch(`/api/games/${game.id}/rosters`);
        const rosters = await rosterResponse.json();
        gameRosters[game.id] = rosters as Roster[];
      } catch (error) {
        console.error(`Failed to fetch rosters for game ${game.id}:`, error);
        gameRosters[game.id] = [];
      }
      
      try {
        const statsResponse = await fetch(`/api/games/${game.id}/stats`);
        const stats = await statsResponse.json();
        gameStats[game.id] = stats as GameStat[];
      } catch (error) {
        console.error(`Failed to fetch stats for game ${game.id}:`, error);
        gameStats[game.id] = [];
      }
    }
    
    // Create JSON structure for all data
    const exportData = {
      players,
      opponents,
      games,
      rosters: Object.values(gameRosters).flat(),
      gameStats: Object.values(gameStats).flat(),
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

// Import data from JSON format
export async function importData(jsonData: string): Promise<ImportResult> {
  try {
    // Parse the JSON data
    const data = JSON.parse(jsonData);
    console.log("Parsed data:", data);
    
    // Validate the data structure
    if (!data.players || !data.opponents || !data.games) {
      console.error("Missing data sections:", { 
        hasPlayers: !!data.players, 
        hasOpponents: !!data.opponents, 
        hasGames: !!data.games 
      });
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
        // Log the player data
        console.log("Importing player:", player);

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
        } else {
          console.error(`Error importing player: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Player import error:", error);
      }
    }
    
    // Step 2: Import opponents
    for (const opponent of data.opponents) {
      try {
        // Log the opponent data
        console.log("Importing opponent:", opponent);

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
        } else {
          console.error(`Error importing opponent: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Opponent import error:", error);
      }
    }
    
    // Step 3: Import games
    for (const game of data.games) {
      try {
        // Log the game data
        console.log("Importing game:", game);

        // Basic game data
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
              const updateResponse = await fetch(`/api/games/${gameResult.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ round: game.round })
              });
              if (updateResponse.ok) {
                console.log(`Updated round for game ${gameResult.id} to ${game.round}`);
              }
            } catch (err) {
              console.error("Error updating game round:", err);
            }
          }
        } else {
          console.error(`Error importing game: ${gameResponse.status} ${gameResponse.statusText}`);
        }
      } catch (error) {
        console.error("Game import error:", error);
      }
    }
    
    // Step 4: Find rosters in the data
    let rosters = [];
    
    // Check for direct rosters array
    if (Array.isArray(data.rosters)) {
      rosters = data.rosters;
    } 
    // Check for rosters as object with game IDs as keys
    else if (data.rosters && typeof data.rosters === 'object') {
      Object.values(data.rosters).forEach(gameRosters => {
        if (Array.isArray(gameRosters)) {
          rosters = [...rosters, ...gameRosters];
        }
      });
    }
    
    // Import rosters
    for (const roster of rosters) {
      try {
        if (!roster || !roster.gameId || !roster.playerId) {
          console.log("Skipping invalid roster:", roster);
          continue;
        }
        
        // Log the roster data
        console.log("Importing roster:", roster);

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
        } else {
          console.error(`Error importing roster: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Roster import error:", error);
      }
    }
    
    // Step 5: Find game stats in the data
    let gameStats = [];
    
    // Check for direct gameStats array
    if (Array.isArray(data.gameStats)) {
      gameStats = data.gameStats;
    } 
    // Check for older "stats" property
    else if (Array.isArray(data.stats)) {
      gameStats = data.stats;
    }
    // Check for stats as object with game IDs as keys
    else if ((data.gameStats || data.stats) && typeof (data.gameStats || data.stats) === 'object') {
      const statsObj = data.gameStats || data.stats;
      Object.values(statsObj).forEach(gameStat => {
        if (Array.isArray(gameStat)) {
          gameStats = [...gameStats, ...gameStat];
        }
      });
    }
    
    // Import game stats
    for (const stat of gameStats) {
      try {
        if (!stat || !stat.gameId || !stat.playerId) {
          console.log("Skipping invalid game stat:", stat);
          continue;
        }
        
        // Log the stat data
        console.log("Importing game stat:", stat);

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
        } else {
          console.error(`Error importing game stat: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Game stat import error:", error);
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