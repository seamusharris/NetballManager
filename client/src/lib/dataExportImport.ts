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
    
    // Validate the data structure
    if (!data.players || !data.opponents || !data.games) {
      throw new Error('Invalid data format. The import file is missing required data sections.');
    }
    
    // Prepare data structure
    let gameStatsArray: GameStat[] = [];
    if (data.gameStats) {
      gameStatsArray = Array.isArray(data.gameStats) ? data.gameStats : [];
    } else if (data.stats) {
      // Handle older format
      if (Array.isArray(data.stats)) {
        gameStatsArray = data.stats;
      } else if (typeof data.stats === 'object') {
        gameStatsArray = Object.values(data.stats).flat();
      }
    }
    
    let rostersArray: Roster[] = [];
    if (data.rosters) {
      if (Array.isArray(data.rosters)) {
        rostersArray = data.rosters;
      } else if (typeof data.rosters === 'object') {
        rostersArray = Object.values(data.rosters).flat();
      }
    }
    
    // Count successful imports
    let playersImported = 0;
    let opponentsImported = 0;
    let gamesImported = 0;
    let rostersImported = 0;
    let statsImported = 0;
    
    // Step 1: Import players first
    console.log(`Starting import of ${data.players.length} players`);
    for (const player of data.players) {
      try {
        const playerData = {
          id: player.id,
          displayName: player.displayName || '',
          firstName: player.firstName || '',
          lastName: player.lastName || '',
          dateOfBirth: player.dateOfBirth || null,
          positionPreferences: Array.isArray(player.positionPreferences) ? player.positionPreferences : [],
          active: player.active === false ? false : true,
          avatarColor: player.avatarColor || null
        };
        
        const response = await apiRequest('/api/players', {
          method: 'POST',
          body: JSON.stringify(playerData)
        });
        
        if (response.ok) {
          playersImported++;
        }
      } catch (error) {
        console.error(`Failed to import player ${player.displayName || player.id}:`, error);
      }
    }
    
    // Step 2: Import opponents
    console.log(`Starting import of ${data.opponents.length} opponents`);
    for (const opponent of data.opponents) {
      try {
        const opponentData = {
          id: opponent.id,
          teamName: opponent.teamName || 'Unknown Team',
          primaryColor: opponent.primaryColor || '#000000',
          secondaryColor: opponent.secondaryColor || '#FFFFFF',
          notes: opponent.notes || ''
        };
        
        const response = await apiRequest('/api/opponents', {
          method: 'POST',
          body: JSON.stringify(opponentData)
        });
        
        if (response.ok) {
          opponentsImported++;
        }
      } catch (error) {
        console.error(`Failed to import opponent ${opponent.teamName || opponent.id}:`, error);
      }
    }
    
    // Step 3: Import games
    console.log(`Starting import of ${data.games.length} games`);
    for (const game of data.games) {
      try {
        const gameData = {
          id: game.id,
          date: game.date || '2025-01-01',
          time: game.time || '12:00',
          opponentId: game.opponentId || null,
          venue: game.venue || null,
          teamScore: game.teamScore || 0,
          opponentScore: game.opponentScore || 0,
          completed: game.completed === true,
          notes: game.notes || '',
          round: game.round || null,
          isBye: game.isBye === true
        };
        
        console.log(`Importing game ID ${game.id} with round ${game.round}, opponent ${game.opponentId}`);
        const response = await apiRequest('/api/games', {
          method: 'POST',
          body: JSON.stringify(gameData)
        });
        
        if (response.ok) {
          const createdGame = await response.json();
          gamesImported++;
          console.log(`Successfully imported game ID ${game.id} as ${createdGame.id}`);
          
          // Update game with round number
          if (game.round) {
            try {
              const updateResponse = await apiRequest(`/api/games/${createdGame.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ round: game.round })
              });
              console.log(`Updated round number for game ${createdGame.id} to ${game.round}`);
            } catch (updateError) {
              console.error(`Error updating round for game ${createdGame.id}:`, updateError);
            }
          }
        } else {
          console.error(`Failed to import game ${game.id}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Failed to import game ${game.id || formatDate(game.date)}:`, error);
      }
    }
    
    // Step 4: Import rosters
    console.log(`Starting import of ${rostersArray.length} roster entries`);
    for (const roster of rostersArray) {
      try {
        const rosterData = {
          id: roster.id,
          gameId: roster.gameId,
          playerId: roster.playerId,
          quarter: roster.quarter || 1,
          position: roster.position || 'GS'
        };
        
        const response = await apiRequest('/api/rosters', {
          method: 'POST',
          body: JSON.stringify(rosterData)
        });
        
        if (response.ok) {
          rostersImported++;
        }
      } catch (error) {
        console.error(`Failed to import roster ${roster.id}:`, error);
      }
    }
    
    // Step 5: Import game stats
    console.log(`Starting import of ${gameStatsArray.length} game stat entries`);
    for (const stat of gameStatsArray) {
      try {
        const statData = {
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
        };
        
        const response = await apiRequest('/api/gamestats', {
          method: 'POST',
          body: JSON.stringify(statData)
        });
        
        if (response.ok) {
          statsImported++;
        }
      } catch (error) {
        console.error(`Failed to import game stat ${stat.id}:`, error);
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